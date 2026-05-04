import { AlertTriangle, CheckCircle2, Bell } from "lucide-react";
import { useState } from "react";

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage({ issues, tasks }) {
  const notifications = [
    ...issues.map((i) => ({
      id: `issue-${i.id}`,
      type: "issue",
      title: `New complaint — ${i.location}`,
      body: i.description || "No description provided.",
      time: i.createdAt,
    })),
    ...tasks
      .filter((t) => t.status === "completed")
      .map((t) => ({
        id: `task-${t.id}`,
        type: "task",
        title: `Task completed — ${t.title}`,
        body: `${t.roomCode} marked done.`,
        time: t.completedAt,
      })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  const [read, setRead] = useState(new Set());

  function markAllRead() {
    setRead(new Set(notifications.map((n) => n.id)));
  }

  const unread = notifications.filter((n) => !read.has(n.id)).length;

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">Workspace</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Notifications</h2>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-sm font-semibold text-slate-500 hover:text-slate-800">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-slate-400">
          <Bell size={36} />
          <p className="text-sm">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const isRead = read.has(n.id);
            return (
              <button
                key={n.id}
                onClick={() => setRead((r) => new Set([...r, n.id]))}
                className={`w-full text-left flex items-start gap-4 rounded-2xl border p-4 transition
                  ${isRead ? "bg-white border-slate-200 opacity-60" : "bg-white border-slate-200 shadow-sm"}`}
              >
                <div className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl
                  ${n.type === "issue" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>
                  {n.type === "issue" ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold text-slate-950 ${!isRead ? "" : "font-medium"}`}>{n.title}</p>
                    <span className="text-xs text-slate-400 shrink-0">{timeAgo(n.time)}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500 truncate">{n.body}</p>
                </div>
                {!isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#F7B955]" />}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
