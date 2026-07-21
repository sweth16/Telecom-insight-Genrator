package com.telecom.insights.rag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class SchemaMetadataIngestor {

    private static final Logger logger =
            LoggerFactory.getLogger(
                    SchemaMetadataIngestor.class
            );

    private final VectorStore vectorStore;

    public SchemaMetadataIngestor(
            VectorStore vectorStore
    ) {

        this.vectorStore = vectorStore;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void ingestSchemaMetadata() {

        logger.info(
                "Initializing telecom schema metadata..."
        );

        String schema = """

====================================================
TELECOM ANALYTICS DATABASE SCHEMA
====================================================

TABLE NAME:
refined_network_metrics

====================================================
ALL AVAILABLE COLUMNS + DATA TYPES
====================================================

id (INTEGER)

timestamp (TIMESTAMP)

city (VARCHAR)

signal_strength_dbm (NUMERIC)

download_speed_mbps (NUMERIC)

upload_speed_mbps (NUMERIC)

avg_latency_ms (NUMERIC)

jitter_ms (NUMERIC)

network_type (VARCHAR)

device_model (VARCHAR)

carrier (VARCHAR)

network_band (VARCHAR)

battery_level_pct (NUMERIC)

temperature_c (NUMERIC)

connected_duration_min (NUMERIC)

handover_count (INTEGER)

data_usage_mb (NUMERIC)

video_streaming_quality (VARCHAR)

vonr_enabled (BOOLEAN)

congestion_level (VARCHAR)

ping_to_google_ms (NUMERIC)

dropped_calls (INTEGER)

hour_of_day (INTEGER)

state (VARCHAR)

region (VARCHAR)

environment_type (VARCHAR)

active_users (INTEGER)

packet_loss_pct (NUMERIC)

weather_condition (VARCHAR)

network_utilization_pct (NUMERIC)

quality_score (NUMERIC)

is_peak_hour (BOOLEAN)

====================================================
COLUMN DEFINITIONS
====================================================

signal_strength_dbm:
Network signal strength quality in dBm.
Higher values indicate stronger signal quality.

download_speed_mbps:
Download throughput speed in Mbps.

upload_speed_mbps:
Upload throughput speed in Mbps.

avg_latency_ms:
Average network response delay in milliseconds.
Lower latency means better responsiveness.

jitter_ms:
Variation in network latency.
Lower jitter indicates stable network.

network_type:
Network technology type:
4G LTE, 5G NSA, 5G SA etc.

device_model:
Mobile device model used by customer.

carrier:
Telecom network provider.

network_band:
Radio frequency network band.

battery_level_pct:
Current device battery percentage.

temperature_c:
Device temperature in Celsius.

connected_duration_min:
Duration of network session.

handover_count:
Number of cell tower handovers.

data_usage_mb:
Data usage in megabytes.

video_streaming_quality:
Video quality level.

vonr_enabled:
Indicates whether VoNR is enabled.

congestion_level:
Network congestion severity.

ping_to_google_ms:
Internet latency to Google servers.

dropped_calls:
Count of disconnected voice calls.

hour_of_day:
Hour extracted from timestamp.

state:
Operational telecom state.

region:
Telecom operational region.

environment_type:
Urban or Rural environment.

active_users:
Total connected users.

packet_loss_pct:
Percentage of lost packets.

weather_condition:
Current weather condition.

network_utilization_pct:
Network traffic utilization percentage.

quality_score:
Overall telecom network quality score.

is_peak_hour:
Peak traffic indicator.

====================================================
BUSINESS DEFINITIONS
====================================================

High download_speed_mbps
= strong download performance

High upload_speed_mbps
= strong upload performance

Low avg_latency_ms
= fast responsive network

High avg_latency_ms
= poor network responsiveness

Low packet_loss_pct
= stable network quality

High packet_loss_pct
= unstable telecom performance

High network_utilization_pct
= heavy network traffic

High congestion_level
= overloaded telecom network

High dropped_calls
= poor call quality

High quality_score
= excellent telecom experience

High signal_strength_dbm
= strong radio signal

High jitter_ms
= unstable connection quality

High ping_to_google_ms
= poor internet routing latency

High handover_count
= excessive tower switching

High data_usage_mb
= high user traffic

Low battery_level_pct
= possible device performance degradation

====================================================
KNOWN CARRIERS
====================================================

Verizon
AT&T
T-Mobile
BSNL
Vi

====================================================
KNOWN DEVICES
====================================================

iPhone 14
Galaxy S23
Pixel 7
Nord 4

====================================================
KNOWN NETWORK TYPES
====================================================

4G LTE
5G NSA
5G SA
5G Sub-6

====================================================
KNOWN ENVIRONMENTS
====================================================

Urban
Rural

====================================================
KNOWN STREAMING QUALITIES
====================================================

Low
Medium
High
Ultra HD

====================================================
POSTGRESQL SQL RULES
====================================================

Use ONLY:
refined_network_metrics

NEVER invent columns

NEVER invent tables

Use PostgreSQL syntax only

Use LOWER(column_name)
for case-insensitive comparisons

Use ILIKE
for text searches

Use GROUP BY
for aggregate queries

Use ORDER BY DESC
for highest/top/best queries

Use ORDER BY ASC
for lowest/worst queries

Use LIMIT
for ranking/top queries

====================================================
IMPORTANT COLUMN RULES
====================================================

is_peak_hour is BOOLEAN

Correct:
is_peak_hour = true

Correct:
is_peak_hour = false

vonr_enabled is BOOLEAN

Correct:
vonr_enabled = true

Wrong:
vonr_enabled = 'yes'

dropped_calls is INTEGER

active_users is INTEGER

quality_score is NUMERIC

packet_loss_pct is NUMERIC

download_speed_mbps is NUMERIC

upload_speed_mbps is NUMERIC

avg_latency_ms is NUMERIC

====================================================
QUERY GENERATION RULES
====================================================

For highest/best:
use MAX() or ORDER BY DESC

For lowest/worst:
use MIN() or ORDER BY ASC

For averages:
use AVG()

For counts:
use COUNT()

For comparisons:
use GROUP BY

For ranking:
use LIMIT

Never aggregate VARCHAR columns

Never compare BOOLEAN with INTEGER

Return ONLY valid PostgreSQL SQL

====================================================
SUPPORTED TELECOM ANALYTICS
====================================================

- Carrier comparison
- Device performance analysis
- Network congestion analysis
- Signal strength analysis
- Packet loss trends
- Latency analysis
- Peak hour analysis
- Weather impact analysis
- Urban vs Rural analysis
- VoNR performance analysis
- Streaming quality analysis
- Active user analytics
- Telecom KPI analysis
- Network anomaly detection
- Telecom quality scoring

====================================================

""";

        Document schemaDoc =
                new Document(

                        schema,

                        Map.of(

                                "type", "schema",

                                "domain", "telecom"
                        )
                );

        vectorStore.add(
                List.of(schemaDoc)
        );

        logger.info(
                "Telecom schema metadata ingested successfully."
        );
    }
}