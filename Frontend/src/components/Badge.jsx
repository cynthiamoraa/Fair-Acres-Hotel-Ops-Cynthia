const statusStyles = {
  available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  occupied: "bg-sky-100 text-sky-700 border-sky-200",
  maintenance: "bg-rose-100 text-rose-700 border-rose-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function Badge({ value }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
        statusStyles[value] || "bg-slate-100 text-slate-700 border-slate-200"
      }`}
    >
      {value}
    </span>
  );
}
