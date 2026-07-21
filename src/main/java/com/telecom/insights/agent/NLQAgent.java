package com.telecom.insights.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.telecom.insights.model.QueryLog;
import com.telecom.insights.repository.QueryLogRepository;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class NLQAgent {

    private final ChatClient chatClient;

    private final JdbcTemplate jdbcTemplate;

    private final QueryLogRepository logRepository;

    private final ObjectMapper objectMapper;

    private final VectorStore vectorStore;

    public NLQAgent(

            ChatClient.Builder builder,

            JdbcTemplate jdbcTemplate,

            QueryLogRepository logRepository,

            ObjectMapper objectMapper,

            VectorStore vectorStore
    ) {

        this.chatClient =
                builder.build();

        this.jdbcTemplate =
                jdbcTemplate;

        this.logRepository =
                logRepository;

        this.objectMapper =
                objectMapper;

        this.vectorStore =
                vectorStore;
    }

    // =====================================================
    // MAIN NLQ ENGINE
    // =====================================================

    public Map<String, Object> processQuestion(
            String question
    ) {

        long start =
                System.currentTimeMillis();

        try {

            // =====================================================
            // NORMALIZE QUESTION
            // =====================================================

            String normalizedQuestion =
                    question
                            .toLowerCase()
                            .trim();

            // =====================================================
            // CACHE CHECK
            // =====================================================

            Optional<QueryLog> cached =
                    logRepository.findByQuestion(
                            normalizedQuestion
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
                        "NLQ_DB_CACHE"
                );

                return cachedMap;
            }

            // =====================================================
            // VECTOR SEARCH
            // =====================================================

            List<Document> docs =
                    vectorStore.similaritySearch(

                            SearchRequest.builder()

                                    .query(question)

                                    .topK(5)

                                    .similarityThreshold(0.5)

                                    .build()
                    );

            String context =
                    docs.stream()

                            .map(Document::getText)

                            .reduce(
                                    "",
                                    (a, b) -> a + "\n" + b
                            );

            // =====================================================
            // SQL PROMPT
            // =====================================================

            String prompt =
                    """
You are an expert PostgreSQL Telecom Analytics AI.

Generate VALID PostgreSQL SQL ONLY.

STRICT RULES:

1. Use ONLY this table:
refined_network_metrics

2. NEVER invent columns

3. Return ONLY executable SQL

4. NO markdown
5. NO explanations
6. NO comments
7. NO ```sql

8. ALWAYS use LOWER() for string comparison

9. ALWAYS use ILIKE for text filtering

10. ALWAYS LIMIT RESULTS TO 50

11. NEVER SELECT *

12. SELECT ONLY REQUIRED COLUMNS

13. If aggregation is used:
ALWAYS include GROUP BY

14. For comparisons:
ALWAYS include compared entities

15. If user asks highest/best:
ORDER BY DESC

16. If user asks lowest/worst:
ORDER BY ASC

17. NEVER generate incomplete SQL

18. NEVER hallucinate schema columns

19. NEVER use AVG(), SUM(), MIN(), MAX()
on VARCHAR/TEXT columns

20. ALWAYS generate PostgreSQL compatible SQL

=====================================================
TABLE:
refined_network_metrics
=====================================================

ALL AVAILABLE COLUMNS:

id
timestamp
city
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
environment_type
active_users
packet_loss_pct
weather_condition
network_utilization_pct
quality_score
is_peak_hour

=====================================================
TEXT COLUMNS
=====================================================

city
network_type
device_model
carrier
network_band
video_streaming_quality
congestion_level
state
region
environment_type
weather_condition

=====================================================
NUMERIC COLUMNS
=====================================================

signal_strength_dbm
download_speed_mbps
upload_speed_mbps
avg_latency_ms
jitter_ms
battery_level_pct
temperature_c
connected_duration_min
handover_count
data_usage_mb
ping_to_google_ms
dropped_calls
hour_of_day
active_users
packet_loss_pct
network_utilization_pct
quality_score

=====================================================
BOOLEAN COLUMNS
=====================================================

vonr_enabled
is_peak_hour

=====================================================
TELECOM DOMAIN MAPPING
=====================================================

latency = avg_latency_ms

download speed = download_speed_mbps

upload speed = upload_speed_mbps

packet loss = packet_loss_pct

signal strength = signal_strength_dbm

quality = quality_score

network utilization = network_utilization_pct

dropped calls = dropped_calls

jitter = jitter_ms

ping = ping_to_google_ms

streaming quality = video_streaming_quality

data usage = data_usage_mb

duration = connected_duration_min

temperature = temperature_c

battery = battery_level_pct

handover = handover_count

VoNR = vonr_enabled

=====================================================
IMPORTANT SQL RULES
=====================================================

- Use AVG() for average questions
- Use COUNT() for count questions
- Use MAX() for highest/best
- Use MIN() for lowest/worst
- Use GROUP BY for comparisons
- Use LIMIT 10 where applicable
- Use LOWER(column) ILIKE LOWER('value')
- NEVER aggregate text columns
- ALWAYS generate PostgreSQL compatible SQL

=====================================================
VECTOR CONTEXT
=====================================================

"""
                            + context +
                            """

=====================================================
USER QUESTION
=====================================================

"""
                            + question;

            // =====================================================
            // GENERATE SQL
            // =====================================================

            String generatedSql =
                    chatClient.prompt(prompt)
                            .call()
                            .content();

            // =====================================================
            // CLEAN SQL
            // =====================================================

            generatedSql =
                    generatedSql

                            .replace("```sql", "")

                            .replace("```", "")

                            .replace(";", "")

                            .trim();

            // =====================================================
            // AUTO LIMIT
            // =====================================================

            String lowerSql =
                    generatedSql.toLowerCase();

            if (!lowerSql.contains("limit")) {

                generatedSql =
                        generatedSql + " LIMIT 50";
            }

            System.out.println(
                    "================================="
            );

            System.out.println(
                    "GENERATED SQL:"
            );

            System.out.println(
                    generatedSql
            );

            System.out.println(
                    "================================="
            );

            // =====================================================
            // VALIDATION
            // =====================================================

            if (!lowerSql.startsWith("select")) {

                return Map.of(

                        "status", "FAILED",

                        "source", "NLQ_AGENT",

                        "reason",
                        "Invalid SQL generated"
                );
            }

            // DANGEROUS SQL BLOCK

            // =====================================================
// DANGEROUS SQL BLOCK
// =====================================================

            String normalizedSql =
                    " " + lowerSql + " ";

// BLOCK ONLY REAL DANGEROUS OPERATIONS

            if (

                    normalizedSql.contains(" delete ")

                            || normalizedSql.contains(" drop table ")

                            || normalizedSql.contains(" truncate ")

                            || normalizedSql.contains(" alter table ")

                            || normalizedSql.contains(" insert into ")

                            || normalizedSql.contains(" update ")

                            || normalizedSql.contains(" create table ")

                            || normalizedSql.contains(" grant ")

                            || normalizedSql.contains(" revoke ")
            ) {

                System.out.println("=================================");
                System.out.println("BLOCKED SQL:");
                System.out.println(generatedSql);
                System.out.println("=================================");

                return Map.of(

                        "status", "FAILED",

                        "source", "NLQ_AGENT",

                        "reason",
                        "Unsafe SQL blocked"
                );
            }

            // INVALID QUERY

            if (lowerSql.contains("invalid_query")) {

                return Map.of(

                        "status", "FAILED",

                        "source", "NLQ_AGENT",

                        "reason",
                        "Question not supported by telecom dataset"
                );
            }

            // INCOMPLETE SQL

            if (

                    lowerSql.endsWith("=")

                            || lowerSql.endsWith("where")

                            || lowerSql.endsWith("group by")

                            || lowerSql.endsWith("order by")
            ) {

                return Map.of(

                        "status", "FAILED",

                        "source", "NLQ_AGENT",

                        "reason",
                        "Incomplete SQL generated"
                );
            }

            // BLOCK INVALID TEXT AGGREGATION

            if (

                    lowerSql.contains("avg(congestion_level)")
                            || lowerSql.contains("sum(congestion_level)")
                            || lowerSql.contains("max(congestion_level)")
                            || lowerSql.contains("min(congestion_level)")

                            || lowerSql.contains("avg(city)")
                            || lowerSql.contains("avg(carrier)")
                            || lowerSql.contains("avg(region)")
            ) {

                return Map.of(

                        "status", "FAILED",

                        "source", "NLQ_AGENT",

                        "reason",
                        "Invalid aggregation on text column"
                );
            }

            // =====================================================
            // EXECUTE SQL
            // =====================================================

            List<Map<String, Object>> results =
                    jdbcTemplate.queryForList(
                            generatedSql
                    );

            // =====================================================
            // LIMIT HUGE RESULT SETS
            // =====================================================

            if (results.size() > 20) {

                results =
                        results.subList(0, 20);
            }

            System.out.println(
                    "TOTAL ROWS: "
                            + results.size()
            );

            // =====================================================
            // EMPTY RESULTS
            // =====================================================

            if (results.isEmpty()) {

                return Map.of(

                        "status", "FAILED",

                        "source", "NLQ_AGENT",

                        "reason",
                        "No matching telecom data found"
                );
            }

            // =====================================================
            // ANSWER PROMPT
            // =====================================================

            String answerPrompt =
                    """
You are a Telecom Analytics AI Assistant.

Generate a concise telecom analytics response.

STRICT RULES:

- Use clean business English
- Mention important findings
- Mention best/worst performers
- Mention regions/carriers/devices if relevant
- Mention telecom metrics clearly
- Mention quality/performance insights
- NEVER mention SQL
- NEVER mention databases
- NEVER dump JSON
- NO markdown
- NO bullet points
- Keep response under 6 lines

QUESTION:
"""
                            + question +
                            """

RESULTS:
"""
                            + results;

            String finalAnswer =
                    chatClient.prompt(answerPrompt)
                            .call()
                            .content();

            // =====================================================
            // EXECUTION TIME
            // =====================================================

            long executionMs =
                    System.currentTimeMillis()
                            - start;

            // =====================================================
            // FINAL RESPONSE
            // =====================================================

            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put(
                    "question",
                    question
            );

            response.put(
                    "queryType",
                    "NLQ"
            );

            response.put(
                    "generatedSql",
                    generatedSql
            );

            response.put(
                    "rawData",
                    results
            );

            response.put(
                    "answer",
                    finalAnswer
            );

            response.put(
                    "status",
                    "SUCCESS"
            );

            response.put(
                    "executionMs",
                    executionMs
            );

            response.put(
                    "source",
                    "NLQ_AGENT"
            );

            // =====================================================
            // SAVE CACHE
            // =====================================================

            String json =
                    objectMapper.writeValueAsString(
                            response
                    );

            logRepository.save(

                    new QueryLog(
                            normalizedQuestion,
                            json
                    )
            );

            return response;

        } catch (Exception e) {

            e.printStackTrace();

            return Map.of(

                    "status", "FAILED",

                    "source", "NLQ_AGENT",

                    "reason",
                    e.getMessage()
            );
        }
    }
}