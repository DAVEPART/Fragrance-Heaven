package com.fragrance.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

public interface ProductService {
    Map<String, Object> addProduct(Map<String, Object> productData, MultipartFile imageMain, MultipartFile[] gallery);

    Map<String, Object> listProducts();

    Map<String, Object> getFilteredProducts(String category, String subCategory, String brand,
            Double minPrice, Double maxPrice, String concentration,
            String character, String occasion, String note, String season,
            String search, String sort, int page, int size);

    Map<String, Object> removeProduct(Long id);

    Map<String, Object> singleProduct(Long productId);

    Map<String, Object> getProductBySlug(String slug);

    Map<String, Object> getFilterOptions();

    Map<String, Object> getRelatedProducts(Long productId);

    Map<String, Object> getBestSellers();

    Map<String, Object> updateProduct(Long id, Map<String, Object> productData, MultipartFile imageMain,
            MultipartFile[] gallery);
}
