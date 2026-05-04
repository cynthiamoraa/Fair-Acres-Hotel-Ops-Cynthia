import { Building2, ClipboardList, Eye, EyeOff, LogOut } from "lucide-react";
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
      <header className="bg-[#111827] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#F7B955] text-slate-950">
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
          <TaskScreen tasks={tasks} pending={pending} completed={completed} onComplete={completeTask} />
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
        <ClipboardList size={36} className="mx-auto text-slate-300" />
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
          className="w-full h-12 rounded-2xl bg-[#111827] text-white font-semibold text-sm hover:bg-slate-800 disabled:opacity-40">
          {loading ? "Signing in…" : "View My Tasks"}
        </button>
      </form>
    </div>
  );
}

function TaskScreen({ tasks, pending, completed, onComplete }) {
  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-slate-950">{pending}</p>
          <p className="text-sm text-slate-500 mt-0.5">Pending</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">{completed}</p>
          <p className="text-sm text-slate-500 mt-0.5">Completed</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <ClipboardList size={36} className="mx-auto text-slate-300" />
          <p className="text-slate-500 text-sm">No tasks assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <WorkerTaskCard key={task.id} task={task} onComplete={onComplete} />
          ))}
        </div>
      )}
    </div>
  );
}
