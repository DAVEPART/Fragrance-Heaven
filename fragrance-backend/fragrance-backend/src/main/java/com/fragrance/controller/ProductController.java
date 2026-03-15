package com.fragrance.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fragrance.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/product")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addProduct(
            @RequestParam("productData") String productDataJson,
            @RequestParam(value = "imageMain", required = false) MultipartFile imageMain,
            @RequestParam(value = "gallery", required = false) MultipartFile[] gallery) {

        try {
            Map<String, Object> productData = objectMapper.readValue(productDataJson,
                    new TypeReference<Map<String, Object>>() {
                    });
            Map<String, Object> response = productService.addProduct(productData, imageMain, gallery);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> listProducts() {
        Map<String, Object> response = productService.listProducts();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/filtered")
    public ResponseEntity<Map<String, Object>> getFilteredProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String subCategory,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String concentration,
            @RequestParam(required = false) String character,
            @RequestParam(required = false) String occasion,
            @RequestParam(required = false) String note,
            @RequestParam(required = false) String season,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Map<String, Object> response = productService.getFilteredProducts(category, subCategory, brand,
                minPrice, maxPrice, concentration, character, occasion, note, season, search, sort, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Map<String, Object>> getProductBySlug(@PathVariable String slug) {
        Map<String, Object> response = productService.getProductBySlug(slug);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/filters")
    public ResponseEntity<Map<String, Object>> getFilterOptions() {
        Map<String, Object> response = productService.getFilterOptions();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/filter-options")
    public ResponseEntity<Map<String, Object>> getFilterOptionsOld() {
        Map<String, Object> response = productService.getFilterOptions();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/related/{productId}")
    public ResponseEntity<Map<String, Object>> getRelatedProducts(@PathVariable Long productId) {
        Map<String, Object> response = productService.getRelatedProducts(productId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/remove")
    public ResponseEntity<Map<String, Object>> removeProduct(@RequestBody Map<String, Object> request) {
        Long id = Long.parseLong(request.get("id").toString());
        Map<String, Object> response = productService.removeProduct(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/single")
    public ResponseEntity<Map<String, Object>> singleProduct(@RequestBody Map<String, Object> request) {
        Long productId = Long.parseLong(request.get("productId").toString());
        Map<String, Object> response = productService.singleProduct(productId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/best-sellers")
    public ResponseEntity<Map<String, Object>> getBestSellers() {
        Map<String, Object> response = productService.getBestSellers();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Map<String, Object>> updateProduct(
            @PathVariable Long id,
            @RequestParam("productData") String productDataJson,
            @RequestParam(value = "imageMain", required = false) MultipartFile imageMain,
            @RequestParam(value = "gallery", required = false) MultipartFile[] gallery) {

        try {
            Map<String, Object> productData = objectMapper.readValue(productDataJson,
                    new TypeReference<Map<String, Object>>() {
                    });
            Map<String, Object> response = productService.updateProduct(id, productData, imageMain, gallery);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
