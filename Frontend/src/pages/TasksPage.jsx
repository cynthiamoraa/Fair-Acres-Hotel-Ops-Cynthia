import {
  AlertTriangle, CheckCircle2, Clock, ClipboardList, Plus, Search, UserCog, UserPlus, X
} from "lucide-react";
import { useState } from "react";
import Badge from "../components/Badge";
import OverdueBadge, { TASK_SLA_MS, isOverdue } from "../components/OverdueBadge";
import { API_BASE_URL, patchJson } from "../services/api";

export default function TasksPage({ tasks, workers, newTask, onNewTaskChange, onCreateTask, onTasksChange }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [assigningTask, setAssigningTask] = useState(null);
  const [selectedWorkerForTask, setSelectedWorkerForTask] = useState({});

  const filteredTasks = tasks
    .filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.roomCode.toLowerCase().includes(search.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = filterStatus === "all" || t.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by: unassigned first, then pending (oldest first), then completed (newest first)
      if (a.status === "unassigned" && b.status !== "unassigned") return -1;
      if (b.status === "unassigned" && a.status !== "unassigned") return 1;
      if (a.status === "pending" && b.status === "pending") {
        return new Date(a.assignedAt || a.createdAt) - new Date(b.assignedAt || b.createdAt);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const stats = {
    unassigned: tasks.filter((t) => t.status === "unassigned").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    overdue: tasks.filter((t) => t.status === "pending" && isOverdue(t.assignedAt || t.createdAt, TASK_SLA_MS)).length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  async function assignTask(taskId, workerId) {
    if (!workerId) return;
    setAssigningTask(taskId);
    try {
      const res = await patchJson(`/tasks/${taskId}/assign`, { workerId });
      if (res.ok) {
        onTasksChange();
        setSelectedWorkerForTask((prev) => ({ ...prev, [taskId]: "" }));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to assign task");
      }
    } catch (error) {
      alert("Failed to assign task");
    }
    setAssigningTask(null);
  }

  function getTimePending(task) {
    const startTime = new Date(task.assignedAt || task.createdAt);
    const now = new Date();
    const diffMs = now - startTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">Tasks Management</h2>
          <p className="mt-1 text-sm text-slate-500">Assign and track housekeeping tasks</p>
        </div>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-slate-400 sm:w-72"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={15} />
            </button>
          )}
        </label>
      </header>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle size={20} />
            </div>
            <span className="text-xs font-semibold text-slate-500">UNASSIGNED</span>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-950">{stats.unassigned}</p>
          <p className="mt-1 text-sm text-slate-500">Awaiting assignment</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-sky-700">
              <Clock size={20} />
            </div>
            <span className="text-xs font-semibold text-slate-500">PENDING</span>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-950">{stats.pending}</p>
          <p className="mt-1 text-sm text-slate-500">In progress</p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-rose-600 text-white">
              <AlertTriangle size={20} />
            </div>
            <span className="text-xs font-semibold text-rose-600">OVERDUE</span>
          </div>
          <p className="mt-4 text-3xl font-bold text-rose-700">{stats.overdue}</p>
          <p className="mt-1 text-sm text-rose-600">Past SLA deadline</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-xs font-semibold text-slate-500">COMPLETED</span>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-950">{stats.completed}</p>
          <p className="mt-1 text-sm text-slate-500">Finished tasks</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Tasks List */}
        <div className="space-y-4">
          {/* Filter Tabs */}
          <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1 w-fit">
            {[
              { id: "all", label: "All" },
              { id: "unassigned", label: "Unassigned" },
              { id: "pending", label: "Pending" },
              { id: "completed", label: "Completed" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  filterStatus === filter.id
                    ? "bg-[#BE185D] text-white shadow"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Tasks */}
          {filteredTasks.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <ClipboardList className="mx-auto text-slate-300" size={48} />
              <p className="mt-3 text-sm text-slate-500">
                {search ? `No tasks match "${search}"` : "No tasks found"}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const worker = workers.find((w) => w.id === task.workerId);
              const isPending = task.status === "pending";
              const isTaskOverdue = isPending && isOverdue(task.assignedAt || task.createdAt, TASK_SLA_MS);

              return (
                <div
                  key={task.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm ${
                    isTaskOverdue ? "border-red-300 bg-red-50" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-950">{task.title}</p>
                        <Badge value={task.status} />
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                        <span className="font-semibold">{task.roomCode}</span>
                        {worker && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <UserCog size={14} />
                              {worker.name}
                            </span>
                          </>
                        )}
                      </div>
                      {task.notes && <p className="mt-2 text-sm text-slate-600">{task.notes}</p>}

                      {/* Assign Button for Unassigned Tasks */}
                      {task.status === "unassigned" && (
                        <div className="mt-3 flex items-center gap-2">
                          <select
                            value={selectedWorkerForTask[task.id] || ""}
                            onChange={(e) => setSelectedWorkerForTask((prev) => ({ ...prev, [task.id]: e.target.value }))}
                            className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                            disabled={assigningTask === task.id}
                          >
                            <option value="">Select worker...</option>
                            {workers.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => assignTask(task.id, selectedWorkerForTask[task.id])}
                            disabled={!selectedWorkerForTask[task.id] || assigningTask === task.id}
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <UserPlus size={16} /> Assign
                          </button>
                        </div>
                      )}

                      {/* Time Pending */}
                      {(task.status === "pending" || task.status === "unassigned") && (
                        <div className="mt-3 flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={14} className={isTaskOverdue ? "text-red-600" : "text-slate-400"} />
                            <span className={isTaskOverdue ? "font-semibold text-red-700" : "text-slate-500"}>
                              Pending for {getTimePending(task)}
                            </span>
                          </div>
                          <OverdueBadge isoDate={task.assignedAt || task.createdAt} slaMs={TASK_SLA_MS} />
                        </div>
                      )}

                      {/* Completed Info */}
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
                    </div>

                    {/* Proof Image Thumbnail */}
                    {task.proofImageUrl && (
                      <a href={`${API_BASE_URL}${task.proofImageUrl}`} target="_blank" rel="noreferrer">
                        <img
                          src={`${API_BASE_URL}${task.proofImageUrl}`}
                          alt="proof"
                          className="h-16 w-16 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create Task Form */}
        <div className="lg:sticky lg:top-6 h-fit">
          <form onSubmit={onCreateTask} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Plus size={19} /> Create New Task
            </h3>
            <div className="mt-5 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Room Code</label>
                <input
                  className="mt-1 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                  placeholder="e.g., 101"
                  value={newTask.roomCode}
                  onChange={(e) => onNewTaskChange({ ...newTask, roomCode: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Task Title</label>
                <input
                  className="mt-1 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                  placeholder="e.g., Clean bathroom"
                  value={newTask.title}
                  onChange={(e) => onNewTaskChange({ ...newTask, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes (Optional)</label>
                <textarea
                  className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-slate-400"
                  placeholder="Additional instructions..."
                  value={newTask.notes}
                  onChange={(e) => onNewTaskChange({ ...newTask, notes: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assign To</label>
                <select
                  className="mt-1 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                  value={newTask.workerId}
                  onChange={(e) => onNewTaskChange({ ...newTask, workerId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#BE185D] text-sm font-bold text-white hover:bg-pink-700"
              >
                <ClipboardList size={18} /> Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
