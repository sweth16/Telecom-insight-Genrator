package com.telecom.insights.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;

import com.itextpdf.text.Image;

import com.telecom.insights.repository.DashboardRepository;
import com.telecom.insights.repository.AnomalyAlertRepository;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class PdfReportService {

    private final DashboardRepository dashboardRepository;

    private final AnomalyAlertRepository alertRepository;

    private final ChartService chartService;

    public PdfReportService(
            DashboardRepository dashboardRepository,
            AnomalyAlertRepository alertRepository,
            ChartService chartService
    ) {

        this.dashboardRepository = dashboardRepository;

        this.alertRepository = alertRepository;

        this.chartService = chartService;
    }

    public byte[] generateDashboardReport() {

        try {

            ByteArrayOutputStream out =
                    new ByteArrayOutputStream();

            Document document =
                    new Document();

            PdfWriter.getInstance(document, out);

            document.open();

            // =====================================================
            // TITLE
            // =====================================================

            Font titleFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            22
                    );

            Font sectionFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            16
                    );

            Paragraph title =
                    new Paragraph(
                            "Telecom Operational Intelligence Report",
                            titleFont
                    );

            title.setAlignment(Element.ALIGN_CENTER);

            document.add(title);

            document.add(new Paragraph(" "));

            // =====================================================
            // GENERATED TIME
            // =====================================================

            Paragraph generatedAt =
                    new Paragraph(
                            "Generated At: "
                                    + LocalDateTime.now()
                    );

            generatedAt.setAlignment(Element.ALIGN_RIGHT);

            document.add(generatedAt);

            document.add(new Paragraph(" "));

            // =====================================================
            // LIVE KPI SECTION
            // =====================================================

            Paragraph kpiTitle =
                    new Paragraph(
                            "Live KPI Snapshot",
                            sectionFont
                    );

            document.add(kpiTitle);

            document.add(new Paragraph(" "));

            Map<String, Object> kpis =
                    dashboardRepository.getAggregateKPIs();

            PdfPTable kpiTable =
                    new PdfPTable(2);

            kpiTable.setWidthPercentage(100);

            addTableHeader(kpiTable, "Metric");

            addTableHeader(kpiTable, "Value");

            kpiTable.addCell("Quality Score");

            kpiTable.addCell(
                    String.valueOf(
                            kpis.get("quality_score")
                    )
            );

            kpiTable.addCell("Dropped Calls");

            kpiTable.addCell(
                    String.valueOf(
                            kpis.get("total_dropped_calls")
                    )
            );

            kpiTable.addCell("Average Latency");

            kpiTable.addCell(
                    String.valueOf(
                            kpis.get("avg_latency")
                    ) + " ms"
            );

            kpiTable.addCell("Average Download");

            kpiTable.addCell(
                    String.valueOf(
                            kpis.get("avg_download")
                    ) + " Mbps"
            );

            document.add(kpiTable);

            document.add(new Paragraph(" "));

            // =====================================================
            // NETWORK LATENCY CHART
            // =====================================================

            Paragraph chartTitle =
                    new Paragraph(
                            "Network Latency Analysis",
                            sectionFont
                    );

            document.add(chartTitle);

            document.add(new Paragraph(" "));

            byte[] chartBytes =
                    chartService.generateLatencyChart();

            Image chartImage =
                    Image.getInstance(chartBytes);

            chartImage.scaleToFit(500, 300);

            chartImage.setAlignment(Element.ALIGN_CENTER);

            document.add(chartImage);

            document.add(new Paragraph(" "));

            // =====================================================
            // LIVE ANALYTICS SUMMARY
            // =====================================================

            Paragraph analyticsTitle =
                    new Paragraph(
                            "Network Analytics Summary",
                            sectionFont
                    );

            document.add(analyticsTitle);

            document.add(new Paragraph(" "));

            Map<String, Object> analytics =
                    dashboardRepository.getAnalyticsSummary();

            PdfPTable analyticsTable =
                    new PdfPTable(2);

            analyticsTable.setWidthPercentage(100);

            addTableHeader(
                    analyticsTable,
                    "Metric"
            );

            addTableHeader(
                    analyticsTable,
                    "Value"
            );

            analyticsTable.addCell("Total Nodes");

            analyticsTable.addCell(
                    String.valueOf(
                            analytics.get("total_nodes")
                    )
            );

            analyticsTable.addCell("Average Packet Loss");

            analyticsTable.addCell(
                    String.valueOf(
                            analytics.get("avg_packet_loss")
                    )
            );

            analyticsTable.addCell("Average Jitter");

            analyticsTable.addCell(
                    String.valueOf(
                            analytics.get("avg_jitter_ms")
                    )
            );

            analyticsTable.addCell("5G Coverage");

            analyticsTable.addCell(
                    String.valueOf(
                            analytics.get("coverage_5g_pct")
                    ) + "%"
            );

            document.add(analyticsTable);

            document.add(new Paragraph(" "));

            // =====================================================
            // LIVE ANOMALY ALERTS
            // =====================================================

            Paragraph alertTitle =
                    new Paragraph(
                            "Live Anomaly Alerts",
                            sectionFont
                    );

            document.add(alertTitle);

            document.add(new Paragraph(" "));

            List<Map<String, Object>> alerts =
                    alertRepository.getUnreadAlerts();

            PdfPTable alertTable =
                    new PdfPTable(3);

            alertTable.setWidthPercentage(100);

            addTableHeader(alertTable, "Severity");

            addTableHeader(alertTable, "Title");

            addTableHeader(alertTable, "Message");

            if(alerts.isEmpty()) {

                alertTable.addCell("INFO");

                alertTable.addCell("No Active Alerts");

                alertTable.addCell(
                        "Network operating normally"
                );

            } else {

                for(Map<String, Object> alert : alerts) {

                    alertTable.addCell(
                            String.valueOf(
                                    alert.get("severity")
                            )
                    );

                    alertTable.addCell(
                            String.valueOf(
                                    alert.get("title")
                            )
                    );

                    alertTable.addCell(
                            String.valueOf(
                                    alert.get("message")
                            )
                    );
                }
            }

            document.add(alertTable);

            document.add(new Paragraph(" "));

            // =====================================================
            // AI OPERATIONAL INSIGHT
            // =====================================================

            Paragraph aiTitle =
                    new Paragraph(
                            "AI Operational Insight",
                            sectionFont
                    );

            document.add(aiTitle);

            document.add(new Paragraph(" "));

            Paragraph aiContent =
                    new Paragraph(
                            "This enterprise telecom analysis report "
                                    + "contains live KPI snapshots, "
                                    + "Kafka-driven anomaly alerts, "
                                    + "network trend analysis, and "
                                    + "real-time operational intelligence "
                                    + "generated through the AI monitoring pipeline."
                    );

            document.add(aiContent);

            document.add(new Paragraph(" "));

            // =====================================================
            // FOOTER
            // =====================================================

            Paragraph footer =
                    new Paragraph(
                            "Generated by Telecom Insight Generator",
                            FontFactory.getFont(
                                    FontFactory.HELVETICA_OBLIQUE,
                                    12
                            )
                    );

            footer.setAlignment(Element.ALIGN_CENTER);

            document.add(footer);

            document.close();

            return out.toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate PDF report",
                    e
            );
        }
    }

    private void addTableHeader(
            PdfPTable table,
            String title
    ) {

        PdfPCell header =
                new PdfPCell();

        header.setPhrase(
                new Phrase(
                        title,
                        FontFactory.getFont(
                                FontFactory.HELVETICA_BOLD
                        )
                )
        );

        table.addCell(header);
    }
}