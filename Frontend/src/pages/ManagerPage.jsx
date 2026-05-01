import { AlertTriangle, BedDouble, CheckCircle2, UserCog, Wrench } from "lucide-react";
import Badge from "../components/Badge";
import { API_BASE_URL } from "../services/api";

export default function ManagerPage({ stats, rooms, workers, issues, newTask, onNewTaskChange, onCreateTask }) {
  const statCards = stats
    ? [
        { label: "Total Rooms", value: stats.roomsTotal, icon: BedDouble },
        { label: "Pending Tasks", value: stats.pendingTasks, icon: Wrench },
        { label: "Completed Tasks", value: stats.completedTasks, icon: CheckCircle2 },
        { label: "Open Issues", value: stats.issuesOpen, icon: AlertTriangle },
      ]
    : [];

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border border-slate-200 rounded-3xl p-4">
            <card.icon className="text-slate-500" size={18} />
            <p className="text-2xl font-bold mt-2">{card.value}</p>
            <p className="text-sm text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-5">
        <h3 className="font-semibold mb-3">Room Inventory</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {rooms.map((room) => (
            <div key={room.id} className="border border-slate-200 rounded-2xl p-3">
              <p className="font-semibold">{room.code}</p>
              <p className="text-xs text-slate-500">Floor {room.floor}</p>
              <div className="mt-2">
                <Badge value={room.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={onCreateTask} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <UserCog size={18} /> Assign Task
          </h3>
          <input
            className="w-full border rounded-2xl p-3"
            placeholder="Room code (e.g. Room101)"
            value={newTask.roomCode}
            onChange={(e) => onNewTaskChange({ ...newTask, roomCode: e.target.value })}
          />
          <input
            className="w-full border rounded-2xl p-3"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => onNewTaskChange({ ...newTask, title: e.target.value })}
          />
          <textarea
            className="w-full border rounded-2xl p-3"
            placeholder="Notes"
            value={newTask.notes}
            onChange={(e) => onNewTaskChange({ ...newTask, notes: e.target.value })}
          />
          <select
            className="w-full border rounded-2xl p-3"
            value={newTask.workerId}
            onChange={(e) => onNewTaskChange({ ...newTask, workerId: e.target.value })}
          >
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.name}
              </option>
            ))}
          </select>
          <button className="w-full bg-[#0F111A] text-white py-3 rounded-2xl font-semibold">Create Task</button>
        </form>

        <div className="bg-white border border-slate-200 rounded-3xl p-5">
          <h3 className="font-semibold mb-3">Customer Issues</h3>
          <div className="space-y-3 max-h-80 overflow-auto pr-1">
            {issues.map((issue) => (
              <div key={issue.id} className="border border-slate-200 rounded-2xl p-3">
                <p className="font-semibold">{issue.location}</p>
                <p className="text-sm text-slate-600">{issue.description || "No description"}</p>
                {issue.imageUrl && (
                  <a href={`${API_BASE_URL}${issue.imageUrl}`} target="_blank" rel="noreferrer" className="text-sm text-sky-600">
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
