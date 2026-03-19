package com.fragrance.service;

import com.fragrance.dto.AdminPurchaseReportDTO;
import com.fragrance.dto.UserPurchaseReportDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfReportService {

    private final TemplateEngine templateEngine;

    private static final String LOGO_URL =
            "https://image2url.com/r2/default/images/1771608671397-4da66b08-148b-4a52-94c1-9935f0ade8d0.png";

    // ─────────────────────────────────────────────────────────────────────────
    // USER REPORT PDF
    // ─────────────────────────────────────────────────────────────────────────

    public byte[] generateUserReportPdf(UserPurchaseReportDTO dto) throws Exception {
        Map<String, Object> vars = new HashMap<>();
        vars.put("report", dto);
        vars.put("logoUrl", LOGO_URL);
        vars.put("currency", "Rs.");
        vars.put("hasOrders", dto.getOrders() != null && !dto.getOrders().isEmpty());
        return renderPdf("user-purchase-report", vars);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN REPORT PDF
    // ─────────────────────────────────────────────────────────────────────────

    public byte[] generateAdminReportPdf(AdminPurchaseReportDTO dto) throws Exception {
        Map<String, Object> vars = new HashMap<>();
        vars.put("report", dto);
        vars.put("logoUrl", LOGO_URL);
        vars.put("currency", "Rs.");
        vars.put("hasOrders", dto.getOrders() != null && !dto.getOrders().isEmpty());
        return renderPdf("admin-report", vars);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE — shared rendering pipeline
    // ─────────────────────────────────────────────────────────────────────────

    private byte[] renderPdf(String templateName, Map<String, Object> variables) throws Exception {
        Context ctx = new Context();
        ctx.setVariables(variables);

        String html;
        try {
            html = templateEngine.process(templateName, ctx);
        } catch (Exception e) {
            log.error("Thymeleaf error for template '{}': {}", templateName, e.getMessage(), e);
            throw new Exception("PDF template rendering failed: " + e.getMessage(), e);
        }

        // Convert HTML5 → well-formed XHTML for Flying Saucer
        Document doc = Jsoup.parse(html, "UTF-8");
        doc.outputSettings().syntax(Document.OutputSettings.Syntax.xml);
        String xhtml = doc.html();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(xhtml);
            renderer.layout();
            renderer.createPDF(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Flying Saucer PDF generation failed for template '{}': {}", templateName, e.getMessage(), e);
            throw new Exception("PDF generation failed: " + e.getMessage(), e);
        }
    }
}
