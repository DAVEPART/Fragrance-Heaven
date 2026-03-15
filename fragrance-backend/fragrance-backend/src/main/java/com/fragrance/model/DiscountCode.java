package com.fragrance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "discount_codes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "discount_percent", nullable = false)
    private Double discountPercent;

    @Column(name = "trigger_amount", nullable = false)
    private Double triggerAmount;

    @Column(name = "minimum_order_amount", nullable = false)
    private Double minimumOrderAmount;

    @Column(name = "issued_at", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date issuedAt;

    @Column(name = "expire_at", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date expireAt;

    @Column(name = "is_used", nullable = false)
    @Builder.Default
    private Boolean isUsed = false;

    @Column(name = "used_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date usedAt;

    @Column(name = "used_order_id")
    private Long usedOrderId;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        if (issuedAt == null) {
            issuedAt = new Date();
        }
    }
}
