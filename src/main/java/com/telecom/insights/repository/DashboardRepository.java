package com.telecom.insights.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class DashboardRepository {

    private final JdbcTemplate jdbcTemplate;

    public DashboardRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // =====================================================
    // KPI CARDS
    // =====================================================

    public Map<String, Object> getAggregateKPIs() {

        String sql = """
            SELECT
                ROUND(AVG(quality_score), 2) AS quality_score,
                SUM(dropped_calls) AS total_dropped_calls,
                ROUND(AVG(avg_latency_ms), 2) AS avg_latency,
                ROUND(AVG(download_speed_mbps), 2) AS avg_download
            FROM refined_network_metrics
        """;

        return jdbcTemplate.queryForMap(sql);
    }

    // =====================================================
    // 24 HOUR TREND
    // =====================================================

    public List<Map<String, Object>> getHourlyUtilizationTrend() {

        String sql = """
            SELECT
                hour_of_day,
                ROUND(AVG(download_speed_mbps), 2) AS download_speed_mbps,
                ROUND(AVG(avg_latency_ms), 2) AS avg_latency_ms
            FROM refined_network_metrics
            GROUP BY hour_of_day
            ORDER BY hour_of_day
        """;

        return jdbcTemplate.queryForList(sql);
    }

    // =====================================================
    // BAND ANALYSIS
    // =====================================================

    public List<Map<String, Object>> getBandPerformance() {

        String sql = """
            SELECT
                network_band,
                SUM(dropped_calls) AS dropped_calls
            FROM refined_network_metrics
            GROUP BY network_band
            ORDER BY dropped_calls DESC
        """;

        return jdbcTemplate.queryForList(sql);
    }

    // =====================================================
    // WORST STATES
    // =====================================================

    public List<Map<String, Object>> getWorstStates() {

        String sql = """
            SELECT
                state,
                SUM(dropped_calls) AS total_dropped_calls,
                ROUND(AVG(packet_loss_pct), 2) AS avg_packet_loss
            FROM refined_network_metrics
            GROUP BY state
            ORDER BY total_dropped_calls DESC
            LIMIT 5
        """;

        return jdbcTemplate.queryForList(sql);
    }

    // =====================================================
    // CARRIER SCORES
    // =====================================================

    public List<Map<String, Object>> getCarrierScores() {

        String sql = """
            SELECT
                CASE
                    WHEN LOWER(TRIM(carrier)) LIKE '%at&t%' THEN 'AT&T'
                    WHEN LOWER(TRIM(carrier)) LIKE '%t-mobile%' THEN 'T-Mobile'
                    WHEN LOWER(TRIM(carrier)) LIKE '%verizon%' THEN 'Verizon'
                    ELSE TRIM(carrier)
                END AS carrier,

                ROUND(AVG(quality_score), 2) AS quality_score

            FROM refined_network_metrics

            GROUP BY
                CASE
                    WHEN LOWER(TRIM(carrier)) LIKE '%at&t%' THEN 'AT&T'
                    WHEN LOWER(TRIM(carrier)) LIKE '%t-mobile%' THEN 'T-Mobile'
                    WHEN LOWER(TRIM(carrier)) LIKE '%verizon%' THEN 'Verizon'
                    ELSE TRIM(carrier)
                END

            ORDER BY quality_score DESC
        """;

        return jdbcTemplate.queryForList(sql);
    }

    // =====================================================
    // CARRIER PERFORMANCE
    // =====================================================

    public List<Map<String, Object>> getCarrierPerformance() {

        String sql = """
            SELECT
                CASE
                    WHEN LOWER(TRIM(carrier)) LIKE '%at&t%' THEN 'AT&T'
                    WHEN LOWER(TRIM(carrier)) LIKE '%t-mobile%' THEN 'T-Mobile'
                    WHEN LOWER(TRIM(carrier)) LIKE '%verizon%' THEN 'Verizon'
                    ELSE TRIM(carrier)
                END AS carrier,

                ROUND(AVG(quality_score), 2) AS quality_score,
                ROUND(AVG(download_speed_mbps), 2) AS download_speed_mbps,
                ROUND(AVG(avg_latency_ms), 2) AS avg_latency_ms

            FROM refined_network_metrics

            GROUP BY
                CASE
                    WHEN LOWER(TRIM(carrier)) LIKE '%at&t%' THEN 'AT&T'
                    WHEN LOWER(TRIM(carrier)) LIKE '%t-mobile%' THEN 'T-Mobile'
                    WHEN LOWER(TRIM(carrier)) LIKE '%verizon%' THEN 'Verizon'
                    ELSE TRIM(carrier)
                END

            ORDER BY quality_score DESC
            LIMIT 5
        """;

        return jdbcTemplate.queryForList(sql);
    }

    // =====================================================
    // ANALYTICS SUMMARY
    // =====================================================

    public Map<String, Object> getAnalyticsSummary() {

        String sql = """
            SELECT
                COUNT(*) AS total_nodes,
                ROUND(AVG(packet_loss_pct), 2) AS avg_packet_loss,
                ROUND(AVG(jitter_ms), 2) AS avg_jitter_ms,
                ROUND(
                    100.0 * SUM(
                        CASE WHEN network_band = '5G' THEN 1 ELSE 0 END
                    ) / NULLIF(COUNT(*), 0),
                1) AS coverage_5g_pct
            FROM refined_network_metrics
        """;

        return jdbcTemplate.queryForMap(sql);
    }

    // =====================================================
    // CARRIER QUALITY TREND
    // =====================================================

    public List<Map<String, Object>> getCarrierQualityTrend() {

        String sql = """
            SELECT
                EXTRACT(MONTH FROM timestamp) AS month,

                CASE
                    WHEN LOWER(TRIM(carrier)) LIKE '%at&t%' THEN 'AT&T'
                    WHEN LOWER(TRIM(carrier)) LIKE '%t-mobile%' THEN 'T-Mobile'
                    WHEN LOWER(TRIM(carrier)) LIKE '%verizon%' THEN 'Verizon'
                    ELSE TRIM(carrier)
                END AS carrier,

                ROUND(AVG(quality_score), 2) AS quality_score

            FROM refined_network_metrics

            GROUP BY
                EXTRACT(MONTH FROM timestamp),

                CASE
                    WHEN LOWER(TRIM(carrier)) LIKE '%at&t%' THEN 'AT&T'
                    WHEN LOWER(TRIM(carrier)) LIKE '%t-mobile%' THEN 'T-Mobile'
                    WHEN LOWER(TRIM(carrier)) LIKE '%verizon%' THEN 'Verizon'
                    ELSE TRIM(carrier)
                END

            ORDER BY month, carrier
        """;

        return jdbcTemplate.queryForList(sql);
    }

    // =====================================================
    // REGIONAL UTILIZATION
    // =====================================================

    public List<Map<String, Object>> getRegionalUtilization() {

        String sql = """
            SELECT
                region,
                ROUND(
                    100.0 * AVG(download_speed_mbps)
                    / NULLIF(MAX(download_speed_mbps) OVER (), 0), 1
                ) AS utilization_pct,

                ROUND(AVG(avg_latency_ms), 2) AS avg_latency_ms

            FROM refined_network_metrics

            GROUP BY region

            ORDER BY utilization_pct DESC
        """;

        return jdbcTemplate.queryForList(sql);
    }

    // =====================================================
    // TOP PERFORMING CITIES
    // =====================================================

    public List<Map<String, Object>> getTopCities() {

        String sql = """
            SELECT
                city,
                ROUND(AVG(quality_score), 2) AS quality_score,
                ROUND(AVG(download_speed_mbps), 2) AS download_speed_mbps
            FROM refined_network_metrics
            GROUP BY city
            ORDER BY quality_score DESC
            LIMIT 5
        """;

        return jdbcTemplate.queryForList(sql);
    }
}