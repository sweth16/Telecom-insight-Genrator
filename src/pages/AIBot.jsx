import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Send,
  MessageSquare,
  Sparkles,
} from 'lucide-react'

import { askNLQ, askAnomaly } from '../services/api'
import { pageTransition } from '../animations/variants'

const SOURCE_COLORS = {

  NLQ_AGENT: {
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.08)',
    border: 'rgba(37,99,235,0.18)',
  },

  NLQ_CACHE: {
    color: '#0d9488',
    bg: 'rgba(13,148,136,0.08)',
    border: 'rgba(13,148,136,0.18)',
  },

  INSIGHT_AGENT: {
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.08)',
    border: 'rgba(124,58,237,0.18)',
  },

  INSIGHT_CACHE: {
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.18)',
  },
}

const SUGGESTED_QUERIES = [

  {
    label: 'Peak hour latency',
    query:
      'What is the average latency during peak hours?',
  },

  {
    label: 'Best carrier',
    query:
      'Which carrier has the best QoS in California?',
  },

  {
    label: 'Network forecast',
    query:
      'Predict tomorrow evening network utilization',
  },

  {
    label: 'Worst states',
    query:
      'Which states have the highest dropped calls?',
  },

  {
    label: '5G coverage',
    query:
      'Show current 5G coverage performance',
  },
]

const MOCK_RESPONSES = [

  {
    text:
      'Average latency during peak hours across all monitored regions is **78.4ms**. California and Texas currently show elevated congestion on 5G corridors.',

    source: 'NLQ_AGENT',
  },

  {
    text:
      'Verizon currently leads with the highest QoS score of **91.8/100** across California regions. Network stability remains strongest in urban 5G zones.',

    source: 'INSIGHT_AGENT',
  },

  {
    text:
      'Returning cached NLQ response. Historical data indicates packet loss increased by **12%** during high traffic windows.',

    source: 'NLQ_CACHE',
  },

  {
    text:
      'Returning cached insight response. Predictive analytics forecast utilization between **84% and 92%** tomorrow evening.',

    source: 'INSIGHT_CACHE',
  },
]

function ChatBubble({ msg }) {

  const isUser =
    msg.role === 'user'

  const cfg = msg.source
    ? SOURCE_COLORS[msg.source]
    : null

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      className={`flex items-start gap-4 ${
        isUser
          ? 'justify-end'
          : 'justify-start'
      }`}
    >

      {!isUser && (

        <div className="flex-shrink-0 rounded-full bg-slate-200 p-2 shadow-[0_8px_22px_rgba(15,23,42,0.08)]">

          <MessageSquare
            size={16}
            className="text-slate-700"
          />
        </div>
      )}

      <div className="max-w-[65%] flex flex-col gap-2">

        <div
          className="rounded-[28px] px-5 py-4 text-sm leading-7"

          style={
            isUser
              ? {
                  background: '#dbeafe',
                  border: '1px solid rgba(37,99,235,0.22)',
                  color: '#0f172a',
                  boxShadow: '0 12px 30px rgba(37,99,235,0.08)',
                }

              : {
                  background: '#ffffff',
                  border: '1px solid rgba(15,23,42,0.08)',
                  color: '#0f172a',
                  boxShadow: 'inset 0 0 0 1px rgba(15,23,42,0.03)',
                }
          }

          dangerouslySetInnerHTML={{
            __html: msg.text
              .replace(
                /\*\*(.*?)\*\*/g,

                '<strong style="color:#0f172a;font-weight:600">$1</strong>'
              )

              .replace(
                /\n/g,
                '<br/>'
              ),
          }}
        />

        <div
          className={`flex flex-wrap items-center gap-2 text-[11px] ${
            isUser
              ? 'justify-end'
              : 'justify-start'
          }`}
        >

          {cfg && (

            <span
              className="rounded-full px-2.5 py-1 font-mono tracking-[0.12em]"

              style={{
                color: cfg.color,

                background: cfg.bg,

                border: `1px solid ${cfg.border}`,
              }}
            >
              [
              {msg.source.replace(
                /_/g,
                ' '
              )}
              ]
            </span>
          )}

          <span className="text-slate-500">
            {msg.time}
          </span>
        </div>
      </div>

      {isUser && (

        <div className="flex-shrink-0 rounded-3xl bg-slate-100 p-3">

          <MessageSquare
            size={18}
            className="text-slate-700"
          />
        </div>
      )}
    </motion.div>
  )
}

