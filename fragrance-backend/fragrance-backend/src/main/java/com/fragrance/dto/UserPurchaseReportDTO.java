package com.fragrance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPurchaseReportDTO {
    private String userName;
    private String userEmail;
    private String range;         // e.g. "Last Month"
    private String generatedAt;   // formatted date string
    private List<OrderSummaryDTO> orders;

    // Aggregate summaries
    private int totalOrders;
    private int totalItems;
    private Double totalAmount;  // grand total across all orders

    // Payment breakdown: method → count
    private Map<String, Long> paymentMethodBreakdown;
    // Payment status breakdown: status → count
    private Map<String, Long> paymentStatusBreakdown;
}
