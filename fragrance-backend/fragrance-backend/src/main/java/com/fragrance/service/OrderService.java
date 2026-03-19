package com.fragrance.service;

import com.fragrance.model.DiscountCode;
import com.fragrance.model.Order;
import com.fragrance.model.User;
import com.fragrance.repository.OrderRepository;
import com.fragrance.repository.UserRepository;
import com.razorpay.RazorpayClient;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@Slf4j
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private DiscountService discountService;

    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;

    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;

    private static final String CURRENCY = "inr";
    private static final int DELIVERY_CHARGE = 100;

    public Map<String, Object> placeOrder(String userId, Object items, Double amount, Map<String, Object> address,
            String transactionId, String notes, String couponCode) {
        Map<String, Object> response = new HashMap<>();

        try {
            log.info("OrderService: Placing order for userId: {}", userId);
            Order order = new Order();
            order.setUserId(userId);
            order.setItems(items);
            order.setAddress(address);
            order.setAmount(amount);
            order.setPaymentMethod("COD");
            order.setPayment(false);
            order.setDate(System.currentTimeMillis());
            order.setDeliveryDate(order.getDate() + (5L * 24 * 60 * 60 * 1000));
            order.setTransactionId(transactionId);
            order.setNotes(notes);

            orderRepository.save(order);

            if (couponCode != null && !couponCode.trim().isEmpty()) {
                discountService.markDiscountUsed(couponCode, order.getId());
            }

            // Generate discount if applicable
            DiscountCode generatedCode = discountService.issueDiscountIfNeeded(order);
            if (generatedCode != null) {
                response.put("earnedCoupon", generatedCode.getCode());
                response.put("earnedCouponDetails", generatedCode);
            }

            // Clear cart
            Optional<User> userOptional = userRepository.findById(Long.parseLong(userId));
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setCartData(new HashMap<>());
                userRepository.save(user);

                // Send email
                emailService.sendOrderConfirmation(user.getEmail(), user.getName(), order);
            }

            response.put("success", true);
            response.put("message", "Order Placed");

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    public Map<String, Object> placeOrderStripe(String userId, List<Map<String, Object>> items,
            Double amount, Map<String, Object> address, String origin, String couponCode) {
        Map<String, Object> response = new HashMap<>();

        try {
            Stripe.apiKey = stripeSecretKey;

            Order order = new Order();
            order.setUserId(userId);
            order.setItems(items);
            order.setAddress(address);
            order.setAmount(amount);
            order.setPaymentMethod("Stripe");
            order.setPayment(false);
            order.setDate(System.currentTimeMillis());
            order.setDeliveryDate(order.getDate() + (5L * 24 * 60 * 60 * 1000));

            Order savedOrder = orderRepository.save(order);

            if (couponCode != null && !couponCode.trim().isEmpty()) {
                discountService.markDiscountUsed(couponCode, savedOrder.getId());
            }

            // Create line items for Stripe
            List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();

            for (Map<String, Object> item : items) {
                SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                        .setPriceData(
                                SessionCreateParams.LineItem.PriceData.builder()
                                        .setCurrency(CURRENCY)
                                        .setProductData(
                                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                        .setName((String) item.get("name"))
                                                        .build())
                                        .setUnitAmount(((Number) item.get("price")).longValue() * 100)
                                        .build())
                        .setQuantity(((Number) item.get("quantity")).longValue())
                        .build();
                lineItems.add(lineItem);
            }

            // Add delivery charge
            SessionCreateParams.LineItem deliveryItem = SessionCreateParams.LineItem.builder()
                    .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency(CURRENCY)
                                    .setProductData(
                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                    .setName("Delivery Charges")
                                                    .build())
                                    .setUnitAmount((long) DELIVERY_CHARGE * 100)
                                    .build())
                    .setQuantity(1L)
                    .build();
            lineItems.add(deliveryItem);

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(origin + "/verify?success=true&orderId=" + savedOrder.getId())
                    .setCancelUrl(origin + "/verify?success=false&orderId=" + savedOrder.getId())
                    .addAllLineItem(lineItems)
                    .build();

            Session session = Session.create(params);

            response.put("success", true);
            response.put("session_url", session.getUrl());

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    public Map<String, Object> verifyStripe(Long orderId, String success, String userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            if ("true".equals(success)) {
                Optional<Order> orderOptional = orderRepository.findById(orderId);
                if (orderOptional.isPresent()) {
                    Order order = orderOptional.get();
                    order.setPayment(true);
                    orderRepository.save(order);
                    discountService.issueDiscountIfNeeded(order);
                }

                Optional<User> userOptional = userRepository.findById(Long.parseLong(userId));
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    user.setCartData(new HashMap<>());
                    userRepository.save(user);
                }

                response.put("success", true);
            } else {
                orderRepository.deleteById(orderId);
                response.put("success", false);
            }

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PENDING PAYMENT SESSION STORE
    // Holds cart/address data between "create razorpay order" and "verify payment".
    // Keyed by razorpayOrderId. No DB order is created until HMAC passes.
    // ─────────────────────────────────────────────────────────────────────────
    private final Map<String, PendingPaymentData> pendingPayments = new java.util.concurrent.ConcurrentHashMap<>();

    /**
     * Lightweight value-object holding cart + delivery data for a pending Razorpay payment.
     * Kept in memory only — discarded when payment succeeds or is cancelled/expired.
     */
    public static class PendingPaymentData {
        public final String userId;
        public final Object items;
        public final Double amount;
        public final Map<String, Object> address;
        public final String notes;
        public final String couponCode;
        public final long createdAt;

        public PendingPaymentData(String userId, Object items, Double amount,
                Map<String, Object> address, String notes, String couponCode) {
            this.userId = userId;
            this.items = items;
            this.amount = amount;
            this.address = address;
            this.notes = notes;
            this.couponCode = couponCode;
            this.createdAt = System.currentTimeMillis();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: Create Razorpay order — NO DB order created here
    // ─────────────────────────────────────────────────────────────────────────
    public Map<String, Object> placeOrderRazorpay(String userId, Object items, Double amount,
            Map<String, Object> address, String transactionId, String notes, String couponCode) {
        Map<String, Object> response = new HashMap<>();

        try {
            if (razorpayKeyId == null || razorpayKeyId.isBlank()
                    || razorpayKeySecret == null || razorpayKeySecret.isBlank()) {
                response.put("success", false);
                response.put("message", "Razorpay is not configured. Contact support.");
                return response;
            }

            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            org.json.JSONObject orderRequest = new org.json.JSONObject();
            orderRequest.put("amount", amount.intValue() * 100); // paise
            orderRequest.put("currency", CURRENCY.toUpperCase());
            // Use timestamp as receipt (no DB order ID yet)
            orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis());

            com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequest);
            String rzpOrderId = razorpayOrder.get("id");

            // ── Store pending session — no DB write ──
            pendingPayments.put(rzpOrderId,
                    new PendingPaymentData(userId, items, amount, address, notes, couponCode));
            log.info("Pending Razorpay session created: razorpayOrderId={}, userId={}", rzpOrderId, userId);

            // Build serializable map for frontend
            Map<String, Object> razorpayOrderMap = new HashMap<>();
            razorpayOrderMap.put("id", rzpOrderId);
            razorpayOrderMap.put("amount", razorpayOrder.get("amount"));
            razorpayOrderMap.put("currency", razorpayOrder.get("currency"));
            razorpayOrderMap.put("receipt", razorpayOrder.get("receipt"));

            response.put("success", true);
            response.put("order", razorpayOrderMap);
            // NOTE: no dbOrderId — frontend must send razorpayOrderId to verify endpoint

        } catch (Exception e) {
            log.error("Failed to create Razorpay order for userId={}: {}", userId, e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Payment initiation failed: " + e.getMessage());
        }

        return response;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2: Cancel — user dismissed Razorpay popup
    // ─────────────────────────────────────────────────────────────────────────
    public Map<String, Object> cancelRazorpayPayment(String razorpayOrderId) {
        pendingPayments.remove(razorpayOrderId);
        log.info("Razorpay payment cancelled/dismissed, session cleaned: razorpayOrderId={}", razorpayOrderId);
        return Map.of("success", true, "message", "Payment cancelled. Your order was not placed.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3: Verify — HMAC check → ONLY THEN create DB order
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Verifies Razorpay HMAC SHA256 signature.
     * Formula: HMAC_SHA256(razorpayOrderId + "|" + razorpayPaymentId, keySecret) == razorpaySignature
     * If verification passes, creates the DB order and returns {success:true}.
     * If verification fails, cleans up the pending session and returns {success:false}.
     */
    public Map<String, Object> verifyRazorpay(String userId, String razorpayOrderId,
            String razorpayPaymentId, String razorpaySignature) {
        Map<String, Object> response = new HashMap<>();

        try {
            // ── Guard: missing params ──
            if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null) {
                response.put("success", false);
                response.put("message", "Missing payment parameters.");
                return response;
            }

            // ── HMAC SHA256 signature verification ──
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hashBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexHash = new StringBuilder();
            for (byte b : hashBytes) {
                hexHash.append(String.format("%02x", b));
            }
            String generatedSignature = hexHash.toString();

            boolean isValid = generatedSignature.equals(razorpaySignature);
            log.info("Razorpay signature verification for razorpayOrderId={}: {}",
                    razorpayOrderId, isValid ? "PASSED" : "FAILED");

            if (isValid) {
                // ── Retrieve pending session ──
                PendingPaymentData pending = pendingPayments.remove(razorpayOrderId);
                if (pending == null) {
                    log.warn("No pending session found for razorpayOrderId={}. Possible duplicate verify.", razorpayOrderId);
                    response.put("success", false);
                    response.put("message", "Payment session not found or already processed.");
                    return response;
                }

                // ── Create DB order NOW (after verification) ──
                Order order = new Order();
                order.setUserId(pending.userId);
                order.setItems(pending.items);
                order.setAddress(pending.address);
                order.setAmount(pending.amount);
                order.setPaymentMethod("Razorpay");
                order.setPayment(true);
                order.setPaymentStatus("PAID");
                order.setRazorpayPaymentId(razorpayPaymentId);
                order.setRazorpayOrderId(razorpayOrderId);
                order.setDate(System.currentTimeMillis());
                order.setDeliveryDate(order.getDate() + (5L * 24 * 60 * 60 * 1000));
                order.setNotes(pending.notes != null ? pending.notes : "");
                order.setTransactionDate(System.currentTimeMillis());

                Order savedOrder = orderRepository.save(order);
                log.info("Order created after Razorpay verification: orderId={}, userId={}", savedOrder.getId(), userId);

                // ── Apply coupon ──
                if (pending.couponCode != null && !pending.couponCode.trim().isEmpty()) {
                    try {
                        discountService.markDiscountUsed(pending.couponCode, savedOrder.getId());
                    } catch (Exception e) {
                        log.warn("Coupon marking failed for orderId={}: {}", savedOrder.getId(), e.getMessage());
                    }
                }

                // ── Issue discount if threshold reached ──
                DiscountCode generatedCode = discountService.issueDiscountIfNeeded(savedOrder);
                if (generatedCode != null) {
                    response.put("earnedCoupon", generatedCode.getCode());
                    response.put("earnedCouponDetails", generatedCode);
                }

                // ── Clear cart + send confirmation email ──
                Optional<User> userOptional = userRepository.findById(Long.parseLong(userId));
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    user.setCartData(new HashMap<>());
                    userRepository.save(user);
                    emailService.sendOrderConfirmation(user.getEmail(), user.getName(), savedOrder);
                    log.info("Order confirmation email sent to {}", user.getEmail());
                }

                response.put("success", true);
                response.put("message", "Payment successful! Your order has been placed.");
                response.put("orderId", savedOrder.getId());

            } else {
                // ── HMAC failed — remove pending session, no order created ──
                pendingPayments.remove(razorpayOrderId);
                log.warn("Razorpay signature mismatch for razorpayOrderId={}", razorpayOrderId);
                response.put("success", false);
                response.put("message", "Payment verification failed. Invalid signature. No order was created.");
            }

        } catch (Exception e) {
            log.error("Error during Razorpay verification for razorpayOrderId={}: {}", razorpayOrderId, e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Verification error: " + e.getMessage());
        }

        return response;
    }

    public Map<String, Object> allOrders() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Order> orders = orderRepository.findAll();

            response.put("success", true);
            response.put("orders", orders);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    public Map<String, Object> userOrders(String userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Order> orders = orderRepository.findByUserId(userId);

            response.put("success", true);
            response.put("orders", orders);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    public Map<String, Object> updateStatus(Long orderId, String status) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<Order> orderOptional = orderRepository.findById(orderId);

            if (orderOptional.isPresent()) {
                Order order = orderOptional.get();

                // Business logic check for cancellation if status is "Cancelled"
                if ("Cancelled".equalsIgnoreCase(status)) {
                    if (order.getDeliveryDate() != null) {
                        long currentTime = System.currentTimeMillis();
                        long diffInMs = order.getDeliveryDate() - currentTime;
                        long diffInDays = diffInMs / (24 * 60 * 60 * 1000);

                        if (diffInDays < 2) {
                            response.put("success", false);
                            response.put("message", "Order cannot be cancelled within 2 days of delivery.");
                            return response;
                        }
                    }

                    if ("Delivered".equalsIgnoreCase(order.getStatus())) {
                        response.put("success", false);
                        response.put("message", "Delivered orders cannot be cancelled.");
                        return response;
                    }
                }

                order.setStatus(status);
                orderRepository.save(order);

                response.put("success", true);
                response.put("message", "Status Updated");
            } else {
                response.put("success", false);
                response.put("message", "Order not found");
            }

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }
}

