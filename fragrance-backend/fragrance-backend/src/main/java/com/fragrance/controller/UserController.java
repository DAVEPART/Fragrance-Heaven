package com.fragrance.controller;

import com.fragrance.service.UserService;
import com.fragrance.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String password = request.get("password");

        Map<String, Object> response = userService.registerUser(name, email, password);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        Map<String, Object> response = userService.loginUser(email, password);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin")
    public ResponseEntity<Map<String, Object>> adminLogin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        Map<String, Object> response = userService.adminLogin(email, password);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/user/profile
     * Returns the logged-in user's name and email.
     * Used by the frontend ShopContext to prefill the order form.
     */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(
            @RequestHeader(value = "token", required = false) String token) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Login required"));
        }
        Long userId = jwtUtil.extractUserId(token);
        if (userId == null) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Invalid token"));
        }
        Map<String, Object> response = userService.getProfile(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Map<String, Object> response = userService.forgotPassword(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("password");
        Map<String, Object> response = userService.resetPassword(email, otp, newPassword);
        return ResponseEntity.ok(response);
    }
}
