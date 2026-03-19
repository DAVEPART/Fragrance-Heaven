package com.fragrance.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fragrance.dto.AdminPurchaseReportDTO;
import com.fragrance.dto.OrderSummaryDTO;
import com.fragrance.dto.UserPurchaseReportDTO;
import com.fragrance.model.Order;
import com.fragrance.model.User;
import com.fragrance.repository.OrderRepository;
import com.fragrance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderReportService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private static final double DELIVERY_FEE = 100.0;

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────────────

    public UserPurchaseReportDTO getUserReport(String userId, String range) {
        long[] dateRange = getDateRange(range);
        List<Order> orders = orderRepository.findByUserIdAndDateBetween(userId, dateRange[0], dateRange[1]);

        // Resolve user info
        String userName = "Customer";
        String userEmail = "N/A";
        try {
            Optional<User> userOpt = userRepository.findById(Long.parseLong(userId));
            if (userOpt.isPresent()) {
                userName = userOpt.get().getName();
                userEmail = userOpt.get().getEmail();
            }
        } catch (Exception e) {
            log.warn("Could not resolve user info for userId={}", userId);
        }

        List<OrderSummaryDTO> summaries = orders.stream()
                .map(this::toOrderSummary)
                .collect(Collectors.toList());

        int totalItems = summaries.stream().mapToInt(OrderSummaryDTO::getTotalItems).sum();
        double totalAmount = summaries.stream().mapToDouble(OrderSummaryDTO::getTotalAmount).sum();

        Map<String, Long> methodBreakdown = orders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getPaymentMethod() != null ? o.getPaymentMethod() : "N/A",
                        Collectors.counting()
                ));

        Map<String, Long> statusBreakdown = orders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getPaymentStatus() != null ? o.getPaymentStatus() : "PENDING",
                        Collectors.counting()
                ));

        UserPurchaseReportDTO dto = new UserPurchaseReportDTO();
        dto.setUserName(userName);
        dto.setUserEmail(userEmail);
        dto.setRange(formatRange(range));
        dto.setGeneratedAt(new SimpleDateFormat("dd MMM yyyy, hh:mm a").format(new Date()));
        dto.setOrders(summaries);
        dto.setTotalOrders(summaries.size());
        dto.setTotalItems(totalItems);
        dto.setTotalAmount(totalAmount);
        dto.setPaymentMethodBreakdown(methodBreakdown);
        dto.setPaymentStatusBreakdown(statusBreakdown);

        return dto;
    }

    public AdminPurchaseReportDTO getAdminReport(String range) {
        long[] dateRange = getDateRange(range);
        List<Order> orders = orderRepository.findByDateBetween(dateRange[0], dateRange[1]);

        List<OrderSummaryDTO> summaries = orders.stream()
                .map(this::toOrderSummary)
                .collect(Collectors.toList());

        int totalItemsSold = summaries.stream().mapToInt(OrderSummaryDTO::getTotalItems).sum();
        double totalRevenue = summaries.stream().mapToDouble(OrderSummaryDTO::getTotalAmount).sum();

        Map<String, Long> methodBreakdown = orders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getPaymentMethod() != null ? o.getPaymentMethod() : "N/A",
                        Collectors.counting()
                ));

        Map<String, Long> statusBreakdown = orders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getPaymentStatus() != null ? o.getPaymentStatus() : "PENDING",
                        Collectors.counting()
                ));

        // Orders by date (yyyy-MM-dd)
        SimpleDateFormat dayFmt = new SimpleDateFormat("dd MMM yyyy");
        Map<String, Long> ordersByDate = orders.stream()
                .collect(Collectors.groupingBy(
                        o -> dayFmt.format(new Date(o.getDate())),
                        TreeMap::new,
                        Collectors.counting()
                ));

        // Best-selling products: aggregate items across all orders
        Map<String, double[]> productStats = new LinkedHashMap<>(); // name → [qty, revenue]
        for (OrderSummaryDTO s : summaries) {
            if (s.getItems() == null) continue;
            for (Map<String, Object> item : s.getItems()) {
                String name = String.valueOf(item.getOrDefault("name", "Unknown"));
                double price = Double.parseDouble(String.valueOf(item.getOrDefault("price", 0)));
                int qty = Integer.parseInt(String.valueOf(item.getOrDefault("quantity", 0)));
                productStats.computeIfAbsent(name, k -> new double[]{0, 0});
                productStats.get(name)[0] += qty;
                productStats.get(name)[1] += price * qty;
            }
        }
        List<Map<String, Object>> bestSellers = productStats.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue()[0], a.getValue()[0]))
                .limit(10)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", e.getKey());
                    m.put("quantity", (int) e.getValue()[0]);
                    m.put("revenue", e.getValue()[1]);
                    return m;
                })
                .collect(Collectors.toList());

        AdminPurchaseReportDTO dto = new AdminPurchaseReportDTO();
        dto.setRange(formatRange(range));
        dto.setGeneratedAt(new SimpleDateFormat("dd MMM yyyy, hh:mm a").format(new Date()));
        dto.setTotalOrders(summaries.size());
        dto.setTotalRevenue(totalRevenue);
        dto.setTotalItemsSold(totalItemsSold);
        dto.setBestSellingProducts(bestSellers);
        dto.setPaymentMethodBreakdown(methodBreakdown);
        dto.setPaymentStatusBreakdown(statusBreakdown);
        dto.setOrdersByDate(ordersByDate);
        dto.setOrders(summaries);

        return dto;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Validates range and returns [from, to] epoch millis (UTC).
     * Throws IllegalArgumentException on invalid input.
     */
    public long[] getDateRange(String range) {
        if (range == null || range.isBlank()) {
            throw new IllegalArgumentException("Range is required. Use: last-week, last-month, last-year");
        }
        long now = System.currentTimeMillis();
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        cal.setTimeInMillis(now);

        switch (range.toLowerCase().trim()) {
            case "last-week":
                cal.add(Calendar.DAY_OF_YEAR, -7);
                break;
            case "last-month":
                cal.add(Calendar.MONTH, -1);
                break;
            case "last-year":
                cal.add(Calendar.YEAR, -1);
                break;
            default:
                throw new IllegalArgumentException(
                        "Invalid range: '" + range + "'. Valid values: last-week, last-month, last-year");
        }

        return new long[]{cal.getTimeInMillis(), now};
    }

    private String formatRange(String range) {
        if (range == null) return "Unknown";
        switch (range.toLowerCase().trim()) {
            case "last-week": return "Last 7 Days";
            case "last-month": return "Last Month";
            case "last-year": return "Last Year";
            default: return range;
        }
    }

    @SuppressWarnings("unchecked")
    private OrderSummaryDTO toOrderSummary(Order order) {
        List<Map<String, Object>> items;
        try {
            if (order.getItems() instanceof List) {
                items = (List<Map<String, Object>>) order.getItems();
            } else if (order.getItems() instanceof String) {
                items = objectMapper.readValue((String) order.getItems(),
                        new TypeReference<List<Map<String, Object>>>() {});
            } else {
                items = objectMapper.convertValue(order.getItems(),
                        new TypeReference<List<Map<String, Object>>>() {});
            }
        } catch (Exception e) {
            log.warn("Failed to parse items for order {}: {}", order.getId(), e.getMessage());
            items = Collections.emptyList();
        }

        double subtotal = 0;
        int totalItems = 0;
        for (Map<String, Object> item : items) {
            try {
                double price = Double.parseDouble(String.valueOf(item.getOrDefault("price", 0)));
                int qty = Integer.parseInt(String.valueOf(item.getOrDefault("quantity", 1)));
                subtotal += price * qty;
                totalItems += qty;
            } catch (Exception ignored) {}
        }

        double totalAmount = subtotal + DELIVERY_FEE;

        String paymentStatus = order.getPaymentStatus() != null
                ? order.getPaymentStatus()
                : (Boolean.TRUE.equals(order.getPayment()) ? "PAID" : "PENDING");

        String txnId = order.getRazorpayPaymentId() != null
                ? order.getRazorpayPaymentId()
                : (order.getTransactionId() != null ? order.getTransactionId() : "N/A");

        String orderDate = new SimpleDateFormat("dd MMM yyyy, hh:mm a")
                .format(new Date(order.getDate() != null ? order.getDate() : 0));

        return new OrderSummaryDTO(
                order.getId(),
                orderDate,
                items,
                subtotal,
                DELIVERY_FEE,
                totalAmount,
                order.getPaymentMethod() != null ? order.getPaymentMethod() : "N/A",
                paymentStatus,
                Boolean.TRUE.equals(order.getPayment()),
                txnId,
                order.getNotes() != null ? order.getNotes() : "",
                totalItems
        );
    }
}
