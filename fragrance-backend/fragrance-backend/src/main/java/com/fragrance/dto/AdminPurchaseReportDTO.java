package com.fragrance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminPurchaseReportDTO {
    private String range;         // e.g. "Last Month"
    private String generatedAt;

    // Top-level KPIs
    private int totalOrders;
    private Double totalRevenue;
    private int totalItemsSold;

    // Best selling products: [{name, qty, revenue}]
    private List<Map<String, Object>> bestSellingProducts;

    // Payment method breakdown: method → count
    private Map<String, Long> paymentMethodBreakdown;

    // Payment status breakdown: status → count
    private Map<String, Long> paymentStatusBreakdown;

    // Orders by date: dateString → count
    private Map<String, Long> ordersByDate;

    // All orders summary (optional, for table in PDF)
    private List<OrderSummaryDTO> orders;
}
