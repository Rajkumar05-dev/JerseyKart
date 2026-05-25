package com.jerseykart.backend.service;

import com.jerseykart.backend.entity.Address;
import com.jerseykart.backend.entity.Cart;
import com.jerseykart.backend.entity.CartItem;
import com.jerseykart.backend.entity.Order;
import com.jerseykart.backend.entity.OrderItem;
import com.jerseykart.backend.entity.User;
import com.jerseykart.backend.repository.AddressRepository;
import com.jerseykart.backend.repository.OrderItemRepository;
import com.jerseykart.backend.repository.OrderRepository;
import com.jerseykart.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private AddressRepository addressRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;

    public Order createOrder(User user, Address shippingAddress) {
        return createOrder(user, shippingAddress, null, null);
    }

    @Transactional
    public Order createOrder(User user, Address shippingAddress, String paymentMethod, String externalOrderId) {
        shippingAddress.setUser(user);
        Address address = addressRepository.save(shippingAddress);

        Cart cart = cartService.findUserCart(user.getId());
        List<OrderItem> orderItems = new ArrayList<>();

        for(CartItem item : cart.getCartItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setPrice(item.getPrice());
            orderItem.setProduct(item.getProduct());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setSize(item.getSize());
            orderItem.setUserId(item.getUserId());
            orderItem.setDiscountedPrice(item.getDiscountedPrice());
            orderItems.add(orderItem);
        }

        Order createdOrder = new Order();
        createdOrder.setUser(user);
        createdOrder.setOrderItems(orderItems);
        createdOrder.setOrderId(externalOrderId);
        createdOrder.setPaymentMethod(paymentMethod);
        createdOrder.setTotalPrice(cart.getTotalPrice());
        createdOrder.setTotalDiscountedPrice(cart.getTotalDiscountedPrice());
        createdOrder.setTotalItem(cart.getTotalItem());
        createdOrder.setShippingAddress(address);
        createdOrder.setOrderStatus("PENDING");
        createdOrder.setPaymentStatus("PENDING");

        for (OrderItem item : orderItems) {
            item.setOrder(createdOrder);
        }

        Order savedOrder = orderRepository.save(createdOrder);

        return savedOrder;
    }

    public Order findOrderById(Long orderId) {
        Optional<Order> opt = orderRepository.findById(orderId);
        return opt.orElse(null);
    }

    public Order findByOrderId(String orderId) {
        if (orderId == null) {
            return null;
        }
        return orderRepository.findByOrderId(orderId);
    }

    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }

    public List<Order> findOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }
}
