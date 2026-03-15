package com.fragrance.controller;

import com.fragrance.service.DiscountService;
import com.fragrance.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/coupon")
@CrossOrigin(origins = "*")
@Slf4j
public class CouponController {

    @Autowired
    private DiscountService discountService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateCoupon(@RequestBody Map<String, Object> request,
            @RequestHeader(value = "token", required = false) String token) {
        
        if (token == null || token.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Login required to apply coupons"));
        }
        
        Long userId = jwtUtil.extractUserId(token);
        if (userId == null) {
            return ResponseEntity.ok(Map.of("success", false, "message", "User not authenticated"));
        }

        String code = (String) request.get("code");
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Coupon code is required"));
        }

        Double orderSubtotal;
        try {
            orderSubtotal = Double.parseDouble(request.get("subtotal").toString());
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Invalid order subtotal provided"));
        }

        log.info("Validating coupon {} for userId {} with subtotal {}", code, userId, orderSubtotal);
        Map<String, Object> response = discountService.validateDiscount(code, userId, orderSubtotal);
        return ResponseEntity.ok(response);
    }
}
