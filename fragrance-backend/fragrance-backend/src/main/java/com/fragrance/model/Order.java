package com.fragrance.model;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.util.Map;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Type(JsonType.class)
    @Column(columnDefinition = "json", nullable = false)
    private Object items; // Array of order items

    @Column(nullable = false)
    private Double amount;

    @Type(JsonType.class)
    @Column(columnDefinition = "json", nullable = false)
    private Map<String, Object> address;

    @Column(nullable = false)
    private String status = "Order Placed";

    @Column(nullable = false)
    private String paymentMethod;

    @Column(nullable = false)
    private Boolean payment = false;

    @Column(nullable = false)
    private Long date;

    @Column
    private String transactionId;

    @Column(length = 1000)
    private String notes;

    @Column
    @com.fasterxml.jackson.annotation.JsonProperty("deliveryDate")
    private Long deliveryDate;
}
