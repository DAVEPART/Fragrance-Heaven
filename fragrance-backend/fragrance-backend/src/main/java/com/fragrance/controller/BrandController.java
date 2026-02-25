package com.fragrance.controller;

import com.fragrance.model.Brand;
import com.fragrance.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/brand")
@CrossOrigin(origins = "*")
public class BrandController {

    @Autowired
    private BrandRepository brandRepository;

    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addBrand(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String name = request.get("name");
            String slug = name.toLowerCase().replace(" ", "-");
            String description = request.get("description");

            if (brandRepository.findByName(name).isPresent()) {
                response.put("success", false);
                response.put("message", "Brand already exists");
                return ResponseEntity.ok(response);
            }

            Brand brand = new Brand(name, slug, description);
            brandRepository.save(brand);

            response.put("success", true);
            response.put("message", "Brand added");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> listBrands() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("brands", brandRepository.findAll());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/remove")
    public ResponseEntity<Map<String, Object>> removeBrand(@RequestBody Map<String, Long> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            brandRepository.deleteById(request.get("id"));
            response.put("success", true);
            response.put("message", "Brand removed");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }
}
