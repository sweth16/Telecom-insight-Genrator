package com.telecom.insights.controller;

import com.telecom.insights.service.PdfReportService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final PdfReportService pdfReportService;

    public ReportController(
            PdfReportService pdfReportService
    ) {

        this.pdfReportService = pdfReportService;
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadReport() {

        byte[] pdfBytes =
                pdfReportService.generateDashboardReport();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=telecom-report.pdf"
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}