import { AlertTriangle, LayoutDashboard, Users } from "lucide-react";

export default function Sidebar({ onChangeView }) {
  return (
    <aside className="hidden md:flex w-72 bg-[#0F111A] text-slate-200 p-6 flex-col">
      <h1 className="text-xl font-bold">Fair Acres Hotel</h1>
      <p className="text-slate-400 text-sm mt-1">Operations Manager</p>
      <nav className="mt-8 space-y-3">
        <button
          onClick={() => onChangeView("manager")}
          className="w-full flex items-center gap-3 bg-slate-800/60 hover:bg-slate-800 px-4 py-3 rounded-2xl"
        >
          <LayoutDashboard size={18} /> Manager
        </button>
        <button
          onClick={() => onChangeView("worker")}
          className="w-full flex items-center gap-3 bg-slate-800/60 hover:bg-slate-800 px-4 py-3 rounded-2xl"
        >
          <Users size={18} /> Worker
        </button>
        <button
          onClick={() => onChangeView("customer")}
          className="w-full flex items-center gap-3 bg-slate-800/60 hover:bg-slate-800 px-4 py-3 rounded-2xl"
        >
          <AlertTriangle size={18} /> Customer Report
        </button>
      </nav>
    </aside>
  );
}
