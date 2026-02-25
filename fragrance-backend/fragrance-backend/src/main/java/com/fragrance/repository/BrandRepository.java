package com.fragrance.repository;

import com.fragrance.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    Optional<Brand> findBySlug(String slug);

    Optional<Brand> findByName(String name);
}
