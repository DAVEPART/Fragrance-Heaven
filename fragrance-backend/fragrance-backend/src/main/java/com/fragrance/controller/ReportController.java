package com.fragrance.controller;

import com.fragrance.dto.AdminPurchaseReportDTO;
import com.fragrance.dto.UserPurchaseReportDTO;
import com.fragrance.service.EmailService;
import com.fragrance.service.OrderReportService;
import com.fragrance.service.PdfReportService;
import com.fragrance.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final OrderReportService orderReportService;
    private final PdfReportService pdfReportService;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;

    // ─────────────────────────────────────────────────────────────────────────
    // USER REPORT ENDPOINTS  /api/orders/user/report
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/orders/user/report?range=last-month
     * Returns purchase report JSON for the authenticated user.
     */
    @GetMapping("/api/orders/user/report")
    public ResponseEntity<?> getUserReport(
            @RequestParam String range,
            @RequestHeader(value = "token", required = false) String token) {

        String userId = extractUserId(token);
        if (userId == null) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Login required"));
        }

        try {
            UserPurchaseReportDTO report = orderReportService.getUserReport(userId, range);
            return ResponseEntity.ok(Map.of("success", true, "report", report));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error generating user report for userId={}, range={}", userId, range, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Failed to generate report: " + e.getMessage()));
        }
    }

    /**
     * GET /api/orders/user/report/pdf?range=last-month
     * Downloads the purchase report as a PDF for the authenticated user.
     */
    @GetMapping("/api/orders/user/report/pdf")
    public ResponseEntity<?> getUserReportPdf(
            @RequestParam String range,
            @RequestHeader(value = "token", required = false) String token) {

        String userId = extractUserId(token);
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Login required"));
        }

        try {
            UserPurchaseReportDTO report = orderReportService.getUserReport(userId, range);
            byte[] pdfBytes = pdfReportService.generateUserReportPdf(report);

            String filename = "PurchaseReport-" + range + ".pdf";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(pdfBytes.length)
                    .body(pdfBytes);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error generating user PDF for userId={}, range={}", userId, range, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "PDF generation failed: " + e.getMessage()));
        }
    }

    /**
     * POST /api/orders/user/report/email?range=last-month
     * Generates PDF and sends it to authenticated user's email.
     */
    @PostMapping("/api/orders/user/report/email")
    public ResponseEntity<?> emailUserReport(
            @RequestParam String range,
            @RequestHeader(value = "token", required = false) String token) {

        String userId = extractUserId(token);
        if (userId == null) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Login required"));
        }

        try {
            UserPurchaseReportDTO report = orderReportService.getUserReport(userId, range);

            byte[] pdfBytes;
            try {
                pdfBytes = pdfReportService.generateUserReportPdf(report);
            } catch (Exception e) {
                log.error("PDF generation failed for email, userId={}, range={}", userId, range, e);
                return ResponseEntity.internalServerError()
                        .body(Map.of("success", false, "message", "PDF generation failed: " + e.getMessage()));
            }

            // Send email asynchronously — failure does not break the response
            boolean emailQueued = true;
            try {
                emailService.sendPurchaseReportEmail(
                        report.getUserEmail(),
                        report.getUserName(),
                        report.getRange(),
                        report.getTotalOrders(),
                        report.getTotalAmount(),
                        pdfBytes
                );
            } catch (Exception e) {
                log.error("Email dispatch failed for userId={}, range={}", userId, range, e);
                emailQueued = false;
            }

            if (emailQueued) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Report sent to your email: " + report.getUserEmail()
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "emailSent", false,
                        "message", "Report generated but we couldn't send the email. Please try downloading instead."
                ));
            }

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error processing email report for userId={}, range={}", userId, range, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "An error occurred: " + e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN REPORT ENDPOINTS  /api/admin/reports
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/admin/reports/purchases?range=last-month
     * Returns the global admin report JSON.
     */
    @GetMapping("/api/admin/reports/purchases")
    public ResponseEntity<?> getAdminReport(@RequestParam String range) {
        try {
            AdminPurchaseReportDTO report = orderReportService.getAdminReport(range);
            return ResponseEntity.ok(Map.of("success", true, "report", report));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error generating admin report, range={}", range, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Failed to generate admin report: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/reports/purchases/pdf?range=last-month
     * Downloads admin business summary PDF.
     */
    @GetMapping("/api/admin/reports/purchases/pdf")
    public ResponseEntity<?> getAdminReportPdf(@RequestParam String range) {
        try {
            AdminPurchaseReportDTO report = orderReportService.getAdminReport(range);
            byte[] pdfBytes = pdfReportService.generateAdminReportPdf(report);

            String filename = "AdminReport-" + range + ".pdf";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(pdfBytes.length)
                    .body(pdfBytes);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error generating admin PDF, range={}", range, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Admin PDF generation failed: " + e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private String extractUserId(String token) {
        if (token == null || token.isBlank()) return null;
        Long id = jwtUtil.extractUserId(token);
        return id != null ? id.toString() : null;
    }
}
