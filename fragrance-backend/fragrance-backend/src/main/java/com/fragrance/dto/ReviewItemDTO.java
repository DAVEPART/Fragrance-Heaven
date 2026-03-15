package com.fragrance.dto;

public class ReviewItemDTO {

    private Long userId;
    private String reviewerName;
    private Integer rating;
    private String message;
    private String createdAt;

    public ReviewItemDTO() {
    }

    public ReviewItemDTO(Long userId, String reviewerName, Integer rating, String message, String createdAt) {
        this.userId = userId;
        this.reviewerName = reviewerName;
        this.rating = rating;
        this.message = message;
        this.createdAt = createdAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
