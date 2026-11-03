
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  Bell,
  Bolt,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardList,
  Clock3,
  Download,
  Gauge,
  LayoutDashboard,
  Leaf,
  Map,
  Menu,
  MessageSquareText,
  PlugZap,
  Search,
  Settings,
  SlidersHorizontal,
  Star,
  TreePine,
  Users,
  Wrench,
  Zap,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Station = {
  id: string | number;
  name: string;
  shortName?: string | null;
  address?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  chargers?: number | null;
  available?: number | null;
  power?: number | string | null;
  price?: number | string | null;
  kind?: string | null;
  distance?: number | string | null;
  minutes?: number | null;
};

type DatabaseCharger = {
  id: string | number;
  station_id: string | number | null;
  name: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  max_power_kw: number | string | null;
  status: string | null;
  protocol: string | null;
  protocol_identity: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type DatabaseConnector = {
  id: string | number;
  charger_id: string | number;
  connector_number: number | string | null;
  connector_type: string | null;
  max_power_kw: number | string | null;
  status: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type DatabaseSession = {
  id: number | string;
  connector_id: string;
  external_session_id: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  energy_kwh: number | string | null;
  created_at: string;
  account_id: number | null;
  connector_number: number | string | null;
  connector_type: string | null;
  charger_id: string | null;
  charger_name: string | null;
  station_id: string | null;
  station_name: string | null;
  station_short_name: string | null;
};

type DatabaseReview = {
  id: number | string;
  station_id: string;
  station_name: string;
  station_short_name: string | null;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

type EnergyPoint = {
  date: string;
  label: string;
  energy: number;
};

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

const navGroups = [
  {
    label: "OVERVIEW",
    items: [
      { name: "Dashboard", icon: LayoutDashboard },
      { name: "Stations", icon: Map },
      { name: "Chargers", icon: PlugZap },
      { name: "Connectors", icon: Zap },
      { name: "Live Monitoring", icon: Activity },
      { name: "Map View", icon: Map },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { name: "Faults & Alerts", icon: AlertTriangle, count: "—" },
      { name: "Maintenance", icon: Wrench },
      { name: "Charging Sessions", icon: ClipboardList },
      { name: "Station Reviews", icon: MessageSquareText },
    ],
  },
  {
    label: "BUSINESS & ANALYTICS",
    items: [
      { name: "Revenue & Transactions", icon: Gauge },
      { name: "Environmental Impact", icon: Leaf },
      { name: "Reports & Analytics", icon: Activity },
    ],
  },
  {
    label: "ADMINISTRATION",
    items: [
      { name: "Users & Roles", icon: Users },
      { name: "Settings", icon: Settings },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Small components                                                           */
/* -------------------------------------------------------------------------- */

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase().replaceAll("_", "-").replaceAll(" ", "-");

  return (
    <span className={`status-pill ${normalized}`}>
      <i />
      {status}
    </span>
  );
}

function Metric({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <section className="metric-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </section>
  );
}

function Progress({
  label,
  value,
  percent,
}: {
  label: string;
  value: string;
  percent: number;
}) {
  const safePercent = Math.max(0, Math.min(100, percent));

  return (
    <div className="progress-item">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="progress-track">
        <i style={{ width: `${safePercent}%` }} />
      </div>
    </div>
  );
}


function EnergyTrendChart({ data }: { data: EnergyPoint[] }) {
  const [hoveredPoint, setHoveredPoint] = useState<
    (EnergyPoint & { x: number; y: number }) | null
  >(null);

  if (data.length === 0) {
    return (
      <div className="empty-state">
        <Activity size={22} />
        <strong>No energy data available</strong>
        <p>
          Completed sessions with a start date and energy value will appear
          here.
        </p>
      </div>
    );
  }

  const width = 720;
  const height = 230;
  const left = 48;
  const right = 18;
  const top = 18;
  const bottom = 38;

  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  const maxEnergy = Math.max(...data.map((item) => item.energy), 1);
  const scaleMax = Math.ceil(maxEnergy / 10) * 10 || 10;

  const coordinates = data.map((item, index) => {
    const x =
      data.length === 1
        ? left + chartWidth / 2
        : left + (index / (data.length - 1)) * chartWidth;

    const y =
      top + chartHeight - (item.energy / scaleMax) * chartHeight;

    return { ...item, x, y };
  });

  const line = coordinates
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const area = [
    `M ${coordinates[0].x} ${top + chartHeight}`,
    ...coordinates.map((point) => `L ${point.x} ${point.y}`),
    `L ${coordinates[coordinates.length - 1].x} ${top + chartHeight}`,
    "Z",
  ].join(" ");

  const labelStep = Math.max(1, Math.ceil(data.length / 7));

  // Keep the popup inside the chart's horizontal boundaries.
  const popupX = hoveredPoint
    ? Math.max(
        95,
        Math.min(width - 95, hoveredPoint.x)
      )
    : 0;

  // Move the popup below the point when the point is near the top.
  const popupAbove = hoveredPoint && hoveredPoint.y > 85;

  return (
    <div className="energy-chart">
      <div style={{ position: "relative", width: "100%" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Daily energy delivered from completed charging sessions"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            overflow: "visible",
          }}
        >
          {[0, 1, 2, 3, 4].map((step) => {
            const y = top + (step / 4) * chartHeight;
            const value = scaleMax * (1 - step / 4);

            return (
              <g key={step}>
                <line
                  x1={left}
                  y1={y}
                  x2={width - right}
                  y2={y}
                  stroke="currentColor"
                  opacity="0.12"
                  strokeDasharray="4 5"
                />

                <text
                  x={left - 9}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="currentColor"
                  opacity="0.65"
                >
                  {formatNumber(value, 0)}
                </text>
              </g>
            );
          })}

          <path d={area} fill="#91a795" opacity="0.18" />

          <polyline
            points={line}
            fill="none"
            stroke="#58715d"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {coordinates.map((point) => {
            const isHovered = hoveredPoint?.date === point.date;

            return (
              <g key={point.date}>
                {isHovered && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="11"
                    fill="#91a795"
                    opacity="0.22"
                  />
                )}

                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? 6.5 : 4.5}
                  fill="#58715d"
                  stroke="white"
                  strokeWidth="2"
                  style={{
                    cursor: "pointer",
                    transition: "r 0.15s ease",
                  }}
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onFocus={() => setHoveredPoint(point)}
                  onBlur={() => setHoveredPoint(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${point.label}: ${formatNumber(
                    point.energy,
                    2
                  )} kWh`}
                />
              </g>
            );
          })}

          {coordinates.map((point, index) =>
            index % labelStep === 0 ||
            index === coordinates.length - 1 ? (
              <text
                key={point.date}
                x={point.x}
                y={height - 10}
                textAnchor="middle"
                fontSize="11"
                fill="currentColor"
                opacity="0.7"
              >
                {point.label}
              </text>
            ) : null
          )}
        </svg>

        {/* Custom energy popup */}
        {hoveredPoint && (
          <div
            className="energy-tooltip"
            style={{
              position: "absolute",
              left: `${(popupX / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
              transform: popupAbove
                ? "translate(-50%, calc(-100% - 15px))"
                : "translate(-50%, 15px)",
              zIndex: 20,
              pointerEvents: "none",
              minWidth: "170px",
              padding: "13px 15px",
              borderRadius: "12px",
              background: "#ffffff",
              border: "1px solid #e2eae3",
              boxShadow: "0 8px 28px rgba(31, 55, 37, 0.16)",
              animation: "energyTooltipIn 0.15s ease-out",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                marginBottom: "9px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#91a795",
                  flexShrink: 0,
                }}
              />

              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#78847a",
                  letterSpacing: "0.02em",
                }}
              >
                ENERGY DELIVERED
              </span>
            </div>

            <div
              style={{
                fontSize: "23px",
                fontWeight: 750,
                lineHeight: 1.2,
                color: "#58715d",
                letterSpacing: "-0.7px",
              }}
            >
              {formatNumber(hoveredPoint.energy, 2)}
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  marginLeft: "4px",
                  color: "#849287",
                }}
              >
                kWh
              </span>
            </div>

            <div
              style={{
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px solid #edf1ed",
                fontSize: "11px",
                color: "#8b958d",
              }}
            >
              {new Date(
                `${hoveredPoint.date}T12:00:00+03:00`
              ).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "Asia/Qatar",
              })}
            </div>
          </div>
        )}
      </div>

      <div className="energy-chart-caption">
        <span>Daily energy delivered</span>
        <strong>kWh</strong>
      </div>

      <style jsx>{`
        @keyframes energyTooltipIn {
          from {
            opacity: 0;
            transform: translate(-50%, ${popupAbove ? "5px" : "-5px"});
          }
          to {
            opacity: 1;
            transform: translate(
              -50%,
              ${popupAbove ? "0" : "0"}
            );
          }
        }
      `}</style>
    </div>
  );
}


function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="spec-row">
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Formatting helpers                                                         */
/* -------------------------------------------------------------------------- */

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

function formatNumber(value: number, decimals = 1) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
  });
}

