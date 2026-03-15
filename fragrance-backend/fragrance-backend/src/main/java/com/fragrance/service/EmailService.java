package com.fragrance.service;

import java.util.Map;

public interface EmailService {
    void sendWelcomeEmail(String to, String name);

    void sendForgotPasswordEmail(String to, String otp);

    void sendHtmlEmail(String to, String subject, String templateName, Map<String, Object> variables);

    void sendHtmlEmailWithAttachment(String to, String subject, String templateName, Map<String, Object> variables, byte[] attachment, String attachmentName);

    void sendOrderConfirmation(String toEmail, String userName, com.fragrance.model.Order order);
}
