package com.fragrance.service;

import com.fragrance.model.Contact;
import com.fragrance.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;

    public Map<String, Object> createContact(String name, String email, String subject, String message) {
        Map<String, Object> response = new HashMap<>();

        try {
            if (name == null || email == null || subject == null || message == null ||
                    name.isEmpty() || email.isEmpty() || subject.isEmpty() || message.isEmpty()) {
                response.put("success", false);
                response.put("message", "All fields are required.");
                return response;
            }

            Contact contact = new Contact();
            contact.setName(name);
            contact.setEmail(email);
            contact.setSubject(subject);
            contact.setMessage(message);

            contactRepository.save(contact);

            response.put("success", true);
            response.put("message", "Message sent successfully!");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Server Error. Please try again later.");
        }

        return response;
    }

    public Map<String, Object> getAllContacts() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Contact> submissions = contactRepository.findAllByOrderByCreatedAtDesc();

            response.put("success", true);
            response.put("submissions", submissions);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch submissions");
        }

        return response;
    }
}
