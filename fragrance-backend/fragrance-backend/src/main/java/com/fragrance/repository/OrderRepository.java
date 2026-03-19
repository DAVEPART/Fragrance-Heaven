package com.fragrance.repository;

import com.fragrance.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(String userId);

    // Report queries — date is stored as epoch millis (Long)
    List<Order> findByUserIdAndDateBetween(String userId, Long from, Long to);

    List<Order> findByDateBetween(Long from, Long to);

    @Query(value = "SELECT jt.productId, SUM(jt.totalSold) as totalSold " +
            "FROM orders o, " +
            "JSON_TABLE(o.items, '$[*]' COLUMNS ( " +
            "  productId BIGINT PATH '$.id', " +
            "  totalSold INT PATH '$.quantity' " +
            ")) AS jt " +
            "WHERE o.date >= :startDate " +
            "AND o.status != 'Cancelled' " +
            "GROUP BY jt.productId " +
            "ORDER BY totalSold DESC " +
            "LIMIT 3", nativeQuery = true)
    List<Object[]> findBestSellers(@Param("startDate") Long startDate);
}
