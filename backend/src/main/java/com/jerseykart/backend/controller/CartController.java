package com.jerseykart.backend.controller;

import com.jerseykart.backend.entity.Cart;
import com.jerseykart.backend.entity.User;
import com.jerseykart.backend.repository.UserRepository;
import com.jerseykart.backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Cart> getUserCart() {
        User user = getCurrentUser();
        return new ResponseEntity<>(cartService.findUserCart(user.getId()), HttpStatus.OK);
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addCartItem(@RequestBody Map<String, Object> body) {
        User user = getCurrentUser();
        Long productId = Long.valueOf(body.get("productId").toString());
        String size = body.get("size").toString();
        int quantity = body.containsKey("quantity")
                ? Integer.parseInt(body.get("quantity").toString())
                : 1;

        cartService.addCartItem(user.getId(), productId, size, quantity);
        return new ResponseEntity<>(cartService.findUserCart(user.getId()), HttpStatus.OK);
    }

    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<Cart> removeCartItem(@PathVariable Long cartItemId) {
        User user = getCurrentUser();
        cartService.removeCartItem(user.getId(), cartItemId);
        return new ResponseEntity<>(cartService.findUserCart(user.getId()), HttpStatus.OK);
    }

    @PutMapping("/item/{cartItemId}")
    public ResponseEntity<Cart> updateCartItem(@PathVariable Long cartItemId, @RequestBody Map<String, Object> body) {
        User user = getCurrentUser();
        int quantity = body.containsKey("quantity")
                ? Integer.parseInt(body.get("quantity").toString())
                : 1;

        cartService.updateCartItem(user.getId(), cartItemId, quantity);
        return new ResponseEntity<>(cartService.findUserCart(user.getId()), HttpStatus.OK);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
