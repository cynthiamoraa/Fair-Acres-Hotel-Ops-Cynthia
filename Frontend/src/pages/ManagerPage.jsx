import {
  AlertTriangle, BedDouble, CalendarDays, CheckCircle2, ChevronDown,
  ClipboardList, LayoutDashboard, MessageSquare, MoreHorizontal, Plus,
  QrCode, Search, Star, UserCog, Users, Wrench, X, Edit2, Trash2,
  Filter, SortAsc, Clock, UserCheck, ClipboardCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AddRoomModal from "../components/AddRoomModal";
import EditRoomModal from "../components/EditRoomModal";
import Badge from "../components/Badge";
import QRModal from "../components/QRModal";
import OverdueBadge, { COMPLAINT_SLA_MS, TASK_SLA_MS, isOverdue } from "../components/OverdueBadge";
import { API_BASE_URL, patchJson, postJson, deleteReq } from "../services/api";

const roomPalette = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  occupied: "border-sky-200 bg-sky-50 text-sky-700",
  maintenance: "border-rose-200 bg-rose-50 text-rose-700",
};
const statusCycle = {
  available: "occupied",
  occupied: "maintenance",
  maintenance: "available",
};
const DATE_OPTIONS = ["Today", "Yesterday", "Last 7 days", "Last 30 days"];
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "rooms", label: "Rooms", icon: BedDouble },
  { id: "workers", label: "Workers & Tasks", icon: Users },
  { id: "complaints", label: "Complaints", icon: AlertTriangle },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
];