/* Returns a YYYY-MM-DD date in Qatar's local timezone. */
function getQatarDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Qatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return year && month && day ? `${year}-${month}-${day}` : "";
}

function getStatusLabel(status: string | null | undefined) {
  const value = (status || "unknown").toLowerCase();

  if (["available", "online", "idle", "ready"].includes(value)) {
    return "Available";
  }

  if (["charging", "occupied", "in_use", "in-use"].includes(value)) {
    return "Charging";
  }

  if (["fault", "faulted", "error", "failed"].includes(value)) {
    return "Faulted";
  }

  if (value === "maintenance") return "Maintenance";

  if (["offline", "disconnected"].includes(value)) {
    return "Offline";
  }

  return status || "Unknown";
}

function getSessionStatus(status: string) {
  const value = status.toLowerCase();

  if (value === "active") return "Charging";
  if (value === "completed") return "Completed";
  if (value === "pending") return "Pending";
  if (value === "failed") return "Failed";
  if (value === "cancelled") return "Cancelled";

  return status;
}

/* -------------------------------------------------------------------------- */
/* Stations table                                                             */
/* -------------------------------------------------------------------------- */

function StationsTable({
  stations,
  loading,
  error,
  onSelect,
}: {
  stations: Station[];
  loading: boolean;
  error: string;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>STATION / ID</th>
            <th>ADDRESS</th>
            <th>CHARGERS</th>
            <th>AVAILABLE</th>
            <th>POWER</th>
            <th>PRICE</th>
            <th>TYPE</th>
          </tr>
        </thead>

        <tbody>
          {stations.map((station) => (
            <tr
              key={String(station.id)}
              className="clickable-row"
              onClick={() => onSelect(`${station.id} · ${station.name}`)}
            >
              <td>
                <strong>
                  {station.id} · {station.name}
                </strong>

                {station.shortName && (
                  <small className="muted" style={{ display: "block" }}>
                    {station.shortName}
                  </small>
                )}
              </td>

              <td>{station.address || "—"}</td>
              <td>{station.chargers ?? "—"}</td>
              <td>{station.available ?? "—"}</td>
              <td>
                {station.power == null ? "—" : `${station.power} kW`}
              </td>
              <td>{station.price == null ? "—" : String(station.price)}</td>
              <td>{station.kind || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <div className="empty-state">Loading station records…</div>}

      {error && (
        <div className="empty-state">
          <CircleAlert size={22} />
          <strong>Could not load stations</strong>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && stations.length === 0 && (
        <div className="empty-state">
          <Map size={22} />
          <strong>No station records found</strong>
          <p>Your database returned no stations.</p>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main page                                                                  */
/* -------------------------------------------------------------------------- */

export default function Home() {
  const [page, setPage] = useState("Dashboard");

  const [chargerTab, setChargerTab] = useState("All chargers");
  const [query, setQuery] = useState("");
  const [stationFilter, setStationFilter] = useState("All stations");
  const [showFilters, setShowFilters] = useState(false);

  const [dateRange, setDateRange] = useState("All time");
  const [notice, setNotice] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  const [reviewStationFilter, setReviewStationFilter] = useState("All stations");

  const [stations, setStations] = useState<Station[]>([]);
  const [stationsLoading, setStationsLoading] = useState(true);
  const [stationsError, setStationsError] = useState("");

  const [databaseChargers, setDatabaseChargers] = useState<DatabaseCharger[]>([]);
  const [chargersLoading, setChargersLoading] = useState(true);
  const [chargersError, setChargersError] = useState("");

  const [databaseConnectors, setDatabaseConnectors] = useState<DatabaseConnector[]>([]);
  const [connectorsLoading, setConnectorsLoading] = useState(true);
  const [connectorsError, setConnectorsError] = useState("");

  const [databaseSessions, setDatabaseSessions] = useState<DatabaseSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState("");

  const [databaseReviews, setDatabaseReviews] = useState<DatabaseReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  const toast = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  /* ------------------------------------------------------------------------ */
  /* Fetch database data                                                      */
  /* ------------------------------------------------------------------------ */


/* -------------------------------------------------------------------------- */
/* Fetch database data — automatic 5-second refresh                           */
/* -------------------------------------------------------------------------- */

useEffect(() => {
  let cancelled = false;
  let refreshing = false;

  async function fetchArray<T>(
    url: string
  ): Promise<{ data: T[] | null; error: string }> {
    try {
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The API returned an unexpected response.");
      }

      return {
        data: data as T[],
        error: "",
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Could not load data.",
      };
    }
  }

  return () => {
    cancelled = true;
    window.clearInterval(interval);
  };
}, []);


  useEffect(() => {
    let cancelled = false;

    async function loadChargers() {
      try {
        setChargersLoading(true);
        setChargersError("");

        const response = await fetch("/api/chargers", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("The chargers API returned an unexpected response.");
        }

        if (!cancelled) {
          setDatabaseChargers(data as DatabaseCharger[]);
        }
      } catch (error) {
        if (!cancelled) {
          setChargersError(
            error instanceof Error ? error.message : "Could not load chargers."
          );
        }
      } finally {
        if (!cancelled) setChargersLoading(false);
      }
    }

    void loadChargers();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadConnectors() {
      try {
        setConnectorsLoading(true);
        setConnectorsError("");

        const response = await fetch("/api/connectors", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("The connectors API returned an unexpected response.");
        }

        if (!cancelled) {
          setDatabaseConnectors(data as DatabaseConnector[]);
        }
      } catch (error) {
        if (!cancelled) {
          setConnectorsError(
            error instanceof Error ? error.message : "Could not load connectors."
          );
        }
      } finally {
        if (!cancelled) setConnectorsLoading(false);
      }
    }

    void loadConnectors();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      try {
        setSessionsLoading(true);
        setSessionsError("");

        const response = await fetch("/api/charging-sessions", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            "The charging sessions API returned an unexpected response."
          );
        }

        if (!cancelled) {
          setDatabaseSessions(data as DatabaseSession[]);
        }
      } catch (error) {
        if (!cancelled) {
          setSessionsError(
            error instanceof Error
              ? error.message
              : "Could not load charging sessions."
          );
        }
      } finally {
        if (!cancelled) setSessionsLoading(false);
      }
    }

    void loadSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        setReviewsLoading(true);
        setReviewsError("");

        const response = await fetch("/api/reviews", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("The reviews API returned an unexpected response.");
        }

        if (!cancelled) {
          setDatabaseReviews(data as DatabaseReview[]);
        }
      } catch (error) {
        if (!cancelled) {
          setReviewsError(
            error instanceof Error ? error.message : "Could not load reviews."
          );
        }
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    }

    void loadReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Calculated database statistics                                           */
  /* ------------------------------------------------------------------------ */

  const connectorStats = useMemo(() => {
    const total = databaseConnectors.length;

    const available = databaseConnectors.filter((connector) =>
      /available|online|idle|ready/i.test(connector.status || "")
    ).length;

    const charging = databaseConnectors.filter((connector) =>
      /charging|occupied|in.use/i.test(connector.status || "")
    ).length;

    const faulted = databaseConnectors.filter((connector) =>
      /fault|error|failed/i.test(connector.status || "")
    ).length;

    const maintenance = databaseConnectors.filter((connector) =>
      /maintenance/i.test(connector.status || "")
    ).length;

    const offline = databaseConnectors.filter((connector) =>
      /offline|disconnected/i.test(connector.status || "")
    ).length;

    return {
      total,
      available,
      charging,
      faulted,
      maintenance,
      offline,
      attention: faulted + maintenance + offline,
    };
  }, [databaseConnectors]);

  const chargerStats = useMemo(() => {
    const totalPower = databaseChargers.reduce(
      (sum, charger) => sum + (Number(charger.max_power_kw) || 0),
      0
    );

    const online = databaseChargers.filter((charger) =>
      /available|online|charging|connected/i.test(charger.status || "")
    ).length;

    const faulted = databaseChargers.filter((charger) =>
      /fault|error|failed/i.test(charger.status || "")
    ).length;

    const offline = databaseChargers.filter((charger) =>
      /offline|disconnected/i.test(charger.status || "")
    ).length;

    const maintenance = databaseChargers.filter((charger) =>
      /maintenance/i.test(charger.status || "")
    ).length;

    return {
      total: databaseChargers.length,
      totalPower,
      online,
      faulted,
      offline,
      maintenance,
    };
  }, [databaseChargers]);

  const sessionStats = useMemo(() => {
    const total = databaseSessions.length;

    const completed = databaseSessions.filter(
      (session) => session.status.toLowerCase() === "completed"
    );

    const active = databaseSessions.filter(
      (session) => session.status.toLowerCase() === "active"
    );

    const pending = databaseSessions.filter(
      (session) => session.status.toLowerCase() === "pending"
    );

    const failed = databaseSessions.filter((session) =>
      ["failed", "cancelled"].includes(session.status.toLowerCase())
    );

    const energy = completed.reduce(
      (sum, session) => sum + (Number(session.energy_kwh) || 0),
      0
    );

    const averageEnergy = completed.length ? energy / completed.length : 0;

    const completionRate = total ? (completed.length / total) * 100 : 0;

    return {
      total,
      completed: completed.length,
      active: active.length,
      pending: pending.length,
      failed: failed.length,
      energy,
      averageEnergy,
      completionRate,
    };
  }, [databaseSessions]);

  /* ------------------------------------------------------------------------ */
  /* Daily energy graph data                                                  */
  /* ------------------------------------------------------------------------ */

  const dailyEnergyData = useMemo<EnergyPoint[]>(() => {
    const dailyTotals = new globalThis.Map<string, number>();

    databaseSessions.forEach((session) => {
      if (
        session.status.toLowerCase() !== "completed" ||
        !session.started_at ||
        session.energy_kwh == null
      ) {
        return;
      }

      const dateKey = getQatarDateKey(session.started_at);

      if (!dateKey) return;

      dailyTotals.set(
        dateKey,
        (dailyTotals.get(dateKey) || 0) +
          (Number(session.energy_kwh) || 0)
      );
    });

    const dates = [...dailyTotals.keys()].sort();

    if (dates.length === 0) return [];

    const firstDate = new Date(`${dates[0]}T00:00:00Z`);

    const todayKey = getQatarDateKey(new Date());
    const lastRecordedDate = dates[dates.length - 1];

    const endDate =
      todayKey > lastRecordedDate ? todayKey : lastRecordedDate;

    const lastDate = new Date(`${endDate}T00:00:00Z`);

    const result: EnergyPoint[] = [];

    for (
      const cursor = new Date(firstDate);
      cursor <= lastDate;
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    ) {
      const date = cursor.toISOString().slice(0, 10);

      const label = new Date(
        `${date}T12:00:00+03:00`
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        timeZone: "Asia/Qatar",
      });

      result.push({
        date,
        label,
        energy: dailyTotals.get(date) || 0,
      });
    }

    return result;
  }, [databaseSessions]);

  const visibleEnergyData = useMemo(() => {
    return dateRange === "Last 7 days"
      ? dailyEnergyData.slice(-7)
      : dailyEnergyData;
  }, [dailyEnergyData, dateRange]);

  const reviewStats = useMemo(() => {
    const total = databaseReviews.length;

    const average = total
      ? databaseReviews.reduce((sum, review) => sum + review.rating, 0) / total
      : 0;

    const fiveStar = databaseReviews.filter((review) => review.rating === 5).length;

    const stationCount = new Set(
      databaseReviews.map((review) => review.station_id)
    ).size;

    const distribution = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: databaseReviews.filter((review) => review.rating === rating).length,
    }));

    return {
      total,
      average,
      fiveStar,
      stationCount,
      distribution,
    };
  }, [databaseReviews]);

  const estimatedCo2Kg = sessionStats.energy * 0.42;

  /* ------------------------------------------------------------------------ */
  /* Charger filtering                                                        */
  /* ------------------------------------------------------------------------ */

  const filteredChargers = useMemo(() => {
    return databaseChargers.filter((charger) => {
      const status = (charger.status || "").toLowerCase();

      const matchesTab =
        chargerTab === "All chargers" ||
        (chargerTab === "Online" &&
          /available|online|charging|connected/i.test(status)) ||
        (chargerTab === "Offline" &&
          /offline|disconnected/i.test(status)) ||
        (chargerTab === "Maintenance" && /maintenance/i.test(status));

      const station = stations.find(
        (item) => String(item.id) === String(charger.station_id)
      );

      const stationName = station?.name || "";

      const searchText = [
        charger.id,
        charger.name,
        charger.station_id,
        stationName,
        charger.manufacturer,
        charger.model,
        charger.serial_number,
        charger.status,
        charger.protocol,
        charger.protocol_identity,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = searchText.includes(query.toLowerCase());

      const matchesStation =
        stationFilter === "All stations" ||
        String(charger.station_id || "") === stationFilter;

      return matchesTab && matchesQuery && matchesStation;
    });
  }, [
    databaseChargers,
    chargerTab,
    query,
    stationFilter,
    stations,
  ]);

  /* ------------------------------------------------------------------------ */
  /* CSV export                                                               */
  /* ------------------------------------------------------------------------ */

  const exportCsv = () => {
    const rows = [
      [
        "Charger ID",
        "Charger Name",
        "Station ID",
        "Manufacturer",
        "Model",
        "Serial Number",
        "Max Power kW",
        "Status",
        "Protocol",
        "Protocol Identity",
      ],
      ...filteredChargers.map((charger) => [
        String(charger.id),
        charger.name || "",
        String(charger.station_id || ""),
        charger.manufacturer || "",
        charger.model || "",
        charger.serial_number || "",
        String(charger.max_power_kw ?? ""),
        charger.status || "",
        charger.protocol || "",
        charger.protocol_identity || "",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "be-electric-chargers.csv";
    link.click();

    URL.revokeObjectURL(url);
    toast("Charger inventory exported.");
  };

  /* ------------------------------------------------------------------------ */
  /* Dashboard                                                                */
  /* ------------------------------------------------------------------------ */

  const renderDashboard = () => (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <h1>Network at a glance</h1>
          <p>
            A clear view of your charging network, from connection to impact.
          </p>
        </div>

        <div className="heading-actions">
          <button
            className="date-button"
            onClick={() =>
              setDateRange(dateRange === "All time" ? "Last 7 days" : "All time")
            }
          >
            <CalendarDays size={15} />
            {dateRange}
            <ChevronDown size={13} />
          </button>

          <button className="primary-button" onClick={exportCsv}>
            <Download size={15} />
            Export chargers
          </button>
        </div>
      </div>

      <div className="network-banner">
        <div className="banner-icon">
          <Activity size={20} />
        </div>

        <div>
          <strong>Your network is moving Qatar forward.</strong>
          <p>
            {chargerStats.online} of {chargerStats.total} chargers online ·{" "}
            {sessionStats.active} active sessions ·{" "}
            {connectorStats.attention} connectors need attention
          </p>
        </div>

        <button
          className="light-button"
          onClick={() => setPage("Live Monitoring")}
        >
          <ArrowRight size={14} />
          View live monitoring
        </button>
      </div>

      <div className="metric-grid">
        <Metric
          title="Total Stations"
          value={stationsLoading || stationsError ? "—" : String(stations.length)}
          sub={stationsLoading ? "Loading database records" : stationsError ? "Database unavailable" : "Live station records"}
        />

        <Metric
          title="Total Chargers"
          value={chargersLoading || chargersError ? "—" : String(chargerStats.total)}
          sub="Live database records"
        />

        <Metric
          title="Total Connectors"
          value={connectorsLoading || connectorsError ? "—" : String(connectorStats.total)}
          sub="Live database records"
        />

        <Metric
          title="Active Sessions"
          value={sessionsLoading || sessionsError ? "—" : String(sessionStats.active)}
          sub="Status: active"
        />

        <Metric
          title="Available Connectors"
          value={connectorsLoading || connectorsError ? "—" : String(connectorStats.available)}
          sub="Based on connector status"
        />

        <Metric
          title="Energy Delivered"
          value={sessionsLoading || sessionsError ? "—" : `${formatNumber(sessionStats.energy)} kWh`}
          sub="Completed sessions only"
        />

        <Metric
          title="Estimated CO₂ Avoided"
          value={sessionsLoading || sessionsError ? "—" : `${formatNumber(estimatedCo2Kg / 1000, 2)} t`}
          sub="Energy × 0.42 kg CO₂/kWh"
        />

        <Metric
          title="Average Energy / Session"
          value={sessionsLoading || sessionsError ? "—" : `${formatNumber(sessionStats.averageEnergy)} kWh`}
          sub="Completed sessions"
        />
      </div>

      <div className="analytics-grid">
        {/* Updated: real daily energy graph from charging_sessions */}
        <section className="panel energy-panel">
          <div className="panel-head">
            <h3>Energy delivered</h3>
            <span>{dateRange}</span>
          </div>

          <div className="chart-summary">
            <strong>
              {sessionsLoading || sessionsError
                ? "—"
                : formatNumber(
                    visibleEnergyData.reduce(
                      (sum, item) => sum + item.energy,
                      0
                    )
                  )}
            </strong>
            <span>kWh</span>
          </div>

          {sessionsLoading ? (
            <div className="empty-state">Loading energy data…</div>
          ) : sessionsError ? (
            <div className="empty-state">
              <CircleAlert size={22} />
              <strong>Could not load energy data</strong>
              <p>{sessionsError}</p>
            </div>
          ) : (
            <EnergyTrendChart data={visibleEnergyData} />
          )}

          <p className="muted tiny">
            Daily totals are grouped by the session start date in Qatar time
            (Asia/Qatar). Only completed sessions are included.
          </p>
        </section>

        <section className="panel health-panel">
          <div className="panel-head">
            <h3>Network health</h3>
            <span>Current database status</span>
          </div>

          <div className="health-score">
            {chargersLoading || connectorsLoading
              ? "—"
              : `${chargerStats.online} / ${chargerStats.total}`}
            <StatusPill status="Database status" />
          </div>

          <p className="muted tiny">
            Charger and connector status counts.
          </p>

          <Progress
            label="Available connectors"
            value={`${connectorStats.available} of ${connectorStats.total}`}
            percent={
              connectorStats.total
                ? (connectorStats.available / connectorStats.total) * 100
                : 0
            }
          />

          <Progress
            label="Charging connectors"
            value={`${connectorStats.charging} of ${connectorStats.total}`}
            percent={
              connectorStats.total
                ? (connectorStats.charging / connectorStats.total) * 100
                : 0
            }
          />

          <Progress
            label="Faulted / maintenance / offline"
            value={`${connectorStats.attention} of ${connectorStats.total}`}
            percent={
              connectorStats.total
                ? (connectorStats.attention / connectorStats.total) * 100
                : 0
            }
          />
        </section>
      </div>

      <div className="mini-chart-grid">
        <Metric
          title="Completed Sessions"
          value={sessionsLoading || sessionsError ? "—" : String(sessionStats.completed)}
          sub="From charging_sessions"
        />

        <Metric
          title="Active Sessions"
          value={sessionsLoading || sessionsError ? "—" : String(sessionStats.active)}
          sub="Currently active records"
        />

        <Metric
          title="Failed / Cancelled"
          value={sessionsLoading || sessionsError ? "—" : String(sessionStats.failed)}
          sub="From charging_sessions"
        />
      </div>

      <div className="two-panel-grid">
        <section className="panel">
          <div className="panel-head">
            <h3>Connector status</h3>
            <button
              className="text-button"
              onClick={() => setPage("Connectors")}
            >
              View connectors <ArrowRight size={12} />
            </button>
          </div>

          <Progress
            label="Available"
            value={String(connectorStats.available)}
            percent={
              connectorStats.total
                ? (connectorStats.available / connectorStats.total) * 100
                : 0
            }
          />

          <Progress
            label="Charging"
            value={String(connectorStats.charging)}
            percent={
              connectorStats.total
                ? (connectorStats.charging / connectorStats.total) * 100
                : 0
            }
          />

          <Progress
            label="Faulted"
            value={String(connectorStats.faulted)}
            percent={
              connectorStats.total
                ? (connectorStats.faulted / connectorStats.total) * 100
                : 0
            }
          />

          <Progress
            label="Offline"
            value={String(connectorStats.offline)}
            percent={
              connectorStats.total
                ? (connectorStats.offline / connectorStats.total) * 100
                : 0
            }
          />
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>Charging session summary</h3>
            <button
              className="text-button"
              onClick={() => setPage("Charging Sessions")}
            >
              View sessions <ArrowRight size={12} />
            </button>
          </div>

          <div className="insight-row">
            <div className="insight-icon">
              <ClipboardList size={16} />
            </div>
            <div>
              <strong>Total sessions</strong>
              <p>{sessionsLoading ? "Loading…" : sessionStats.total}</p>
            </div>
          </div>

          <div className="insight-row">
            <div className="insight-icon">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <strong>Completed sessions</strong>
              <p>{sessionsLoading ? "Loading…" : sessionStats.completed}</p>
            </div>
          </div>

          <div className="insight-row">
            <div className="insight-icon">
              <Clock3 size={16} />
            </div>
            <div>
              <strong>Completion rate</strong>
              <p>
                {sessionsLoading
                  ? "Loading…"
                  : `${formatNumber(sessionStats.completionRate)}%`}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="panel station-performance">
        <div className="panel-head">
          <h3>Station performance</h3>
          <button className="text-button" onClick={() => setPage("Stations")}>
            View stations <ArrowRight size={12} />
          </button>
        </div>

        <StationsTable
          stations={stations}
          loading={stationsLoading}
          error={stationsError}
          onSelect={(station) => toast(`${station} selected.`)}
        />

        <div className="table-foot">
          {stationsLoading
            ? "Loading station records…"
            : stationsError
              ? "Station data unavailable"
              : `${stations.length} station records from database`}
        </div>
      </section>

      <footer>
        Be-Electric · Qatar network
        <span>Data loaded from Neon PostgreSQL</span>
      </footer>
    </div>
  );

  /* ------------------------------------------------------------------------ */
  /* Chargers                                                                 */
  /* ------------------------------------------------------------------------ */

  const renderChargers = () => (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <h1>Chargers</h1>
          <p>
            Hardware inventory, connectivity and charger status across your
            network.
          </p>
        </div>

        <div className="heading-actions">
          <button
            className="outline-button"
            onClick={() => window.location.reload()}
          >
            <Activity size={14} />
            Refresh data
          </button>

          <button className="primary-button" onClick={exportCsv}>
            <Download size={15} />
            Export chargers
          </button>
        </div>
      </div>

      <div className="metric-grid charger-metrics">
        <Metric
          title="Total chargers"
          value={chargersLoading || chargersError ? "—" : String(chargerStats.total)}
          sub="Live database records"
        />

        <Metric
          title="Total connectors"
          value={connectorsLoading || connectorsError ? "—" : String(connectorStats.total)}
          sub="Live database records"
        />

        <Metric
          title="Available / online"
          value={chargersLoading || chargersError ? "—" : String(chargerStats.online)}
          sub="Based on charger status"
        />

        <Metric
          title="Faulted chargers"
          value={chargersLoading || chargersError ? "—" : String(chargerStats.faulted)}
          sub="Based on charger status"
        />

        <Metric
          title="Total rated power"
          value={chargersLoading || chargersError ? "—" : `${formatNumber(chargerStats.totalPower)} kW`}
          sub="Sum of max_power_kw"
        />
      </div>

      <section className="panel inventory-panel">
        <div className="panel-head">
          <h3>Charger inventory</h3>
          <span>Live data from public.chargers</span>
        </div>

        <div className="tabs">
          {["All chargers", "Online", "Offline", "Maintenance"].map((tab) => {
            const count = databaseChargers.filter((charger) => {
              const status = charger.status || "";

              return (
                tab === "All chargers" ||
                (tab === "Online" &&
                  /available|online|charging|connected/i.test(status)) ||
                (tab === "Offline" &&
                  /offline|disconnected/i.test(status)) ||
                (tab === "Maintenance" && /maintenance/i.test(status))
              );
            }).length;

            return (
              <button
                key={tab}
                className={chargerTab === tab ? "tab active" : "tab"}
                onClick={() => setChargerTab(tab)}
              >
                {tab}
                <span>{chargersLoading ? "—" : count}</span>
              </button>
            );
          })}
        </div>

        <div className="toolbar">
          <label className="search-box">
            <Search size={16} />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search charger ID, name or serial..."
            />

            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </label>

          <label className="select-wrap">
            <select
              value={stationFilter}
              onChange={(event) => setStationFilter(event.target.value)}
            >
              <option value="All stations">All stations</option>

              {stations.map((station) => (
                <option key={String(station.id)} value={String(station.id)}>
                  {station.id} · {station.name}
                </option>
              ))}
            </select>
            <ChevronDown size={13} />
          </label>

          <div className="toolbar-spacer" />

          <button
            className={`outline-button ${showFilters ? "selected" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>

          <button
            className="icon-button"
            onClick={exportCsv}
            aria-label="Export charger list"
          >
            <ArrowDownToLine size={16} />
          </button>
        </div>

        {showFilters && (
          <div className="filter-note">
            <Activity size={14} />
            Filters apply immediately.
            <button
              onClick={() => {
                setStationFilter("All stations");
                setQuery("");
                setChargerTab("All chargers");
              }}
            >
              Clear all
            </button>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>CHARGER ID / NAME</th>
                <th>STATION ID</th>
                <th>MANUFACTURER</th>
                <th>MODEL</th>
                <th>SERIAL NUMBER</th>
                <th>MAX POWER</th>
                <th>STATUS</th>
                <th>PROTOCOL</th>
              </tr>
            </thead>

            <tbody>
              {filteredChargers.map((charger) => (
                <tr key={String(charger.id)}>
                  <td>
                    <strong>{charger.name || `Charger ${charger.id}`}</strong>
                    <small className="muted" style={{ display: "block" }}>
                      ID: {charger.id}
                    </small>
                  </td>

                  <td>{charger.station_id ?? "—"}</td>
                  <td>{charger.manufacturer || "—"}</td>
                  <td>{charger.model || "—"}</td>
                  <td>{charger.serial_number || "—"}</td>

                  <td>
                    {charger.max_power_kw == null
                      ? "—"
                      : `${charger.max_power_kw} kW`}
                  </td>

                  <td>
                    <StatusPill status={getStatusLabel(charger.status)} />
                  </td>

                  <td>
                    {charger.protocol || "—"}
                    {charger.protocol_identity && (
                      <small className="muted" style={{ display: "block" }}>
                        {charger.protocol_identity}
                      </small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {chargersLoading && (
            <div className="empty-state">Loading charger records…</div>
          )}

          {chargersError && (
            <div className="empty-state">
              <CircleAlert size={22} />
              <strong>Could not load chargers</strong>
              <p>{chargersError}</p>
            </div>
          )}

          {!chargersLoading &&
            !chargersError &&
            filteredChargers.length === 0 && (
              <div className="empty-state">
                <PlugZap size={22} />
                <strong>No matching chargers found</strong>
                <p>Try changing your search or filters.</p>
              </div>
            )}
        </div>

        <div className="table-foot">
          {chargersLoading
            ? "Loading charger records…"
            : `Showing ${filteredChargers.length} of ${databaseChargers.length} chargers`}
        </div>
      </section>

      <div className="bottom-info-grid">
        <section className="panel firmware-panel">
          <div className="panel-head">
            <h3>Charger status summary</h3>
            <span>Live database data</span>
          </div>

          <Spec label="Available / online" value={String(chargerStats.online)} />
          <Spec label="Faulted" value={String(chargerStats.faulted)} />
          <Spec label="Offline" value={String(chargerStats.offline)} />
          <Spec label="Maintenance" value={String(chargerStats.maintenance)} />
        </section>

        <section className="panel hardware-panel">
          <div className="panel-head">
            <h3>Hardware inventory</h3>
            <span>Database fields</span>
          </div>

          <Spec label="Total chargers" value={String(chargerStats.total)} />
          <Spec label="Total connectors" value={String(connectorStats.total)} />
          <Spec
            label="Combined rated power"
            value={`${formatNumber(chargerStats.totalPower)} kW`}
          />
          <Spec label="Data source" value="public.chargers" />
        </section>
      </div>

      <footer>
        Be-Electric · Qatar network
        <span>Live charger inventory</span>
      </footer>
    </div>
  );

  /* ------------------------------------------------------------------------ */
  /* Connectors                                                               */
  /* ------------------------------------------------------------------------ */

  const renderConnectors = () => (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <h1>Connectors</h1>
          <p>Connector inventory loaded directly from your database.</p>
        </div>

        <div className="heading-actions">
          <button
            className="outline-button"
            onClick={() => window.location.reload()}
          >
            <Activity size={14} />
            Refresh data
          </button>
        </div>
      </div>

      <div className="metric-grid charger-metrics">
        <Metric
          title="Total connectors"
          value={connectorsLoading || connectorsError ? "—" : String(connectorStats.total)}
          sub="Live database records"
        />

        <Metric
          title="Total chargers"
          value={chargersLoading || chargersError ? "—" : String(chargerStats.total)}
          sub="Live database records"
        />

        <Metric
          title="Rated connector power"
          value={
            connectorsLoading || connectorsError
              ? "—"
              : `${formatNumber(
                  databaseConnectors.reduce(
                    (sum, connector) =>
                      sum + (Number(connector.max_power_kw) || 0),
                    0
                  )
                )} kW`
          }
          sub="Sum of max_power_kw"
        />

        <Metric
          title="Available connectors"
          value={connectorsLoading || connectorsError ? "—" : String(connectorStats.available)}
          sub="Based on connector status"
        />

        <Metric
          title="Faulted connectors"
          value={connectorsLoading || connectorsError ? "—" : String(connectorStats.faulted)}
          sub="Based on connector status"
        />
      </div>

      <section className="panel inventory-panel">
        <div className="panel-head">
          <h3>Connector inventory</h3>
          <span>Live data from public.connectors</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>CONNECTOR ID</th>
                <th>CHARGER ID</th>
                <th>CONNECTOR NUMBER</th>
                <th>TYPE</th>
                <th>MAX POWER</th>
                <th>STATUS</th>
                <th>UPDATED</th>
              </tr>
            </thead>

            <tbody>
              {databaseConnectors.map((connector) => (
                <tr key={String(connector.id)}>
                  <td>
                    <strong>{connector.id}</strong>
                  </td>

                  <td>{connector.charger_id}</td>
                  <td>{connector.connector_number ?? "—"}</td>
                  <td>{connector.connector_type || "—"}</td>

                  <td>
                    {connector.max_power_kw == null
                      ? "—"
                      : `${connector.max_power_kw} kW`}
                  </td>

                  <td>
                    <StatusPill status={getStatusLabel(connector.status)} />
                  </td>

                  <td>{formatDate(connector.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {connectorsLoading && (
            <div className="empty-state">Loading connector records…</div>
          )}

          {connectorsError && (
            <div className="empty-state">
              <CircleAlert size={22} />
              <strong>Could not load connectors</strong>
              <p>{connectorsError}</p>
            </div>
          )}

          {!connectorsLoading &&
            !connectorsError &&
            databaseConnectors.length === 0 && (
              <div className="empty-state">
                <Zap size={22} />
                <strong>No connector records found</strong>
                <p>Your database returned no connectors.</p>
              </div>
            )}
        </div>

        <div className="table-foot">
          {connectorsLoading
            ? "Loading connector records…"
            : `Showing ${databaseConnectors.length} connector records`}
        </div>
      </section>

      <footer>
        Connector details are read from public.connectors.
      </footer>
    </div>
  );

  /* ------------------------------------------------------------------------ */
  /* Charging sessions                                                        */
  /* ------------------------------------------------------------------------ */

  const renderChargingSessions = () => (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <h1>Charging Sessions</h1>
          <p>
            Track charging activity, session performance and energy delivered
            across your network.
          </p>
        </div>

        <div className="heading-actions">
          <button
            className="outline-button"
            onClick={() => window.location.reload()}
          >
            <Activity size={14} />
            Refresh data
          </button>
        </div>
      </div>

      <div className="metric-grid">
        <Metric
          title="Total sessions"
          value={sessionsLoading || sessionsError ? "—" : String(sessionStats.total)}
          sub="All session records"
        />

        <Metric
          title="Completed sessions"
          value={sessionsLoading || sessionsError ? "—" : String(sessionStats.completed)}
          sub={`${formatNumber(sessionStats.completionRate)}% completion rate`}
        />

        <Metric
          title="Energy delivered"
          value={sessionsLoading || sessionsError ? "—" : `${formatNumber(sessionStats.energy)} kWh`}
          sub="Completed sessions"
        />

        <Metric
          title="Average session"
          value={sessionsLoading || sessionsError ? "—" : `${formatNumber(sessionStats.averageEnergy)} kWh`}
          sub="Average completed session"
        />
      </div>

      <div className="analytics-grid session-analytics">
        <section className="panel energy-panel">
          <div className="panel-head">
            <h3>Session activity</h3>
            <span>All database records</span>
          </div>

          <div className="chart-summary">
            <strong>
              {sessionsLoading || sessionsError
                ? "—"
                : sessionStats.total.toLocaleString()}
            </strong>
            <span>sessions</span>
          </div>

          <Progress
            label="Completed"
            value={String(sessionStats.completed)}
            percent={sessionStats.completionRate}
          />

          <Progress
            label="Active"
            value={String(sessionStats.active)}
            percent={
              sessionStats.total
                ? (sessionStats.active / sessionStats.total) * 100
                : 0
            }
          />

          <Progress
            label="Pending"
            value={String(sessionStats.pending)}
            percent={
              sessionStats.total
                ? (sessionStats.pending / sessionStats.total) * 100
                : 0
            }
          />

          <Progress
            label="Failed / cancelled"
            value={String(sessionStats.failed)}
            percent={
              sessionStats.total
                ? (sessionStats.failed / sessionStats.total) * 100
                : 0
            }
          />
        </section>

        <section className="panel health-panel">
          <div className="panel-head">
            <h3>Session outcomes</h3>
            <span>Database status</span>
          </div>

          <div className="donut-layout">
            <div className="donut-chart">
              <div>
                <strong>{formatNumber(sessionStats.completionRate)}%</strong>
                <span>completed</span>
              </div>
            </div>

            <div className="legend-list">
              <span>
                <i className="legend-dot completed" />
                Completed <b>{sessionStats.completed}</b>
              </span>

              <span>
                <i className="legend-dot active" />
                Active <b>{sessionStats.active}</b>
              </span>

              <span>
                <i className="legend-dot interrupted" />
                Failed / cancelled <b>{sessionStats.failed}</b>
              </span>
            </div>
          </div>

          <p className="muted tiny">
            Session totals are calculated from public.charging_sessions.
          </p>
        </section>
      </div>

      <div className="mini-chart-grid">
        <Metric
          title="Active sessions"
          value={String(sessionStats.active)}
          sub="Currently active"
        />

        <Metric
          title="Pending sessions"
          value={String(sessionStats.pending)}
          sub="Awaiting completion"
        />

        <Metric
          title="Average energy"
          value={`${formatNumber(sessionStats.averageEnergy)} kWh`}
          sub="Per completed session"
        />
      </div>

      <section className="panel inventory-panel">
        <div className="panel-head">
          <h3>Recent charging sessions</h3>
          <span>Latest database activity</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>SESSION ID</th>
                <th>STATION</th>
                <th>CHARGER</th>
                <th>CONNECTOR</th>
                <th>START TIME</th>
                <th>END TIME</th>
                <th>ENERGY</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {databaseSessions.map((session) => (
                <tr key={String(session.id)}>
                  <td>
                    <strong>
                      {session.external_session_id || `SES-${session.id}`}
                    </strong>
                    <small className="muted" style={{ display: "block" }}>
                      ID: {session.id}
                    </small>
                  </td>

                  <td>
                    {session.station_name ||
                      session.station_short_name ||
                      session.station_id ||
                      "—"}
                  </td>

                  <td>
                    {session.charger_name || session.charger_id || "—"}
                  </td>

                  <td>
                    {session.connector_id}
                    {session.connector_type && (
                      <small className="muted" style={{ display: "block" }}>
                        {session.connector_type}
                      </small>
                    )}
                  </td>

                  <td>{formatDate(session.started_at)}</td>
                  <td>{formatDate(session.ended_at)}</td>

                  <td>
                    {session.energy_kwh == null
                      ? "—"
                      : `${session.energy_kwh} kWh`}
                  </td>

                  <td>
                    <StatusPill status={getSessionStatus(session.status)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sessionsLoading && (
            <div className="empty-state">Loading charging sessions…</div>
          )}

          {sessionsError && (
            <div className="empty-state">
              <CircleAlert size={22} />
              <strong>Could not load charging sessions</strong>
              <p>{sessionsError}</p>
            </div>
          )}

          {!sessionsLoading &&
            !sessionsError &&
            databaseSessions.length === 0 && (
              <div className="empty-state">
                <ClipboardList size={22} />
                <strong>No charging sessions found</strong>
                <p>Your database returned no session records.</p>
              </div>
            )}
        </div>

        <div className="table-foot">
          {sessionsLoading
            ? "Loading session records…"
            : `Showing ${databaseSessions.length} database sessions`}
        </div>
      </section>

      <footer>
        Be-Electric · Charging session records
        <span>Source: public.charging_sessions</span>
      </footer>
    </div>
  );

  /* ------------------------------------------------------------------------ */
  /* Station reviews                                                          */
  /* ------------------------------------------------------------------------ */

  const filteredReviews = useMemo(() => {
    if (reviewStationFilter === "All stations") {
      return databaseReviews;
    }

    return databaseReviews.filter(
      (review) => String(review.station_id) === reviewStationFilter
    );
  }, [databaseReviews, reviewStationFilter]);

  const renderReviews = () => (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <h1>Station Reviews</h1>
          <p>
            View customer feedback and ratings across all Be-Electric stations.
          </p>
        </div>

        <div className="heading-actions">
          <button
            className="outline-button"
            onClick={() => window.location.reload()}
          >
            <Activity size={14} />
            Refresh reviews
          </button>
        </div>
      </div>

      <div className="metric-grid">
        <Metric
          title="Total Reviews"
          value={reviewsLoading || reviewsError ? "—" : String(reviewStats.total)}
          sub="All station reviews"
        />

        <Metric
          title="Average Rating"
          value={
            reviewsLoading || reviewsError
              ? "—"
              : `${reviewStats.average.toFixed(1)} / 5`
          }
          sub="Average customer rating"
        />

        <Metric
          title="5-Star Reviews"
          value={reviewsLoading || reviewsError ? "—" : String(reviewStats.fiveStar)}
          sub="Highest-rated reviews"
        />

        <Metric
          title="Stations Reviewed"
          value={reviewsLoading || reviewsError ? "—" : String(reviewStats.stationCount)}
          sub="Unique stations with reviews"
        />
      </div>

      <div className="analytics-grid">
        <section className="panel">
          <div className="panel-head">
            <h3>Rating distribution</h3>
            <span>All reviews</span>
          </div>

          <div className="review-rating-breakdown">
            {reviewStats.distribution.map((item) => {
              const percent = reviewStats.total
                ? (item.count / reviewStats.total) * 100
                : 0;

              return (
                <div className="review-rating-row" key={item.rating}>
                  <span>
                    {item.rating}
                    <Star size={13} />
                  </span>

                  <div className="progress-track">
                    <i style={{ width: `${percent}%` }} />
                  </div>

                  <strong>{item.count}</strong>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel health-panel">
          <div className="panel-head">
            <h3>Overall customer rating</h3>
            <span>All stations</span>
          </div>

          <div className="health-score">
            {reviewsLoading || reviewsError
              ? "—"
              : `${reviewStats.average.toFixed(1)} / 5`}
          </div>

          <div className="review-stars">
            {"★".repeat(Math.round(reviewStats.average))}
            <span>
              {"★".repeat(5 - Math.round(reviewStats.average))}
            </span>
          </div>

          <p className="muted tiny">
            Based on {reviewStats.total} submitted reviews.
          </p>
        </section>
      </div>

      <section className="panel inventory-panel">
        <div className="panel-head">
          <h3>All station reviews</h3>
          <span>Live data from public.reviews</span>
        </div>

        <div className="toolbar">
          <label className="select-wrap">
            <select
              value={reviewStationFilter}
              onChange={(event) =>
                setReviewStationFilter(event.target.value)
              }
            >
              <option value="All stations">All stations</option>

              {stations.map((station) => (
                <option key={String(station.id)} value={String(station.id)}>
                  {station.id} · {station.name}
                </option>
              ))}
            </select>

            <ChevronDown size={13} />
          </label>

          <div className="toolbar-spacer" />

          <span className="muted tiny">
            {filteredReviews.length} reviews displayed
          </span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>REVIEW ID</th>
                <th>STATION</th>
                <th>USER ID</th>
                <th>RATING</th>
                <th>COMMENT</th>
                <th>SUBMITTED</th>
              </tr>
            </thead>

            <tbody>
              {filteredReviews.map((review) => (
                <tr key={String(review.id)}>
                  <td>
                    <strong>#{review.id}</strong>
                  </td>

                  <td>
                    <strong>
                      {review.station_short_name || review.station_name}
                    </strong>
                    <small className="muted" style={{ display: "block" }}>
                      {review.station_id}
                    </small>
                  </td>

                  <td>{review.user_id}</td>

                  <td>
                    <span className="review-stars">
                      {"★".repeat(review.rating)}
                      <span>
                        {"★".repeat(Math.max(0, 5 - review.rating))}
                      </span>
                    </span>
                    <small className="muted">{review.rating}/5</small>
                  </td>

                  <td>
                    <div className="review-comment">
                      {review.comment || "No comment provided"}
                    </div>
                  </td>

                  <td>{formatDate(review.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {reviewsLoading && (
            <div className="empty-state">Loading station reviews…</div>
          )}

          {reviewsError && (
            <div className="empty-state">
              <CircleAlert size={22} />
              <strong>Could not load reviews</strong>
              <p>{reviewsError}</p>
              <p>Check that the /api/reviews route is configured.</p>
            </div>
          )}

          {!reviewsLoading &&
            !reviewsError &&
            filteredReviews.length === 0 && (
              <div className="empty-state">
                <MessageSquareText size={22} />
                <strong>No reviews found</strong>
                <p>
                  There are no reviews for the selected station.
                </p>
              </div>
            )}
        </div>

        <div className="table-foot">
          {reviewsLoading
            ? "Loading reviews…"
            : `Showing ${filteredReviews.length} of ${databaseReviews.length} reviews`}
        </div>
      </section>

      <footer>
        Be-Electric · Customer feedback
        <span>Source: public.reviews</span>
      </footer>
    </div>
  );

  /* ------------------------------------------------------------------------ */
  /* Environmental impact                                                     */
  /* ------------------------------------------------------------------------ */

  const renderEnvironmental = () => (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <h1>Environmental Impact</h1>
          <p>
            Estimated emissions avoided through energy delivered by the
            charging network.
          </p>
        </div>
      </div>

      <div className="impact-banner">
        <div className="impact-banner-icon">
          <TreePine size={23} />
        </div>

        <div>
          <strong>Cleaner journeys, powered by your network.</strong>
          <p>
            Estimates are calculated from completed charging session energy
            using 0.42 kg CO₂ per kWh.
          </p>
        </div>
      </div>

      <div className="metric-grid">
        <Metric
          title="Estimated CO₂ avoided"
          value={
            sessionsLoading || sessionsError
              ? "—"
              : `${formatNumber(estimatedCo2Kg / 1000, 2)} t`
          }
          sub="Calculated from completed sessions"
        />

        <Metric
          title="Energy delivered"
          value={
            sessionsLoading || sessionsError
              ? "—"
              : `${formatNumber(sessionStats.energy)} kWh`
          }
          sub="Completed charging sessions"
        />

        <Metric
          title="Completed sessions"
          value={sessionsLoading || sessionsError ? "—" : String(sessionStats.completed)}
          sub="From charging_sessions"
        />

        <Metric
          title="Average energy per session"
          value={
            sessionsLoading || sessionsError
              ? "—"
              : `${formatNumber(sessionStats.averageEnergy)} kWh`
          }
          sub="Completed sessions"
        />
      </div>

      <section className="panel methodology-panel">
        <div className="panel-head">
          <h3>Calculation methodology</h3>
          <span>Transparent estimate</span>
        </div>

        <div className="method-grid">
          <div>
            <span>ENERGY DELIVERED</span>
            <strong>
              {formatNumber(sessionStats.energy)} kWh
            </strong>
          </div>

          <div>
            <span>AVOIDED EMISSIONS FACTOR</span>
            <strong>0.42 kg CO₂ / kWh</strong>
          </div>

          <div>
            <span>ESTIMATED CO₂ AVOIDED</span>
            <strong>
              {formatNumber(estimatedCo2Kg / 1000, 2)} tonnes
            </strong>
          </div>
        </div>

        <p className="muted tiny">
          This is an estimate, not independently verified emissions
          accounting. The factor is an assumption and should be replaced
          with the approved Qatar-specific methodology if one is provided
          by your project.
        </p>
      </section>

      <footer>
        Be-Electric · Environmental impact
        <span>Calculated from charging session energy</span>
      </footer>
    </div>
  );

  /* ------------------------------------------------------------------------ */
  /* Stations                                                                 */
  /* ------------------------------------------------------------------------ */

  const renderStations = () => (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <h1>Stations</h1>
          <p>All charging stations registered in your Neon database.</p>
        </div>

        <button
          className="outline-button"
          onClick={() => window.location.reload()}
        >
          <Activity size={14} />
          Refresh data
        </button>
      </div>

      <div className="metric-grid">
        <Metric
          title="Total stations"
          value={stationsLoading || stationsError ? "—" : String(stations.length)}
          sub="Database records"
        />

        <Metric
          title="Total chargers"
          value={chargersLoading || chargersError ? "—" : String(chargerStats.total)}
          sub="Across all stations"
        />

        <Metric
          title="Total connectors"
          value={connectorsLoading || connectorsError ? "—" : String(connectorStats.total)}
          sub="Across all chargers"
        />

        <Metric
          title="Available connectors"
          value={connectorsLoading || connectorsError ? "—" : String(connectorStats.available)}
          sub="Based on connector status"
        />
      </div>

      <section className="panel inventory-panel">
        <div className="panel-head">
          <h3>Station inventory</h3>
          <span>Live data from public.stations</span>
        </div>

        <StationsTable
          stations={stations}
          loading={stationsLoading}
          error={stationsError}
          onSelect={(station) => toast(`${station} selected.`)}
        />
      </section>
    </div>
  );

  /* ------------------------------------------------------------------------ */
  /* Generic pages                                                            */
  /* ------------------------------------------------------------------------ */

  const renderGeneric = () => (
    <div className="page-content generic-page">
      <div className="page-heading">
        <div>
          <h1>{page}</h1>
          <p>Manage and monitor your Be-Electric charging network.</p>
        </div>
      </div>

      <div className="generic-banner">
        <div className="banner-icon">
          <Activity size={20} />
        </div>

        <div>
          <strong>{page} workspace</strong>
          <p>
            This section is not connected to a database table yet. Its
            dashboard data will appear here when the corresponding backend
            endpoints are implemented.
          </p>
        </div>
      </div>

      <div className="generic-cards">
        <div className="panel">
          <Activity />
          <h3>Network status</h3>
          <strong>{chargerStats.online} online chargers</strong>
          <p>Based on charger database status.</p>
        </div>

        <div className="panel">
          <AlertTriangle />
          <h3>Items requiring attention</h3>
          <strong>{connectorStats.attention} connectors</strong>
          <p>Faulted, offline or under maintenance.</p>
        </div>

        <div className="panel">
          <Clock3 />
          <h3>Charging sessions</h3>
          <strong>{sessionStats.total} records</strong>
          <p>From the charging sessions table.</p>
        </div>
      </div>

      <section className="panel generic-table">
        <div className="panel-head">
          <h3>Station overview</h3>
          <span>Live database data</span>
        </div>

        <StationsTable
          stations={stations}
          loading={stationsLoading}
          error={stationsError}
          onSelect={(station) => toast(`${station} selected.`)}
        />
      </section>

      <footer>
        Be-Electric · Qatar network
        <span>Database-backed station overview</span>
      </footer>
    </div>
  );

  /* ------------------------------------------------------------------------ */
  /* Page rendering                                                           */
  /* ------------------------------------------------------------------------ */

  const pageContent =
    page === "Dashboard"
      ? renderDashboard()
      : page === "Stations"
        ? renderStations()
        : page === "Chargers"
          ? renderChargers()
          : page === "Connectors"
            ? renderConnectors()
            : page === "Charging Sessions"
              ? renderChargingSessions()
              : page === "Station Reviews"
                ? renderReviews()
                : page === "Environmental Impact"
                  ? renderEnvironmental()
                  : renderGeneric();

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Bolt size={22} />
          </div>

          <div>
            <b>be-electric</b>
            <small>NETWORK OPERATIONS · QATAR</small>
          </div>

          <button
            className="close-nav"
            onClick={() => setMobileNav(false)}
            aria-label="Close navigation"
          >
            <X size={17} />
          </button>
        </div>

        <nav>
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-label">{group.label}</div>

              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.name}
                    className={`nav-item ${page === item.name ? "active" : ""}`}
                    onClick={() => {
                      setPage(item.name);
                      setMobileNav(false);
                    }}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>

                    {"count" in item && item.count && (
                      <em>{item.count}</em>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="network-card">
          <span className="live-dot" />
          <strong>Qatar network</strong>
          <p>
            {stations.length} stations · Asia/Qatar (UTC+3)
          </p>
          <small>Database connected</small>
        </div>
      </aside>

      {mobileNav && (
        <button
          className="nav-scrim"
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation"
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="menu-toggle"
              onClick={() => setMobileNav(true)}
              aria-label="Open navigation"
            >
              <Menu size={19} />
            </button>

            <span>Workspace</span>
            <span className="crumb-slash">/</span>
            <strong>{page}</strong>
          </div>

          <div className="topbar-right">
            <span className="demo-tag">Neon database</span>

            <button
              className="bell-button"
              onClick={() => setPage("Faults & Alerts")}
              aria-label="Notifications"
            >
              <Bell size={17} />
            </button>

            <div className="avatar">AM</div>

            <button
              className="profile-button"
              onClick={() => setPage("Users & Roles")}
            >
              <strong>Network administrator</strong>
              <small>Be-Electric Qatar</small>
              <ChevronDown size={13} />
            </button>
          </div>
        </header>

        {pageContent}
      </main>

      {notice && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {notice}

          <button onClick={() => setNotice("")}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
