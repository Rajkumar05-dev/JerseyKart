package com.jerseykart.backend.service;

import com.jerseykart.backend.entity.CartItem;
import com.jerseykart.backend.entity.User;
import com.jerseykart.backend.repository.CartItemRepository;
import com.jerseykart.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CartItemService {

    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private UserRepository userRepository;

    public CartItem createCartItem(CartItem cartItem) {
        return cartItemRepository.save(cartItem);
    }

    public CartItem updateCartItem(Long userId, Long id, CartItem cartItem) {
        Optional<CartItem> opt = cartItemRepository.findById(id);
        
        if (opt.isPresent()) {
            CartItem item = opt.get();
            if (item.getUserId().equals(userId)) {
                item.setQuantity(cartItem.getQuantity());
                item.setPrice(item.getQuantity() * item.getProduct().getPrice());
                item.setDiscountedPrice(item.getQuantity() * item.getProduct().getDiscountPrice());
                return cartItemRepository.save(item);
            }
        }
        return null;
    }

    public void removeCartItem(Long userId, Long cartItemId) {
        Optional<CartItem> cartItemOpt = cartItemRepository.findById(cartItemId);
        if (cartItemOpt.isPresent()) {
            CartItem cartItem = cartItemOpt.get();
            if (userId.equals(cartItem.getUserId())) {
                cartItemRepository.deleteById(cartItemId);
            }
        }
    }
}
