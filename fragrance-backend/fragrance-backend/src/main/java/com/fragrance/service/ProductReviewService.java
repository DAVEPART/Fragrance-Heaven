package com.fragrance.service;

import com.fragrance.dto.ApiResponse;
import com.fragrance.dto.ProductReviewsResponseDTO;
import com.fragrance.dto.ReviewRequestDTO;

public interface ProductReviewService {

    /**
     * Add a new review. The token is validated server-side; userId extracted from
     * JWT.
     * Returns error if user is not authenticated or has already reviewed this
     * product.
     */
    ApiResponse addReview(ReviewRequestDTO request, String token);

    /**
     * Get the latest 5 reviews, average rating, and total count for a product.
     * If token is provided (logged-in user), also returns the user's own review
     * (userReview field).
     */
    ProductReviewsResponseDTO getProductReviews(Long productId, String token);
}
