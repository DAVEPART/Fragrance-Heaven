package com.fragrance.service;

import com.fragrance.model.User;
import com.fragrance.repository.UserRepository;
import com.fragrance.util.JwtUtil;
import org.apache.commons.validator.routines.EmailValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    public Map<String, Object> registerUser(String name, String email, String password) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Check if user already exists
            Optional<User> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent()) {
                response.put("success", false);
                response.put("message", "User already exists");
                return response;
            }

            // Validate email format
            if (!EmailValidator.getInstance().isValid(email)) {
                response.put("success", false);
                response.put("message", "Please enter a valid email");
                return response;
            }

            // Validate password length
            if (password.length() < 8) {
                response.put("success", false);
                response.put("message", "Please enter a strong password");
                return response;
            }

            // Hash password
            String hashedPassword = passwordEncoder.encode(password);

            // Create new user
            User newUser = new User();
            newUser.setName(name);
            newUser.setEmail(email);
            newUser.setPassword(hashedPassword);
            newUser.setCartData(new HashMap<>());

            User savedUser = userRepository.save(newUser);

            // Generate token
            String token = jwtUtil.generateToken(savedUser.getId());

            response.put("success", true);
            response.put("token", token);

            // Send Welcome Email
            emailService.sendWelcomeEmail(email, name);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    public Map<String, Object> loginUser(String email, String password) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Find user by email
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (!userOptional.isPresent()) {
                response.put("success", false);
                response.put("message", "User doesn't exists");
                return response;
            }

            User user = userOptional.get();

            // Verify password
            boolean isMatch = passwordEncoder.matches(password, user.getPassword());

            if (isMatch) {
                String token = jwtUtil.generateToken(user.getId());
                response.put("success", true);
                response.put("token", token);
                response.put("userId", user.getId());
            } else {
                response.put("success", false);
                response.put("message", "Invalid credentials");
            }

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    public Map<String, Object> adminLogin(String email, String password) {
        Map<String, Object> response = new HashMap<>();

        try {
            if (email.equals(adminEmail) && password.equals(adminPassword)) {
                String token = jwtUtil.generateAdminToken(email, password);
                response.put("success", true);
                response.put("token", token);
            } else {
                response.put("success", false);
                response.put("message", "Invalid credentials");
            }

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    public Map<String, Object> forgotPassword(String email) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (!userOptional.isPresent()) {
                response.put("success", false);
                response.put("message", "User with this email does not exist");
                return response;
            }

            User user = userOptional.get();
            String otp = String.valueOf((int) (Math.random() * 900000) + 100000); // 6 digit OTP
            user.setResetPasswordOtp(otp);
            user.setResetPasswordOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
            userRepository.save(user);

            emailService.sendForgotPasswordEmail(email, otp);

            response.put("success", true);
            response.put("message", "OTP sent to your email");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to send OTP");
        }
        return response;
    }

    public Map<String, Object> resetPassword(String email, String otp, String newPassword) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (!userOptional.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return response;
            }

            User user = userOptional.get();
            if (user.getResetPasswordOtp() == null || !user.getResetPasswordOtp().equals(otp)) {
                response.put("success", false);
                response.put("message", "Invalid OTP");
                return response;
            }

            if (user.getResetPasswordOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
                response.put("success", false);
                response.put("message", "OTP expired");
                return response;
            }

            if (newPassword.length() < 8) {
                response.put("success", false);
                response.put("message", "Please enter a strong password (min 8 characters)");
                return response;
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            user.setResetPasswordOtp(null);
            user.setResetPasswordOtpExpiry(null);
            userRepository.save(user);

            response.put("success", true);
            response.put("message", "Password reset successful");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to reset password");
        }
        return response;
    }
}
