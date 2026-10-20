 "use client";

import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownToLine, ArrowRight, Bell, Bolt, CalendarDays,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, ClipboardList,
  Download, Gauge, LayoutDashboard, Map, Menu, MoreHorizontal, Plus, Search,
  Settings, SlidersHorizontal, Users, Wrench, Zap, PlugZap, Radio, Leaf,
  CircleUserRound, X, Wifi, Clock3, CheckCircle2, CircleAlert, Filter,
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
const stations = [
  { id: "Q001", name: "Msheireb Central", municipality: "Doha", chargers: "4 chargers", available: "5 / 8", energy: "12,480 kWh", status: "Operational" },
  { id: "Q002", name: "Lusail Marina", municipality: "Lusail", chargers: "4 chargers", available: "5 / 8", energy: "10,860 kWh", status: "Operational" },
  { id: "Q003", name: "West Bay", municipality: "Doha", chargers: "4 chargers", available: "4 / 8", energy: "8,940 kWh", status: "Degraded" },
  { id: "Q004", name: "Education City", municipality: "Al Rayyan", chargers: "4 chargers", available: "6 / 8", energy: "7,260 kWh", status: "Operational" },
  { id: "Q005", name: "Al Wakrah Hub", municipality: "Al Wakrah", chargers: "4 chargers", available: "5 / 8", energy: "4,980 kWh", status: "Maintenance" },
  { id: "Q006", name: "Airport Gateway", municipality: "Doha", chargers: "4 chargers", available: "5 / 8", energy: "4,100 kWh", status: "Degraded" },
];
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
      <Metric title="Total Stations" value="6" sub="Across 4 municipalities"/>
      <Metric title="Total Chargers" value="24" sub="22 online · 2 unavailable"/>
      <Metric title="Available Connectors" value="30 / 48" sub="12 charging · 6 unavailable"/>
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
    <section className="panel station-performance"><div className="panel-head"><h3>Station performance</h3><button className="text-button" onClick={() => setPage("Stations")}>Month to date · View stations <ArrowRight size={12}/></button></div><StationsTable onSelect={(station) => { setPage("Stations"); toast(`${station} selected.`); }}/><div className="table-foot">6 illustrative stations · 24 chargers · 48 connectors <span>‹　1　›</span></div></section>
    <footer>Be-Electric · Qatar network / All records are illustrative demo data <span>Snapshot: 20 Oct 2026, 14:32 AST</span></footer>
  </div>;

  const renderChargers = () => <div className="page-content">
    <div className="page-heading"><div><h1>Chargers</h1><p>Hardware inventory, connectivity and firmware across your network.</p></div><div className="heading-actions"><button className="date-button" onClick={() => setDateRange(dateRange === "01–20 Oct 2026" ? "Last 7 days" : "01–20 Oct 2026")}><CalendarDays size={15}/>{dateRange}<ChevronDown size={13}/></button><button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={16}/> Add charger</button></div></div>
    <div className="metric-grid charger-metrics">
      <Metric title="Installed chargers" value="24" sub="4 chargers at each station"/>
      <Metric title="Online chargers" value="22 / 24" sub="91.7% currently connected"/>
      <Metric title="Faulted chargers" value="1" sub="Q003-CH02 · 2 connectors"/>
      <Metric title="Firmware compliance" value="87.5%" sub="21 of 24 on version 4.2.1"/>
    </div>
    <section className="panel inventory-panel">
      <div className="panel-head"><h3>Charger inventory</h3><span>120 kW DC · Dual CCS2</span></div>
      <div className="tabs">{["All chargers", "Online", "Offline", "Maintenance"].map(tab => <button key={tab} className={chargerTab === tab ? "tab active" : "tab"} onClick={() => setChargerTab(tab)}>{tab}<span>{tab === "All chargers" ? "24" : tab === "Online" ? "22" : tab === "Offline" ? "1" : "1"}</span></button>)}</div>
      <div className="toolbar"><label className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search charger ID or serial..."/>{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={14}/></button>}</label><label className="select-wrap"><select value={stationFilter} onChange={e => setStationFilter(e.target.value)}><option>All stations</option><option>Msheireb Central</option><option>Lusail Marina</option><option>West Bay</option><option>Education City</option><option>Al Wakrah Hub</option><option>Airport Gateway</option></select><ChevronDown size={13}/></label><label className="select-wrap"><select value={firmwareFilter} onChange={e => setFirmwareFilter(e.target.value)}><option>All firmware</option><option>4.2.1</option><option>4.1.8</option></select><ChevronDown size={13}/></label><div className="toolbar-spacer"/><button className={`outline-button ${showFilters ? "selected" : ""}`} onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={14}/> Filters</button><button className="icon-button" onClick={exportCsv} aria-label="Export charger list"><ArrowDownToLine size={16}/></button></div>
      {showFilters && <div className="filter-note"><Filter size={14}/> Filters apply immediately. Use the station and firmware menus to narrow the inventory. <button onClick={() => { setStationFilter("All stations"); setFirmwareFilter("All firmware"); setQuery(""); setChargerTab("All chargers"); }}>Clear all</button></div>}
      <div className="table-wrap"><table><thead><tr><th>CHARGER ID</th><th>STATION</th><th>OPERATING STATE</th><th>PORTS IN USE</th><th>FIRMWARE</th><th>LAST HEARTBEAT</th><th></th></tr></thead><tbody>{filteredChargers.map(c => <tr key={c.id} onClick={() => setSelectedCharger(c)} className="clickable-row"><td><strong>{c.id}</strong></td><td>{c.station}</td><td><StatusPill status={c.state}/></td><td>{c.ports}</td><td>{c.firmware}</td><td>{c.heartbeat}</td><td><button className="row-more" aria-label={`Details for ${c.id}`} onClick={e => { e.stopPropagation(); setSelectedCharger(c); }}><MoreHorizontal size={17}/></button></td></tr>)}</tbody></table>{filteredChargers.length === 0 && <div className="empty-state"><Search size={22}/><strong>No chargers match your filters</strong><p>Try another search term or clear your filters.</p></div>}</div>
      <div className="table-foot">Showing {filteredChargers.length} of 24 chargers · 6 stations <span>‹　1　›</span></div>
    </section>
    <div className="bottom-info-grid">
      <section className="panel firmware-panel"><div className="panel-head"><h3>Firmware deployment</h3><span>Current target · 4.2.1</span></div><div className="firmware-row"><div><span>Version 4.2.1</span><strong>21 chargers</strong></div><div className="progress-track"><i style={{width:"87.5%"}}/></div></div><div className="firmware-row"><div><span>Version 4.1.8</span><strong>3 chargers</strong></div><div className="progress-track"><i style={{width:"12.5%"}}/></div></div><div className="info-callout"><CircleHelp size={16}/><div><strong>Next maintenance window</strong><p>Update the remaining 3 chargers after fault clearance. Scheduled 24 Oct, 02:00–04:00 AST.</p></div></div></section>
      <section className="panel hardware-panel"><div className="panel-head"><h3>Hardware profile</h3><span>Standard network configuration</span></div><div className="spec-head"><span>SPECIFICATION</span><span>VALUE</span></div><Spec label="Rated output" value="120 kW DC per charger"/><Spec label="Connector configuration" value="2 × CCS2 · Shared power"/><Spec label="Communication protocol" value="OCPP 1.6J · TLS enabled"/><Spec label="Asset naming" value="Q001-CH01 through Q006-CH04"/><div className="table-foot">All hardware specifications are illustrative <span>‹　1　›</span></div></section>
    </div>
    <footer>Be-Electric · Qatar network / All records are illustrative demo data <span>Snapshot: 20 Oct 2026, 14:32 AST</span></footer>
  </div>;

  const renderGeneric = () => <div className="page-content generic-page"><div className="page-heading"><div><h1>{page}</h1><p>Manage and monitor your Be-Electric charging network.</p></div><button className="primary-button" onClick={() => toast(`${page} action is a demo in this prototype.`)}><Plus size={15}/> Create new</button></div><div className="generic-banner"><div className="banner-icon"><Activity size={20}/></div><div><strong>{page} workspace</strong><p>This section is included in the navigation prototype. The dashboard and charger inventory are implemented with sample data.</p></div></div><div className="generic-cards"><div className="panel"><Activity/><h3>Network status</h3><strong>Operational</strong><p>22 of 24 chargers online</p></div><div className="panel"><AlertTriangle/><h3>Items requiring attention</h3><strong>4 open alerts</strong><p>Review fault and maintenance queues</p></div><div className="panel"><Clock3/><h3>Last update</h3><strong>14:32 AST</strong><p>Illustrative sample telemetry</p></div></div><section className="panel generic-table"><div className="panel-head"><h3>Quick overview</h3><span>Illustrative demo data</span></div><StationsTable onSelect={(station) => toast(`${station} selected.`)}/></section><footer>Be-Electric · Qatar network / All records are illustrative demo data <span>Snapshot: 20 Oct 2026, 14:32 AST</span></footer></div>;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Bolt size={22}/></div><div><b>be-electric</b><small>NETWORK OPERATIONS · QATAR</small></div><button className="close-nav" onClick={() => setMobileNav(false)}><X size={17}/></button></div>
      <nav>{navGroups.map(group => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(item => { const Icon = item.icon; return <button key={item.name} className={`nav-item ${page === item.name ? "active" : ""}`} onClick={() => { setPage(item.name); setMobileNav(false); }}><Icon size={16}/><span>{item.name}</span>{item.count && <em>{item.count}</em>}</button>; })}</div>)}</nav>
      <div className="network-card"><span className="live-dot"/><strong>Qatar network</strong><p>6 stations · Asia/Qatar (UTC+3)</p><small>Demo environment</small></div>
    </aside>
    {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb"><button className="menu-toggle" onClick={() => setMobileNav(true)}><Menu size={19}/></button><span>Workspace</span><span className="crumb-slash">/</span><strong>{page}</strong></div><div className="topbar-right"><span className="demo-tag">Demo data · Illustrative only</span><button className="bell-button" onClick={() => setPage("Faults & Alerts")} aria-label="Notifications"><Bell size={17}/><i/></button><div className="avatar">AM</div><button className="profile-button" onClick={() => setPage("Users & Roles")}><strong>Aisha Mansour</strong><small>Network administrator</small><ChevronDown size={13}/></button></div></header>
      {page === "Dashboard" ? renderDashboard() : page === "Chargers" ? renderChargers() : renderGeneric()}
    </main>
    {notice && <div className="toast"><CheckCircle2 size={17}/>{notice}<button onClick={() => setNotice("")}><X size={14}/></button></div>}
    {showAdd && <div className="modal-backdrop" onClick={() => setShowAdd(false)}><div className="modal" onClick={e => e.stopPropagation()}><div className="modal-head"><div><h2>Add charger</h2><p>Register a charger in the network inventory.</p></div><button className="icon-button" onClick={() => setShowAdd(false)}><X size={18}/></button></div><label>Charger ID<input placeholder="e.g. Q007-CH01"/></label><label>Station<select defaultValue=""><option value="" disabled>Select station</option>{stations.map(s => <option key={s.id}>{s.id} · {s.name}</option>)}</select></label><label>Firmware version<select defaultValue="4.2.1"><option>4.2.1</option><option>4.1.8</option></select></label><div className="modal-actions"><button className="outline-button" onClick={() => setShowAdd(false)}>Cancel</button><button className="primary-button" onClick={() => { setShowAdd(false); toast("Demo only: charger form submitted. No database is connected."); }}>Register charger</button></div><p className="modal-note">Demo prototype — this form does not save to a backend.</p></div></div>}
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
function StationsTable({ onSelect }: { onSelect: (name: string) => void }) {
  return <div className="table-wrap"><table><thead><tr><th>STATION / ID</th><th>MUNICIPALITY</th><th>CHARGERS</th><th>AVAILABLE / TOTAL</th><th>ENERGY DELIVERED</th><th>STATUS</th></tr></thead><tbody>{stations.map(s => <tr key={s.id} className="clickable-row" onClick={() => onSelect(`${s.id} · ${s.name}`)}><td><strong>{s.id} · {s.name}</strong></td><td>{s.municipality}</td><td>{s.chargers}</td><td>{s.available}</td><td>{s.energy}</td><td><span className={`station-state ${s.status.toLowerCase()}`}>{s.status}</span></td></tr>)}</tbody></table></div>;
}
function Spec({ label, value }: { label: string; value: string }) {
  return <div className="spec-row"><strong>{label}</strong><span>{value}</span></div>;
}
