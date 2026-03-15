package com.fragrance.service;

import com.fragrance.model.DiscountCode;
import com.fragrance.model.Order;
import com.fragrance.model.User;
import com.fragrance.repository.DiscountCodeRepository;
import com.fragrance.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Calendar;
import java.util.Date;
import java.util.Optional;

@Service
@Slf4j
public class DiscountService {

    @Autowired
    private DiscountCodeRepository discountCodeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Value("${discount.trigger.amount:5000}")
    private Double triggerAmount;

    @Value("${discount.percent:10}")
    private Double discountPercent;

    @Value("${discount.minimum.order.amount:3000}")
    private Double minimumOrderAmount;

    @Value("${discount.valid.days:7}")
    private Integer validDays;

    @Value("${discount.code.length:6}")
    private Integer codeLength;

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public DiscountCode issueDiscountIfNeeded(Order order) {
        if (order.getAmount() == null || order.getAmount() < triggerAmount) {
            return null; // Order did not meet threshold
        }

        try {
            Long userId = Long.parseLong(order.getUserId());
            
            // Generate a unique code
            String code = generateCode(codeLength);
            while (discountCodeRepository.findByCode(code).isPresent()) {
                code = generateCode(codeLength);
            }

            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.DAY_OF_YEAR, validDays);
            Date expireAt = cal.getTime();

            DiscountCode discountCode = DiscountCode.builder()
                    .code(code)
                    .userId(userId)
                    .discountPercent(discountPercent)
                    .triggerAmount(triggerAmount)
                    .minimumOrderAmount(minimumOrderAmount)
                    .isUsed(false)
                    .issuedAt(new Date())
                    .expireAt(expireAt)
                    .build();

            DiscountCode saved = discountCodeRepository.save(discountCode);
            log.info("Issued discount code {} to userId {}", code, userId);

            // Send Email
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                emailService.sendCouponUnlockEmail(user.getEmail(), user.getName(), saved);
            }

            return saved;
        } catch (NumberFormatException e) {
            log.error("Failed to parse userId for discount generation: {}", order.getUserId());
            return null;
        }
    }

    private String generateCode(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }

    public java.util.Map<String, Object> validateDiscount(String code, Long userId, Double orderSubtotal) {
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        
        if (code == null || code.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Promotional code is required");
            return response;
        }

        Optional<DiscountCode> opt = discountCodeRepository.findByCode(code.trim().toUpperCase());
        if (!opt.isPresent()) {
            response.put("success", false);
            response.put("message", "Invalid promotional code");
            return response;
        }
        
        DiscountCode discountCode = opt.get();
        
        if (!discountCode.getUserId().equals(userId)) {
            response.put("success", false);
            response.put("message", "This code cannot be used with your account");
            return response;
        }
        
        if (discountCode.getIsUsed()) {
            response.put("success", false);
            response.put("message", "This code has already been used");
            return response;
        }
        
        if (discountCode.getExpireAt().before(new Date())) {
            response.put("success", false);
            response.put("message", "This promotional code has expired");
            return response;
        }
        
        if (orderSubtotal < discountCode.getMinimumOrderAmount()) {
            response.put("success", false);
            response.put("message", "Minimum order amount of Rs. " + discountCode.getMinimumOrderAmount() + " not met");
            return response;
        }
        
        double discountAmount = orderSubtotal * (discountCode.getDiscountPercent() / 100.0);
        
        response.put("success", true);
        response.put("message", "Promotional code applied successfully!");
        response.put("discountAmount", discountAmount);
        response.put("discountPercent", discountCode.getDiscountPercent());
        return response;
    }

    public void markDiscountUsed(String code, Long orderId) {
        if (code == null || code.trim().isEmpty()) return;
        discountCodeRepository.findByCode(code.trim().toUpperCase()).ifPresent(discount -> {
            discount.setIsUsed(true);
            discount.setUsedAt(new Date());
            discount.setUsedOrderId(orderId);
            discountCodeRepository.save(discount);
            log.info("Discount code {} marked as used for order ID {}", code, orderId);
        });
    }
}
