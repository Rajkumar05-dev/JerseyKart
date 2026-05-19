package com.jerseykart.backend.service;

import com.jerseykart.backend.entity.Cart;
import com.jerseykart.backend.entity.CartItem;
import com.jerseykart.backend.entity.Product;
import com.jerseykart.backend.entity.User;
import com.jerseykart.backend.repository.CartRepository;
import com.jerseykart.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemService cartItemService;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserRepository userRepository;

    public Cart createCart(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepository.save(cart);
    }

    @Transactional
    public CartItem addCartItem(Long userId, Long productId, String size, int quantity) {
        Cart cart = getOrCreateCart(userId);
        Product product = productService.findProductById(productId);
        if (product == null) {
            throw new RuntimeException("Product not found");
        }

        double unitPrice = product.getPrice() != null ? product.getPrice() : 0.0;
        double unitDiscount = product.getDiscountPrice() != null ? product.getDiscountPrice() : unitPrice;

        for (CartItem item : cart.getCartItems()) {
            if (item.getProduct().getId().equals(productId) && item.getSize().equals(size)) {
                int newQty = item.getQuantity() + quantity;
                item.setQuantity(newQty);
                item.setPrice(newQty * unitPrice);
                item.setDiscountedPrice(newQty * unitDiscount);
                cartItemService.updateCartItem(userId, item.getId(), item);
                cartRepository.save(cart);
                return item;
            }
        }

        CartItem cartItem = new CartItem();
        cartItem.setProduct(product);
        cartItem.setCart(cart);
        cartItem.setQuantity(quantity);
        cartItem.setSize(size);
        cartItem.setUserId(userId);
        cartItem.setPrice(unitPrice * quantity);
        cartItem.setDiscountedPrice(unitDiscount * quantity);

        CartItem createdCartItem = cartItemService.createCartItem(cartItem);
        cart.getCartItems().add(createdCartItem);
        cartRepository.save(cart);

        return createdCartItem;
    }

    @Transactional
    public Cart findUserCart(Long userId) {
        Cart cart = getOrCreateCart(userId);

        double totalPrice = 0;
        double totalDiscountedPrice = 0;
        int totalItem = 0;

        for (CartItem cartItem : cart.getCartItems()) {
            totalPrice += cartItem.getPrice() != null ? cartItem.getPrice() : 0;
            totalDiscountedPrice += cartItem.getDiscountedPrice() != null ? cartItem.getDiscountedPrice() : 0;
            totalItem += cartItem.getQuantity();
        }

        cart.setTotalPrice(totalPrice);
        cart.setTotalDiscountedPrice(totalDiscountedPrice);
        cart.setTotalItem(totalItem);

        return cartRepository.save(cart);
    }

    @Transactional
    public void removeCartItem(Long userId, Long cartItemId) {
        Cart cart = cartRepository.findByUserId(userId);
        if (cart == null) {
            return;
        }
        cartItemService.removeCartItem(userId, cartItemId);
        cart.getCartItems().removeIf(item -> item.getId().equals(cartItemId));
        findUserCart(userId);
    }

    private Cart getOrCreateCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId);
        if (cart == null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            cart = createCart(user);
        }
        return cart;
    }
}
