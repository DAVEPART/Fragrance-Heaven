package com.fragrance.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fragrance.model.Order;
import com.fragrance.model.User;
import com.fragrance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import java.io.ByteArrayOutputStream;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class InvoiceService {

    @Autowired
    private TemplateEngine templateEngine;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    public byte[] generateInvoicePdf(Order order) throws Exception {
        Context context = new Context();
        context.setVariable("orderId", order.getId());
        context.setVariable("orderDate", new Date(order.getDate()));
        context.setVariable("paymentMethod", order.getPaymentMethod());
        context.setVariable("paymentStatus", order.getPaymentStatus() != null ? order.getPaymentStatus() : (order.getPayment() ? "PAID" : "PENDING"));
        context.setVariable("razorpayPaymentId", order.getRazorpayPaymentId());
        
        // Fetch User to get name and email
        String customerName = "Guest User";
        String customerEmail = "N/A";
        try {
            Long userIdLong = Long.parseLong(order.getUserId());
            Optional<User> userOpt = userRepository.findById(userIdLong);
            if (userOpt.isPresent()) {
                customerName = userOpt.get().getName();
                customerEmail = userOpt.get().getEmail();
            }
        } catch (NumberFormatException e) {
            // Ignored, user might be guest or older string format
        }
        
        context.setVariable("customerName", customerName);
        context.setVariable("customerEmail", customerEmail);
        context.setVariable("currency", "Rs.");

        // Set address
        context.setVariable("address", order.getAddress());

        // Parse items
        List<Map<String, Object>> itemsList;
        if (order.getItems() instanceof List) {
            itemsList = (List<Map<String, Object>>) order.getItems();
        } else if (order.getItems() instanceof String) {
            itemsList = objectMapper.readValue((String) order.getItems(), new TypeReference<List<Map<String, Object>>>() {});
        } else {
            itemsList = objectMapper.convertValue(order.getItems(), new TypeReference<List<Map<String, Object>>>() {});
        }
        context.setVariable("items", itemsList);

        double subtotal = 0;
        for (Map<String, Object> item : itemsList) {
            double price = Double.parseDouble(item.get("price").toString());
            int qty = Integer.parseInt(item.get("quantity").toString());
            subtotal += (price * qty);
        }

        context.setVariable("subtotal", subtotal);
        // Using same frontend logic (100 delivery fee)
        double shippingFee = 100;
        context.setVariable("shippingFee", shippingFee);
        context.setVariable("totalAmount", subtotal + shippingFee);

        context.setVariable("logoUrl", "https://image2url.com/r2/default/images/1771608671397-4da66b08-148b-4a52-94c1-9935f0ade8d0.png");

        // Generate HTML
        String html;
        try {
            html = templateEngine.process("invoice", context);
        } catch (Exception e) {
            Throwable root = e;
            StringBuilder msgs = new StringBuilder();
            while (root != null) {
                msgs.append(root.getMessage()).append(" -> ");
                root = root.getCause();
            }
            throw new Exception("Thymeleaf Parsing Error details: " + msgs.toString(), e);
        }

        // Convert HTML5 to strictly valid XHTML
        Document document = Jsoup.parse(html, "UTF-8");
        document.outputSettings().syntax(Document.OutputSettings.Syntax.xml);
        String xhtml = document.html();

        // Convert HTML to PDF
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(xhtml);
            renderer.layout();
            renderer.createPDF(outputStream);
            return outputStream.toByteArray();
        }
    }
}
