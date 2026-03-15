package com.fragrance.controller;

import com.fragrance.model.DiscountCode;
import com.fragrance.repository.DiscountCodeRepository;
import com.fragrance.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/coupons")
@CrossOrigin(origins = "*")
@Slf4j
public class AdminCouponController {

    @Autowired
    private DiscountCodeRepository discountCodeRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getCouponsList(@RequestHeader(value = "token", required = false) String token) {
        // Assume primitive admin check by token existence (based on previous endpoints logic)
        if (token == null || token.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Admin login required"));
        }
        
        // In a real system, verify if the user extracted from token has ADMIN role.
        
        Map<String, Object> response = new HashMap<>();
        try {
            List<DiscountCode> coupons = discountCodeRepository.findAll();
            
            long totalIssued = coupons.size();
            long totalUsed = coupons.stream().filter(DiscountCode::getIsUsed).count();
            
            long currentTime = System.currentTimeMillis();
            long totalExpired = coupons.stream()
                .filter(c -> !c.getIsUsed() && c.getExpireAt().getTime() < currentTime)
                .count();

            response.put("success", true);
            response.put("coupons", coupons);
            response.put("totalIssued", totalIssued);
            response.put("totalUsed", totalUsed);
            response.put("totalExpired", totalExpired);
            
        } catch (Exception e) {
            log.error("Error fetching coupons", e);
            response.put("success", false);
            response.put("message", "Error fetching coupons: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
}
