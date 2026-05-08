import { Building2, Eye, EyeOff, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import WorkerTaskCard from "./components/WorkerTaskCard";
import { API_URL, fetchJson, postForm, postJson } from "./services/api";

export default function WorkerApp() {
  const [workers, setWorkers] = useState([]);
  const [worker, setWorker] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchJson("/workers").then((data) => { setWorkers(data); setLoading(false); });
  }, []);

  async function loadTasks(id) {
    const data = await fetchJson(`/tasks?workerId=${id}`);
    setTasks(data);
  }

  function handleLogin(workerObj) {
    setWorker(workerObj);
    loadTasks(workerObj.id);
    pollRef.current = setInterval(() => loadTasks(workerObj.id), 30000);
  }

  function handleLogout() {
    clearInterval(pollRef.current);
    setWorker(null);
    setTasks([]);
  }

  async function completeTask(taskId, file) {
    if (!file) return alert("Photo proof is required.");
    const formData = new FormData();
    formData.append("image", file);
    const response = await postForm(`/tasks/${taskId}/complete`, formData);
    const data = await response.json();
    if (!response.ok) return alert(data.error || "Failed to complete task.");
    loadTasks(worker.id);
  }

  const pending = tasks.filter((t) => t.status === "pending").length;
  const completed = tasks.filter((t) => t.status === "completed").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-slate-950">
      <header className="bg-[#BE185D] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#F9A8D4] text-[#BE185D]">
            <Building2 size={18} />
          </div>
          <div>
            <p className="font-bold leading-tight">Fair Acres</p>
            <p className="text-xs text-slate-400">{worker ? `${worker.name}'s Tasks` : "Worker Portal"}</p>
          </div>
        </div>
        {worker && (
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
            <LogOut size={16} /> Sign out
          </button>
        )}
      </header>

      <main className="p-4 md:p-8 max-w-xl mx-auto">
        {!worker ? (
          <LoginScreen workers={workers} onLogin={handleLogin} />
        ) : (
          <TaskScreen tasks={tasks} pending={pending} completed={completed} onComplete={completeTask} worker={worker} />
        )}
      </main>
    </div>
  );
}

function LoginScreen({ workers, onLogin }) {
  const [selectedId, setSelectedId] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!workers.length) {
    return (
      <div className="mt-16 text-center space-y-2">
        <p className="font-semibold text-slate-700">No workers registered yet.</p>
        <p className="text-sm text-slate-500">Ask your manager to add workers in Settings.</p>
      </div>
    );
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!selectedId) return setError("Please select your name.");
    if (!pin) return setError("Please enter your PIN.");
    setError("");
    setLoading(true);
    const res = await postJson(`/auth/worker/login`, { workerId: selectedId, pin });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Login failed.");
    onLogin(data.worker);
  }

  return (
    <div className="mt-10 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-950">Worker Sign In</h2>
        <p className="text-sm text-slate-500 mt-1">Select your name and enter your PIN.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-3">
        <div className="space-y-2">
          {workers.map((w) => (
            <button key={w.id} type="button" onClick={() => { setSelectedId(w.id); setError(""); }}
              className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition
                ${selectedId === w.id ? "border-[#F7B955] bg-amber-50" : "border-slate-200 hover:bg-slate-50"}`}>
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-sm font-bold text-white shrink-0">
                {w.name.slice(0, 1)}
              </div>
              <p className="font-semibold text-slate-900">{w.name}</p>
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type={showPin ? "text" : "password"}
            inputMode="numeric"
            maxLength={8}
            className="h-12 w-full rounded-xl border border-slate-200 px-4 pr-10 text-sm outline-none focus:border-slate-400"
            placeholder="Enter your PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <button type="button" onClick={() => setShowPin((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button disabled={loading}
          className="w-full h-12 rounded-2xl bg-[#BE185D] text-white font-semibold text-sm hover:bg-pink-700 disabled:opacity-40">
          {loading ? "Signing in…" : "View My Tasks"}
        </button>
      </form>
    </div>
  );
}

function TaskScreen({ tasks, pending, completed, onComplete, worker }) {
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const [showCompleted, setShowCompleted] = useState(false);

  // Calculate performance stats
  const completedToday = completedTasks.filter((t) => {
    const completedDate = new Date(t.completedAt);
    const today = new Date();
    return completedDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="space-y-5 mt-4">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl p-6 text-white shadow-lg">
        <p className="text-sm text-pink-100 font-medium">Welcome back,</p>
        <h1 className="text-2xl font-bold mt-1">{worker?.name || "Worker"}</h1>
        <p className="text-sm text-pink-100 mt-2">You've completed {completedToday} task{completedToday !== 1 ? 's' : ''} today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-pink-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-amber-600 mb-1">Pending</p>
          <p className="text-3xl font-bold text-slate-950">{pending}</p>
        </div>
        <div className="bg-white border border-pink-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-emerald-600 mb-1">Done</p>
          <p className="text-3xl font-bold text-slate-950">{completed}</p>
        </div>
        <div className="bg-white border border-pink-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-pink-600 mb-1">Today</p>
          <p className="text-3xl font-bold text-slate-950">{completedToday}</p>
        </div>
      </div>

      {/* Priority Alert */}
      {pendingTasks.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-amber-900">You have {pendingTasks.length} pending task{pendingTasks.length !== 1 ? 's' : ''}</p>
          <p className="text-xs text-amber-700 mt-1">Complete them as soon as possible to maintain service quality</p>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="bg-white border border-pink-100 rounded-3xl p-12 text-center shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-2">All caught up!</h3>
          <p className="text-slate-500">No tasks assigned at the moment.</p>
        </div>
      ) : (
        <>
          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Pending Tasks</h2>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                  {pendingTasks.length}
                </span>
              </div>
              {pendingTasks.map((task) => (
                <WorkerTaskCard key={task.id} task={task} onComplete={onComplete} />
              ))}
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="text-lg font-bold text-slate-900 hover:text-pink-600 transition"
                >
                  Completed Tasks {showCompleted ? '▼' : '▶'}
                </button>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                  {completedTasks.length}
                </span>
              </div>
              {showCompleted && completedTasks.map((task) => (
                <WorkerTaskCard key={task.id} task={task} onComplete={onComplete} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
