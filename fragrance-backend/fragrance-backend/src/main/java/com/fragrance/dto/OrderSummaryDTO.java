package com.fragrance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderSummaryDTO {
    private Long orderId;
    private String orderDate;
    private List<Map<String, Object>> items;
    private Double subtotal;
    private Double shippingFee;
    private Double totalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private Boolean paymentConfirmed;
    private String transactionId;
    private String notes;
    private int totalItems;
}
