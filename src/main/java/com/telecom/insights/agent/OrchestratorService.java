package com.telecom.insights.agent;

import com.telecom.insights.handler.GuardrailResponseHandler;
import com.telecom.insights.model.AgentType;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;

import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.SimpleVectorStore;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class OrchestratorService {

    private static final Logger logger =
            LoggerFactory.getLogger(
                    OrchestratorService.class
            );

    // =====================================================
    // VECTOR STORE
    // =====================================================

    private final SimpleVectorStore vectorStore;

    // =====================================================
    // AGENTS
    // =====================================================

    private final NLQAgent nlqAgent;

    private final InsightAgent insightAgent;

    private final AnomalyAgent anomalyAgent;

    private final GuardrailResponseHandler guardrail;

    // =====================================================
    // THRESHOLD
    // =====================================================

    private static final double THRESHOLD = 0.35;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public OrchestratorService(

            EmbeddingModel embeddingModel,

            NLQAgent nlqAgent,

            InsightAgent insightAgent,

            AnomalyAgent anomalyAgent,

            GuardrailResponseHandler guardrail
    ) {

        this.vectorStore =
                SimpleVectorStore.builder(
                        embeddingModel
                ).build();

        this.nlqAgent = nlqAgent;

        this.insightAgent = insightAgent;

        this.anomalyAgent = anomalyAgent;

        this.guardrail = guardrail;

        initializeSemanticRoutes();
    }

    // =====================================================
    // DOMAIN VALIDATION
    // =====================================================

    private boolean isTelecomIntent(String question) {

        String q = question.toLowerCase();

        return

                q.contains("latency")

                        || q.contains("download")

                        || q.contains("upload")

                        || q.contains("packet")

                        || q.contains("carrier")

                        || q.contains("network")

                        || q.contains("5g")

                        || q.contains("telecom")

                        || q.contains("signal")

                        || q.contains("region")

                        || q.contains("city")

                        || q.contains("device")

                        || q.contains("speed")

                        || q.contains("quality")

                        || q.contains("congestion")

                        || q.contains("drop")

                        || q.contains("iphone")

                        || q.contains("galaxy")

                        || q.contains("pixel")

                        || q.contains("nord")

                        || q.contains("verizon")

                        || q.contains("at&t")

                        || q.contains("t-mobile")

                        || q.contains("bsnl")

                        || q.contains("vi")

                        || q.contains("network_band")

                        || q.contains("packet loss")

                        || q.contains("active users")

                        || q.contains("quality score")

                        || q.contains("telecom analytics")

                        || q.contains("battery")

                        || q.contains("temperature")

                        || q.contains("jitter")

                        || q.contains("vonr")

                        || q.contains("handover")

                        || q.contains("streaming")

                        || q.contains("video")

                        || q.contains("usage")

                        || q.contains("data usage")

                        || q.contains("ping")

                        || q.contains("google")

                        || q.contains("duration")

                        || q.contains("peak hour")

                        || q.contains("weather")

                        || q.contains("environment")

                        || q.contains("urban")

                        || q.contains("rural")

                        || q.contains("state")

                        || q.contains("utilization")

                        || q.contains("calls")

                        || q.contains("dropped calls");
    }

    // =====================================================
    // INTENT CLASSIFIER
    // =====================================================

    private AgentType classifyIntent(
            String question
    ) {

        String q =
                question.toLowerCase();

        // =====================================================
        // INSIGHT QUESTIONS
        // =====================================================

        if (

                q.contains("why")

                        || q.contains("explain")

                        || q.contains("analyze")

                        || q.contains("analysis")

                        || q.contains("trend")

                        || q.contains("root cause")

                        || q.contains("reason")

                        || q.contains("insight")

                        || q.contains("summary")

                        || q.contains("recommendation")

                        || q.contains("performing better")

                        || q.contains("performance issue")

                        || q.contains("degradation")
        ) {

            return AgentType.INSIGHT_AGENT;
        }

        // =====================================================
        // ANOMALY QUESTIONS
        // =====================================================

        if (

                q.contains("anomaly")

                        || q.contains("abnormal")

                        || q.contains("outage")

                        || q.contains("spike")

                        || q.contains("failure")

                        || q.contains("suspicious")
        ) {

            return AgentType.ANOMALY_AGENT;
        }

        // =====================================================
        // DEFAULT → NLQ
        // =====================================================

        return AgentType.NLQ_AGENT;
    }

    // =====================================================
    // SEMANTIC ROUTES
    // =====================================================

    private void initializeSemanticRoutes() {

        logger.info(
                "Initializing telecom semantic routes..."
        );

        List<Document> routes = List.of(

                new Document(
                        """
                        telecom KPI metrics
                        telecom statistics
                        compare download speed
                        compare upload speed
                        compare latency
                        packet loss metrics
                        network utilization
                        carrier analytics
                        region analytics
                        city analytics
                        device analytics
                        network analytics
                        telecom trends
                        anomaly detection
                        signal strength analysis
                        battery performance
                        VoNR analysis
                        jitter metrics
                        ping analysis
                        data usage analytics
                        handover analysis
                        streaming quality
                        dropped call analytics
                        peak hour traffic
                        weather impact on network
                        urban vs rural comparison
                        quality score comparison
                        environment type analytics
                        carrier comparison
                        network band comparison
                        """
                        ,
                        Map.of(
                                "domain",
                                "telecom"
                        )
                )
        );

        vectorStore.add(routes);

        logger.info(
                "Telecom semantic routes initialized successfully."
        );
    }

    // =====================================================
    // MAIN ROUTER
    // =====================================================

    public Object route(String question) {

        try {

            question =
                    question.trim();

            logger.info(
                    "Routing Question: {}",
                    question
            );

            // =====================================================
            // GREETING HANDLER
            // =====================================================

            String q = question.toLowerCase().trim();

            List<String> greetings = List.of(
                    "hi",
                    "hello",
                    "hey",
                    "good morning",
                    "good evening",
                    "good afternoon"
            );

            if (greetings.contains(q)) {

                return Map.of(

                        "status", "SUCCESS",

                        "source", "GREETING_AGENT",

                        "message",
                        """
                        Hello 👋 Welcome to Telecom Insight Generator.

                        I can assist you with:
                        • Telecom KPI analysis
                        • Network anomaly detection
                        • Carrier performance insights
                        • Latency and throughput analytics
                        • Regional network trends
                        • Signal strength analysis
                        • VoNR analytics
                        • Battery and device analysis

                        Example Questions:
                        • Show average latency by carrier
                        • Which city has best signal strength?
                        • Compare download speed across regions
                        • Analyze packet loss trends
                        • Detect telecom anomalies
                        """
                );
            }

            // =====================================================
            // DOMAIN VALIDATION
            // =====================================================

            if (!isTelecomIntent(question)) {

                logger.warn(
                        "Rejected non telecom query"
                );

                return guardrail.handleOffTopic(
                        question
                );
            }

            // =====================================================
            // VECTOR SEARCH
            // =====================================================

            List<Document> matches =
                    vectorStore.similaritySearch(

                            SearchRequest.builder()

                                    .query(question)

                                    .topK(1)

                                    .similarityThreshold(
                                            THRESHOLD
                                    )

                                    .build()
                    );

            // =====================================================
            // SEMANTIC GUARDRAIL
            // =====================================================

            if (matches == null
                    || matches.isEmpty()) {

                logger.warn(
                        "Semantic Guardrail Triggered"
                );

                return guardrail.handleOffTopic(
                        question
                );
            }

            // =====================================================
            // CLASSIFY INTENT
            // =====================================================

            AgentType agentType =
                    classifyIntent(question);

            logger.info(
                    "Classified Agent: {}",
                    agentType
            );

            // =====================================================
            // ROUTING
            // =====================================================

            return switch (agentType) {

                // =====================================================
                // NLQ
                // =====================================================

                case NLQ_AGENT -> {

                    logger.info(
                            "Routing → NLQ_AGENT"
                    );

                    yield nlqAgent.processQuestion(
                            question
                    );
                }

                // =====================================================
                // INSIGHT
                // =====================================================

                case INSIGHT_AGENT -> {

                    logger.info(
                            "Routing → INSIGHT_AGENT"
                    );

                    String supportingQuestion =
                            """
                            Give telecom analytics data including:

                            download speed,
                            upload speed,
                            latency,
                            jitter,
                            packet loss,
                            signal strength,
                            congestion level,
                            dropped calls,
                            quality score,
                            network utilization,
                            battery level,
                            handover count,
                            video streaming quality,
                            VoNR enabled users,
                            ping to google,
                            data usage,
                            connected duration,
                            carrier,
                            city,
                            state,
                            region,
                            environment type,
                            network band,
                            active users,
                            weather condition,
                            peak hour analysis

                            related to:
                            """
                                    + question;

                    Map<String, Object> analyticsData =
                            nlqAgent.processQuestion(
                                    supportingQuestion
                            );

                    // =====================================================
                    // NULL CHECK
                    // =====================================================

                    if (analyticsData == null) {

                        yield Map.of(
                                "status", "FAILED",

                                "source",
                                "INSIGHT_AGENT",

                                "reason",
                                "Failed to fetch telecom analytics"
                        );
                    }

                    // =====================================================
                    // DEBUG FULL RESPONSE
                    // =====================================================

                    System.out.println("=================================");
                    System.out.println("FULL NLQ RESPONSE");
                    System.out.println(analyticsData);
                    System.out.println("=================================");

                    // =====================================================
                    // AUTO DETECT RESPONSE DATA
                    // =====================================================

                    Object rawData = null;

                    // =====================================================
                    // TRY MULTIPLE POSSIBLE KEYS
                    // =====================================================

                    String[] possibleKeys = {

                            "data",
                            "rawData",
                            "results",
                            "rows",
                            "result",
                            "response",
                            "records"
                    };

                    for (String key : possibleKeys) {

                        Object value = analyticsData.get(key);

                        if (value instanceof List<?> list
                                && !list.isEmpty()) {

                            rawData = value;

                            System.out.println("=================================");
                            System.out.println("FOUND DATA KEY : " + key);
                            System.out.println("ROWS COUNT : " + list.size());
                            System.out.println("=================================");

                            break;
                        }
                    }

                    // =====================================================
                    // VALIDATE DATA
                    // =====================================================

                    if (!(rawData instanceof List<?> rawList)
                            || rawList.isEmpty()) {

                        System.out.println("=================================");
                        System.out.println("NO VALID DATA FOUND");
                        System.out.println("AVAILABLE KEYS : " + analyticsData.keySet());
                        System.out.println("=================================");

                        yield Map.of(
                                "status", "FAILED",

                                "source",
                                "INSIGHT_AGENT",

                                "reason",
                                "No telecom insight data available"
                        );
                    }

                    // =====================================================
                    // CAST DATA
                    // =====================================================

                    List<Map<String, Object>> data =
                            (List<Map<String, Object>>) rawData;

                    // =====================================================
                    // DEBUG
                    // =====================================================

                    System.out.println("=================================");
                    System.out.println("TOTAL ROWS RECEIVED : " + data.size());
                    System.out.println("=================================");

                    // =====================================================
                    // GENERATE INSIGHTS
                    // =====================================================

                    yield insightAgent.generateInsights(

                            question,

                            data
                    );
                }

                // =====================================================
                // ANOMALY
                // =====================================================

                case ANOMALY_AGENT -> {

                    logger.info(
                            "Routing → ANOMALY_AGENT"
                    );

                    yield anomalyAgent.runManualCheck();
                }

                // =====================================================
                // DEFAULT
                // =====================================================

                default -> guardrail.handleOffTopic(
                        question
                );
            };

        } catch (Exception e) {

            logger.error(
                    "Semantic Routing Error",
                    e
            );

            return Map.of(

                    "status", "FAILED",

                    "source", "ORCHESTRATOR",

                    "reason",
                    "Unable to process telecom request"
            );
        }
    }
}