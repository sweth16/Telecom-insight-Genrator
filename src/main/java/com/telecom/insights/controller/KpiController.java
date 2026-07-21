package com.telecom.insights.controller;

import com.telecom.insights.repository.DashboardRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
public class KpiController {

    private final DashboardRepository dashboardRepository;

    public KpiController(DashboardRepository dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }

    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Object>> getKPIs() {
        return ResponseEntity.ok(dashboardRepository.getAggregateKPIs());
    }

    @GetMapping("/hourly-trend")
    public ResponseEntity<List<Map<String, Object>>> getHourlyTrend() {
        return ResponseEntity.ok(dashboardRepository.getHourlyUtilizationTrend());
    }

    @GetMapping("/band-performance")
    public ResponseEntity<List<Map<String, Object>>> getBandPerformance() {
        return ResponseEntity.ok(dashboardRepository.getBandPerformance());
    }

    @GetMapping("/worst-states")
    public ResponseEntity<List<Map<String, Object>>> getWorstStates() {
        return ResponseEntity.ok(dashboardRepository.getWorstStates());
    }

    @GetMapping("/carrier-scores")
    public ResponseEntity<List<Map<String, Object>>> getCarrierScores() {
        return ResponseEntity.ok(dashboardRepository.getCarrierScores());
    }

    @GetMapping("/carrier-performance")
    public ResponseEntity<List<Map<String, Object>>> getCarrierPerformance() {
        return ResponseEntity.ok(dashboardRepository.getCarrierPerformance());
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<Map<String, Object>> getAnalyticsSummary() {
        return ResponseEntity.ok(dashboardRepository.getAnalyticsSummary());
    }

    @GetMapping("/analytics/carrier-trend")
    public ResponseEntity<List<Map<String, Object>>> getCarrierQualityTrend() {
        return ResponseEntity.ok(dashboardRepository.getCarrierQualityTrend());
    }

    @GetMapping("/analytics/regional")
    public ResponseEntity<List<Map<String, Object>>> getRegionalUtilization() {
        return ResponseEntity.ok(dashboardRepository.getRegionalUtilization());
    }

    @GetMapping("/analytics/top-cities")
    public ResponseEntity<List<Map<String, Object>>> getTopCities() {
        return ResponseEntity.ok(dashboardRepository.getTopCities());
    }
}