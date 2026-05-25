package com.jerseykart.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jerseykart.backend.entity.Address;
import com.jerseykart.backend.entity.Order;
import com.jerseykart.backend.entity.User;
import com.jerseykart.backend.repository.UserRepository;
import com.jerseykart.backend.service.CartService;
import com.jerseykart.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private static final String RAZORPAY_ORDER_URL = "https://api.razorpay.com/v1/orders";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartService cartService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${razorpay.key}")
    private String razorpayKey;

    @Value("${razorpay.secret}")
    private String razorpaySecret;

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody(required = false) Map<String, Object> body) {
        User user = getCurrentUser();
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        var cart = cartService.findUserCart(user.getId());
        if (cart == null || cart.getCartItems().isEmpty() || cart.getTotalDiscountedPrice() == null || cart.getTotalDiscountedPrice() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty or invalid");
        }

        long amount = Math.round(cart.getTotalDiscountedPrice() * 100);
        Map<String, Object> payload = new HashMap<>();
        payload.put("amount", amount);
        payload.put("currency", "INR");
        payload.put("receipt", "order_rcptid_" + System.currentTimeMillis());
        payload.put("payment_capture", 1);

        try {
            String requestBody = objectMapper.writeValueAsString(payload);
            String authHeader = Base64.getEncoder().encodeToString((razorpayKey + ":" + razorpaySecret).getBytes(StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(RAZORPAY_ORDER_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Basic " + authHeader)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200 && response.statusCode() != 201) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to create Razorpay order");
            }

            Map<String, Object> razorpayResponse = objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});
            String razorpayOrderId = razorpayResponse.get("id").toString();

            Address shippingAddress = buildShippingAddress(body, user);
            Order order = orderService.createOrder(user, shippingAddress, "RAZORPAY", razorpayOrderId);

            Map<String, Object> result = new HashMap<>();
            result.put("razorpayKey", razorpayKey);
            result.put("razorpayOrderId", razorpayOrderId);
            result.put("amount", amount);
            result.put("currency", "INR");
            result.put("orderId", order.getId());
            result.put("userName", user.getFirstName() + (user.getLastName() != null ? " " + user.getLastName() : ""));
            result.put("userEmail", user.getEmail());
            result.put("userContact", user.getMobile() != null ? user.getMobile() : "");
            return ResponseEntity.ok(result);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create Razorpay order", ex);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyPayment(@RequestBody Map<String, String> body) {
        String razorpayOrderId = body.get("razorpayOrderId");
        String razorpayPaymentId = body.get("razorpayPaymentId");
        String razorpaySignature = body.get("razorpaySignature");

        if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing Razorpay payment data");
        }

        String payload = razorpayOrderId + "|" + razorpayPaymentId;
        if (!verifySignature(payload, razorpaySignature)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid payment signature");
        }

        Order order = orderService.findByOrderId(razorpayOrderId);
        if (order == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }

        order.setPaymentStatus("COMPLETED");
        order.setOrderStatus("PLACED");
        orderService.saveOrder(order);
        cartService.clearCart(order.getUser().getId());

        return ResponseEntity.ok(Map.of("status", "success", "message", "Payment verified and order placed"));
    }

    private boolean verifySignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpaySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] expected = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String encoded = bytesToHex(expected);
            return encoded.equals(signature);
        } catch (Exception ex) {
            return false;
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder hex = new StringBuilder();
        for (byte b : bytes) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }

    @SuppressWarnings("unchecked")
    private Address buildShippingAddress(Map<String, Object> body, User user) {
        Address address = new Address();
        Map<String, String> shipping = null;
        if (body != null && body.containsKey("shippingAddress")) {
            shipping = (Map<String, String>) body.get("shippingAddress");
        }

        address.setFirstName(user.getFirstName());
        address.setLastName(user.getLastName());
        address.setStreetAddress(shipping != null ? shipping.getOrDefault("streetAddress", "Not provided") : "Not provided");
        address.setCity(shipping != null ? shipping.getOrDefault("city", "") : "");
        address.setState(shipping != null ? shipping.getOrDefault("state", "") : "");
        address.setZipCode(shipping != null ? shipping.getOrDefault("zipCode", "000000") : "000000");
        address.setMobile(user.getMobile() != null ? user.getMobile() : "");
        return address;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return null;
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
