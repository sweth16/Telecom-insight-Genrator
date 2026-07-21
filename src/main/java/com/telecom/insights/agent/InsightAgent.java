package com.telecom.insights.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.telecom.insights.model.QueryLog;
import com.telecom.insights.repository.QueryLogRepository;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class InsightAgent {

    private final ChatClient chatClient;

    private final QueryLogRepository logRepository;

    private final ObjectMapper objectMapper;

    public InsightAgent(

            ChatClient.Builder builder,

            QueryLogRepository logRepository,

            ObjectMapper objectMapper
    ) {

        this.chatClient =
                builder.build();

        this.logRepository =
                logRepository;

        this.objectMapper =
                objectMapper;
    }

    // =====================================================
    // STRICT TELECOM VALIDATION
    // =====================================================

    private boolean isTelecomQuestion(
            String question
    ) {

        String q =
                question.toLowerCase();

        // =====================================================
        // REJECT NON TELECOM
        // =====================================================

        if (

                q.contains("movie")

                        || q.contains("story")

                        || q.contains("cricket")

                        || q.contains("football")

                        || q.contains("ipl")

                        || q.contains("recipe")

                        || q.contains("cooking")

                        || q.contains("song")

                        || q.contains("poem")

                        || q.contains("joke")

                        || q.contains("anime")

                        || q.contains("love")

                        || q.contains("romance")

                        || q.contains("actor")

                        || q.contains("actress")

                        || q.contains("bitcoin")

                        || q.contains("stock")

                        || q.contains("politics")
        ) {

            return false;
        }

        // =====================================================
        // ALLOW TELECOM DOMAIN
        // =====================================================

        return

                q.contains("latency")

                        || q.contains("packet")

                        || q.contains("network")

                        || q.contains("download")

                        || q.contains("upload")

                        || q.contains("telecom")

                        || q.contains("carrier")

                        || q.contains("signal")

                        || q.contains("5g")

                        || q.contains("bandwidth")

                        || q.contains("kpi")

                        || q.contains("congestion")

                        || q.contains("dropped")

                        || q.contains("tower")

                        || q.contains("quality")

                        || q.contains("coverage")

                        || q.contains("speed")

                        || q.contains("anomaly")

                        || q.contains("region")

                        || q.contains("city")

                        || q.contains("state")

                        || q.contains("utilization")

                        || q.contains("battery")

                        || q.contains("temperature")

                        || q.contains("jitter")

                        || q.contains("vonr")

                        || q.contains("handover")

                        || q.contains("streaming")

                        || q.contains("video")

                        || q.contains("data usage")

                        || q.contains("usage")

                        || q.contains("ping")

                        || q.contains("duration")

                        || q.contains("weather")

                        || q.contains("environment")

                        || q.contains("urban")

                        || q.contains("rural")

                        || q.contains("peak")

                        || q.contains("active users")

                        || q.contains("network band")

                        || q.contains("device")

                        || q.contains("iphone")

                        || q.contains("galaxy")

                        || q.contains("pixel")

                        || q.contains("nord")

                        || q.contains("verizon")

                        || q.contains("at&t")

                        || q.contains("t-mobile")

                        || q.contains("bsnl")

                        || q.contains("vi");
    }

    // =====================================================
    // MAIN INSIGHT ENGINE
    // =====================================================

    public Map<String, Object> generateInsights(

            String question,

            List<Map<String, Object>> queryResults
    ) {

        long start =
                System.currentTimeMillis();

        try {

            // =====================================================
            // TELECOM VALIDATION
            // =====================================================

            if (!isTelecomQuestion(question)) {

                return Map.of(

                        "status", "REJECTED",

                        "source", "GUARDRAIL",

                        "message",
                        "The requested query is outside the supported telecom analytics domain."
                );
            }

            // =====================================================
            // CACHE KEY
            // =====================================================

            String cacheKey =
                    "insight_" +
                            question.toLowerCase();

            // =====================================================
            // CACHE CHECK
            // =====================================================

            Optional<QueryLog> cached =
                    logRepository.findByQuestion(
                            cacheKey
                    );

            if (cached.isPresent()) {

                Map<String, Object> cachedMap =
                        objectMapper.readValue(

                                cached.get()
                                        .getResponseJson(),

                                Map.class
                        );

                cachedMap.put(
                        "source",
                        "INSIGHT_DB_CACHE"
                );

                return cachedMap;
            }

            // =====================================================
            // NULL SAFETY
            // =====================================================

            if (queryResults == null) {

                queryResults = new ArrayList<>();
            }

            // =====================================================
            // EMPTY RESULT SAFETY
            // =====================================================

            if (queryResults.isEmpty()) {

                return Map.of(

                        "status", "FAILED",

                        "source", "INSIGHT_AGENT",

                        "reason",
                        "No telecom insight data found from SQL execution"
                );
            }

            // =====================================================
            // LIMIT RECORDS FOR AI
            // =====================================================

            List<Map<String, Object>> limitedResults =
                    queryResults.stream()
                            .limit(20)
                            .toList();

            // =====================================================
            // DEBUG LOGS
            // =====================================================

            System.out.println("=================================");
            System.out.println("INSIGHT AGENT RECEIVED DATA");
            System.out.println("TOTAL RECORDS: " + queryResults.size());
            System.out.println("=================================");

            // =====================================================
            // EXECUTIVE TELECOM PROMPT
            // =====================================================

            String prompt = """
You are a Senior Telecom Network Intelligence Analyst
working for an enterprise telecom operations center (NOC).

Analyze the telecom KPI dataset and generate
professional telecom insights.

=====================================================
AVAILABLE TELECOM COLUMNS
=====================================================

signal_strength_dbm
download_speed_mbps
upload_speed_mbps
avg_latency_ms
jitter_ms
network_type
device_model
carrier
network_band
battery_level_pct
temperature_c
connected_duration_min
handover_count
data_usage_mb
video_streaming_quality
vonr_enabled
congestion_level
ping_to_google_ms
dropped_calls
hour_of_day
state
region
city
environment_type
active_users
packet_loss_pct
weather_condition
network_utilization_pct
quality_score
is_peak_hour

=====================================================
ANALYZE
=====================================================

1. Executive Summary
2. Best Performing Areas
3. Worst Performing Areas
4. Carrier Comparison
5. Congestion Analysis
6. Latency & Packet Loss
7. Signal Quality
8. Peak Hour Impact
9. Device Analysis
10. Recommendations

=====================================================
RULES
=====================================================

- Only telecom analytics
- Professional telecom language
- Mention degradation if present
- Mention anomalies if present
- Mention best/worst regions
- Keep concise
- Max 15 lines

=====================================================
QUESTION
=====================================================

%s

=====================================================
DATA
=====================================================

%s
"""
                    .formatted(
                            question,
                            limitedResults
                    );

            // =====================================================
            // CALL LLM
            // =====================================================

            String insights =
                    chatClient.prompt(prompt)
                            .call()
                            .content();

            // =====================================================
            // NULL SAFETY
            // =====================================================

            if (insights == null
                    || insights.isBlank()) {

                insights =
                        "Telecom insights generated successfully, but AI summary was empty.";
            }

            // =====================================================
            // FINAL RESPONSE
            // =====================================================

            Map<String, Object> out =
                    new LinkedHashMap<>();

            out.put(
                    "status",
                    "SUCCESS"
            );

            out.put(
                    "source",
                    "INSIGHT_AGENT"
            );

            out.put(
                    "question",
                    question
            );

            out.put(
                    "insights",
                    insights
            );

            out.put(
                    "recordsAnalyzed",
                    queryResults.size()
            );

            out.put(
                    "executionMs",
                    System.currentTimeMillis()
                            - start
            );

            out.put(
                    "sampleData",
                    limitedResults
            );

            // =====================================================
            // CACHE SAVE
            // =====================================================

            String json =
                    objectMapper.writeValueAsString(
                            out
                    );

            logRepository.save(

                    new QueryLog(
                            cacheKey,
                            json
                    )
            );

            return out;

        } catch (Exception e) {

            e.printStackTrace();

            return Map.of(

                    "status", "FAILED",

                    "source", "INSIGHT_AGENT",

                    "reason",
                    e.getMessage()
            );
        }
    }
}