package com.jerseykart.backend.service;

import com.jerseykart.backend.entity.Cart;
import com.jerseykart.backend.entity.CartItem;
import com.jerseykart.backend.entity.Product;
import com.jerseykart.backend.entity.User;
import com.jerseykart.backend.repository.CartItemRepository;
import com.jerseykart.backend.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemService cartItemService;

    @Autowired
    private ProductService productService;

    public Cart createCart(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepository.save(cart);
    }

    public CartItem addCartItem(Long userId, Long productId, String size, int quantity) {
        Cart cart = cartRepository.findByUserId(userId);
        if(cart == null) {
            cart = new Cart();
            // user needs to be fetched, omitting for brevity in mocked addCart
        }
        Product product = productService.findProductById(productId);

        for (CartItem item : cart.getCartItems()) {
            if (item.getProduct().getId().equals(productId) && item.getSize().equals(size)) {
                item.setQuantity(item.getQuantity() + quantity);
                item.setPrice(item.getQuantity() * product.getPrice());
                item.setDiscountedPrice(item.getQuantity() * product.getDiscountPrice());
                return cartItemService.updateCartItem(userId, item.getId(), item);
            }
        }

        CartItem cartItem = new CartItem();
        cartItem.setProduct(product);
        cartItem.setCart(cart);
        cartItem.setQuantity(quantity);
        cartItem.setSize(size);
        cartItem.setUserId(userId);
        
        Double price = product.getPrice() * quantity;
        Double discountPrice = product.getDiscountPrice() * quantity;
        
        cartItem.setPrice(price);
        cartItem.setDiscountedPrice(discountPrice);

        CartItem createdCartItem = cartItemService.createCartItem(cartItem);
        cart.getCartItems().add(createdCartItem);
        cartRepository.save(cart);

        return createdCartItem;
    }

    public Cart findUserCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId);
        
        double totalPrice = 0;
        double totalDiscountedPrice = 0;
        int totalItem = 0;

        for (CartItem cartItem : cart.getCartItems()) {
            totalPrice += cartItem.getPrice();
            totalDiscountedPrice += cartItem.getDiscountedPrice();
            totalItem += cartItem.getQuantity();
        }

        cart.setTotalPrice(totalPrice);
        cart.setTotalDiscountedPrice(totalDiscountedPrice);
        cart.setTotalItem(totalItem);

        return cartRepository.save(cart);
    }
}
