package com.fragrance.controller;

import com.fragrance.service.OrderService;
import com.fragrance.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.fragrance.service.InvoiceService;
import com.fragrance.repository.OrderRepository;
import com.fragrance.model.Order;
import java.util.Optional;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/order")
@CrossOrigin(origins = "*")
@Slf4j
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/place")
    public ResponseEntity<Map<String, Object>> placeOrder(@RequestBody Map<String, Object> request,
            @RequestHeader(value = "token", required = false) String token) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Login required"));
        }
        Long userIdLong = jwtUtil.extractUserId(token);
        if (userIdLong == null) {
            log.warn("Failed to extract userId from token");
            return ResponseEntity.ok(Map.of("success", false, "message", "User not authenticated"));
        }
        String userId = userIdLong.toString();
        log.info("Processing order placement for userId: {}", userId);

        Object items = request.get("items");
        Double amount = ((Number) request.get("amount")).doubleValue();
        @SuppressWarnings("unchecked")
        Map<String, Object> address = (Map<String, Object>) request.get("address");
        String transactionId = (String) request.get("transactionId");
        String notes = (String) request.get("notes");

        Map<String, Object> response = orderService.placeOrder(userId, items, amount, address, transactionId, notes);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/stripe")
    public ResponseEntity<Map<String, Object>> placeOrderStripe(@RequestBody Map<String, Object> request,
            @RequestHeader(value = "token", required = false) String token,
            @RequestHeader("origin") String origin) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Login required"));
        }
        Long userIdLong = jwtUtil.extractUserId(token);
        if (userIdLong == null) {
            return ResponseEntity.ok(Map.of("success", false, "message", "User not authenticated"));
        }
        String userId = userIdLong.toString();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("items");
        Double amount = ((Number) request.get("amount")).doubleValue();
        @SuppressWarnings("unchecked")
        Map<String, Object> address = (Map<String, Object>) request.get("address");

        Map<String, Object> response = orderService.placeOrderStripe(userId, items, amount, address, origin);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verifyStripe")
    public ResponseEntity<Map<String, Object>> verifyStripe(@RequestBody Map<String, Object> request,
            @RequestHeader(value = "token", required = false) String token) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Login required"));
        }
        Long userIdLong = jwtUtil.extractUserId(token);
        if (userIdLong == null) {
            return ResponseEntity.ok(Map.of("success", false, "message", "User not authenticated"));
        }
        String userId = userIdLong.toString();

        Long orderId = Long.parseLong(request.get("orderId").toString());
        String success = (String) request.get("success");

        Map<String, Object> response = orderService.verifyStripe(orderId, success, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/razorpay")
    public ResponseEntity<Map<String, Object>> placeOrderRazorpay(@RequestBody Map<String, Object> request,
            @RequestHeader(value = "token", required = false) String token) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Login required"));
        }
        Long userIdLong = jwtUtil.extractUserId(token);
        if (userIdLong == null) {
            return ResponseEntity.ok(Map.of("success", false, "message", "User not authenticated"));
        }
        String userId = userIdLong.toString();

        Object items = request.get("items");
        Double amount = ((Number) request.get("amount")).doubleValue();
        @SuppressWarnings("unchecked")
        Map<String, Object> address = (Map<String, Object>) request.get("address");
        String transactionId = (String) request.get("transactionId");
        String notes = (String) request.get("notes");

        Map<String, Object> response = orderService.placeOrderRazorpay(userId, items, amount, address, transactionId,
                notes);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verifyRazorpay")
    public ResponseEntity<Map<String, Object>> verifyRazorpay(@RequestBody Map<String, Object> request,
            @RequestHeader(value = "token", required = false) String token) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Login required"));
        }
        Long userIdLong = jwtUtil.extractUserId(token);
        if (userIdLong == null) {
            return ResponseEntity.ok(Map.of("success", false, "message", "User not authenticated"));
        }
        String userId = userIdLong.toString();

        String razorpayOrderId = (String) request.get("razorpay_order_id");
        String razorpayPaymentId = (String) request.get("razorpay_payment_id");
        String razorpaySignature = (String) request.get("razorpay_signature");
        Long dbOrderId = Long.parseLong(request.get("orderId").toString());

        Map<String, Object> response = orderService.verifyRazorpay(userId, razorpayOrderId,
                razorpayPaymentId, razorpaySignature, dbOrderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> allOrders() {
        Map<String, Object> response = orderService.allOrders();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/userorders")
    public ResponseEntity<Map<String, Object>> userOrders(@RequestBody Map<String, String> request,
            @RequestHeader(value = "token", required = false) String token) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Login required"));
        }
        Long userIdLong = jwtUtil.extractUserId(token);
        if (userIdLong == null) {
            return ResponseEntity.ok(Map.of("success", false, "message", "User not authenticated"));
        }
        String userId = userIdLong.toString();

        Map<String, Object> response = orderService.userOrders(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/status")
    public ResponseEntity<Map<String, Object>> updateStatus(@RequestBody Map<String, Object> request) {
        Long orderId = Long.parseLong(request.get("orderId").toString());
        String status = (String) request.get("status");

        Map<String, Object> response = orderService.updateStatus(orderId, status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{orderId}/invoice")
    public ResponseEntity<?> downloadInvoice(
            @PathVariable Long orderId,
            @RequestHeader(value = "token", required = false) String token) {
        // Allow admin (without explicit userId check for now, or check token if needed)
        // Since there's no complex role check in this controller natively, we'll verify the order exists
        Optional<Order> orderOptional = orderRepository.findById(orderId);
        if (!orderOptional.isPresent()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Order not found"));
        }

        try {
            byte[] pdfBytes = invoiceService.generateInvoicePdf(orderOptional.get());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Invoice-" + orderId + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(pdfBytes.length)
                    .body(pdfBytes);
        } catch (Exception e) {
            log.error("Failed to generate invoice for orderId: {}", orderId, e);
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Error generating invoice: " + (e.getMessage() != null ? e.getMessage() : e.toString())));
        }
    }
}
