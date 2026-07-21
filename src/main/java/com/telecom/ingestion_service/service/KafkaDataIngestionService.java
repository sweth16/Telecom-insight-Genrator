package com.telecom.ingestion_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaDataIngestionService {

    private final JdbcTemplate jdbcTemplate;

    // In-memory buffer to hold messages before batch insertion
    private final List<Map<String, Object>> messageBuffer = new ArrayList<>();

    // The maximum number of records to hold before forcing a database insert
    private static final int BATCH_SIZE_THRESHOLD = 40;

    /**
     * Consumes messages from Kafka continuously, but only adds them to an in-memory list.
     * Triggers a batch insert ONLY if the list size reaches 50.
     */
    @KafkaListener(topics = "telecom-network-metrics", groupId = "telecom-ingestion-group", concurrency = "3")
    public synchronized void consumeTelemetry(Map<String, Object> payload) {

        messageBuffer.add(payload);
        log.debug("Buffered message. Current buffer size: {}", messageBuffer.size());

        if (messageBuffer.size() >= BATCH_SIZE_THRESHOLD) {
            log.info("Batch threshold reached ({} records). Triggering batch insert.", BATCH_SIZE_THRESHOLD);
            flushBufferToDatabase();
        }
    }

    /**
     * A scheduled task that runs every 15 minutes.
     * If the buffer has records (but hasn't reached 50 yet), this forces the insert
     * so data doesn't sit in memory forever during low-traffic periods.
     */
    @Scheduled(fixedRate = 900000) // 15 minutes in milliseconds
    public synchronized void scheduledBufferFlush() {
        if (!messageBuffer.isEmpty()) {
            log.info("Scheduled 15-minute flush triggered. Flushing {} pending records.", messageBuffer.size());
            flushBufferToDatabase();
        }
    }

    /**
     * The core logic for taking the in-memory list and running a high-performance
     * Batch Insert into PostgreSQL.
     */
    private void flushBufferToDatabase() {
        if (messageBuffer.isEmpty()) {
            return;
        }

        String sql = """
    INSERT INTO refined_network_metrics (
        timestamp,
        city,
        signal_strength_dbm,
        download_speed_mbps,
        upload_speed_mbps,
        avg_latency_ms,
        jitter_ms,
        network_type,
        device_model,
        carrier,
        network_band,
        battery_level_pct,
        temperature_c,
        connected_duration_min,
        handover_count,
        data_usage_mb,
        video_streaming_quality,
        vonr_enabled,
        congestion_level,
        ping_to_google_ms,
        dropped_calls,
        hour_of_day,
        state,
        region,
        environment_type,
        active_users,
        packet_loss_pct,
        weather_condition,
        network_utilization_pct,
        quality_score,
        is_peak_hour
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    """;

        try {
            // We copy the buffer to a local list so we can clear the main buffer instantly
            // allowing the Kafka consumer to keep receiving messages without blocking.
            List<Map<String, Object>> recordsToInsert = new ArrayList<>(messageBuffer);
            messageBuffer.clear();

            jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int i) throws SQLException {
                    Map<String, Object> record = recordsToInsert.get(i);

                    String timestampStr = (String) record.get("timestamp");
                    ps.setTimestamp(1, Timestamp.from(Instant.parse(timestampStr + "Z")));

                    ps.setString(2, (String) record.get("city"));
                    ps.setObject(3, record.get("signal_strength_dbm"));
                    ps.setObject(4, record.get("download_speed_mbps"));
                    ps.setObject(5, record.get("upload_speed_mbps"));
                    ps.setObject(6, record.get("avg_latency_ms"));
                    ps.setObject(7, record.get("jitter_ms"));
                    ps.setString(8, (String) record.get("network_type"));
                    ps.setString(9, (String) record.get("device_model"));
                    ps.setString(10, (String) record.get("carrier"));
                    ps.setString(11, (String) record.get("network_band"));
                    ps.setObject(12, record.get("battery_level_pct"));
                    ps.setObject(13, record.get("temperature_c"));
                    ps.setObject(14, record.get("connected_duration_min"));
                    ps.setObject(15, record.get("handover_count"));
                    ps.setObject(16, record.get("data_usage_mb"));
                    ps.setString(17, (String) record.get("video_streaming_quality"));
                    ps.setObject(18, record.get("vonr_enabled"));
                    ps.setString(19, (String) record.get("congestion_level"));
                    ps.setObject(20, record.get("ping_to_google_ms"));
                    ps.setObject(21, record.get("dropped_calls"));
                    ps.setObject(22, record.get("hour_of_day"));
                    ps.setString(23, (String) record.get("state"));
                    ps.setString(24, (String) record.get("region"));
                    ps.setString(25, (String) record.get("environment_type"));
                    ps.setObject(26, record.get("active_users"));
                    ps.setObject(27, record.get("packet_loss_pct"));
                    ps.setString(28, (String) record.get("weather_condition"));
                    ps.setObject(29, record.get("network_utilization_pct"));
                    ps.setObject(30, record.get("quality_score"));
                    ps.setBoolean(31, ((Integer) record.get("is_peak_hour")) == 1);
                }

                @Override
                public int getBatchSize() {
                    return recordsToInsert.size();
                }
            });

            log.info("Successfully batch inserted {} records into PostgreSQL.", recordsToInsert.size());

        } catch (Exception e) {
            log.error("Failed to execute batch insert into PostgreSQL", e);
        }
    }

/**
 * A scheduled task that runs every 2 minutes.
 * Logs the current record count in the refined_network_metrics table.
 */
@Scheduled(fixedRate = 120000) // 2 minutes in milliseconds
public void logTableRecordCount() {
    try {
        String countSql = "SELECT COUNT(*) FROM refined_network_metrics";
        Integer count = jdbcTemplate.queryForObject(countSql, Integer.class);
        log.info("Current record count in refined_network_metrics table: {}", count);
    } catch (Exception e) {
        log.error("Failed to retrieve record count from refined_network_metrics table", e);
    }
}

}

