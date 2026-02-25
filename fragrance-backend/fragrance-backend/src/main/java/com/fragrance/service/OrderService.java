package com.fragrance.service;

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

    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;

    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;

    private static final String CURRENCY = "inr";
    private static final int DELIVERY_CHARGE = 100;

    public Map<String, Object> placeOrder(String userId, Object items, Double amount, Map<String, Object> address,
            String transactionId, String notes) {
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
            Double amount, Map<String, Object> address, String origin) {
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

    public Map<String, Object> placeOrderRazorpay(String userId, Object items, Double amount,
            Map<String, Object> address, String transactionId, String notes) {
        Map<String, Object> response = new HashMap<>();

        try {
            Order order = new Order();
            order.setUserId(userId);
            order.setItems(items);
            order.setAddress(address);
            order.setAmount(amount);
            order.setPaymentMethod("Razorpay");
            order.setPayment(false);
            order.setDate(System.currentTimeMillis());
            order.setDeliveryDate(order.getDate() + (5L * 24 * 60 * 60 * 1000));
            order.setTransactionId(transactionId);
            order.setNotes(notes);

            Order savedOrder = orderRepository.save(order);

            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            org.json.JSONObject orderRequest = new org.json.JSONObject();
            orderRequest.put("amount", amount.intValue() * 100);
            orderRequest.put("currency", CURRENCY.toUpperCase());
            orderRequest.put("receipt", savedOrder.getId().toString());

            com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequest);

            response.put("success", true);
            response.put("order", razorpayOrder.toJson());

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    public Map<String, Object> verifyRazorpay(String userId, String razorpayOrderId) {
        Map<String, Object> response = new HashMap<>();

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            com.razorpay.Order orderInfo = razorpay.orders.fetch(razorpayOrderId);

            if ("paid".equals(orderInfo.get("status"))) {
                String receipt = orderInfo.get("receipt");
                Optional<Order> orderOptional = orderRepository.findById(Long.parseLong(receipt));
                if (orderOptional.isPresent()) {
                    Order order = orderOptional.get();
                    order.setPayment(true);
                    orderRepository.save(order);
                }

                Optional<User> userOptional = userRepository.findById(Long.parseLong(userId));
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    user.setCartData(new HashMap<>());
                    userRepository.save(user);
                }

                response.put("success", true);
                response.put("message", "Payment Successful");
            } else {
                response.put("success", false);
                response.put("message", "Payment Failed");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", e.getMessage());
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
