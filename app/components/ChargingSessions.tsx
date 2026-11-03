
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ClipboardList,
  CircleAlert,
  RefreshCw,
  Zap,
  Clock3,
} from "lucide-react";

type Session = {
  id: number;
  connector_id: string;
  external_session_id: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  energy_kwh: number | string | null;
  created_at: string;
  account_id: number | null;
  connector_number: number | null;
  connector_type: string | null;
  charger_id: string | null;
  charger_name: string | null;
  station_id: string | null;
  station_name: string | null;
  station_short_name: string | null;
};

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  return (
    <span
      className={`status-pill ${
        normalized.replaceAll(" ", "-")
      }`}
    >
      <i />
      {status.charAt(0).toUpperCase() + status.slice(1)}
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

export default function ChargingSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All sessions");
  const [query, setQuery] = useState("");

  const loadSessions = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/charging-sessions", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to load sessions (${response.status}).`
        );
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected charging sessions API response.");
      }

      setSessions(data as Session[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load charging sessions."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadSessions();
  }, []);

  const stats = useMemo(() => {
    const completed = sessions.filter(
      (session) => session.status === "completed"
    );

    const active = sessions.filter(
      (session) => session.status === "active"
    );

    const pending = sessions.filter(
      (session) => session.status === "pending"
    );

    const failed = sessions.filter(
      (session) =>
        session.status === "failed" ||
        session.status === "cancelled"
    );

    const energy = completed.reduce(
      (sum, session) =>
        sum + (Number(session.energy_kwh) || 0),
      0
    );

    const average = completed.length
      ? energy / completed.length
      : 0;

    const completionRate = sessions.length
      ? (completed.length / sessions.length) * 100
      : 0;

    return {
      total: sessions.length,
      completed: completed.length,
      active: active.length,
      pending: pending.length,
      failed: failed.length,
      energy,
      average,
      completionRate,
    };
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesStatus =
        statusFilter === "All sessions" ||
        session.status.toLowerCase() ===
          statusFilter.toLowerCase();

      const searchText = [
        session.id,
        session.external_session_id,
        session.connector_id,
        session.charger_id,
        session.station_id,
        session.station_name,
        session.status,
        session.account_id,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        searchText.includes(query.toLowerCase())
      );
    });
  }, [sessions, statusFilter, query]);

  const exportCsv = () => {
    const rows = [
      [
        "Session ID",
        "External Session ID",
        "Station",
        "Station ID",
        "Charger ID",
        "Connector ID",
        "Status",
        "Started At",
        "Ended At",
        "Energy (kWh)",
        "Account ID",
      ],
      ...filteredSessions.map((session) => [
        String(session.id),
        session.external_session_id || "",
        session.station_name || "",
        session.station_id || "",
        session.charger_id || "",
        session.connector_id,
        session.status,
        session.started_at || "",
        session.ended_at || "",
        String(session.energy_kwh ?? ""),
        String(session.account_id ?? ""),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "be-electric-charging-sessions.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <h1>Charging Sessions</h1>
          <p>
            Track charging activity, session performance and
            energy delivered across your network.
          </p>
        </div>

        <div className="heading-actions">
          <button
            className="outline-button"
            disabled={loading || refreshing}
            onClick={() => {
              setRefreshing(true);
              void loadSessions();
            }}
          >
            <RefreshCw size={14} />
            Refresh data
          </button>

          <button
            className="primary-button"
            onClick={exportCsv}
            disabled={loading || !!error}
          >
            <Activity size={15} />
            Export report
          </button>
        </div>
      </div>

      <div className="metric-grid">
        <Metric
          title="Total sessions"
          value={loading ? "—" : String(stats.total)}
          sub="All database sessions"
        />

        <Metric
          title="Completed sessions"
          value={loading ? "—" : String(stats.completed)}
          sub={`${stats.completionRate.toFixed(1)}% completion rate`}
        />

        <Metric
          title="Active sessions"
          value={loading ? "—" : String(stats.active)}
          sub="Currently charging"
        />

        <Metric
          title="Energy delivered"
          value={
            loading
              ? "—"
              : `${stats.energy.toFixed(3)} kWh`
          }
          sub="Completed sessions"
        />

        <Metric
          title="Average session"
          value={
            loading
              ? "—"
              : `${stats.average.toFixed(2)} kWh`
          }
          sub="Energy per completed session"
        />

        <Metric
          title="Pending sessions"
          value={loading ? "—" : String(stats.pending)}
          sub="Awaiting activation"
        />

        <Metric
          title="Failed / cancelled"
          value={loading ? "—" : String(stats.failed)}
          sub="Unsuccessful sessions"
        />
      </div>

      <div className="analytics-grid">
        <section className="panel energy-panel">
          <div className="panel-head">
            <h3>Session overview</h3>
            <span>Database records</span>
          </div>

          <div className="chart-summary">
            <strong>{loading ? "—" : stats.total}</strong>
            <span>sessions</span>
          </div>

          <div className="session-status-breakdown">
            {[
              {
                label: "Completed",
                value: stats.completed,
                className: "session-completed",
              },
              {
                label: "Active",
                value: stats.active,
                className: "session-active",
              },
              {
                label: "Pending",
                value: stats.pending,
                className: "session-pending",
              },
              {
                label: "Failed / cancelled",
                value: stats.failed,
                className: "session-failed",
              },
            ].map((item) => (
              <div className="session-status-row" key={item.label}>
                <span>
                  <i className={item.className} />
                  {item.label}
                </span>
                <strong>{loading ? "—" : item.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel health-panel">
          <div className="panel-head">
            <h3>Energy delivered</h3>
            <span>Completed sessions</span>
          </div>

          <div className="session-energy-summary">
            <Zap size={22} />
            <strong>
              {loading ? "—" : stats.energy.toFixed(3)}
            </strong>
            <span>kWh</span>
          </div>

          <p className="muted tiny">
            Calculated from energy_kwh in public.charging_sessions.
          </p>

          <div className="session-stat-detail">
            <span>Average energy per session</span>
            <strong>
              {loading ? "—" : `${stats.average.toFixed(2)} kWh`}
            </strong>
          </div>

          <div className="session-stat-detail">
            <span>Completed sessions</span>
            <strong>
              {loading ? "—" : stats.completed}
            </strong>
          </div>
        </section>
      </div>

      <section className="panel inventory-panel">
        <div className="panel-head">
          <h3>Charging session records</h3>
          <span>Live data from public.charging_sessions</span>
        </div>

        <div className="toolbar">
          <label className="search-box">
            <Activity size={15} />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search session, charger, station or account..."
            />
          </label>

          <label className="select-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All sessions</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <div className="toolbar-spacer" />

          <span className="muted tiny">
            {filteredSessions.length} records
          </span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>SESSION ID</th>
                <th>STATION</th>
                <th>CHARGER</th>
                <th>CONNECTOR</th>
                <th>ACCOUNT ID</th>
                <th>STARTED AT</th>
                <th>ENDED AT</th>
                <th>ENERGY</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {filteredSessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <strong>
                      {session.external_session_id ||
                        `SES-${session.id}`}
                    </strong>
                    <small className="muted" style={{ display: "block" }}>
                      DB ID: {session.id}
                    </small>
                  </td>

                  <td>
                    <strong>
                      {session.station_name || "Unknown station"}
                    </strong>
                    <small className="muted" style={{ display: "block" }}>
                      {session.station_id || "—"}
                    </small>
                  </td>

                  <td>
                    {session.charger_name ||
                      session.charger_id ||
                      "—"}
                    {session.charger_name && (
                      <small className="muted" style={{ display: "block" }}>
                        {session.charger_id}
                      </small>
                    )}
                  </td>

                  <td>
                    {session.connector_id}
                    <small className="muted" style={{ display: "block" }}>
                      {session.connector_type || "—"}
                    </small>
                  </td>

                  <td>{session.account_id ?? "—"}</td>

                  <td>
                    {session.started_at
                      ? new Date(session.started_at).toLocaleString()
                      : "—"}
                  </td>

                  <td>
                    {session.ended_at
                      ? new Date(session.ended_at).toLocaleString()
                      : "—"}
                  </td>

                  <td>
                    {session.energy_kwh == null
                      ? "—"
                      : `${Number(session.energy_kwh).toFixed(3)} kWh`}
                  </td>

                  <td>
                    <StatusPill status={session.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="empty-state">
              <Activity size={20} />
              Loading charging sessions...
            </div>
          )}

          {error && !loading && (
            <div className="empty-state">
              <CircleAlert size={22} />
              <strong>Could not load sessions</strong>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && filteredSessions.length === 0 && (
            <div className="empty-state">
              <ClipboardList size={22} />
              <strong>No sessions found</strong>
              <p>There are no records matching your filters.</p>
            </div>
          )}
        </div>

        <div className="table-foot">
          {loading
            ? "Loading session records..."
            : error
            ? "Session data unavailable"
            : `Showing ${filteredSessions.length} of ${sessions.length} database records`}
        </div>
      </section>

      <footer>
        Be-Electric · Qatar network / Live charging session records
      </footer>
    </div>
  );
}
