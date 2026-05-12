import {
  AlertTriangle, BedDouble, CalendarDays, CheckCircle2, ChevronDown,
  ClipboardList, LayoutDashboard, MessageSquare, MoreHorizontal, Plus,
  QrCode, Search, Sparkles, Star, Ticket, UserCog, Users, Wrench, X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AddRoomModal from "../components/AddRoomModal";
import Badge from "../components/Badge";
import QRModal from "../components/QRModal";
import TicketDashboard from "../components/TicketDashboard";

import { API_BASE_URL, patchJson, postJson } from "../services/api";

const roomPalette = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  occupied: "border-sky-200 bg-sky-50 text-sky-700",
  maintenance: "border-rose-200 bg-rose-50 text-rose-700",
};
const statusCycle = { available: "occupied", occupied: "maintenance", maintenance: "available" };
const DATE_OPTIONS = ["Today", "Yesterday", "Last 7 days", "Last 30 days"];
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "workers", label: "Workers & Tasks", icon: Users },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "complaints", label: "Complaints", icon: AlertTriangle },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
];

export default function ManagerPage({ stats, rooms, workers, issues, reviews, tasks, newTask, onNewTaskChange, onCreateTask, onRoomsChange }) {
  const [tab, setTab] = useState("overview");
  const [showQR, setShowQR] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [search, setSearch] = useState("");
  const [openCardMenu, setOpenCardMenu] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState("Today");
  const [updatingRoom, setUpdatingRoom] = useState(null);
  const [resolvingIssue, setResolvingIssue] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const dateRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dateRef.current && !dateRef.current.contains(e.target)) setShowDatePicker(false);
      if (!e.target.closest("[data-card-menu]")) setOpenCardMenu(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const safeStats = {
    roomsTotal: stats?.roomsTotal ?? rooms.length,
    available: stats?.available ?? rooms.filter((r) => r.status === "available").length,
    occupied: stats?.occupied ?? rooms.filter((r) => r.status === "occupied").length,
    maintenance: stats?.maintenance ?? rooms.filter((r) => r.status === "maintenance").length,
    pendingTasks: stats?.pendingTasks ?? 0,
    completedTasks: stats?.completedTasks ?? 0,
    issuesOpen: stats?.issuesOpen ?? issues.filter((i) => i.status === "open").length,
  };

  const statCards = [
    { label: "Total Rooms", value: safeStats.roomsTotal, helper: "Across all floors", icon: BedDouble, color: "bg-[#111827] text-white" },
    { label: "Available", value: safeStats.available, helper: "Ready for guests", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
    { label: "In Service", value: safeStats.pendingTasks, helper: "Pending tasks", icon: Wrench, color: "bg-amber-100 text-amber-700" },
    { label: "Open Issues", value: safeStats.issuesOpen, helper: "Guest reports", icon: AlertTriangle, color: "bg-rose-100 text-rose-700" },
  ];

  const roomBreakdown = [
    { label: "Available", value: safeStats.available, color: "bg-emerald-500" },
    { label: "Occupied", value: safeStats.occupied, color: "bg-sky-500" },
    { label: "Maintenance", value: safeStats.maintenance, color: "bg-rose-500" },
  ];

  const filteredRooms = rooms
    .filter((r, idx, arr) => arr.findIndex((x) => x.id === r.id) === idx)
    .filter(
      (r) =>
        r.code.toLowerCase().includes(search.toLowerCase()) ||
        r.status.toLowerCase().includes(search.toLowerCase()) ||
        String(r.floor).includes(search)
    );

  async function cycleRoomStatus(room) {
    setUpdatingRoom(room.id);
    await patchJson(`/rooms/${room.id}/status`, { status: statusCycle[room.status] || "available" });
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

  const focusedWorkerTasks = selectedWorker ? workerTaskMap[selectedWorker] || [] : [];

  return (
    <section className="mx-auto max-w-7xl space-y-6">

      {/* ── Header ── */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">Welcome back, Manager</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Admin Dashboard</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-slate-400 sm:w-72"
              placeholder="Search room or status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={15} />
              </button>
            )}
          </label>
          <div className="relative" ref={dateRef}>
            <button
              onClick={() => setShowDatePicker((v) => !v)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <CalendarDays size={17} /> {selectedDate} <ChevronDown size={16} />
            </button>
            {showDatePicker && (
              <div className="absolute right-0 top-12 z-20 w-44 rounded-2xl border border-slate-200 bg-white shadow-lg py-1">
                {DATE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setSelectedDate(opt); setShowDatePicker(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 ${selectedDate === opt ? "font-semibold text-slate-950" : "text-slate-600"}`}
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
              ${tab === id ? "bg-[#BE185D] text-white shadow" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
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
                <div key={card.label} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`grid h-11 w-11 place-items-center rounded-xl ${card.color}`}>
                      <Icon size={20} />
                    </div>
                    <div data-card-menu>
                      <button
                        onClick={() => setOpenCardMenu(openCardMenu === i ? null : i)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      {openCardMenu === i && (
                        <div className="absolute right-4 top-14 z-20 w-36 rounded-2xl border border-slate-200 bg-white shadow-lg py-1">
                          <button className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">View details</button>
                          <button className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">Export data</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="mt-5 text-3xl font-bold text-slate-950">{card.value}</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-700">{card.label}</p>
                    <p className="text-xs text-slate-500">{card.helper}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Room inventory + breakdown */}
          <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Room Inventory</h3>
                  <p className="text-sm text-slate-500">Click a status badge to cycle its state</p>
                </div>
                <button
                  onClick={() => setShowAddRoom(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#BE185D] px-4 text-sm font-semibold text-white hover:bg-pink-700"
                >
                  <Plus size={17} /> Add Room
                </button>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {filteredRooms.length === 0 && (
                  <p className="col-span-full text-sm text-slate-500">No rooms match "{search}".</p>
                )}
                {filteredRooms.map((room) => (
                  <div key={room.id} className="rounded-2xl border border-slate-200 bg-[#FAFBFD] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-950">{room.code}</p>
                        <p className="text-xs text-slate-500">Floor {room.floor}</p>
                      </div>
                      <div className={`grid h-10 w-10 place-items-center rounded-xl border ${roomPalette[room.status] || "border-slate-200 bg-slate-100 text-slate-600"}`}>
                        <BedDouble size={18} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => cycleRoomStatus(room)}
                        disabled={updatingRoom === room.id}
                        className="disabled:opacity-50"
                      >
                        <Badge value={room.status} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#BE185D] p-5 text-white shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">Room Status</h3>
                  <p className="text-sm text-slate-400">Current occupancy mix</p>
                </div>
                <Sparkles className="text-[#F7B955]" size={22} />
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
                        <span className="font-semibold">{item.value} rooms</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-7 rounded-2xl bg-white/[0.06] p-4">
                <p className="text-sm font-semibold">Completed tasks</p>
                <p className="mt-2 text-3xl font-bold">{safeStats.completedTasks}</p>
                <p className="mt-1 text-xs text-slate-400">Finished by the housekeeping team</p>
              </div>
            </div>
          </div>

          {/* Assign task form */}
          <form onSubmit={onCreateTask} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm max-w-md">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <UserCog size={19} /> Assign Task
            </h3>
            <div className="mt-5 space-y-3">
              <input
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                placeholder="Room code"
                value={newTask.roomCode}
                onChange={(e) => onNewTaskChange({ ...newTask, roomCode: e.target.value })}
              />
              <input
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => onNewTaskChange({ ...newTask, title: e.target.value })}
              />
              <textarea
                className="min-h-20 w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-slate-400"
                placeholder="Notes"
                value={newTask.notes}
                onChange={(e) => onNewTaskChange({ ...newTask, notes: e.target.value })}
              />
              <select
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                value={newTask.workerId}
                onChange={(e) => onNewTaskChange({ ...newTask, workerId: e.target.value })}
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#BE185D] text-sm font-bold text-white hover:bg-pink-700">
                <ClipboardList size={18} /> Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── WORKERS & TASKS TAB ── */}
      {tab === "workers" && (
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 px-1 mb-3">Team Members</p>
            {workers.length === 0 && (
              <p className="text-sm text-slate-500">No workers yet. Add them in Settings.</p>
            )}
            {workers.map((w) => {
              const wTasks = workerTaskMap[w.id] || [];
              const done = wTasks.filter((t) => t.status === "completed").length;
              const pending = wTasks.filter((t) => t.status === "pending").length;
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWorker(selectedWorker === w.id ? null : w.id)}
                  className={`w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition
                    ${selectedWorker === w.id ? "border-[#F7B955] bg-amber-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                    {w.name.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{w.name}</p>
                    <p className="text-xs text-slate-500">{done} done · {pending} pending</p>
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
                  <p className="text-sm text-slate-500">No tasks assigned yet.</p>
                )}
                {focusedWorkerTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{task.title}</p>
                        <p className="text-sm text-slate-500">{task.roomCode}</p>
                        {task.notes && (
                          <p className="text-xs text-slate-400 mt-1">{task.notes}</p>
                        )}
                      </div>
                      <Badge value={task.status} />
                    </div>
                    {task.status === "completed" && (
                      <div className="mt-3 flex items-center gap-3">
                        <p className="text-xs text-slate-400">
                          Completed {new Date(task.completedAt).toLocaleString()}
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

      {/* ── TICKETS TAB ── */}
      {tab === "tickets" && (
        <TicketDashboard />
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
            <p className="text-sm text-slate-500">No complaints submitted yet.</p>
          )}

          <div className="space-y-3">
            {issues.map((issue) => (
              <div key={issue.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-950">{issue.location}</p>
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
                    <a href={`${API_BASE_URL}${issue.imageUrl}`} target="_blank" rel="noreferrer">
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
                  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
                  return (
                    <Star
                      key={n}
                      size={18}
                      className={n <= Math.round(avg) ? "fill-amber-400 text-rose-700" : "text-slate-300"}
                    />
                  );
                })}
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)} average · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {reviews.length === 0 && (
            <p className="text-sm text-slate-500">No reviews submitted yet.</p>
          )}

          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
                          {review.roomCode} · {new Date(review.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex mt-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={14}
                          className={n <= review.rating ? "fill-amber-400 text-rose-700" : "text-slate-300"}
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
    </section>
  );
}