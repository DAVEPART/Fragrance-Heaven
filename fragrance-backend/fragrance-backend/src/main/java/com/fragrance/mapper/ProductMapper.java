package com.fragrance.mapper;

import com.fragrance.dto.*;
import com.fragrance.model.*;
import java.util.stream.Collectors;

public class ProductMapper {

    public static ProductResponseDTO toDTO(Product product) {
        if (product == null)
            return null;

        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setSubCategory(product.getSubCategory());
        dto.setSlug(product.getSlug());
        dto.setShortDescription(product.getShortDescription());
        dto.setFullDescription(product.getFullDescription());
        dto.setConcentration(product.getConcentration());
        dto.setFragranceCharacter(product.getFragranceCharacter());
        dto.setSeason(product.getSeason());
        dto.setOccasion(product.getOccasion());
        dto.setLongevity(product.getLongevity());
        dto.setSillage(product.getSillage());
        dto.setPriceBase(product.getPriceBase());
        dto.setRating(product.getRating());
        dto.setReviewCount(product.getReviewCount());
        dto.setDate(product.getDate());
        dto.setIsFeatured(product.getIsFeatured());
        dto.setImageMain(product.getImageMain());
        dto.setImageGallery(product.getImageGallery());

        if (product.getCategory() != null) {
            dto.setCategory(new CategoryDTO(
                    product.getCategory().getId(),
                    product.getCategory().getName(),
                    product.getCategory().getSlug()));
        }

        if (product.getBrand() != null) {
            dto.setBrand(new BrandDTO(
                    product.getBrand().getId(),
                    product.getBrand().getName(),
                    product.getBrand().getSlug(),
                    product.getBrand().getDescription()));
        }

        if (product.getSizes() != null) {
            dto.setSizes(product.getSizes().stream()
                    .map(s -> new ProductSizeDTO(s.getId(), s.getSizeMl(), s.getPrice(), s.getStock()))
                    .collect(Collectors.toList()));
        }

        if (product.getNotes() != null) {
            dto.setNotes(product.getNotes().stream()
                    .map(n -> new ProductNoteDTO(n.getId(), n.getType().name(), n.getNoteName()))
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}
