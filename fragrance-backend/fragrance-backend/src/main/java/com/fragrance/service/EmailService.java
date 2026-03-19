package com.fragrance.service;

import java.util.Map;

public interface EmailService {
    void sendWelcomeEmail(String to, String name);

    void sendForgotPasswordEmail(String to, String otp);

    void sendHtmlEmail(String to, String subject, String templateName, Map<String, Object> variables);

    void sendHtmlEmailWithAttachment(String to, String subject, String templateName, Map<String, Object> variables, byte[] attachment, String attachmentName);

    void sendOrderConfirmation(String toEmail, String userName, com.fragrance.model.Order order);

    void sendCouponUnlockEmail(String toEmail, String userName, com.fragrance.model.DiscountCode code);

    /**
     * Sends a fancy marketing-style email with the purchase report PDF attached.
     *
     * @param toEmail   recipient email
     * @param userName  customer display name
     * @param range     the display range string e.g. "Last Month"
     * @param totalOrders total order count for the period
     * @param totalAmount total spend for the period
     * @param pdfBytes  the generated report PDF bytes
     */
    void sendPurchaseReportEmail(String toEmail, String userName, String range,
                                  int totalOrders, double totalAmount, byte[] pdfBytes);
}

