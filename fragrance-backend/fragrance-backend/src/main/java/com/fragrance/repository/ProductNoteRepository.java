package com.fragrance.repository;

import com.fragrance.model.ProductNote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductNoteRepository extends JpaRepository<ProductNote, Long> {
}
