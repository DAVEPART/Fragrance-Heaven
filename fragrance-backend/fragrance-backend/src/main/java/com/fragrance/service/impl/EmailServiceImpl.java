package com.fragrance.service.impl;

import com.fragrance.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${mail.from}")
    private String fromEmail;

    @Async
    @Override
    public void sendWelcomeEmail(String to, String name) {
        log.info("Preparing welcome email for user: {}, recipient: {}", name, to);
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", name);
        variables.put("logoUrl",
                "https://image2url.com/r2/default/images/1771608671397-4da66b08-148b-4a52-94c1-9935f0ade8d0.png");
        sendHtmlEmail(to, "Welcome to Fragrance Heaven!", "welcome-email", variables);
    }

    @Async
    @Override
    public void sendForgotPasswordEmail(String to, String otp) {
        log.info("Preparing forgot password OTP email for recipient: {}", to);
        Map<String, Object> variables = new HashMap<>();
        variables.put("otp", otp);
        variables.put("logoUrl",
                "https://image2url.com/r2/default/images/1771608671397-4da66b08-148b-4a52-94c1-9935f0ade8d0.png");
        sendHtmlEmail(to, "Reset Your Password - Fragrance Heaven", "forgot-password-email", variables);
    }

    @Async
    @Override
    public void sendHtmlEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        // Sanitize inputs
        String sanitizedTo = (to != null) ? to.trim() : "";
        String sanitizedFrom = (fromEmail != null) ? fromEmail.trim() : "";

        if (sanitizedTo.isEmpty()) {
            log.error("FAILURE: Recipient email address is null or empty. Subject: [{}]", subject);
            return;
        }

        log.info("Starting email send process. Recipient: [{}], Subject: [{}], Template: [{}]", sanitizedTo, subject,
                templateName);
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            Context context = new Context();
            context.setVariables(variables);

            String htmlContent = templateEngine.process(templateName, context);

            helper.setFrom(sanitizedFrom);
            helper.setTo(sanitizedTo);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("SUCCESS: Email sent successfully. Recipient: [{}], Subject: [{}]", sanitizedTo, subject);
        } catch (Exception e) {
            log.error("FAILURE: Failed to send email to [{}]. Subject: [{}]. Reason: {}", sanitizedTo, subject,
                    e.getMessage());
            // We don't rethrow strictly to avoid breaking the async caller, but we log the
            // full stack trace for debugging
            log.debug("Stack trace:", e);
        }
    }

    @Async
    @Override
    public void sendOrderConfirmation(String toEmail, String userName, com.fragrance.model.Order order) {
        log.info("Preparing order confirmation email for user: {}, recipient: {}", userName, toEmail);
        Map<String, Object> variables = new HashMap<>();
        variables.put("userName", userName);
        variables.put("orderId", order.getId());
        variables.put("totalAmount", order.getAmount());
        variables.put("items", order.getItems());
        variables.put("address", order.getAddress());
        variables.put("orderDate", new java.util.Date(order.getDate()));
        variables.put("deliveryDate", new java.util.Date(order.getDeliveryDate()));
        variables.put("paymentMethod", order.getPaymentMethod());
        variables.put("logoUrl",
                "https://image2url.com/r2/default/images/1771608671397-4da66b08-148b-4a52-94c1-9935f0ade8d0.png");

        sendHtmlEmail(toEmail, "Your Fragrance Heaven Order #" + order.getId() + " is Confirmed!", "order-confirmation",
                variables);
    }
}