function TypingIndicator() {

  return (
    <div className="flex items-center gap-3 max-w-[76%]">

      <div className="flex-shrink-0 rounded-3xl bg-slate-950 p-3 shadow-[0_15px_45px_rgba(15,23,42,0.25)]">

        <Zap
          size={18}
          className="text-white"
        />
      </div>

      <div className="rounded-[28px] px-5 py-4 bg-slate-100 border border-slate-200">

        <div className="flex gap-2.5 items-center h-5">

          {[0, 1, 2].map(
            (i) => (

              <motion.span
                key={i}

                animate={{
                  y: [
                    0,
                    -6,
                    0,
                  ],

                  opacity: [
                    0.4,
                    1,
                    0.4,
                  ],
                }}

                transition={{
                  duration: 0.8,

                  repeat: Infinity,

                  delay:
                    i * 0.15,
                }}

                className="h-2.5 w-2.5 rounded-full bg-slate-800"
              />
            )
          )}

          <span className="text-[11px] text-slate-500">
            AI agents analyzing...
          </span>
        </div>
      </div>
    </div>
  )
}

export default function AIBotPage() {

  const defaultMessage = [
    {
      role: 'assistant',

      text:
        'Welcome to **Telecom Insight AI**. Connected to NLQ Agent, Insight Agent, NLQ Cache and Insight Cache for real-time telecom intelligence.',

      source:
        'INSIGHT_AGENT',

      time: 'now',
    },
  ]

  const [messages, setMessages] =
    useState(defaultMessage)

  const [input, setInput] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [mockIdx, setMockIdx] =
    useState(0)

  const bottomRef = useRef(null)

  const inputRef = useRef(null)

  // LOAD CHAT HISTORY

  useEffect(() => {

    const saved =
      localStorage.getItem(
        'telecom_ai_chat'
      )

    if (saved) {

      setMessages(
        JSON.parse(saved)
      )
    }

  }, [])

  // SAVE CHAT HISTORY

  useEffect(() => {

    localStorage.setItem(
      'telecom_ai_chat',

      JSON.stringify(messages)
    )

  }, [messages])

  // AUTO SCROLL

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })

  }, [messages, loading])

  const extractAnswer = (
    result
  ) => {

    if (!result)
      return 'No response received.'

    if (
      typeof result === 'string'
    )
      return result

    if (result.answer)
      return result.answer

    if (result.response)
      return result.response

    if (result.reason)
      return result.reason

    return JSON.stringify(result)
  }

  const send = async (
    question
  ) => {

    const q =
      question ||
      input.trim()

    if (
      !q ||
      loading
    )
      return

    setInput('')

    const now =
      new Date().toLocaleTimeString(
        'en-US',
        {
          hour:
            '2-digit',

          minute:
            '2-digit',
        }
      )

    setMessages((prev) => [

      ...prev,

      {
        role: 'user',

        text: q,

        time: now,
      },
    ])

    setLoading(true)

    try {

      const result =
        await askNLQ(q)

      setMessages((prev) => [

        ...prev,

        {
          role:
            'assistant',

          text:
            extractAnswer(
              result
            ),

          source:
            result.source ||
            'NLQ_AGENT',

          time:
            new Date().toLocaleTimeString(
              'en-US',
              {
                hour:
                  '2-digit',

                minute:
                  '2-digit',
              }
            ),
        },
      ])

    } catch {

      const mock =
        MOCK_RESPONSES[
          mockIdx %
            MOCK_RESPONSES.length
        ]

      setMockIdx(
        (i) => i + 1
      )

      await new Promise(
        (r) =>
          setTimeout(
            r,
            900 +
              Math.random() *
                700
          )
      )

      setMessages((prev) => [

        ...prev,

        {
          role:
            'assistant',

          text:
            mock.text,

          source:
            mock.source,

          time:
            new Date().toLocaleTimeString(
              'en-US',
              {
                hour:
                  '2-digit',

                minute:
                  '2-digit',
              }
            ),
        },
      ])

    } finally {

      setLoading(false)
    }
  }

  const runAnomalyScan = async () => {
    if (loading) return

    const now = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: 'Run anomaly scan',
        time: now,
      },
    ])
    setLoading(true)

    try {
      const result = await askAnomaly()
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: result?.message || 'Anomaly scan completed successfully.',
          source: 'ANOMALY_AGENT',
          time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Anomaly scan failed. Check the backend or try again later.',
          source: 'ANOMALY_AGENT',
          time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      variants={pageTransition}

      initial="initial"

      animate="animate"

      className="flex flex-col h-full gap-6"
    >

      {/* TOP SECTION */}

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">

        {/* LEFT */}

        <div className="rounded-[32px] bg-white/85 border border-slate-200 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">

          <div className="flex flex-col gap-4">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>

                <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 shadow-[0_10px_30px_rgba(37,99,235,0.18)]">

                  <Zap
                    size={18}
                    className="text-white"
                  />

                  <div>

                    <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                      Telecom Insight Generator
                    </p>

                    <p className="text-[11px] text-white/80">
                      NLQ + Insight + Cache Agents
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">

                {[
                  {
                    label:
                      'Avg response',

                    value:
                      '1.1s',
                  },

                  {
                    label:
                      'Agents active',

                    value:
                      '4',
                  },

                  {
                    label:
                      'Confidence',

                    value:
                      '91.2%',
                  },
                ].map((info) => (

                  <div
                    key={
                      info.label
                    }

                    className="rounded-3xl bg-slate-950/5 p-4"
                  >

                    <p className="text-[11px] uppercase tracking-[0.17em] text-slate-500">

                      {
                        info.label
                      }
                    </p>

                    <p className="mt-2 text-xl font-semibold text-slate-900">

                      {
                        info.value
                      }
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* QUERIES */}

            <div className="rounded-[32px] bg-slate-50 p-6 border border-slate-200">

              <div className="flex items-center gap-3 text-slate-700">

                <Sparkles size={16} />

                <div>

                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Suggested queries
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Start with the most common telecom intelligence questions.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">

                {SUGGESTED_QUERIES.map(
                  (
                    item,
                    index
                  ) => (

                    <button
                      key={index}

                      onClick={() =>
                        send(
                          item.query
                        )
                      }

                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    >
                      {
                        item.label
                      }
                    </button>
                  )
                )}

                <button
                  onClick={runAnomalyScan}
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200"
                >
                  Run anomaly scan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div className="rounded-[32px] bg-white/85 border border-slate-200 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">

          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
            Status overview
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4">

            {[
              {
                label:
                  'Latency spike',

                value:
                  '94ms',

                accent:
                  '#2563eb',
              },

              {
                label:
                  'Dropped calls',

                value:
                  '18%',

                accent:
                  '#ef4444',
              },

              {
                label:
                  'Carrier QoS',

                value:
                  '87.4%',

                accent:
                  '#0d9488',
              },

              {
                label:
                  'Forecast accuracy',

                value:
                  '91.2%',

                accent:
                  '#7c3aed',
              },
            ].map((stat) => (

              <div
                key={
                  stat.label
                }

                className="rounded-3xl bg-slate-50 p-4 border border-slate-200"
              >

                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">

                  {
                    stat.label
                  }
                </div>

                <div
                  className="mt-3 text-2xl font-semibold"

                  style={{
                    color:
                      stat.accent,
                  }}
                >
                  {
                    stat.value
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHAT SECTION */}

      <div className="h-[700px] rounded-[32px] overflow-hidden border border-slate-200 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">

        {/* HEADER */}

        <div className="px-6 py-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>

            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
              Conversation
            </p>

            <h2 className="text-xl font-semibold text-slate-900">
              Telecom Insight AI Dialogue
            </h2>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() => {

                localStorage.removeItem(
                  'telecom_ai_chat'
                )

                setMessages(
                  defaultMessage
                )
              }}

              className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-200"
            >
              Reset Chat
            </button>

            <button className="rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-sm text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)]">

              Live AI Stream
            </button>
          </div>
        </div>

        {/* CHAT BODY */}

        <div
          className="p-6 space-y-4 overflow-y-auto h-[520px]"

          style={{
            background:
              'linear-gradient(180deg, rgba(248,250,252,0.98), rgba(248,250,252,0.95))',

            scrollbarWidth:
              'thin',
          }}
        >

          {messages.map(
            (
              msg,
              index
            ) => (

              <ChatBubble
                key={index}
                msg={msg}
              />
            )
          )}

          {loading && (
            <TypingIndicator />
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}

        <div className="px-6 pb-6 pt-4 border-t border-slate-200 bg-slate-50">

          <div className="flex items-end gap-3">

            <div className="flex-1 relative">

              <textarea
                ref={inputRef}

                value={input}

                onChange={(e) =>
                  setInput(
                    e.target.value
                  )
                }

                onKeyDown={(e) => {

                  if (
                    e.key ===
                      'Enter' &&
                    !e.shiftKey
                  ) {

                    e.preventDefault()

                    send()
                  }
                }}

                rows={1}

                placeholder="Ask about latency, carriers, QoS, forecasts or telecom intelligence..."

                className="min-h-[54px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />

              <div className="pointer-events-none absolute top-3 right-4 text-[11px] text-slate-400">

                Shift + Enter for newline
              </div>
            </div>

            <button
              onClick={() =>
                send()
              }

              disabled={
                !input.trim() ||
                loading
              }

              className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-violet-500 text-white shadow-[0_15px_40px_rgba(37,99,235,0.3)] transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >

              <Send size={18} />
            </button>
          </div>

          <p className="mt-3 text-[10px] text-slate-400 text-center uppercase tracking-[0.25em]">

            Telecom Insight AI • NLQ + Insight + Cache Intelligence
          </p>
        </div>
      </div>
    </motion.div>
  )
}