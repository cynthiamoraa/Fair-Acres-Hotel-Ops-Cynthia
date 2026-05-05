import { Bell, Building2, CalendarDays, LayoutDashboard, LogOut, Settings } from "lucide-react";

const primaryNav = [
  { id: "manager", label: "Dashboard", icon: LayoutDashboard },
];

const secondaryNav = [
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ activeView, onChangeView, onLogout }) {
  function handleLogout() {
    if (window.confirm("Log out of the management dashboard?")) onLogout();
  }

  return (
    <aside className="hidden md:flex w-72 shrink-0 bg-[#BE185D] text-slate-200 p-5 flex-col">
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#F9A8D4] text-[#BE185D]">
          <Building2 size={22} />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight">Fair Acres</h1>
          <p className="text-xs text-slate-400">Room Management</p>
        </div>
      </div>

      <nav className="mt-9 space-y-1">
        {primaryNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                isActive ? "bg-[#F9A8D4] text-[#BE185D] shadow-lg shadow-pink-500/20" : "text-pink-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} /> {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-white/10 pt-5">
        <p className="px-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
        <div className="mt-3 space-y-1">
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? "bg-white/10 text-white" : "text-pink-200 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto rounded-2xl bg-white/[0.06] p-4">
        <p className="text-sm font-semibold text-white">Operations Manager</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">Monitor rooms, assign tasks, and resolve guest reports.</p>
        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
