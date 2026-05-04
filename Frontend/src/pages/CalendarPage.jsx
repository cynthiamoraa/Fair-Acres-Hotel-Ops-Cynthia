import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function CalendarPage({ tasks }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(today.toDateString());

  const firstDay = new Date(cursor.year, cursor.month, 1).getDay();
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const key = new Date(t.createdAt).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  const selectedTasks = tasksByDate[selected] || [];

  function prevMonth() {
    setCursor((c) => {
      const m = c.month === 0 ? 11 : c.month - 1;
      const y = c.month === 0 ? c.year - 1 : c.year;
      return { year: y, month: m };
    });
  }

  function nextMonth() {
    setCursor((c) => {
      const m = c.month === 11 ? 0 : c.month + 1;
      const y = c.month === 11 ? c.year + 1 : c.year;
      return { year: y, month: m };
    });
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-slate-500">Workspace</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Calendar</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar grid */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="rounded-xl p-2 hover:bg-slate-100"><ChevronLeft size={18} /></button>
            <p className="font-bold text-slate-950">{MONTHS[cursor.month]} {cursor.year}</p>
            <button onClick={nextMonth} className="rounded-xl p-2 hover:bg-slate-100"><ChevronRight size={18} /></button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <p key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</p>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const dateStr = new Date(cursor.year, cursor.month, day).toDateString();
              const isToday = dateStr === today.toDateString();
              const isSelected = dateStr === selected;
              const hasTasks = !!tasksByDate[dateStr];
              return (
                <button
                  key={day}
                  onClick={() => setSelected(dateStr)}
                  className={`relative flex flex-col items-center justify-center rounded-xl py-2 text-sm font-medium transition
                    ${isSelected ? "bg-[#111827] text-white" : isToday ? "bg-[#F7B955] text-slate-950" : "hover:bg-slate-100 text-slate-700"}`}
                >
                  {day}
                  {hasTasks && (
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-amber-400" : "bg-slate-400"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tasks for selected day */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList size={18} className="text-slate-400" />
            <p className="font-bold text-slate-950">{selected}</p>
          </div>
          {selectedTasks.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks on this day.</p>
          ) : (
            <div className="space-y-3">
              {selectedTasks.map((t) => (
                <div key={t.id} className="rounded-2xl bg-[#FAFBFD] border border-slate-200 p-3">
                  <p className="font-semibold text-slate-950 text-sm">{t.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.roomCode} · {t.status}</p>
                  {t.notes && <p className="text-xs text-slate-400 mt-1">{t.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
