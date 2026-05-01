import { useEffect, useMemo, useState } from "react";
import MobileNav from "./components/MobileNav";
import Sidebar from "./components/Sidebar";
import ManagerPage from "./pages/ManagerPage";
import WorkerPage from "./pages/WorkerPage";
import { API_URL, fetchJson } from "./services/api";

export default function App() {
  const [view, setView] = useState("manager");

  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);

  const [selectedWorker, setSelectedWorker] = useState("w1");
  const [newTask, setNewTask] = useState({ roomCode: "Room101", title: "", notes: "", workerId: "w1" });

  async function loadAll() {
    const [nextStats, nextRooms, nextWorkers, nextTasks, nextIssues] = await Promise.all([
      fetchJson("/stats"),
      fetchJson("/rooms"),
      fetchJson("/workers"),
      fetchJson("/tasks"),
      fetchJson("/issues"),
    ]);

    setStats(nextStats);
    setRooms(nextRooms);
    setWorkers(nextWorkers);
    setTasks(nextTasks);
    setIssues(nextIssues);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const workerTasks = useMemo(() => tasks.filter((task) => task.workerId === selectedWorker), [tasks, selectedWorker]);

  async function createTask(event) {
    event.preventDefault();
    await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    setNewTask((current) => ({ ...current, title: "", notes: "" }));
    loadAll();
  }

  async function completeTask(taskId, file) {
    if (!file) return alert("Photo proof is required.");

    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch(`${API_URL}/tasks/${taskId}/complete`, { method: "POST", body: formData });
    const data = await response.json();

    if (!response.ok) return alert(data.error || "Failed to complete task.");
    loadAll();
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-slate-950 flex">
      <Sidebar activeView={view} onChangeView={setView} />

      <main className="flex-1 min-w-0 p-4 md:p-6 xl:p-8">
        <MobileNav activeView={view} onChangeView={setView} />

        {view === "manager" && (
          <ManagerPage
            stats={stats}
            rooms={rooms}
            workers={workers}
            issues={issues}
            newTask={newTask}
            onNewTaskChange={setNewTask}
            onCreateTask={createTask}
          />
        )}

        {view === "worker" && (
          <WorkerPage
            workers={workers}
            selectedWorker={selectedWorker}
            onSelectedWorkerChange={setSelectedWorker}
            workerTasks={workerTasks}
            onCompleteTask={completeTask}
          />
        )}
      </main>
    </div>
  );
}
