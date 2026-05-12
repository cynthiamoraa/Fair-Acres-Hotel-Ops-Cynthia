import { useEffect, useRef, useState } from "react";
import ManagerLogin from "./components/ManagerLogin";
import MobileNav from "./components/MobileNav";
import Sidebar from "./components/Sidebar";
import CalendarPage from "./pages/CalendarPage";
import ManagerPage from "./pages/ManagerPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import TasksPage from "./pages/TasksPage";
import { postJson, fetchJson } from "./services/api";

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem("mgr_auth") === "1");
  const [view, setView] = useState("manager");

  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newTask, setNewTask] = useState({ roomCode: "", title: "", notes: "", workerId: "" });

  const pollRef = useRef(null);

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

  useEffect(() => {
    if (!authed) return;
    loadAll();
    pollRef.current = setInterval(loadAll, 30000);
    return () => clearInterval(pollRef.current);
  }, [authed]);

  function handleLogout() {
    localStorage.removeItem("mgr_auth");
    setAuthed(false);
  }

  async function createTask(event) {
    event.preventDefault();
    const res = await postJson("/tasks", newTask);
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed to create task.");
    setNewTask((c) => ({ ...c, title: "", notes: "" }));
    loadAll();
  }

  if (!authed) return <ManagerLogin onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-slate-950 flex">
      <Sidebar
        activeView={view}
        onChangeView={setView}
        onLogout={handleLogout}
      />

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

        {view === "tasks" && (
          <TasksPage
            tasks={tasks}
            workers={workers}
            newTask={newTask}
            onNewTaskChange={setNewTask}
            onCreateTask={createTask}
            onTasksChange={loadAll}
          />
        )}

        {view === "calendar" && <CalendarPage tasks={tasks} />}
        {view === "notifications" && (
          <NotificationsPage issues={issues} tasks={tasks} />
        )}
        {view === "settings" && (
          <SettingsPage workers={workers} onWorkersChange={loadAll} />
        )}
      </main>
    </div>
  );
}
