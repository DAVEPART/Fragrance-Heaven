package com.fragrance.service;

import com.fragrance.dto.ApiResponse;
import com.fragrance.dto.ProductReviewsResponseDTO;
import com.fragrance.dto.ReviewItemDTO;
import com.fragrance.dto.ReviewRequestDTO;
import com.fragrance.model.Product;
import com.fragrance.model.ProductReview;
import com.fragrance.model.User;
import com.fragrance.repository.ProductRepository;
import com.fragrance.repository.ProductReviewRepository;
import com.fragrance.repository.UserRepository;
import com.fragrance.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductReviewServiceImpl implements ProductReviewService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired
    private ProductReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // ===== Resolve user from token =====

    private User resolveUser(String token) {
        if (token == null || token.isBlank())
            return null;
        try {
            Long userId = jwtUtil.extractUserId(token);
            if (userId == null)
                return null;
            return userRepository.findById(userId).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    // ===== Map a review to DTO =====

    private ReviewItemDTO toDTO(ProductReview r) {
        // Defensive null check — orphaned rows (user_id = 0 from Phase 1) skip cleanly
        if (r.getUser() == null) {
            return null;
        }
        return new ReviewItemDTO(
                r.getUser().getId(),
                r.getUser().getName(),
                r.getRating(),
                r.getMessage(),
                r.getCreatedAt() != null ? r.getCreatedAt().format(DATE_FORMATTER) : "");
    }

    // ===== addReview =====

    @Override
    @Transactional
    public ApiResponse addReview(ReviewRequestDTO request, String token) {
        // 1. Auth check
        User user = resolveUser(token);
        if (user == null) {
            return ApiResponse.error("You must be logged in to submit a review");
        }

        // 2. Validate rating
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            return ApiResponse.error("Rating must be between 1 and 5");
        }

        // 3. Validate message
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ApiResponse.error("Review message cannot be empty");
        }

        // 4. Validate productId
        if (request.getProductId() == null) {
            return ApiResponse.error("Product ID is required");
        }

        // 5. Find product
        Product product = productRepository.findById(request.getProductId()).orElse(null);
        if (product == null) {
            return ApiResponse.error("Product not found");
        }

        // 6. Duplicate check
        if (reviewRepository.existsByProductIdAndUserId(product.getId(), user.getId())) {
            return ApiResponse.error("You have already reviewed this product");
        }

        // 7. Save review
        ProductReview review = new ProductReview();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(request.getRating());
        review.setMessage(request.getMessage().trim());
        reviewRepository.save(review);

        // 8. Recalculate and update product rating statistics
        recalculateProductStats(product);

        return ApiResponse.success("Review submitted successfully");
    }

    // ===== getProductReviews =====

    @Override
    public ProductReviewsResponseDTO getProductReviews(Long productId, String token) {
        // Latest 5 reviews
        List<ProductReview> latestReviews = reviewRepository.findTop5ByProductIdOrderByCreatedAtDesc(productId);

        // Stats
        Double avgRating = reviewRepository.findAverageRatingByProductId(productId);
        long totalReviews = reviewRepository.countByProductId(productId);

        double roundedAvg = 0.0;
        if (avgRating != null) {
            roundedAvg = BigDecimal.valueOf(avgRating).setScale(1, RoundingMode.HALF_UP).doubleValue();
        }

        List<ReviewItemDTO> reviewDTOs = latestReviews.stream()
                .map(this::toDTO)
                .filter(java.util.Objects::nonNull) // skip any orphaned rows where user couldn't be loaded
                .limit(5)
                .collect(Collectors.toList());

        // Resolve current user's review (if logged in)
        ReviewItemDTO userReview = null;
        User user = resolveUser(token);
        if (user != null) {
            Optional<ProductReview> myReview = reviewRepository.findByProductIdAndUserId(productId, user.getId());
            userReview = myReview.map(this::toDTO).orElse(null);
        }

        return new ProductReviewsResponseDTO(roundedAvg, totalReviews, reviewDTOs, userReview);
    }

    // ===== Private helper =====

    private void recalculateProductStats(Product product) {
        Double avgRating = reviewRepository.findAverageRatingByProductId(product.getId());
        long totalReviews = reviewRepository.countByProductId(product.getId());

        double roundedAvg = 0.0;
        if (avgRating != null) {
            roundedAvg = BigDecimal.valueOf(avgRating).setScale(1, RoundingMode.HALF_UP).doubleValue();
        }

        product.setRating(roundedAvg);
        product.setReviewCount((int) totalReviews);
        productRepository.save(product);
    }
}
