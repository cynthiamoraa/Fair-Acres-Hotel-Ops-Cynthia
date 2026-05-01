const views = ["manager", "worker", "customer"];

export default function MobileNav({ activeView, onChangeView }) {
  return (
    <div className="md:hidden flex gap-2 mb-4">
      {views.map((view) => (
        <button
          key={view}
          onClick={() => onChangeView(view)}
          className={`px-4 py-2 rounded-2xl text-sm font-semibold ${
            activeView === view ? "bg-[#0F111A] text-white" : "bg-white border border-slate-200"
          }`}
        >
          {view}
        </button>
      ))}
    </div>
  );
}
