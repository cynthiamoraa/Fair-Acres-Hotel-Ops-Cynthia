import { useEffect, useState } from "react";
import MobileNav from "./components/MobileNav";
import Sidebar from "./components/Sidebar";
import CalendarPage from "./pages/CalendarPage";
import ManagerPage from "./pages/ManagerPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import { API_URL, fetchJson } from "./services/api";

export default function App() {
  const [view, setView] = useState("manager");

  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newTask, setNewTask] = useState({ roomCode: "", title: "", notes: "", workerId: "" });

  async function loadAll() {
    const [nextStats, nextRooms, nextWorkers, nextTasks, nextIssues, nextReviews] = await Promise.all([
      fetchJson("/stats"),
      fetchJson("/rooms"),
      fetchJson("/workers"),
      fetchJson("/tasks"),
      fetchJson("/issues"),
      fetchJson("/reviews"),
    ]);
    setStats(nextStats);
    setRooms(nextRooms);
    setWorkers(nextWorkers);
    setTasks(nextTasks);
    setIssues(nextIssues);
    setReviews(nextReviews);
    setNewTask((c) => ({
      ...c,
      workerId: c.workerId || nextWorkers[0]?.id || "",
      roomCode: c.roomCode || nextRooms[0]?.code || "",
    }));
  }

  useEffect(() => { loadAll(); }, []);

  async function createTask(event) {
    event.preventDefault();
    await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    setNewTask((c) => ({ ...c, title: "", notes: "" }));
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
            reviews={reviews}
            tasks={tasks}
            newTask={newTask}
            onNewTaskChange={setNewTask}
            onCreateTask={createTask}
            onRoomsChange={loadAll}
          />
        )}

        {view === "calendar" && <CalendarPage tasks={tasks} />}
        {view === "notifications" && <NotificationsPage issues={issues} tasks={tasks} />}
        {view === "settings" && <SettingsPage workers={workers} onWorkersChange={loadAll} />}
      </main>
    </div>
  );
}
