package com.telecom.insights.service;

import com.telecom.insights.repository.DashboardRepository;

import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.ChartUtils;

import org.jfree.data.category.DefaultCategoryDataset;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

@Service
public class ChartService {

    private final DashboardRepository dashboardRepository;

    public ChartService(
            DashboardRepository dashboardRepository
    ) {

        this.dashboardRepository = dashboardRepository;
    }

    // =====================================================
    // LATENCY TREND CHART
    // =====================================================

    public byte[] generateLatencyChart() {

        try {

            List<Map<String, Object>> trend =
                    dashboardRepository.getHourlyUtilizationTrend();

            DefaultCategoryDataset dataset =
                    new DefaultCategoryDataset();

            for(Map<String, Object> row : trend) {

                dataset.addValue(
                        ((Number) row.get("avg_latency_ms")).doubleValue(),
                        "Latency",
                        row.get("hour_of_day").toString()
                );
            }

            JFreeChart chart =
                    ChartFactory.createLineChart(
                            "Hourly Latency Trend",
                            "Hour",
                            "Latency (ms)",
                            dataset
                    );

            ByteArrayOutputStream out =
                    new ByteArrayOutputStream();

            ChartUtils.writeChartAsPNG(
                    out,
                    chart,
                    700,
                    400
            );

            return out.toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate chart",
                    e
            );
        }
    }
}