export default function ManagerPage({
  stats,
  rooms,
  workers,
  issues,
  reviews,
  tasks,
  newTask,
  onNewTaskChange,
  onCreateTask,
  onRoomsChange,
}) {
  const [tab, setTab] = useState("overview");
  const [showQR, setShowQR] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [search, setSearch] = useState("");
  const [openCardMenu, setOpenCardMenu] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState("Today");
  const [updatingRoom, setUpdatingRoom] = useState(null);
  const [resolvingIssue, setResolvingIssue] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("code");
  const [viewMode, setViewMode] = useState("grid");
  const dateRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dateRef.current && !dateRef.current.contains(e.target))
        setShowDatePicker(false);
      if (!e.target.closest("[data-card-menu]")) setOpenCardMenu(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const safeStats = {
    roomsTotal: stats?.roomsTotal ?? rooms.length,
    available:
      stats?.available ?? rooms.filter((r) => r.status === "available").length,
    occupied:
      stats?.occupied ?? rooms.filter((r) => r.status === "occupied").length,
    maintenance:
      stats?.maintenance ??
      rooms.filter((r) => r.status === "maintenance").length,
    pendingTasks: stats?.pendingTasks ?? 0,
    completedTasks: stats?.completedTasks ?? 0,
    issuesOpen:
      stats?.issuesOpen ?? issues.filter((i) => i.status === "open").length,
  };

  const statCards = [
    {
      label: "Total Rooms",
      value: safeStats.roomsTotal,
      helper: "Across all floors",
      icon: BedDouble,
      color: "bg-[#111827] text-white",
    },
    {
      label: "Available",
      value: safeStats.available,
      helper: "Ready for guests",
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "In Service",
      value: safeStats.pendingTasks,
      helper: "Pending tasks",
      icon: Wrench,
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "Open Issues",
      value: safeStats.issuesOpen,
      helper: "Guest reports",
      icon: AlertTriangle,
      color: "bg-rose-100 text-rose-700",
    },
  ];

  const roomBreakdown = [
    { label: "Available", value: safeStats.available, color: "bg-emerald-500" },
    { label: "Occupied", value: safeStats.occupied, color: "bg-sky-500" },
    {
      label: "Maintenance",
      value: safeStats.maintenance,
      color: "bg-rose-500",
    },
  ];

  const filteredRooms = rooms
    .filter((r, idx, arr) => arr.findIndex((x) => x.id === r.id) === idx)
    .filter(
      (r) =>
        r.code.toLowerCase().includes(search.toLowerCase()) ||
        r.status.toLowerCase().includes(search.toLowerCase()) ||
        String(r.floor).includes(search)
    )
    .filter((r) => statusFilter === "all" || r.status === statusFilter)
    .filter((r) => floorFilter === "all" || String(r.floor) === floorFilter)
    .filter((r) => typeFilter === "all" || r.type === typeFilter)
    .sort((a, b) => {
      if (sortBy === "code") return a.code.localeCompare(b.code);
      if (sortBy === "floor") return a.floor - b.floor;
      if (sortBy === "status") return a.status.localeCompare(b.status);
      if (sortBy === "type") return (a.type || "").localeCompare(b.type || "");
      return 0;
    });

  const uniqueFloors = [...new Set(rooms.map((r) => r.floor))].sort((a, b) => a - b);
  const uniqueTypes = [...new Set(rooms.map((r) => r.type).filter(Boolean))];

  async function deleteRoom(id) {
    if (!confirm("Are you sure you want to delete this room?")) return;
    await deleteReq(`/rooms/${id}`);
    onRoomsChange();
  }

  async function cycleRoomStatus(room) {
    setUpdatingRoom(room.id);
    await patchJson(`/rooms/${room.id}/status`, {
      status: statusCycle[room.status] || "available",
    });
    onRoomsChange();
    setUpdatingRoom(null);
  }

  async function resolveIssue(id) {
    setResolvingIssue(id);
    await patchJson(`/issues/${id}/resolve`, {});
    onRoomsChange();
    setResolvingIssue(null);
  }

  const workerTaskMap = workers.reduce((acc, w) => {
    acc[w.id] = tasks.filter((t) => t.workerId === w.id);
    return acc;
  }, {});

  const focusedWorkerTasks = selectedWorker
    ? workerTaskMap[selectedWorker] || []
    : [];

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      {/* ── Header ── */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Welcome back, Manager
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Admin Dashboard
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-slate-400 sm:w-72"
              placeholder="Search room or status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}
          </label>
          <div className="relative" ref={dateRef}>
            <button
              onClick={() => setShowDatePicker((v) => !v)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <CalendarDays size={17} /> {selectedDate}{" "}
              <ChevronDown size={16} />
            </button>
            {showDatePicker && (
              <div className="absolute right-0 top-12 z-20 w-44 rounded-2xl border border-slate-200 bg-white shadow-lg py-1">
                {DATE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedDate(opt);
                      setShowDatePicker(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 ${
                      selectedDate === opt
                        ? "font-semibold text-slate-950"
                        : "text-slate-600"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowQR(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <QrCode size={17} /> Guest QR
          </button>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="flex flex-wrap gap-1 bg-white border border-slate-200 rounded-2xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition
              ${
                tab === id
                  ? "bg-[#BE185D] text-white shadow"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`grid h-11 w-11 place-items-center rounded-xl ${card.color}`}
                    >
                      <Icon size={20} />
                    </div>
                    <div data-card-menu>
                      <button
                        onClick={() =>
                          setOpenCardMenu(openCardMenu === i ? null : i)
                        }
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      {openCardMenu === i && (
                        <div className="absolute right-4 top-14 z-20 w-36 rounded-2xl border border-slate-200 bg-white shadow-lg py-1">
                          <button className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                            View details
                          </button>
                          <button className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                            Export data
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="mt-5 text-3xl font-bold text-slate-950">
                    {card.value}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-700">
                      {card.label}
                    </p>
                    <p className="text-xs text-slate-500">{card.helper}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Open Issues</h3>
                  <p className="text-sm text-slate-500">Guest complaints requiring attention</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {issues.filter((i) => i.status === "open").length === 0 && (
                  <p className="text-sm text-slate-500">No open issues.</p>
                )}
                {issues.filter((i) => i.status === "open").map((issue) => (
                  <div key={issue.id} className={`rounded-2xl border p-4 ${
                    isOverdue(issue.createdAt, COMPLAINT_SLA_MS)
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 bg-white"
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-950">{issue.location}</p>
                          {issue.ticketNo && (
                            <span className="rounded-full bg-pink-100 text-[#BE185D] border border-pink-200 px-2.5 py-0.5 text-xs font-bold tracking-widest">
                              {issue.ticketNo}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{issue.description || "No description"}</p>
                        <div className="mt-2">
                          <OverdueBadge isoDate={issue.createdAt} slaMs={COMPLAINT_SLA_MS} />
                        </div>
                      </div>
                      {issue.imageUrl && (
                        <a href={`${API_BASE_URL}${issue.imageUrl}`} target="_blank" rel="noreferrer">
                          <img src={`${API_BASE_URL}${issue.imageUrl}`} alt="complaint"
                            className="h-16 w-16 rounded-xl object-cover border border-slate-200 shrink-0" />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => resolveIssue(issue.id)}
                      disabled={resolvingIssue === issue.id}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} /> Mark Resolved
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-[#BE185D] p-5 text-white shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">Room Status</h3>
                  <p className="text-sm text-slate-400">
                    Current occupancy mix
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-5">
                {roomBreakdown.map((item) => {
                  const percent = safeStats.roomsTotal
                    ? Math.round((item.value / safeStats.roomsTotal) * 100)
                    : 0;
                  return (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="font-semibold">
                          {item.value} rooms
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-7 rounded-2xl bg-white/[0.06] p-4">
                <p className="text-sm font-semibold">Completed tasks</p>
                <p className="mt-2 text-3xl font-bold">
                  {safeStats.completedTasks}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Finished by the housekeeping team
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ROOMS TAB ── */}
      {tab === "rooms" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-950">All Rooms</h3>
              <p className="text-sm text-slate-500">{filteredRooms.length} room{filteredRooms.length !== 1 ? "s" : ""} found</p>
            </div>
            <button
              onClick={() => setShowAddRoom(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#BE185D] px-4 text-sm font-semibold text-white hover:bg-[#9F1239]"
            >
              <Plus size={17} /> Add Room
            </button>
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select
                className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <select
              className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
            >
              <option value="all">All Floors</option>
              {uniqueFloors.map((f) => <option key={f} value={f}>Floor {f}</option>)}
            </select>

            {uniqueTypes.length > 0 && (
              <select
                className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                {uniqueTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            )}

            <div className="flex items-center gap-2">
              <SortAsc size={16} className="text-slate-400" />
              <select
                className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="code">Sort by Code</option>
                <option value="floor">Sort by Floor</option>
                <option value="status">Sort by Status</option>
                <option value="type">Sort by Type</option>
              </select>
            </div>

            <div className="flex gap-1 ml-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={`h-9 px-3 rounded-lg text-sm font-semibold transition ${
                  viewMode === "grid" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`h-9 px-3 rounded-lg text-sm font-semibold transition ${
                  viewMode === "list" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                List
              </button>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredRooms.map((room) => {
                const roomTasks = tasks.filter((t) => t.roomCode === room.code && t.status === "pending");
                return (
                  <div key={room.id} className={`rounded-2xl border p-4 shadow-sm ${roomPalette[room.status]}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <BedDouble size={20} />
                        <div>
                          <p className="text-xl font-bold">{room.code}</p>
                          <p className="text-xs mt-0.5">Floor {room.floor}</p>
                        </div>
                      </div>
                      <Badge value={room.status} />
                    </div>

                    {room.type && (
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <span className="font-semibold">{room.type}</span>
                        {room.beds && <span>• {room.beds} bed{room.beds !== 1 ? "s" : ""}</span>}
                      </div>
                    )}

                    {room.notes && (
                      <p className="mt-2 text-xs italic opacity-75 line-clamp-2">{room.notes}</p>
                    )}

                    {roomTasks.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs">
                        <ClipboardCheck size={14} />
                        <span className="font-semibold">{roomTasks.length} pending task{roomTasks.length !== 1 ? "s" : ""}</span>
                      </div>
                    )}

                    {room.lastCleaned && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs opacity-75">
                        <Clock size={12} />
                        <span>Cleaned {new Date(room.lastCleaned).toLocaleDateString()}</span>
                      </div>
                    )}

                    {room.currentGuest && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs">
                        <UserCheck size={12} />
                        <span className="font-semibold">{room.currentGuest}</span>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => cycleRoomStatus(room)}
                        disabled={updatingRoom === room.id}
                        className="flex-1 rounded-xl bg-white/50 hover:bg-white/80 px-3 py-2 text-xs font-semibold transition disabled:opacity-50"
                      >
                        {updatingRoom === room.id ? "Updating..." : "Change Status"}
                      </button>
                      <button
                        onClick={() => setEditingRoom(room)}
                        className="rounded-xl bg-white/50 hover:bg-white/80 p-2 transition"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteRoom(room.id)}
                        className="rounded-xl bg-rose-500/20 hover:bg-rose-500/30 p-2 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="space-y-2">
              {filteredRooms.map((room) => {
                const roomTasks = tasks.filter((t) => t.roomCode === room.code && t.status === "pending");
                return (
                  <div key={room.id} className={`rounded-2xl border p-4 shadow-sm ${roomPalette[room.status]}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <BedDouble size={24} />
                        <div>
                          <p className="text-lg font-bold">{room.code}</p>
                          <div className="flex items-center gap-3 text-xs mt-1">
                            <span>Floor {room.floor}</span>
                            {room.type && <span>• {room.type}</span>}
                            {room.beds && <span>• {room.beds} bed{room.beds !== 1 ? "s" : ""}</span>}
                            {roomTasks.length > 0 && <span>• {roomTasks.length} pending task{roomTasks.length !== 1 ? "s" : ""}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {room.currentGuest && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <UserCheck size={14} />
                            <span className="font-semibold">{room.currentGuest}</span>
                          </div>
                        )}
                        <Badge value={room.status} />
                        <div className="flex gap-2">
                          <button
                            onClick={() => cycleRoomStatus(room)}
                            disabled={updatingRoom === room.id}
                            className="rounded-xl bg-white/50 hover:bg-white/80 px-4 py-2 text-xs font-semibold transition disabled:opacity-50"
                          >
                            {updatingRoom === room.id ? "Updating..." : "Change Status"}
                          </button>
                          <button
                            onClick={() => setEditingRoom(room)}
                            className="rounded-xl bg-white/50 hover:bg-white/80 p-2 transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteRoom(room.id)}
                            className="rounded-xl bg-rose-500/20 hover:bg-rose-500/30 p-2 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    {room.notes && (
                      <p className="mt-3 text-sm italic opacity-75">{room.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── WORKERS & TASKS TAB ── */}
      {tab === "workers" && (
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 px-1 mb-3">
              Team Members
            </p>
            {workers.length === 0 && (
              <p className="text-sm text-slate-500">
                No workers yet. Add them in Settings.
              </p>
            )}
            {workers.map((w) => {
              const wTasks = workerTaskMap[w.id] || [];
              const done = wTasks.filter(
                (t) => t.status === "completed"
              ).length;
              const pending = wTasks.filter(
                (t) => t.status === "pending"
              ).length;
              return (
                <button
                  key={w.id}
                  onClick={() =>
                    setSelectedWorker(selectedWorker === w.id ? null : w.id)
                  }
                  className={`w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition
                    ${
                      selectedWorker === w.id
                        ? "border-[#F7B955] bg-amber-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                    {w.name.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">
                      {w.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {done} done · {pending} pending
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            {!selectedWorker ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 gap-2">
                <Users size={36} />
                <p className="text-sm">Select a worker to view their tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-bold text-slate-950 text-lg">
                  {workers.find((w) => w.id === selectedWorker)?.name}'s Tasks
                </p>
                {focusedWorkerTasks.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No tasks assigned yet.
                  </p>
                )}
                {focusedWorkerTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-2xl border bg-white p-4 shadow-sm ${
                      task.status === "pending" &&
                      isOverdue(task.assignedAt || task.createdAt, TASK_SLA_MS)
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {task.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {task.roomCode}
                        </p>
                        {task.notes && (
                          <p className="text-xs text-slate-400 mt-1">
                            {task.notes}
                          </p>
                        )}
                      </div>
                      <Badge value={task.status} />
                    </div>
                    {task.status === "pending" && (
                      <div className="mt-2">
                        <OverdueBadge
                          isoDate={task.assignedAt || task.createdAt}
                          slaMs={TASK_SLA_MS}
                        />
                      </div>
                    )}
                    {task.status === "completed" && (
                      <div className="mt-3 flex items-center gap-3">
                        <p className="text-xs text-slate-400">
                          Completed{" "}
                          {new Date(task.completedAt).toLocaleString()}
                        </p>
                        {task.proofImageUrl && (
                          <a
                            href={`${API_BASE_URL}${task.proofImageUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-sky-600 hover:underline"
                          >
                            View proof photo
                          </a>
                        )}
                      </div>
                    )}
                    {task.status === "pending" && (
                      <p className="mt-2 text-xs text-slate-400">
                        Assigned {new Date(task.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── COMPLAINTS TAB ── */}
      {tab === "complaints" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex gap-2 text-sm">
              <span className="rounded-full bg-rose-100 text-rose-700 px-3 py-1 font-semibold">
                {issues.filter((i) => i.status === "open").length} open
              </span>
              <span className="rounded-full bg-slate-100 text-slate-600 px-3 py-1 font-semibold">
                {issues.filter((i) => i.status === "resolved").length} resolved
              </span>
            </div>
          </div>

          {issues.length === 0 && (
            <p className="text-sm text-slate-500">
              No complaints submitted yet.
            </p>
          )}

          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-950">
                        {issue.location}
                      </p>
                      {issue.ticketNo && (
                        <span className="rounded-full bg-pink-100 text-[#BE185D] border border-pink-200 px-2.5 py-0.5 text-xs font-bold tracking-widest">
                          {issue.ticketNo}
                        </span>
                      )}
                      <Badge value={issue.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {issue.description || "No description provided."}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(issue.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {issue.imageUrl && (
                    <a
                      href={`${API_BASE_URL}${issue.imageUrl}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={`${API_BASE_URL}${issue.imageUrl}`}
                        alt="complaint"
                        className="h-16 w-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    </a>
                  )}
                </div>
                {issue.status === "open" && (
                  <button
                    onClick={() => resolveIssue(issue.id)}
                    disabled={resolvingIssue === issue.id}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <CheckCircle2 size={15} /> Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── REVIEWS TAB ── */}
      {tab === "reviews" && (
        <div className="space-y-4">
          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => {
                  const avg =
                    reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
                  return (
                    <Star
                      key={n}
                      size={18}
                      className={
                        n <= Math.round(avg)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }
                    />
                  );
                })}
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {(
                  reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
                ).toFixed(1)}{" "}
                average · {reviews.length} review
                {reviews.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {reviews.length === 0 && (
            <p className="text-sm text-slate-500">No reviews submitted yet.</p>
          )}

          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                        {(review.guestName || "A").slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950 text-sm">
                          {review.guestName || "Anonymous"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {review.roomCode} ·{" "}
                          {new Date(review.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex mt-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={14}
                          className={
                            n <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showQR && <QRModal onClose={() => setShowQR(false)} />}
      {showAddRoom && <AddRoomModal onClose={() => setShowAddRoom(false)} onAdded={onRoomsChange} />}
      {editingRoom && <EditRoomModal room={editingRoom} onClose={() => setEditingRoom(null)} onUpdated={onRoomsChange} />}
    </section>
  );
}
