package com.fragrance.controller;

import com.fragrance.model.Category;
import com.fragrance.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/category")
@CrossOrigin(origins = "*")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addCategory(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String name = request.get("name");
            String slug = name.toLowerCase().replace(" ", "-");

            if (categoryRepository.findByName(name).isPresent()) {
                response.put("success", false);
                response.put("message", "Category already exists");
                return ResponseEntity.ok(response);
            }

            Category category = new Category(name, slug);
            categoryRepository.save(category);

            response.put("success", true);
            response.put("message", "Category added");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> listCategories() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("categories", categoryRepository.findAll());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/remove")
    public ResponseEntity<Map<String, Object>> removeCategory(@RequestBody Map<String, Long> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            categoryRepository.deleteById(request.get("id"));
            response.put("success", true);
            response.put("message", "Category removed");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }
}
