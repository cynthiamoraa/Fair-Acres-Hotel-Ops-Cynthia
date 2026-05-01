import {
  AlertTriangle,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";
import Badge from "../components/Badge";
import { API_BASE_URL } from "../services/api";

const roomPalette = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  occupied: "border-sky-200 bg-sky-50 text-sky-700",
  maintenance: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function ManagerPage({ stats, rooms, workers, issues, newTask, onNewTaskChange, onCreateTask }) {
  const safeStats = {
    roomsTotal: stats?.roomsTotal ?? rooms.length,
    available: stats?.available ?? rooms.filter((room) => room.status === "available").length,
    occupied: stats?.occupied ?? rooms.filter((room) => room.status === "occupied").length,
    maintenance: stats?.maintenance ?? rooms.filter((room) => room.status === "maintenance").length,
    pendingTasks: stats?.pendingTasks ?? 0,
    completedTasks: stats?.completedTasks ?? 0,
    issuesOpen: stats?.issuesOpen ?? issues.length,
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

  const activeWorkers = workers.slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">Welcome back, Manager</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Dashboard</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-slate-400 sm:w-72" placeholder="Search room or task" />
          </label>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">
            <CalendarDays size={17} /> Today <ChevronDown size={16} />
          </button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ${card.color}`}>
                  <Icon size={20} />
                </div>
                <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label={`${card.label} options`}>
                  <MoreHorizontal size={18} />
                </button>
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

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Room Inventory</h3>
              <p className="text-sm text-slate-500">Live room condition and housekeeping status</p>
            </div>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white">
              <Plus size={17} /> Add Room
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {rooms.map((room) => (
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
                  <Badge value={room.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-[#111827] p-5 text-white shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Room Status</h3>
              <p className="text-sm text-slate-400">Current occupancy mix</p>
            </div>
            <Sparkles className="text-[#F7B955]" size={22} />
          </div>

          <div className="mt-6 space-y-5">
            {roomBreakdown.map((item) => {
              const percent = safeStats.roomsTotal ? Math.round((item.value / safeStats.roomsTotal) * 100) : 0;
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

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1fr_1fr]">
        <form onSubmit={onCreateTask} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <UserCog size={19} /> Assign Task
          </h3>
          <div className="mt-5 space-y-3">
            <input
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
              placeholder="Room code (e.g. Room101)"
              value={newTask.roomCode}
              onChange={(e) => onNewTaskChange({ ...newTask, roomCode: e.target.value })}
            />
            <input
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => onNewTaskChange({ ...newTask, title: e.target.value })}
            />
            <textarea
              className="min-h-24 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-slate-400"
              placeholder="Notes"
              value={newTask.notes}
              onChange={(e) => onNewTaskChange({ ...newTask, notes: e.target.value })}
            />
            <select
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
              value={newTask.workerId}
              onChange={(e) => onNewTaskChange({ ...newTask, workerId: e.target.value })}
            >
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name}
                </option>
              ))}
            </select>
            <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F7B955] px-4 text-sm font-bold text-slate-950 hover:bg-[#f4ad35]">
              <ClipboardList size={18} /> Create Task
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Team</h3>
            <Users className="text-slate-400" size={20} />
          </div>
          <div className="mt-5 space-y-3">
            {activeWorkers.map((worker, index) => (
              <div key={worker.id} className="flex items-center justify-between rounded-2xl bg-[#FAFBFD] p-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-sm font-bold text-white">{worker.name.slice(0, 1)}</div>
                  <div>
                    <p className="font-semibold text-slate-900">{worker.name}</p>
                    <p className="text-xs text-slate-500">Housekeeping team</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{index === 0 ? "Active" : "Ready"}</span>
              </div>
            ))}
            {!workers.length && <p className="text-sm text-slate-500">No workers available.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Customer Issues</h3>
            <AlertTriangle className="text-slate-400" size={20} />
          </div>
          <div className="mt-5 max-h-80 space-y-3 overflow-auto pr-1">
            {issues.map((issue) => (
              <div key={issue.id} className="rounded-2xl border border-slate-200 bg-[#FAFBFD] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{issue.location}</p>
                    <p className="mt-1 text-sm text-slate-600">{issue.description || "No description"}</p>
                  </div>
                  <Badge value={issue.status || "open"} />
                </div>
                {issue.imageUrl && (
                  <a href={`${API_BASE_URL}${issue.imageUrl}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-semibold text-sky-600">
                    View photo
                  </a>
                )}
              </div>
            ))}
            {!issues.length && <p className="text-sm text-slate-500">No issues reported yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
