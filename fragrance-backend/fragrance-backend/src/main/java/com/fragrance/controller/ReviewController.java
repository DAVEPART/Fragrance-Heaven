package com.fragrance.controller;

import com.fragrance.dto.ApiResponse;
import com.fragrance.dto.ProductReviewsResponseDTO;
import com.fragrance.dto.ReviewRequestDTO;
import com.fragrance.service.ProductReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/review")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ProductReviewService productReviewService;

    /**
     * POST /api/review/add
     * Requires: Authorization token in header "token"
     * Body: { productId, rating, message }
     */
    @PostMapping("/add")
    public ResponseEntity<ApiResponse> addReview(
            @RequestHeader(value = "token", required = false) String token,
            @RequestBody ReviewRequestDTO request) {

        if (token == null || token.isBlank()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Authentication required. Please log in to submit a review."));
        }

        ApiResponse response = productReviewService.addReview(request, token);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            // 409 Conflict for duplicate review, 400 for other validation failures
            if ("You have already reviewed this product".equals(response.getMessage())) {
                return ResponseEntity.status(409).body(response);
            }
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * GET /api/review/product/{productId}
     * Optional: token header to return the current user's review
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductReviews(
            @PathVariable Long productId,
            @RequestHeader(value = "token", required = false) String token) {
        try {
            ProductReviewsResponseDTO data = productReviewService.getProductReviews(productId, token);
            return ResponseEntity.ok(ApiResponse.success("Reviews fetched successfully", data));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch reviews: " + e.getMessage()));
        }
    }
}
