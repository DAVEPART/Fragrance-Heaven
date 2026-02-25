package com.fragrance.dto;

import java.util.List;

public class ProductResponseDTO {
    private Long id;
    private String name;
    private String description;
    private CategoryDTO category;
    private String subCategory;
    private String slug;
    private BrandDTO brand;
    private String shortDescription;
    private String fullDescription;
    private String concentration;
    private String fragranceCharacter;
    private String season;
    private String occasion;
    private String longevity;
    private String sillage;
    private Double priceBase;
    private Double rating;
    private Integer reviewCount;
    private Long date;
    private Boolean isFeatured;
    private String imageMain;
    private List<String> imageGallery;
    private List<ProductSizeDTO> sizes;
    private List<ProductNoteDTO> notes;

    public ProductResponseDTO() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public CategoryDTO getCategory() {
        return category;
    }

    public void setCategory(CategoryDTO category) {
        this.category = category;
    }

    public String getSubCategory() {
        return subCategory;
    }

    public void setSubCategory(String subCategory) {
        this.subCategory = subCategory;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public BrandDTO getBrand() {
        return brand;
    }

    public void setBrand(BrandDTO brand) {
        this.brand = brand;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public String getFullDescription() {
        return fullDescription;
    }

    public void setFullDescription(String fullDescription) {
        this.fullDescription = fullDescription;
    }

    public String getConcentration() {
        return concentration;
    }

    public void setConcentration(String concentration) {
        this.concentration = concentration;
    }

    public String getFragranceCharacter() {
        return fragranceCharacter;
    }

    public void setFragranceCharacter(String fragranceCharacter) {
        this.fragranceCharacter = fragranceCharacter;
    }

    public String getSeason() {
        return season;
    }

    public void setSeason(String season) {
        this.season = season;
    }

    public String getOccasion() {
        return occasion;
    }

    public void setOccasion(String occasion) {
        this.occasion = occasion;
    }

    public String getLongevity() {
        return longevity;
    }

    public void setLongevity(String longevity) {
        this.longevity = longevity;
    }

    public String getSillage() {
        return sillage;
    }

    public void setSillage(String sillage) {
        this.sillage = sillage;
    }

    public Double getPriceBase() {
        return priceBase;
    }

    public void setPriceBase(Double priceBase) {
        this.priceBase = priceBase;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public Long getDate() {
        return date;
    }

    public void setDate(Long date) {
        this.date = date;
    }

    public Boolean getIsFeatured() {
        return isFeatured;
    }

    public void setIsFeatured(Boolean isFeatured) {
        this.isFeatured = isFeatured;
    }

    public String getImageMain() {
        return imageMain;
    }

    public void setImageMain(String imageMain) {
        this.imageMain = imageMain;
    }

    public List<String> getImageGallery() {
        return imageGallery;
    }

    public void setImageGallery(List<String> imageGallery) {
        this.imageGallery = imageGallery;
    }

    public List<ProductSizeDTO> getSizes() {
        return sizes;
    }

    public void setSizes(List<ProductSizeDTO> sizes) {
        this.sizes = sizes;
    }

    public List<ProductNoteDTO> getNotes() {
        return notes;
    }

    public void setNotes(List<ProductNoteDTO> notes) {
        this.notes = notes;
    }
}
