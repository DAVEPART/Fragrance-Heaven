package com.fragrance.controller;

import com.fragrance.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createContact(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String subject = request.get("subject");
        String message = request.get("message");

        Map<String, Object> response = contactService.createContact(name, email, subject, message);

        if ((Boolean) response.get("success")) {
            return ResponseEntity.status(201).body(response);
        } else {
            if (response.get("message").equals("All fields are required.")) {
                return ResponseEntity.status(400).body(response);
            }
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllContacts() {
        Map<String, Object> response = contactService.getAllContacts();

        if ((Boolean) response.get("success")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(500).body(response);
        }
    }
}
