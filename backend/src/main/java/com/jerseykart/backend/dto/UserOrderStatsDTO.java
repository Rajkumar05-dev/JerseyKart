package com.jerseykart.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserOrderStatsDTO {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String mobile;
    private Integer totalOrders;
    private List<OrderPaymentInfo> orderDetails;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderPaymentInfo {
        private Long orderId;
        private String orderId_external; // External order ID
        private String paymentMethod; // RAZORPAY or COD
        private String orderStatus;
        private Double totalPrice;
        private String orderDate;
    }
}
