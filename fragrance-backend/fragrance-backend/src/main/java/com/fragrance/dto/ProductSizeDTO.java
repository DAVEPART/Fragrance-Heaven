package com.fragrance.dto;

public class ProductSizeDTO {
    private Long id;
    private String sizeMl;
    private Double price;
    private Integer stock;

    public ProductSizeDTO() {
    }

    public ProductSizeDTO(Long id, String sizeMl, Double price, Integer stock) {
        this.id = id;
        this.sizeMl = sizeMl;
        this.price = price;
        this.stock = stock;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSizeMl() {
        return sizeMl;
    }

    public void setSizeMl(String sizeMl) {
        this.sizeMl = sizeMl;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }
}
