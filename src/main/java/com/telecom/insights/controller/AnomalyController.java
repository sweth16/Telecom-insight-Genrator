package com.telecom.insights.controller;

import com.telecom.insights.agent.AnomalyAgent;
import com.telecom.insights.repository.AnomalyAlertRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/anomaly")
@CrossOrigin(origins = "*")
public class AnomalyController {

    private final AnomalyAgent anomalyAgent;

    private final AnomalyAlertRepository alertRepository;

    @Value("${anomaly.agent.threshold.quality-score:0.50}")
    private double qualityScore;

    @Value("${anomaly.agent.threshold.quality-drops:5}")
    private int qualityDrops;

    @Value("${anomaly.agent.threshold.latency:100}")
    private int latency;

    @Value("${anomaly.agent.threshold.device-drops:5000}")
    private int deviceDrops;

    public AnomalyController(
            AnomalyAgent anomalyAgent,
            AnomalyAlertRepository alertRepository
    ) {

        this.anomalyAgent = anomalyAgent;
        this.alertRepository = alertRepository;
    }

    // =====================================================
    // MANUAL ANOMALY SCAN
    // =====================================================

    @GetMapping("/check")
    public ResponseEntity<?> runManualCheck() {

        String result = anomalyAgent.runManualCheck();

        return ResponseEntity.ok(
                Map.of(
                        "status", "SUCCESS",
                        "message", result
                )
        );
    }

    // =====================================================
    // GET UNREAD ALERTS
    // =====================================================

    @GetMapping("/alerts")
    public ResponseEntity<List<Map<String, Object>>> getUnreadAlerts() {

        return ResponseEntity.ok(
                alertRepository.getUnreadAlerts()
        );
    }

    // =====================================================
    // MARK ALERT AS READ
    // =====================================================

    @PutMapping("/alerts/{id}/read")
    public ResponseEntity<Map<String, Object>> markAlertAsRead(
            @PathVariable Long id
    ) {

        alertRepository.markAsRead(id);

        return ResponseEntity.ok(
                Map.of(
                        "status", "SUCCESS",
                        "message", "Alert marked as read",
                        "alertId", id
                )
        );
    }

    // =====================================================
    // GET ANOMALY THRESHOLDS
    // =====================================================

    @GetMapping("/thresholds")
    public ResponseEntity<Map<String, Object>> getThresholds() {
        Map<String, Object> m = new LinkedHashMap<>();
        // Return camelCase (frontend expects) and kebab-case as fallback
        m.put("qualityScore", qualityScore);
        m.put("qualityDrops", qualityDrops);
        m.put("latency", latency);
        m.put("deviceDrops", deviceDrops);

        m.put("quality-score", qualityScore);
        m.put("quality-drops", qualityDrops);
        m.put("device-drops", deviceDrops);

        return ResponseEntity.ok(m);
    }
}