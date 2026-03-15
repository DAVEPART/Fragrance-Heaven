package com.fragrance.controller;

import com.fragrance.service.CartService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
@Slf4j
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private com.fragrance.util.JwtUtil jwtUtil;

    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addToCart(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "token", required = false) String token) {
        try {
            if (token == null || token.isEmpty()) {
                return ResponseEntity.ok(Map.of("success", false, "message",
                        "Login required to add items to cart"));
            }

            Long userId = jwtUtil.extractUserId(token);
            if (userId == null) {
                return ResponseEntity.ok(Map.of("success", false, "message",
                        "User not authenticated"));
            }

            String itemId = request.get("itemId").toString();
            String size = request.get("size").toString();

            Integer quantity = 1;
            if (request.containsKey("quantity")) {
                Object qObj = request.get("quantity");
                if (qObj instanceof Number) {
                    quantity = ((Number) qObj).intValue();
                } else {
                    quantity = Integer.parseInt(qObj.toString());
                }
            }

            Map<String, Object> response = cartService.addToCart(userId, itemId, size, quantity);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error in addToCart: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("success", false, "message",
                    "Session expired or invalid token. Please login again."));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Map<String, Object>> updateCart(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "token", required = false) String token) {
        try {
            if (token == null || token.isEmpty()) {
                return ResponseEntity.ok(Map.of("success", false, "message",
                        "User not authenticated"));
            }

            Long userId = jwtUtil.extractUserId(token);
            if (userId == null) {
                return ResponseEntity.ok(Map.of("success", false, "message",
                        "User not authenticated"));
            }

            String itemId = request.get("itemId").toString();
            String size = request.get("size").toString();
            Integer quantity = Integer.parseInt(request.get("quantity").toString());

            Map<String, Object> response = cartService.updateCart(userId, itemId, size, quantity);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("success", false, "message",
                    "Failed to update cart"));
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, Object>> deleteCart(
            @PathVariable("id") String itemId,
            @RequestHeader(value = "token", required = false) String token) {
        try {
            if (token == null || token.isEmpty()) {
                return ResponseEntity.ok(Map.of("success", false, "message",
                        "User not authenticated"));
            }

            Long userId = jwtUtil.extractUserId(token);
            if (userId == null) {
                return ResponseEntity.ok(Map.of("success", false, "message",
                        "User not authenticated"));
            }

            Map<String, Object> response = cartService.deleteCart(userId, itemId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("success", false, "message",
                    "Failed to delete item"));
        }
    }

    /**
     * @param token
     * @return
     */
    @PostMapping("/get")
    public ResponseEntity<Map<String, Object>> getUserCart(
            @RequestHeader(value = "token", required = false) String token) {
        try {

            if (token == null || token.isEmpty()) {
                // Return empty cart if no token
                return ResponseEntity.ok(Map.of("success", true, "cartData", Map.of()));
            }

            Long userId = jwtUtil.extractUserId(token);
            if (userId == null) {
                return ResponseEntity.ok(Map.of("success", false, "message",
                        "User not authenticated"));
            }

            Map<String, Object> response = cartService.getUserCart(userId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("success", false, "message",
                    "Failed to fetch cart"));
        }
    }
}