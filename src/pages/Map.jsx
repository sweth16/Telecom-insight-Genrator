import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  AlertCircle,
  AlertTriangle,
  Activity,
  CheckCircle2,
} from "lucide-react";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

import { useAnomalyContext } from "../context/AnomalyContext";
import { pageTransition } from "../animations/variants";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Extended city coordinates – covers both static demo cities and anomaly agent locations
const CITY_COORDINATES = {
  // US States / Regions
  Texas:         [-99.9018,  31.9686],
  California:    [-119.4179, 36.7783],
  Florida:       [-81.5158,  27.6648],
  "New York":    [-74.2179,  43.2994],
  Chicago:       [-87.6298,  41.8781],
  Orlando:       [-81.3769,  28.5421],
  Houston:       [-95.3698,  29.7604],
  Austin:        [-97.7431,  30.2672],
  Dallas:        [-96.7970,  32.7767],
  Phoenix:       [-112.0740, 33.4484],
  Seattle:       [-122.3321, 47.6062],
  Denver:        [-104.9903, 39.7392],
  Atlanta:       [-84.3880,  33.7490],
  Miami:         [-80.1918,  25.7617],
  Boston:        [-71.0589,  42.3601],
  "San Francisco": [-122.4194, 37.7749],
  // India (world map fallback)
  Albany:        [-73.7562,  42.6526],
  Buffalo:       [-78.8784,  42.8864],
  Mumbai:        [72.8479,   19.0760],
  Bangalore:     [77.5946,   12.9716],
  Pune:          [73.8355,   18.5204],
  Hyderabad:     [78.4711,   17.3850],
  Chennai:       [80.2809,   13.0827],
  Delhi:         [77.1025,   28.7041],
  Kolkata:       [88.3639,   22.5726],
};

const SEVERITY_CONFIG = {
  critical: { color: "#ef4444", label: "Critical", Icon: AlertCircle },
  warning:  { color: "#facc15", label: "Warning",  Icon: AlertTriangle },
};

function StatPill({ count, severity }) {
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{
        background: `${cfg.color}15`,
        border: `1px solid ${cfg.color}35`,
        color: cfg.color,
      }}
    >
      <cfg.Icon size={12} />
      {count} {cfg.label}
    </div>
  );
}

