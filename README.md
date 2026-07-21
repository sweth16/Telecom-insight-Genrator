# Telecom-insight-Genrator
Overview

Telecom Insight Generator is an AI-powered network analytics platform that enables telecom operators to analyze network performance using natural language. Instead of writing SQL queries manually, users can interact with the system in plain English to retrieve telecom metrics, generate business insights, and detect network anomalies in real time.

The platform combines Spring AI, Retrieval-Augmented Generation (RAG), Semantic Search, Google Gemini, Apache Kafka, and PostgreSQL (PGVector) to deliver intelligent, context-aware analytics on large-scale telecom datasets.
LOGIN PAGE WITH OAUTH:

<img width="1917" height="1077" alt="image" src="https://github.com/user-attachments/assets/2416ea1c-a83b-4267-8024-e7f63aa5a365" />

DASHBOARD PAGE:

<img width="1920" height="1020" alt="Screenshot 2026-07-21 193711" src="https://github.com/user-attachments/assets/619e696a-8c4c-44b9-bd4e-032723fc9254" />

AI Architecture

The platform follows an AI-agent architecture where every user request is intelligently routed to the appropriate specialized agent.

🔹 NLQ Agent
Converts natural language questions into optimized SQL queries using semantic retrieval and database schema understanding.

🔹 Insight Agent
Generates business-friendly summaries by analyzing query results and highlighting important trends, patterns, and KPIs.

🔹 Anomaly Agent
Continuously monitors telecom metrics to detect unusual behavior such as latency spikes, excessive congestion, increased packet loss, or dropped calls.

🔹 Guardrail
Filters unsupported or irrelevant queries before they reach the LLM, improving response quality and application reliability.

CONVERSATIONAL AI:

<img width="1920" height="1020" alt="Screenshot 2026-07-21 193725" src="https://github.com/user-attachments/assets/4fb77ad0-d939-442f-9c32-9eee5ddee6eb" />

REAL-TIME ANOMALY ALERT:

<img width="1920" height="1020" alt="Screenshot 2026-07-21 193733" src="https://github.com/user-attachments/assets/0f7e5e94-0afc-44f1-bf3f-10a38f6d6286" />

DETAILED ALERT PAGE AND ITS RECOMMENDATION

<img width="1920" height="1020" alt="Screenshot 2026-07-21 193754" src="https://github.com/user-attachments/assets/9576d525-40b9-46d7-9c42-511c5001d528" />

HISTORY PAGE:

<img width="1920" height="1020" alt="Screenshot 2026-07-21 193759" src="https://github.com/user-attachments/assets/1be26319-6112-428d-99fe-d17fd6afd8f3" />

MAP PAGE:

<img width="1920" height="1020" alt="Screenshot 2026-07-21 193809" src="https://github.com/user-attachments/assets/cb04fc79-d365-4e04-8be8-242ca248801d" />

SETTINGS PAGE :
<img width="1920" height="1020" alt="Screenshot 2026-07-21 193828" src="https://github.com/user-attachments/assets/d7354912-8ae9-467e-b117-3e28a5632633" />

AI GENERATED REPORT

<img width="648" height="918" alt="Screenshot 2026-07-21 201347" src="https://github.com/user-attachments/assets/84018df1-564b-4362-8f01-c59771af22d9" />
Conclusion

Telecom Insight Generator demonstrates how Generative AI can transform traditional telecom analytics by combining natural language understanding, intelligent retrieval, real-time data streaming, and automated insight generation into a single scalable platform. The project showcases modern AI engineering practices through a full-stack implementation that bridges enterprise backend development, vector search, LLM integration, and interactive data visualization to simplify complex network analysis.

