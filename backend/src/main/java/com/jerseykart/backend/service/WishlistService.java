package com.jerseykart.backend.service;

import com.jerseykart.backend.entity.Product;
import com.jerseykart.backend.entity.User;
import com.jerseykart.backend.entity.Wishlist;
import com.jerseykart.backend.repository.UserRepository;
import com.jerseykart.backend.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserRepository userRepository;

    public Wishlist createWishlist(User user) {
        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setProducts(new HashSet<>());
        return wishlistRepository.save(wishlist);
    }

    @Transactional
    public Wishlist findUserWishlist(Long userId) {
        return getOrCreateWishlist(userId);
    }

    @Transactional
    public Wishlist addProductToWishlist(Long userId, Long productId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        Product product = productService.findProductById(productId);
        if (product == null) {
            throw new RuntimeException("Product not found");
        }
        wishlist.getProducts().add(product);
        return wishlistRepository.save(wishlist);
    }

    @Transactional
    public Wishlist removeProductFromWishlist(Long userId, Long productId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        wishlist.getProducts().removeIf(product -> product.getId().equals(productId));
        return wishlistRepository.save(wishlist);
    }

    private Wishlist getOrCreateWishlist(Long userId) {
        Optional<Wishlist> wishlistOpt = wishlistRepository.findByUserId(userId);
        if (wishlistOpt.isEmpty()) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return createWishlist(user);
        }
        return wishlistOpt.get();
    }
}
