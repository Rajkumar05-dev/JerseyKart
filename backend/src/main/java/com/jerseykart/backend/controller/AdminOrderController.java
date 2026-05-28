package com.jerseykart.backend.controller;

import com.jerseykart.backend.dto.UserOrderStatsDTO;
import com.jerseykart.backend.entity.Order;
import com.jerseykart.backend.entity.User;
import com.jerseykart.backend.repository.OrderRepository;
import com.jerseykart.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/user-statistics")
    public ResponseEntity<List<UserOrderStatsDTO>> getUserOrderStatistics() {
        try {
            List<User> allUsers = userRepository.findAll();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

            List<UserOrderStatsDTO> userStats = allUsers.stream()
                    .map(user -> {
                        List<Order> userOrders = orderRepository.findByUserId(user.getId());
                        
                        List<UserOrderStatsDTO.OrderPaymentInfo> orderDetails = userOrders.stream()
                                .map(order -> UserOrderStatsDTO.OrderPaymentInfo.builder()
                                        .orderId(order.getId())
                                        .orderId_external(order.getOrderId())
                                        .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod() : "COD")
                                        .orderStatus(order.getOrderStatus())
                                        .totalPrice(order.getTotalPrice())
                                        .orderDate(order.getOrderDate() != null ? order.getOrderDate().format(formatter) : "N/A")
                                        .build())
                                .collect(Collectors.toList());

                        return UserOrderStatsDTO.builder()
                                .userId(user.getId())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName() != null ? user.getLastName() : "")
                                .email(user.getEmail())
                                .mobile(user.getMobile() != null ? user.getMobile() : "")
                                .totalOrders(userOrders.size())
                                .orderDetails(orderDetails)
                                .build();
                    })
                    .filter(stat -> stat.getTotalOrders() > 0) // Only show users with orders
                    .collect(Collectors.toList());

            return new ResponseEntity<>(userStats, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            throw new org.springframework.web.server.ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, "Error loading statistics: " + e.getMessage(), e);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        try {
            List<Order> orders = orderRepository.findAll();
            return new ResponseEntity<>(orders, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
