package com.fragrance.dto;

import java.util.List;

public class ProductReviewsResponseDTO {

    private Double averageRating;
    private Long totalReviews;
    private List<ReviewItemDTO> reviews;
    // The current authenticated user's review (null if not logged in or hasn't
    // reviewed)
    private ReviewItemDTO userReview;

    public ProductReviewsResponseDTO() {
    }

    public ProductReviewsResponseDTO(Double averageRating, Long totalReviews, List<ReviewItemDTO> reviews,
            ReviewItemDTO userReview) {
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
        this.reviews = reviews;
        this.userReview = userReview;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Long getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(Long totalReviews) {
        this.totalReviews = totalReviews;
    }

    public List<ReviewItemDTO> getReviews() {
        return reviews;
    }

    public void setReviews(List<ReviewItemDTO> reviews) {
        this.reviews = reviews;
    }

    public ReviewItemDTO getUserReview() {
        return userReview;
    }

    public void setUserReview(ReviewItemDTO userReview) {
        this.userReview = userReview;
    }
}
