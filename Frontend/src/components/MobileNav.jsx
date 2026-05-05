const views = [
  { id: "manager", label: "Dashboard" },
];

export default function MobileNav({ activeView, onChangeView }) {
  return (
    <div className="md:hidden flex gap-2 mb-4">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onChangeView(view.id)}
          className={`px-4 py-2 rounded-2xl text-sm font-semibold ${
            activeView === view.id ? "bg-[#BE185D] text-white" : "bg-white border border-slate-200"
          }`}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
