package com.fragrance.service;

import com.fragrance.model.User;
import com.fragrance.repository.ProductRepository;
import com.fragrance.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class CartService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public Map<String, Object> addToCart(Long userId, String itemId, String size, Integer quantity) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<User> userOptional = userRepository.findById(userId);

            if (!userOptional.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return response;
            }

            User user = userOptional.get();
            Map<String, Object> cartData = user.getCartData();

            if (cartData == null) {
                cartData = new HashMap<>();
            }

            log.info("Adding to cart: userId={}, itemId={}, size={}, quantity={}", userId, itemId, size, quantity);

            // Check if item exists in cart
            if (cartData.containsKey(itemId)) {
                Object itemObj = cartData.get(itemId);
                if (itemObj instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> sizeMap = (Map<String, Object>) itemObj;
                    int currentQty = 0;
                    if (sizeMap.containsKey(size)) {
                        Object qtyObj = sizeMap.get(size);
                        currentQty = (qtyObj instanceof Number) ? ((Number) qtyObj).intValue()
                                : Integer.parseInt(qtyObj.toString());
                    }
                    sizeMap.put(size, currentQty + (quantity != null ? quantity : 1));
                }
            } else {
                Map<String, Integer> sizeMap = new HashMap<>();
                sizeMap.put(size, (quantity != null ? quantity : 1));
                cartData.put(itemId, sizeMap);
            }

            user.setCartData(cartData);
            userRepository.save(user);

            response.put("success", true);
            response.put("message", "Added To Cart");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    public Map<String, Object> updateCart(Long userId, String itemId, String size, Integer quantity) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<User> userOptional = userRepository.findById(userId);

            if (!userOptional.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return response;
            }

            User user = userOptional.get();
            Map<String, Object> cartData = user.getCartData();

            if (cartData != null && cartData.containsKey(itemId)) {
                @SuppressWarnings("unchecked")
                Map<String, Integer> sizeMap = (Map<String, Integer>) cartData.get(itemId);
                sizeMap.put(size, quantity);
            }

            user.setCartData(cartData);
            userRepository.save(user);

            response.put("success", true);
            response.put("message", "Cart Updated");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    public Map<String, Object> deleteCart(Long userId, String itemId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<User> userOptional = userRepository.findById(userId);

            if (!userOptional.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return response;
            }

            User user = userOptional.get();
            Map<String, Object> cartData = user.getCartData();

            if (cartData != null && cartData.containsKey(itemId)) {
                cartData.remove(itemId);
                user.setCartData(cartData);
                userRepository.save(user);
            }

            response.put("success", true);
            response.put("message", "Cart item deleted successfully");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    public Map<String, Object> getUserCart(Long userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<User> userOptional = userRepository.findById(userId);

            if (!userOptional.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return response;
            }

            User user = userOptional.get();
            Map<String, Object> cartData = user.getCartData();

            double totalAmount = 0;
            if (cartData != null) {
                totalAmount = calculateSubtotal(cartData);
            }

            response.put("success", true);
            response.put("cartData", cartData != null ? cartData : new HashMap<>());
            response.put("totalAmount", totalAmount);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    private double calculateSubtotal(Map<String, Object> cartData) {
        double subtotal = 0;
        for (Map.Entry<String, Object> itemEntry : cartData.entrySet()) {
            try {
                Long productId = Long.parseLong(itemEntry.getKey());
                Optional<com.fragrance.model.Product> productOpt = productRepository.findById(productId);

                if (productOpt.isPresent()) {
                    com.fragrance.model.Product product = productOpt.get();
                    @SuppressWarnings("unchecked")
                    Map<String, Integer> sizesMap = (Map<String, Integer>) itemEntry.getValue();

                    for (Map.Entry<String, Integer> sizeEntry : sizesMap.entrySet()) {
                        String sizeName = sizeEntry.getKey();
                        Integer quantity = sizeEntry.getValue();

                        // Find the price for the specific size from the Product's sizes list
                        if (product.getSizes() != null) {
                            product.getSizes().stream()
                                    .filter(ps -> ps.getSizeMl().equalsIgnoreCase(sizeName))
                                    .findFirst()
                                    .ifPresent(ps -> {
                                        // Using a temporary variable to add to subtotal is tricky in lambda,
                                        // but subtotal is local and not effectively final.
                                        // Let's use a traditional loop instead.
                                    });

                            for (com.fragrance.model.ProductSize ps : product.getSizes()) {
                                if (ps.getSizeMl().equalsIgnoreCase(sizeName)) {
                                    subtotal += ps.getPrice() * quantity;
                                    break;
                                }
                            }
                        }
                    }
                }
            } catch (Exception e) {
                // Skip invalid items
            }
        }
        return subtotal;
    }
}
