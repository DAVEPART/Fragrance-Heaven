package com.fragrance.repository;

import com.fragrance.model.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    // Latest 5 reviews for a product — JOIN inner-joins the user so that
    // any orphaned rows (e.g. from Phase 1 migration with user_id = 0) are silently
    // skipped.
    @Query("SELECT r FROM ProductReview r JOIN FETCH r.user u " +
            "WHERE r.product.id = :productId " +
            "ORDER BY r.createdAt DESC")
    List<ProductReview> findTop5ByProductIdOrderByCreatedAtDesc(@Param("productId") Long productId);

    // Average rating — exclude orphaned rows (user_id 0 is not a real user)
    @Query("SELECT AVG(r.rating) FROM ProductReview r " +
            "JOIN r.user u WHERE r.product.id = :productId")
    Double findAverageRatingByProductId(@Param("productId") Long productId);

    // Total review count — exclude orphaned rows
    @Query("SELECT COUNT(r) FROM ProductReview r " +
            "JOIN r.user u WHERE r.product.id = :productId")
    long countByProductId(@Param("productId") Long productId);

    // Duplicate check — uses real userId so no issue
    boolean existsByProductIdAndUserId(Long productId, Long userId);

    // User's own review for a product
    Optional<ProductReview> findByProductIdAndUserId(Long productId, Long userId);
}
