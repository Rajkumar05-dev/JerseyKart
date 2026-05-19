package com.jerseykart.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderId; // For razorpay or external tracking

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "shipping_address_id")
    private Address shippingAddress;

    private Double totalPrice;
    private Double totalDiscountedPrice;
    private Integer totalItem;

    private String orderStatus; // PENDING, PLACED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
    private String paymentStatus; // PENDING, COMPLETED, FAILED
    private String paymentMethod; // RAZORPAY, COD

    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;

    @PrePersist
    public void prePersist() {
        this.orderDate = LocalDateTime.now();
    }
}