export default function NetworkMap() {
  const { notificationsData: anomalies, refetch, readIds, unreadCount, handleMarkAsRead } = useAnomalyContext();

  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const notificationsData = anomalies || [];

  const mapItems =
    filter === "all"
      ? notificationsData
      : notificationsData.filter(a => a.severity === filter);

  const counts = {
    critical: notificationsData.filter(a => a.severity === "critical").length,
    warning:  notificationsData.filter(a => a.severity === "warning").length,
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      className="space-y-5"
    >
      {/* ─── HEADER ────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Map size={15} className="text-blue-400" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-semibold">
              LIVE NETWORK VIEW
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            USA Telecom Network Map
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Real-time anomaly monitoring · AI agent alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatPill count={counts.critical} severity="critical" />
          <StatPill count={counts.warning}  severity="warning" />
        </div>
      </div>

      {/* ─── FILTERS ────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {["all", "critical", "warning"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-xs px-4 py-2 rounded-xl capitalize transition-all"
            style={
              filter === f
                ? {
                    background: "rgba(37,99,235,0.15)",
                    border:     "1px solid rgba(37,99,235,0.30)",
                    color:      "#60a5fa",
                  }
                : {
                    background: "rgba(255,255,255,0.04)",
                    border:     "1px solid rgba(255,255,255,0.08)",
                    color:      "rgba(255,255,255,0.45)",
                  }
            }
          >
            {f === "all"
              ? `All (${notificationsData.length})`
              : `${f} (${counts[f]})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* ─── MAP ───────────────────────────────────────────────────── */}
        <div
          className="xl:col-span-2 rounded-3xl overflow-hidden relative"
          style={{
            background: "#f8f9fa",
            border:     "1px solid rgba(0,0,0,0.1)",
            minHeight:  650,
          }}
        >
          {/* LEGEND */}
          <div className="absolute top-5 left-5 z-20 flex flex-col gap-3 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-gray-200">
            {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ background: cfg.color }}
                />
                <span
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{ color: "#1f2937" }}
                >
                  {cfg.label}
                </span>
              </div>
            ))}
          </div>

          {/* "Anomaly Agent" live chip - HIDDEN */}

          {/* USA MAP */}
          <ComposableMap
            projection="geoAlbersUsa"
            projectionConfig={{ scale: 1000 }}
            style={{
              width: "100%",
              height: "100%",
              minHeight: "650px",
              background: "#f8f9fa",
            }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#dbeafe"
                    stroke="#bfdbfe"
                    strokeWidth={1.2}
                    style={{
                      default: { fill: "#dbeafe", outline: "none", transition: "all 0.3s ease" },
                      hover:   { fill: "#93c5fd", outline: "none", cursor: "pointer" },
                      pressed: { fill: "#60a5fa", outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* ─── ANOMALY MARKERS (from real agent data) ─── */}
            {mapItems.map(city => {
              const cfg         = SEVERITY_CONFIG[city.severity] ?? SEVERITY_CONFIG.critical;
              const coordinates = CITY_COORDINATES[city.city];
              if (!coordinates) return null;

              const isRead = readIds.has(city.id);

              return (
                <Marker key={city.id} coordinates={coordinates}>
                  {/* Hover area */}
                  <circle
                    r={22}
                    fill="transparent"
                    onMouseEnter={() => setSelected(city)}
                    onMouseLeave={() => setSelected(null)}
                    style={{ cursor: "pointer" }}
                  />

                  {/* Pulse ring – dimmed if read */}
                  <motion.circle
                    r={18}
                    fill={`${cfg.color}${isRead ? "10" : "30"}`}
                    animate={{ r: [10, 22, 10], opacity: isRead ? [0.2, 0, 0.2] : [0.7, 0, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ pointerEvents: "none" }}
                  />

                  {/* Glow */}
                  <circle
                    r={10}
                    fill={`${cfg.color}${isRead ? "15" : "40"}`}
                    style={{ pointerEvents: "none" }}
                  />

                  {/* Main dot */}
                  <circle
                    r={6}
                    fill={isRead ? `${cfg.color}60` : cfg.color}
                    stroke={isRead ? "rgba(255,255,255,0.3)" : "#ffffff"}
                    strokeWidth={2}
                    style={{ pointerEvents: "none" }}
                  />

                  {/* Read checkmark on dot */}
                  {isRead && (
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={7}
                      fill="#fff"
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      ✓
                    </text>
                  )}
                </Marker>
              );
            })}
          </ComposableMap>

          {/* TOOLTIP */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0,  scale: 1 }}
                exit={{   opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="absolute bottom-6 left-6 z-50 w-[300px] rounded-3xl p-4"
                style={{
                  background:    "#ffffff",
                  border:        "1px solid rgba(0,0,0,0.1)",
                  backdropFilter: "blur(18px)",
                  boxShadow:     "0 0 28px rgba(0,0,0,0.12)",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-blue-600 font-semibold mb-2">
                      NETWORK LOCATION
                    </p>
                    <h2 className="text-3xl font-bold text-gray-900 leading-none">
                      {selected.city}
                    </h2>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      selected.severity === "critical"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {selected.severity}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-900 font-medium">Anomaly Type</p>
                      <p className="text-xs text-gray-600 mt-1">AI Agent Detection</p>
                    </div>
                    <span className="text-xs font-bold text-gray-800 text-right max-w-[160px]">
                      {selected.type?.replace(/_/g, " ")}
                    </span>
                  </div>

                  {selected.value && selected.value !== "—" && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-900 font-medium">Metric</p>
                        <p className="text-xs text-gray-600 mt-1">Observed value</p>
                      </div>
                      <span className="text-xl font-bold text-red-500">
                        {selected.value}
                      </span>
                    </div>
                  )}

                  {selected.message && (
                    <div className="pt-1">
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                        {selected.message}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-500 uppercase tracking-[0.2em] font-semibold">
                    Anomaly Agent
                  </span>
                  <div className="flex items-center gap-2">
                    {readIds.has(selected.id) ? (
                      <>
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <span className="text-xs text-emerald-600 font-semibold">READ</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs text-red-500 font-semibold">UNREAD</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* BOTTOM ACTIVITY ICON */}
          <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center border border-gray-300">
            <Activity size={15} className="text-gray-600" />
          </div>
        </div>

        {/* ─── RIGHT PANEL ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs uppercase tracking-wider text-white/50">
              {mapItems.length} Anomalies
            </span>
            <span className="text-[10px] text-white/30">
              {unreadCount > 0 ? `${unreadCount} unread` : "All read"}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 650 }}>
            {mapItems.map(anomaly => {
              const cfg    = SEVERITY_CONFIG[anomaly.severity] ?? SEVERITY_CONFIG.info;
              const isRead = readIds.has(anomaly.id);

              return (
                <motion.div
                  key={anomaly.id}
                  whileHover={{ scale: 1.01 }}
                  className="rounded-2xl p-3 cursor-pointer transition-all"
                  style={{
                    background: isRead
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isRead ? "rgba(255,255,255,0.05)" : `${cfg.color}20`}`,
                    opacity: isRead ? 0.55 : 1,
                  }}
                  onClick={() => setSelected(anomaly)}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${cfg.color}${isRead ? "10" : "20"}` }}
                    >
                      {isRead
                        ? <CheckCircle2 size={14} className="text-emerald-400" />
                        : <cfg.Icon size={14} style={{ color: cfg.color }} />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-[9px] uppercase tracking-wider font-semibold"
                          style={{ color: isRead ? "rgba(255,255,255,0.25)" : cfg.color }}
                        >
                          {anomaly.severity}
                        </span>
                        <div className="flex items-center gap-1">
                          {isRead && (
                            <span className="text-[9px] text-emerald-400 font-semibold">✓ Read</span>
                          )}
                          <span className="text-[9px] text-white/30">{anomaly.time}</span>
                        </div>
                      </div>

                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: isRead ? "rgba(255,255,255,0.30)" : cfg.color }}
                      >
                        {anomaly.type?.replace(/_/g, " ")}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        {anomaly.value && anomaly.value !== "—" && (
                          <span
                            className="text-[10px] font-semibold"
                            style={{ color: isRead ? "rgba(255,255,255,0.25)" : cfg.color }}
                          >
                            {anomaly.value}
                          </span>
                        )}
                        <span className="text-[10px] text-white/40 truncate">
                          📍 {anomaly.city}
                        </span>
                      </div>

                      {/* Mark as read button on panel card */}
                      {!isRead && (
                        <button
                          onClick={e => { e.stopPropagation(); handleMarkAsRead(anomaly.id); }}
                          className="mt-2 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Mark as read →
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {mapItems.length === 0 && (
              <div className="text-center text-white/30 text-sm py-12">
                No anomalies match this filter
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
