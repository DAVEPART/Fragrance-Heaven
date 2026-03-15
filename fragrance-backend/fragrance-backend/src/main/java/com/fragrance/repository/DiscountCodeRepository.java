package com.fragrance.repository;

import com.fragrance.model.DiscountCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountCodeRepository extends JpaRepository<DiscountCode, Long> {

    Optional<DiscountCode> findByCode(String code);

    List<DiscountCode> findByUserId(Long userId);

    List<DiscountCode> findByUserIdAndIsUsedFalse(Long userId);
}
