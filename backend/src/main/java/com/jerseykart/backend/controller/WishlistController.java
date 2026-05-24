package com.jerseykart.backend.controller;

import com.jerseykart.backend.entity.User;
import com.jerseykart.backend.entity.Wishlist;
import com.jerseykart.backend.repository.UserRepository;
import com.jerseykart.backend.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Wishlist> getUserWishlist() {
        User user = getCurrentUser();
        return new ResponseEntity<>(wishlistService.findUserWishlist(user.getId()), HttpStatus.OK);
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<Wishlist> addProductToWishlist(@PathVariable Long productId) {
        User user = getCurrentUser();
        Wishlist wishlist = wishlistService.addProductToWishlist(user.getId(), productId);
        return new ResponseEntity<>(wishlist, HttpStatus.OK);
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Wishlist> removeProductFromWishlist(@PathVariable Long productId) {
        User user = getCurrentUser();
        Wishlist wishlist = wishlistService.removeProductFromWishlist(user.getId(), productId);
        return new ResponseEntity<>(wishlist, HttpStatus.OK);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
