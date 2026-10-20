 "use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownToLine, ArrowRight, Bell, Bolt, CalendarDays,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, ClipboardList,
  Download, Gauge, LayoutDashboard, Map, Menu, MoreHorizontal, Plus, Search,
  Settings, SlidersHorizontal, Users, Wrench, Zap, PlugZap, Radio, Leaf,
  CircleUserRound, X, Wifi, Clock3, CheckCircle2, CircleAlert, Filter, BarChart3, TrendingUp, Receipt, TreePine, CalendarClock, CircleDollarSign, FileText, CarFront,
} from "lucide-react";

type ChargerStatus = "Charging" | "Available" | "Faulted" | "Maintenance" | "Offline";
type Charger = {
  id: string; station: string; state: ChargerStatus; ports: string; firmware: string; heartbeat: string;
};
const chargers: Charger[] = [
  { id: "Q001-CH01", station: "Q001 · Msheireb Central", state: "Charging", ports: "2 / 2", firmware: "4.2.1", heartbeat: "8 sec ago" },
  { id: "Q001-CH02", station: "Q001 · Msheireb Central", state: "Charging", ports: "1 / 2", firmware: "4.2.1", heartbeat: "6 sec ago" },
  { id: "Q001-CH03", station: "Q001 · Msheireb Central", state: "Available", ports: "0 / 2", firmware: "4.2.1", heartbeat: "9 sec ago" },
  { id: "Q001-CH04", station: "Q001 · Msheireb Central", state: "Available", ports: "0 / 2", firmware: "4.2.1", heartbeat: "7 sec ago" },
  { id: "Q002-CH01", station: "Q002 · Lusail Marina", state: "Charging", ports: "2 / 2", firmware: "4.2.1", heartbeat: "5 sec ago" },
  { id: "Q003-CH02", station: "Q003 · West Bay", state: "Faulted", ports: "0 / 2", firmware: "4.1.8", heartbeat: "14 sec ago" },
  { id: "Q005-CH03", station: "Q005 · Al Wakrah Hub", state: "Maintenance", ports: "0 / 2", firmware: "4.1.8", heartbeat: "2 min ago" },
  { id: "Q006-CH04", station: "Q006 · Airport Gateway", state: "Offline", ports: "0 / 2", firmware: "4.1.8", heartbeat: "40 min ago" },
  { id: "Q002-CH02", station: "Q002 · Lusail Marina", state: "Available", ports: "0 / 2", firmware: "4.2.1", heartbeat: "11 sec ago" },
  { id: "Q004-CH01", station: "Q004 · Education City", state: "Available", ports: "0 / 2", firmware: "4.2.1", heartbeat: "12 sec ago" },
  { id: "Q004-CH02", station: "Q004 · Education City", state: "Charging", ports: "1 / 2", firmware: "4.2.1", heartbeat: "5 sec ago" },
  { id: "Q005-CH01", station: "Q005 · Al Wakrah Hub", state: "Available", ports: "0 / 2", firmware: "4.2.1", heartbeat: "8 sec ago" },
];
type Station = {
  id: string | number;
  name: string;
  shortName?: string | null;
  address?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  plugs?: number | null;
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
const navGroups = [
  { label: "OVERVIEW", items: [{ name: "Dashboard", icon: LayoutDashboard }, { name: "Stations", icon: Map }, { name: "Chargers", icon: PlugZap }, { name: "Connectors", icon: Zap }, { name: "Live Monitoring", icon: Activity }, { name: "Map View", icon: Map }] },
  { label: "OPERATIONS", items: [{ name: "Faults & Alerts", icon: AlertTriangle, count: "4" }, { name: "Maintenance", icon: Wrench }, { name: "Charging Sessions", icon: ClipboardList }] },
  { label: "BUSINESS & ANALYTICS", items: [{ name: "Revenue & Transactions", icon: Gauge }, { name: "Environmental Impact", icon: Leaf }, { name: "Reports & Analytics", icon: Activity }] },
  { label: "ADMINISTRATION", items: [{ name: "Users & Roles", icon: Users }, { name: "Settings", icon: Settings }] },
];
const lineA = "0,93 45,96 88,78 130,83 172,65 215,71 258,51 300,55 343,33 386,40 430,18 472,25 516,7 560,15 604,0";
const lineB = "0,87 45,92 88,68 130,76 172,48 215,58 258,32 300,40 343,17 386,25 430,7 472,19 516,0 560,10 604,-4";

function Sparkline({ variant = 0 }: { variant?: number }) {
  return <svg className="sparkline" viewBox="0 0 604 112" preserveAspectRatio="none" aria-label="Illustrative trend chart">
    <path d={`M ${variant % 2 ? lineB : lineA} L 604 112 L 0 112 Z`} className="chart-fill" />
    <polyline points={variant % 2 ? lineB : lineA} className="chart-line" />
  </svg>;
}
function StatusPill({ status }: { status: string }) {
  return <span className={`status-pill ${status.toLowerCase().replaceAll(" ", "-")}`}><i />{status}</span>;
}

export default function Home() {
  const [page, setPage] = useState("Dashboard");
  const [chargerTab, setChargerTab] = useState("All chargers");
  const [query, setQuery] = useState("");
  const [stationFilter, setStationFilter] = useState("All stations");
  const [firmwareFilter, setFirmwareFilter] = useState("All firmware");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState("01–20 Oct 2026");
  const [notice, setNotice] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [stationsLoading, setStationsLoading] = useState(true);
  const [stationsError, setStationsError] = useState("");
  const [databaseChargers, setDatabaseChargers] = useState<DatabaseCharger[]>([]);
  const [chargersLoading, setChargersLoading] = useState(true);
  const [chargersError, setChargersError] = useState("");
  const [databaseConnectors, setDatabaseConnectors] = useState<DatabaseConnector[]>([]);
  const [connectorsLoading, setConnectorsLoading] = useState(true);
  const [connectorsError, setConnectorsError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async <T,>(url: string, setter: (rows: T[]) => void, setLoading: (value: boolean) => void, setError: (value: string) => void) => {
      setLoading(true); setError("");
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error(`The ${url} API returned an unexpected response.`);
        if (!cancelled) setter(data as T[]);
      } catch (error) {
        if (!cancelled) setError(error instanceof Error ? error.message : `Could not load ${url} records.`);
      } finally { if (!cancelled) setLoading(false); }
    };
    void load<DatabaseCharger>("/api/chargers", setDatabaseChargers, setChargersLoading, setChargersError);
    void load<DatabaseConnector>("/api/connectors", setDatabaseConnectors, setConnectorsLoading, setConnectorsError);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadStations = async () => {
      setStationsLoading(true);
      setStationsError("");
      try {
        const response = await fetch("/api/stations", { cache: "no-store" });
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("The stations API returned an unexpected response.");
        if (!cancelled) setStations(data as Station[]);
      } catch (error) {
        if (!cancelled) setStationsError(error instanceof Error ? error.message : "Could not load station records.");
      } finally {
        if (!cancelled) setStationsLoading(false);
      }
    };
    void loadStations();
    return () => { cancelled = true; };
  }, []);

  const filteredChargers = useMemo(() => chargers.filter((charger) => {
    const matchesTab = chargerTab === "All chargers" ||
      (chargerTab === "Online" && charger.state !== "Offline" && charger.state !== "Faulted") ||
      (chargerTab === "Offline" && charger.state === "Offline") ||
      (chargerTab === "Maintenance" && charger.state === "Maintenance");
    const matchesQuery = `${charger.id} ${charger.station} ${charger.state} ${charger.firmware}`.toLowerCase().includes(query.toLowerCase());
    const matchesStation = stationFilter === "All stations" || charger.station.includes(stationFilter);
    const matchesFirmware = firmwareFilter === "All firmware" || charger.firmware === firmwareFilter;
    return matchesTab && matchesQuery && matchesStation && matchesFirmware;
  }), [chargerTab, query, stationFilter, firmwareFilter]);

  const toast = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3200); };
  const exportCsv = () => {
    const rows = [["Charger ID", "Station", "State", "Ports in use", "Firmware", "Last heartbeat"], ...filteredChargers.map(c => [c.id, c.station, c.state, c.ports, c.firmware, c.heartbeat])];
    const csv = rows.map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a"); link.href = url; link.download = "be-electric-chargers.csv"; link.click(); URL.revokeObjectURL(url);
    toast("Charger inventory exported.");
  };

  const renderDashboard = () => <div className="page-content">
    <div className="page-heading">
      <div><h1>Network at a glance</h1><p>A clear view of your charging network, from connection to impact.</p></div>
      <div className="heading-actions">
        <button className="date-button" onClick={() => setDateRange(dateRange === "01–20 Oct 2026" ? "Last 7 days" : "01–20 Oct 2026")}><CalendarDays size={15}/>{dateRange}<ChevronDown size={13}/></button>
        <button className="primary-button" onClick={exportCsv}><Download size={15}/> Export report</button>
      </div>
    </div>
    <div className="network-banner"><div className="banner-icon"><Activity size={20}/></div><div><strong>Your network is moving Qatar forward.</strong><p>22 of 24 chargers online · 12 sessions charging now · 4 connectors need attention</p></div><button className="light-button" onClick={() => setPage("Live Monitoring")}><ArrowRight size={14}/> View live monitoring</button></div>
    <div className="metric-grid">
      <Metric title="Total Stations" value={stationsLoading ? "—" : stationsError ? "—" : String(stations.length)} sub={stationsLoading ? "Loading database records" : stationsError ? "Database unavailable" : "Live station records"}/>
      <Metric title="Total Chargers" value={chargersLoading ? "—" : chargersError ? "—" : String(databaseChargers.length)} sub={chargersLoading ? "Loading database records" : chargersError ? "Database unavailable" : "Live charger records"}/>
      <Metric title="Connectors" value={connectorsLoading ? "—" : connectorsError ? "—" : String(databaseConnectors.length)} sub={connectorsLoading ? "Loading database records" : connectorsError ? "Database unavailable" : "Live connector records"}/>
      <Metric title="Active Sessions" value="12" sub="Live snapshot · 14:32 AST"/>
      <Metric title="Network Uptime" value="99.2%" sub="+0.4 pp vs prior period"/>
      <Metric title="Energy Delivered" value="48,620 kWh" sub="+12.8% vs prior period"/>
      <Metric title="Estimated CO₂ Avoided" value="20.4 t" sub="Estimate · 0.42 kg / kWh"/>
      <Metric title="Charging Revenue" value="QAR 58,344" sub="1,824 completed sessions"/>
    </div>
    <div className="analytics-grid">
      <section className="panel energy-panel"><div className="panel-head"><h3>Energy consumption</h3><span>01–20 Oct</span></div><div className="chart-summary"><strong>48,620</strong><span>kWh</span><small>↗ 12.8% vs prior period</small></div><Sparkline/><div className="chart-axis"><span>01 Oct</span><span>05 Oct</span><span>10 Oct</span><span>15 Oct</span><span>20 Oct</span></div></section>
      <section className="panel health-panel"><div className="panel-head"><h3>Network health</h3><span>Live snapshot</span></div><div className="health-score">99.2% <StatusPill status="Within target"/></div><p className="muted tiny">Availability target ≥ 99.0% · period average</p><Progress label="Available connectors" value="30 of 48" percent={62.5}/><Progress label="Charging connectors" value="12 of 48" percent={25}/><Progress label="Faulted / maintenance" value="6 of 48" percent={12.5}/><p className="muted tiny health-foot"><span className="live-dot"/> Last telemetry received 8 seconds ago</p></section>
    </div>
    <div className="mini-chart-grid">
      <MiniChart title="Charging sessions" value="1,824" sub="completed" variant={1}/>
      <MiniChart title="Charging revenue" value="58,344" sub="QAR" variant={2}/>
      <MiniChart title="Estimated CO₂ avoided" value="20.4" sub="tonnes" variant={3}/>
    </div>
    <div className="two-panel-grid">
      <section className="panel"><div className="panel-head"><h3>Recent faults</h3><button className="text-button" onClick={() => setPage("Faults & Alerts")}>4 open · View all <ArrowRight size={12}/></button></div><div className="fault-row"><span className="severity critical">Critical</span><div><strong>Q003-CH02 · Connector temperature</strong><p>14:18 · Assigned to Omar Khalid</p></div></div><div className="fault-row"><span className="severity warning">Warning</span><div><strong>Q006-CH04 · Communication lost</strong><p>13:52 · Assigned to Sara Ali</p></div></div></section>
      <section className="panel"><div className="panel-head"><h3>Maintenance reminders</h3><span>Next 7 days</span></div><div className="maintenance-row"><span className="date-chip">21 OCT</span><div><strong>Q005 · Cooling system service</strong><p>WO-104 · Sara Ali · 09:00–11:00</p></div></div><div className="maintenance-row"><span className="date-chip">23 OCT</span><div><strong>Q002 · Preventive inspection</strong><p>WO-105 · Omar Khalid · 08:00–10:00</p></div></div></section>
    </div>
    <section className="panel station-performance"><div className="panel-head"><h3>Station performance</h3><button className="text-button" onClick={() => setPage("Stations")}>Month to date · View stations <ArrowRight size={12}/></button></div><StationsTable stations={stations} loading={stationsLoading} error={stationsError} onSelect={(station) => { setPage("Stations"); toast(`${station} selected.`); }}/><div className="table-foot">{stationsLoading ? "Loading station records…" : stationsError ? `Could not load stations: ${stationsError}` : `${stations.length} station records from database`} <span>‹　1　›</span></div></section>
    <footer>Be-Electric · Qatar network / All records are illustrative demo data <span>Snapshot: 20 Oct 2026, 14:32 AST</span></footer>
  </div>;

  const renderChargers = () => <div className="page-content">
    <div className="page-heading"><div><h1>Chargers</h1><p>Hardware inventory, connectivity and firmware across your network.</p></div><div className="heading-actions"><button className="date-button" onClick={() => setDateRange(dateRange === "01–20 Oct 2026" ? "Last 7 days" : "01–20 Oct 2026")}><CalendarDays size={15}/>{dateRange}<ChevronDown size={13}/></button><button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={16}/> Add charger</button></div></div>
    <div className="metric-grid charger-metrics">
      <Metric title="Installed chargers" value={chargersLoading ? "—" : chargersError ? "—" : String(databaseChargers.length)} sub="Live database records"/>
      <Metric title="Available / online" value={chargersLoading ? "—" : chargersError ? "—" : String(databaseChargers.filter(c => /available|online|charging|connected/i.test(c.status || "")).length)} sub="Based on charger status"/>
      <Metric title="Faulted chargers" value={chargersLoading ? "—" : chargersError ? "—" : String(databaseChargers.filter(c => /fault|error|failed/i.test(c.status || "")).length)} sub="Based on charger status"/>
      <Metric title="Total rated power" value={chargersLoading ? "—" : chargersError ? "—" : `${databaseChargers.reduce((sum, c) => sum + (Number(c.max_power_kw) || 0), 0)} kW`} sub="Sum of max_power_kw"/>
    </div>
    <section className="panel inventory-panel">
      <div className="panel-head"><h3>Charger inventory</h3><span>Live data from public.chargers</span></div>
      <div className="tabs">{["All chargers", "Online", "Offline", "Maintenance"].map(tab => <button key={tab} className={chargerTab === tab ? "tab active" : "tab"} onClick={() => setChargerTab(tab)}>{tab}<span>{chargersLoading ? "—" : databaseChargers.filter(c => tab === "All chargers" || (tab === "Online" && /available|online|charging|connected/i.test(c.status || "")) || (tab === "Offline" && /offline|disconnected/i.test(c.status || "")) || (tab === "Maintenance" && /maintenance/i.test(c.status || ""))).length}</span></button>)}</div>
      <div className="toolbar"><label className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search charger ID or serial..."/>{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={14}/></button>}</label><label className="select-wrap"><select value={stationFilter} onChange={e => setStationFilter(e.target.value)}><option>All stations</option>{stations.map(s => <option key={String(s.id)} value={String(s.id)}>{s.name}</option>)}</select><ChevronDown size={13}/></label><label className="select-wrap"><select value={firmwareFilter} onChange={e => setFirmwareFilter(e.target.value)}><option>All firmware</option><option>4.2.1</option><option>4.1.8</option></select><ChevronDown size={13}/></label><div className="toolbar-spacer"/><button className={`outline-button ${showFilters ? "selected" : ""}`} onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={14}/> Filters</button><button className="icon-button" onClick={exportCsv} aria-label="Export charger list"><ArrowDownToLine size={16}/></button></div>
      {showFilters && <div className="filter-note"><Filter size={14}/> Filters apply immediately. Use the station and firmware menus to narrow the inventory. <button onClick={() => { setStationFilter("All stations"); setFirmwareFilter("All firmware"); setQuery(""); setChargerTab("All chargers"); }}>Clear all</button></div>}
      <div className="table-wrap"><table><thead><tr><th>CHARGER ID / NAME</th><th>STATION ID</th><th>MANUFACTURER</th><th>MODEL</th><th>SERIAL NUMBER</th><th>MAX POWER</th><th>STATUS</th><th>PROTOCOL</th></tr></thead><tbody>{databaseChargers.filter(c => { const matchesTab = chargerTab === "All chargers" || (chargerTab === "Online" && /available|online|charging|connected/i.test(c.status || "")) || (chargerTab === "Offline" && /offline|disconnected/i.test(c.status || "")) || (chargerTab === "Maintenance" && /maintenance/i.test(c.status || "")); const text = `${c.id} ${c.name || ""} ${c.station_id || ""} ${c.manufacturer || ""} ${c.model || ""} ${c.serial_number || ""} ${c.status || ""} ${c.protocol || ""}`.toLowerCase(); return matchesTab && text.includes(query.toLowerCase()) && (stationFilter === "All stations" || String(c.station_id || "") === stationFilter || String(c.station_id || "").includes(stationFilter)); }).map(c => <tr key={String(c.id)} className="clickable-row"><td><strong>{c.name || `Charger ${c.id}`}</strong><small className="muted" style={{display:"block"}}>ID: {c.id}</small></td><td>{c.station_id ?? "—"}</td><td>{c.manufacturer || "—"}</td><td>{c.model || "—"}</td><td>{c.serial_number || "—"}</td><td>{c.max_power_kw == null ? "—" : `${c.max_power_kw} kW`}</td><td><StatusPill status={c.status || "Unknown"}/></td><td>{c.protocol || "—"}{c.protocol_identity ? <small className="muted" style={{display:"block"}}>{c.protocol_identity}</small> : null}</td></tr>)}</tbody></table>{chargersLoading && <div className="empty-state">Loading charger records…</div>}{chargersError && <div className="empty-state"><CircleAlert size={22}/><strong>Could not load chargers</strong><p>{chargersError}. Check that /api/chargers is configured.</p></div>}{!chargersLoading && !chargersError && databaseChargers.length === 0 && <div className="empty-state"><PlugZap size={22}/><strong>No charger records found</strong><p>Your database returned no chargers.</p></div>}</div>
      <div className="table-foot">{chargersLoading ? "Loading charger records…" : chargersError ? "Charger data unavailable" : `Showing ${databaseChargers.length} database charger records`}</div>
    </section>
    <div className="bottom-info-grid">
      <section className="panel firmware-panel"><div className="panel-head"><h3>Firmware deployment</h3><span>Current target · 4.2.1</span></div><div className="firmware-row"><div><span>Version 4.2.1</span><strong>21 chargers</strong></div><div className="progress-track"><i style={{width:"87.5%"}}/></div></div><div className="firmware-row"><div><span>Version 4.1.8</span><strong>3 chargers</strong></div><div className="progress-track"><i style={{width:"12.5%"}}/></div></div><div className="info-callout"><CircleHelp size={16}/><div><strong>Next maintenance window</strong><p>Update the remaining 3 chargers after fault clearance. Scheduled 24 Oct, 02:00–04:00 AST.</p></div></div></section>
      <section className="panel hardware-panel"><div className="panel-head"><h3>Hardware profile</h3><span>Standard network configuration</span></div><div className="spec-head"><span>SPECIFICATION</span><span>VALUE</span></div><Spec label="Rated output" value="120 kW DC per charger"/><Spec label="Connector configuration" value="2 × CCS2 · Shared power"/><Spec label="Communication protocol" value="OCPP 1.6J · TLS enabled"/><Spec label="Asset naming" value="Q001-CH01 through Q006-CH04"/><div className="table-foot">All hardware specifications are illustrative <span>‹　1　›</span></div></section>
    </div>
    <footer>Be-Electric · Qatar network / All records are illustrative demo data <span>Snapshot: 20 Oct 2026, 14:32 AST</span></footer>
  </div>;

  const renderConnectors = () => <div className="page-content">
    <div className="page-heading"><div><h1>Connectors</h1><p>Connector inventory loaded from your database.</p></div><div className="heading-actions"><button className="outline-button" onClick={() => window.location.reload()}><Activity size={14}/> Refresh data</button></div></div>
    <div className="metric-grid charger-metrics">
      <Metric title="Total connectors" value={connectorsLoading ? "—" : connectorsError ? "—" : String(databaseConnectors.length)} sub="Live database records"/>
      <Metric title="Rated connector power" value={connectorsLoading ? "—" : connectorsError ? "—" : `${databaseConnectors.reduce((sum, c) => sum + (Number(c.max_power_kw) || 0), 0)} kW`} sub="Sum of max_power_kw"/>
      <Metric title="Available connectors" value={connectorsLoading ? "—" : connectorsError ? "—" : String(databaseConnectors.filter(c => /available|online|ready/i.test(c.status || "")).length)} sub="Based on connector status"/>
      <Metric title="Faulted connectors" value={connectorsLoading ? "—" : connectorsError ? "—" : String(databaseConnectors.filter(c => /fault|error|failed/i.test(c.status || "")).length)} sub="Based on connector status"/>
    </div>
    <section className="panel inventory-panel"><div className="panel-head"><h3>Connector inventory</h3><span>Live data from public.connectors</span></div>
      <div className="table-wrap"><table><thead><tr><th>CONNECTOR ID</th><th>CHARGER ID</th><th>CONNECTOR NUMBER</th><th>TYPE</th><th>MAX POWER</th><th>STATUS</th><th>UPDATED</th></tr></thead><tbody>{databaseConnectors.map(c => <tr key={String(c.id)}><td><strong>{c.id}</strong></td><td>{c.charger_id}</td><td>{c.connector_number ?? "—"}</td><td>{c.connector_type || "—"}</td><td>{c.max_power_kw == null ? "—" : `${c.max_power_kw} kW`}</td><td><StatusPill status={c.status || "Unknown"}/></td><td>{c.updated_at ? new Date(c.updated_at).toLocaleString() : "—"}</td></tr>)}</tbody></table>{connectorsLoading && <div className="empty-state">Loading connector records…</div>}{connectorsError && <div className="empty-state"><CircleAlert size={22}/><strong>Could not load connectors</strong><p>{connectorsError}. Check that /api/connectors is configured.</p></div>}{!connectorsLoading && !connectorsError && databaseConnectors.length === 0 && <div className="empty-state"><Zap size={22}/><strong>No connector records found</strong><p>Your database returned no connectors.</p></div>}</div>
      <div className="table-foot">{connectorsLoading ? "Loading connector records…" : connectorsError ? "Connector data unavailable" : `Showing ${databaseConnectors.length} database connector records`}</div>
    </section><footer>Connector details are read from the database; session telemetry remains separate.</footer>
  </div>;

  const renderGeneric = () => <div className="page-content generic-page"><div className="page-heading"><div><h1>{page}</h1><p>Manage and monitor your Be-Electric charging network.</p></div><button className="primary-button" onClick={() => toast(`${page} action is a demo in this prototype.`)}><Plus size={15}/> Create new</button></div><div className="generic-banner"><div className="banner-icon"><Activity size={20}/></div><div><strong>{page} workspace</strong><p>This section is included in the navigation prototype. The dashboard and charger inventory are implemented with sample data.</p></div></div><div className="generic-cards"><div className="panel"><Activity/><h3>Network status</h3><strong>Operational</strong><p>22 of 24 chargers online</p></div><div className="panel"><AlertTriangle/><h3>Items requiring attention</h3><strong>4 open alerts</strong><p>Review fault and maintenance queues</p></div><div className="panel"><Clock3/><h3>Last update</h3><strong>14:32 AST</strong><p>Illustrative sample telemetry</p></div></div><section className="panel generic-table"><div className="panel-head"><h3>Quick overview</h3><span>Illustrative demo data</span></div><StationsTable stations={stations} loading={stationsLoading} error={stationsError} onSelect={(station) => toast(`${station} selected.`)}/></section><footer>Be-Electric · Qatar network / All records are illustrative demo data <span>Snapshot: 20 Oct 2026, 14:32 AST</span></footer></div>;


  const renderChargingSessions = () => <div className="page-content">
    <div className="page-heading">
      <div><h1>Charging Sessions</h1><p>Track charging activity, session performance and energy delivered across your network.</p></div>
      <div className="heading-actions">
        <button className="date-button" onClick={() => setDateRange(dateRange === "01–20 Oct 2026" ? "Last 7 days" : "01–20 Oct 2026")}><CalendarDays size={15}/>{dateRange}<ChevronDown size={13}/></button>
        <button className="primary-button" onClick={() => toast("Session report exported in this demo.")}><Download size={15}/> Export report</button>
      </div>
    </div>
    <div className="metric-grid">
      <Metric title="Total sessions" value="1,986" sub="+14.2% vs prior period"/>
      <Metric title="Completed sessions" value="1,824" sub="91.8% completion rate"/>
      <Metric title="Energy delivered" value="48,620 kWh" sub="+12.8% vs prior period"/>
      <Metric title="Average session" value="24.6 kWh" sub="38 min average duration"/>
    </div>
    <div className="analytics-grid session-analytics">
      <section className="panel energy-panel">
        <div className="panel-head"><h3>Session activity</h3><span>01–20 Oct 2026</span></div>
        <div className="chart-summary"><strong>1,986</strong><span>sessions</span><small>↗ 14.2% vs prior period</small></div>
        <div className="bar-chart" aria-label="Illustrative daily charging session chart">
          {[42,55,48,67,61,73,58,80,65,72,88,69,77,94,82,73,98,84,90,100].map((h,i)=><i key={i} style={{height:`${h}%`}} title={`${i+1} Oct`}/>)}
        </div>
        <div className="chart-axis"><span>01 Oct</span><span>05 Oct</span><span>10 Oct</span><span>15 Oct</span><span>20 Oct</span></div>
      </section>
      <section className="panel health-panel">
        <div className="panel-head"><h3>Session outcomes</h3><span>Current period</span></div>
        <div className="donut-layout"><div className="donut-chart"><div><strong>91.8%</strong><span>completed</span></div></div><div className="legend-list"><span><i className="legend-dot completed"/>Completed <b>1,824</b></span><span><i className="legend-dot active"/>In progress <b>12</b></span><span><i className="legend-dot interrupted"/>Interrupted <b>150</b></span></div></div>
        <p className="muted tiny">Session totals are illustrative demo data.</p>
      </section>
    </div>
    <div className="mini-chart-grid">
      <MiniChart title="Energy per day" value="2,431" sub="kWh average" variant={1}/>
      <MiniChart title="Average duration" value="38 min" sub="per session" variant={2}/>
      <MiniChart title="Repeat charging" value="64%" sub="returning drivers" variant={3}/>
    </div>
    <div className="two-panel-grid">
      <section className="panel"><div className="panel-head"><h3>Sessions by station</h3><button className="text-button" onClick={() => setPage("Stations")}>View stations <ArrowRight size={12}/></button></div>
        {([{name:"Msheireb Central",value:82,count:"426"},{name:"Lusail Marina",value:72,count:"371"},{name:"West Bay",value:61,count:"314"},{name:"Education City",value:49,count:"253"},{name:"Al Wakrah Hub",value:38,count:"196"}]).map(s=><div className="rank-row" key={s.name}><span>{s.name}</span><div className="progress-track"><i style={{width:`${s.value}%`}}/></div><strong>{s.count}</strong></div>)}
      </section>
      <section className="panel"><div className="panel-head"><h3>Session insights</h3><span>01–20 Oct</span></div>
        <div className="insight-row"><div className="insight-icon"><Clock3 size={16}/></div><div><strong>Peak charging window</strong><p>12:00–15:00 AST · highest session volume</p></div></div>
        <div className="insight-row"><div className="insight-icon"><Zap size={16}/></div><div><strong>Energy per completed session</strong><p>26.7 kWh average across all stations</p></div></div>
        <div className="insight-row"><div className="insight-icon"><TrendingUp size={16}/></div><div><strong>Completion rate</strong><p>Up 2.4 percentage points from prior period</p></div></div>
      </section>
    </div>
    <section className="panel inventory-panel"><div className="panel-head"><h3>Recent charging sessions</h3><span>Latest activity · illustrative records</span></div>
      <div className="table-wrap"><table><thead><tr><th>SESSION ID</th><th>STATION</th><th>START TIME</th><th>DURATION</th><th>ENERGY</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>
        {[
          ["SES-10284","Q001 · Msheireb Central","20 Oct, 14:12","32 min","28.4 kWh","QAR 34.08","Completed"],
          ["SES-10283","Q002 · Lusail Marina","20 Oct, 14:08","41 min","36.2 kWh","QAR 43.44","Charging"],
          ["SES-10282","Q004 · Education City","20 Oct, 13:56","27 min","21.8 kWh","QAR 26.16","Completed"],
          ["SES-10281","Q003 · West Bay","20 Oct, 13:42","18 min","14.6 kWh","QAR 17.52","Interrupted"],
          ["SES-10280","Q001 · Msheireb Central","20 Oct, 13:31","46 min","39.1 kWh","QAR 46.92","Completed"]
        ].map(r=><tr key={r[0]}><td><strong>{r[0]}</strong></td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td>{r[5]}</td><td><StatusPill status={r[6]}/></td></tr>)}
      </tbody></table></div><div className="table-foot">Showing 5 recent sessions <span>‹　1　›</span></div>
    </section>
    <footer>Be-Electric · Qatar network / All records are illustrative demo data <span>Snapshot: 20 Oct 2026, 14:32 AST</span></footer>
  </div>;

  const renderRevenue = () => <div className="page-content">
    <div className="page-heading">
      <div><h1>Revenue &amp; Transactions</h1><p>Monitor charging revenue, payment performance and transaction activity.</p></div>
      <div className="heading-actions">
        <button className="date-button" onClick={() => setDateRange(dateRange === "01–20 Oct 2026" ? "Last 7 days" : "01–20 Oct 2026")}><CalendarDays size={15}/>{dateRange}<ChevronDown size={13}/></button>
        <button className="primary-button" onClick={() => toast("Transaction report exported in this demo.")}><Download size={15}/> Export report</button>
      </div>
    </div>
    <div className="metric-grid">
      <Metric title="Total revenue" value="QAR 58,344" sub="+16.4% vs prior period"/>
      <Metric title="Successful transactions" value="1,824" sub="97.6% payment success"/>
      <Metric title="Average transaction" value="QAR 31.98" sub="Across completed sessions"/>
      <Metric title="Pending settlement" value="QAR 1,248" sub="18 transactions pending"/>
    </div>
    <section className="panel revenue-chart-panel">
      <div className="panel-head"><h3>Revenue over time</h3><span>01–20 Oct 2026 · QAR</span></div>
      <div className="chart-summary"><strong>58,344</strong><span>QAR</span><small>↗ 16.4% vs prior period</small></div>
      <div className="bar-chart revenue-bars" aria-label="Illustrative daily revenue chart">
        {[38,46,43,52,49,58,54,65,57,69,73,61,78,71,84,76,89,82,94,100].map((h,i)=><i key={i} style={{height:`${h}%`}} title={`${i+1} Oct`}/>)}
      </div><div className="chart-axis"><span>01 Oct</span><span>05 Oct</span><span>10 Oct</span><span>15 Oct</span><span>20 Oct</span></div>
    </section>
    <div className="mini-chart-grid revenue-mini-grid">
      <section className="panel mini-chart"><div className="panel-head"><h3>Payment success</h3><span>Current period</span></div><div className="mini-summary"><strong>97.6%</strong><span>success rate</span></div><div className="progress-track wide-progress"><i style={{width:"97.6%"}}/></div><p className="muted tiny">1,824 successful · 45 failed</p></section>
      <section className="panel mini-chart"><div className="panel-head"><h3>Revenue per station</h3><span>Top performer</span></div><div className="mini-summary"><strong>QAR 13,632</strong><span>Msheireb Central</span></div><p className="muted tiny">23.4% of total network revenue</p><div className="progress-track wide-progress"><i style={{width:"78%"}}/></div></section>
      <section className="panel mini-chart"><div className="panel-head"><h3>Refunds &amp; adjustments</h3><span>Current period</span></div><div className="mini-summary"><strong>QAR 486</strong><span>12 adjustments</span></div><p className="muted tiny">0.8% of gross revenue</p><div className="progress-track wide-progress"><i style={{width:"8%"}}/></div></section>
    </div>
    <div className="two-panel-grid">
      <section className="panel"><div className="panel-head"><h3>Revenue by station</h3><button className="text-button" onClick={() => setPage("Stations")}>View stations <ArrowRight size={12}/></button></div>
        {[["Msheireb Central","13,632",92],["Lusail Marina","11,804",80],["West Bay","9,742",66],["Education City","8,246",56],["Al Wakrah Hub","6,118",42]].map(s=><div className="rank-row" key={s[0]}><span>{s[0]}</span><div className="progress-track"><i style={{width:`${s[2]}%`}}/></div><strong>{s[1]}</strong></div>)}
      </section>
      <section className="panel"><div className="panel-head"><h3>Payment methods</h3><span>Successful transactions</span></div>
        <div className="payment-method"><div><span className="payment-symbol"><CircleDollarSign size={16}/></span><span>Credit / debit card</span></div><strong>68%</strong></div><div className="progress-track"><i style={{width:"68%"}}/></div>
        <div className="payment-method"><div><span className="payment-symbol"><Zap size={16}/></span><span>Mobile wallet</span></div><strong>24%</strong></div><div className="progress-track"><i style={{width:"24%"}}/></div>
        <div className="payment-method"><div><span className="payment-symbol"><Receipt size={16}/></span><span>Fleet account</span></div><strong>8%</strong></div><div className="progress-track"><i style={{width:"8%"}}/></div>
      </section>
    </div>
    <section className="panel inventory-panel"><div className="panel-head"><h3>Recent transactions</h3><span>Latest payment activity</span></div>
      <div className="table-wrap"><table><thead><tr><th>TRANSACTION ID</th><th>SESSION ID</th><th>STATION</th><th>DATE &amp; TIME</th><th>PAYMENT METHOD</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>
        {[
          ["TXN-80421","SES-10284","Msheireb Central","20 Oct, 14:44","Visa •••• 2048","QAR 34.08","Paid"],
          ["TXN-80420","SES-10282","Education City","20 Oct, 14:25","Apple Pay","QAR 26.16","Paid"],
          ["TXN-80419","SES-10279","Lusail Marina","20 Oct, 14:02","Visa •••• 1186","QAR 43.44","Pending"],
          ["TXN-80418","SES-10275","West Bay","20 Oct, 13:48","Fleet account","QAR 17.52","Failed"],
          ["TXN-80417","SES-10273","Msheireb Central","20 Oct, 13:30","Mastercard •••• 7741","QAR 46.92","Paid"]
        ].map(r=><tr key={r[0]}><td><strong>{r[0]}</strong></td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td>{r[5]}</td><td><StatusPill status={r[6]}/></td></tr>)}
      </tbody></table></div><div className="table-foot">Showing 5 recent transactions <span>‹　1　›</span></div>
    </section>
    <footer>Be-Electric · Qatar network / All records are illustrative demo data <span>Snapshot: 20 Oct 2026, 14:32 AST</span></footer>
  </div>;

  const renderEnvironmental = () => <div className="page-content">
    <div className="page-heading">
      <div><h1>Environmental Impact</h1><p>Understand the emissions avoided and environmental benefits enabled by your charging network.</p></div>
      <div className="heading-actions">
        <button className="date-button" onClick={() => setDateRange(dateRange === "01–20 Oct 2026" ? "Last 7 days" : "01–20 Oct 2026")}><CalendarDays size={15}/>{dateRange}<ChevronDown size={13}/></button>
        <button className="primary-button" onClick={() => toast("Environmental report exported in this demo.")}><Download size={15}/> Export report</button>
      </div>
    </div>
    <div className="impact-banner"><div className="impact-banner-icon"><TreePine size={23}/></div><div><strong>Cleaner journeys, powered by your network.</strong><p>Impact estimates are based on energy delivered and an illustrative factor of 0.42 kg CO₂ avoided per kWh.</p></div><span className="impact-badge">01–20 OCT 2026</span></div>
    <div className="metric-grid">
      <Metric title="Estimated CO₂ avoided" value="20.4 t" sub="+12.8% vs prior period"/>
      <Metric title="Clean energy delivered" value="48,620 kWh" sub="Across 6 charging stations"/>
      <Metric title="Equivalent trees grown" value="928" sub="Illustrative annual equivalent"/>
      <Metric title="Fossil fuel displaced" value="5,840 L" sub="Estimated equivalent fuel"/>
    </div>
    <div className="analytics-grid impact-analytics">
      <section className="panel energy-panel">
        <div className="panel-head"><h3>CO₂ emissions avoided</h3><span>01–20 Oct 2026</span></div>
        <div className="chart-summary"><strong>20.4</strong><span>tonnes CO₂</span><small>↗ 12.8% vs prior period</small></div>
        <div className="bar-chart impact-bars" aria-label="Illustrative daily carbon savings chart">
          {[32,45,39,54,47,63,57,68,61,74,69,80,73,86,77,91,82,89,94,100].map((h,i)=><i key={i} style={{height:`${h}%`}} title={`${i+1} Oct`}/>)}
        </div><div className="chart-axis"><span>01 Oct</span><span>05 Oct</span><span>10 Oct</span><span>15 Oct</span><span>20 Oct</span></div>
      </section>
      <section className="panel impact-score-panel"><div className="panel-head"><h3>Environmental contribution</h3><span>Current period</span></div>
        <div className="impact-ring"><div><strong>20.4 t</strong><span>CO₂ avoided</span></div></div>
        <p className="muted tiny">Estimated savings from electricity delivered by the network.</p>
        <div className="impact-stat"><span>Average avoided per kWh</span><strong>0.42 kg CO₂</strong></div>
      </section>
    </div>
    <div className="mini-chart-grid">
      <section className="panel mini-chart"><div className="panel-head"><h3>CO₂ avoided per day</h3><span>Daily average</span></div><div className="mini-summary"><strong>1.02 t</strong><span>CO₂</span></div><Sparkline variant={1}/><div className="chart-axis"><span>01 Oct</span><span>05 Oct</span><span>10 Oct</span><span>15 Oct</span><span>20 Oct</span></div></section>
      <section className="panel mini-chart"><div className="panel-head"><h3>Energy delivered</h3><span>Current period</span></div><div className="mini-summary"><strong>48,620</strong><span>kWh</span></div><Sparkline variant={2}/><div className="chart-axis"><span>01 Oct</span><span>05 Oct</span><span>10 Oct</span><span>15 Oct</span><span>20 Oct</span></div></section>
      <section className="panel mini-chart"><div className="panel-head"><h3>Network efficiency</h3><span>Current period</span></div><div className="mini-summary"><strong>99.2%</strong><span>uptime</span></div><p className="muted tiny">Reliable charging infrastructure supporting lower-emission mobility.</p><div className="progress-track wide-progress"><i style={{width:"99.2%"}}/></div></section>
    </div>
    <div className="two-panel-grid">
      <section className="panel"><div className="panel-head"><h3>Environmental impact by station</h3><button className="text-button" onClick={() => setPage("Stations")}>View stations <ArrowRight size={12}/></button></div>
        {[["Msheireb Central","5.24 t",88],["Lusail Marina","4.56 t",77],["West Bay","3.75 t",63],["Education City","3.08 t",52],["Al Wakrah Hub","2.10 t",36]].map(s=><div className="rank-row" key={s[0]}><span>{s[0]}</span><div className="progress-track"><i style={{width:`${s[2]}%`}}/></div><strong>{s[1]}</strong></div>)}
      </section>
      <section className="panel"><div className="panel-head"><h3>What this impact represents</h3><span>Illustrative equivalents</span></div>
        <div className="impact-equivalent"><div className="equivalent-icon"><TreePine size={18}/></div><div><strong>928 trees</strong><p>Equivalent to estimated annual carbon absorption.</p></div></div>
        <div className="impact-equivalent"><div className="equivalent-icon"><CarFront size={18}/></div><div><strong>5,840 litres</strong><p>Estimated petrol equivalent displaced.</p></div></div>
        <div className="impact-equivalent"><div className="equivalent-icon"><Zap size={18}/></div><div><strong>48.6 MWh</strong><p>Electricity delivered to charging vehicles.</p></div></div>
      </section>
    </div>
    <section className="panel methodology-panel"><div className="panel-head"><h3>Calculation methodology</h3><span>Transparency &amp; assumptions</span></div><div className="method-grid"><div><span>ENERGY DELIVERED</span><strong>48,620 kWh</strong></div><div><span>AVOIDED EMISSIONS FACTOR</span><strong>0.42 kg CO₂ / kWh</strong></div><div><span>ESTIMATED CO₂ AVOIDED</span><strong>20.4 tonnes</strong></div></div><p className="muted tiny">Figures are illustrative estimates for this prototype and are not independently verified emissions accounting.</p></section>
    <footer>Be-Electric · Qatar network / All records are illustrative demo data <span>Snapshot: 20 Oct 2026, 14:32 AST</span></footer>
  </div>;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Bolt size={22}/></div><div><b>be-electric</b><small>NETWORK OPERATIONS · QATAR</small></div><button className="close-nav" onClick={() => setMobileNav(false)}><X size={17}/></button></div>
      <nav>{navGroups.map(group => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(item => { const Icon = item.icon; return <button key={item.name} className={`nav-item ${page === item.name ? "active" : ""}`} onClick={() => { setPage(item.name); setMobileNav(false); }}><Icon size={16}/><span>{item.name}</span>{item.count && <em>{item.count}</em>}</button>; })}</div>)}</nav>
      <div className="network-card"><span className="live-dot"/><strong>Qatar network</strong><p>6 stations · Asia/Qatar (UTC+3)</p><small>Demo environment</small></div>
    </aside>
    {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb"><button className="menu-toggle" onClick={() => setMobileNav(true)}><Menu size={19}/></button><span>Workspace</span><span className="crumb-slash">/</span><strong>{page}</strong></div><div className="topbar-right"><span className="demo-tag">Demo data · Illustrative only</span><button className="bell-button" onClick={() => setPage("Faults & Alerts")} aria-label="Notifications"><Bell size={17}/><i/></button><div className="avatar">AM</div><button className="profile-button" onClick={() => setPage("Users & Roles")}><strong>Aisha Mansour</strong><small>Network administrator</small><ChevronDown size={13}/></button></div></header>
      {page === "Dashboard" ? renderDashboard() : page === "Chargers" ? renderChargers() : page === "Connectors" ? renderConnectors() : page === "Charging Sessions" ? renderChargingSessions() : page === "Revenue & Transactions" ? renderRevenue() : page === "Environmental Impact" ? renderEnvironmental() : renderGeneric()}
    </main>
    {notice && <div className="toast"><CheckCircle2 size={17}/>{notice}<button onClick={() => setNotice("")}><X size={14}/></button></div>}
    {showAdd && <div className="modal-backdrop" onClick={() => setShowAdd(false)}><div className="modal" onClick={e => e.stopPropagation()}><div className="modal-head"><div><h2>Add charger</h2><p>Register a charger in the network inventory.</p></div><button className="icon-button" onClick={() => setShowAdd(false)}><X size={18}/></button></div><label>Charger ID<input placeholder="e.g. Q007-CH01"/></label><label>Station<select defaultValue=""><option value="" disabled>Select station</option>{stations.map(s => <option key={String(s.id)}>{s.id} · {s.name}</option>)}</select></label><label>Firmware version<select defaultValue="4.2.1"><option>4.2.1</option><option>4.1.8</option></select></label><div className="modal-actions"><button className="outline-button" onClick={() => setShowAdd(false)}>Cancel</button><button className="primary-button" onClick={() => { setShowAdd(false); toast("Demo only: charger form submitted. No database is connected."); }}>Register charger</button></div><p className="modal-note">Demo prototype — this form does not save to a backend.</p></div></div>}
    {selectedCharger && <div className="modal-backdrop" onClick={() => setSelectedCharger(null)}><div className="modal detail-modal" onClick={e => e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">CHARGER DETAILS</span><h2>{selectedCharger.id}</h2><p>{selectedCharger.station}</p></div><button className="icon-button" onClick={() => setSelectedCharger(null)}><X size={18}/></button></div><div className="detail-status"><StatusPill status={selectedCharger.state}/><span>Last heartbeat: {selectedCharger.heartbeat}</span></div><Spec label="Operating state" value={selectedCharger.state}/><Spec label="Ports in use" value={selectedCharger.ports}/><Spec label="Firmware version" value={selectedCharger.firmware}/><Spec label="Communication" value={selectedCharger.state === "Offline" ? "No recent heartbeat" : "Connected · OCPP 1.6J"}/><div className="modal-actions"><button className="outline-button" onClick={() => { setSelectedCharger(null); setPage("Maintenance"); }}>Maintenance history</button><button className="primary-button" onClick={() => { setSelectedCharger(null); toast("Demo only: command queued locally."); }}>Send command</button></div><p className="modal-note">Sample record only. Live device controls are not connected.</p></div></div>}
  </div>;
}

function Metric({ title, value, sub }: { title: string; value: string; sub: string }) {
  return <section className="metric-card"><span>{title}</span><strong>{value}</strong><small>{sub}</small></section>;
}
function Progress({ label, value, percent }: { label: string; value: string; percent: number }) {
  return <div className="progress-item"><div><span>{label}</span><strong>{value}</strong></div><div className="progress-track"><i style={{width:`${percent}%`}}/></div></div>;
}
function MiniChart({ title, value, sub, variant }: { title: string; value: string; sub: string; variant: number }) {
  return <section className="panel mini-chart"><div className="panel-head"><h3>{title}</h3><span>01–20 Oct</span></div><div className="mini-summary"><strong>{value}</strong><span>{sub}</span><small>↗ 12.8% vs prior period</small></div><Sparkline variant={variant}/><div className="chart-axis"><span>01 Oct</span><span>05 Oct</span><span>10 Oct</span><span>15 Oct</span><span>20 Oct</span></div></section>;
}
function StationsTable({ stations, loading, error, onSelect }: {
  stations: Station[];
  loading: boolean;
  error: string;
  onSelect: (name: string) => void;
}) {
  return <div className="table-wrap"><table><thead><tr><th>STATION / ID</th><th>ADDRESS</th><th>PLUGS</th><th>AVAILABLE</th><th>POWER</th><th>PRICE</th><th>TYPE</th></tr></thead><tbody>{stations.map(s => <tr key={String(s.id)} className="clickable-row" onClick={() => onSelect(`${s.id} · ${s.name}`)}><td><strong>{s.id} · {s.name}</strong>{s.shortName && <small className="muted" style={{display:"block"}}>{s.shortName}</small>}</td><td>{s.address || "—"}</td><td>{s.plugs ?? "—"}</td><td>{s.available ?? "—"}</td><td>{s.power == null ? "—" : `${s.power} kW`}</td><td>{s.price == null ? "—" : String(s.price)}</td><td>{s.kind || "—"}</td></tr>)}</tbody></table>{!loading && !error && stations.length === 0 && <div className="empty-state"><Map size={22}/><strong>No station records found</strong><p>Your database returned no stations.</p></div>}{loading && <div className="empty-state">Loading station records…</div>}{error && <div className="empty-state"><CircleAlert size={22}/><strong>Could not load stations</strong><p>{error}. Check that /api/stations is configured.</p></div>}</div>;
}
function Spec({ label, value }: { label: string; value: string }) {
  return <div className="spec-row"><strong>{label}</strong><span>{value}</span></div>;
}
