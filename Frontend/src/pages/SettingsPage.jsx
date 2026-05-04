import { Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { API_URL } from "../services/api";

export default function SettingsPage({ workers, onWorkersChange }) {
  const [hotelName, setHotelName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState("");
  const [adding, setAdding] = useState(false);

  function handleSaveGeneral(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleAddWorker(e) {
    e.preventDefault();
    if (!newWorkerName.trim()) return;
    setAdding(true);
    await fetch(`${API_URL}/workers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newWorkerName.trim() }),
    });
    setNewWorkerName("");
    setAdding(false);
    onWorkersChange();
  }

  async function handleRemoveWorker(id) {
    if (!window.confirm("Remove this worker?")) return;
    await fetch(`${API_URL}/workers/${id}`, { method: "DELETE" });
    onWorkersChange();
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-slate-500">Workspace</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Settings</h2>
      </div>

      {/* General */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-950">General</h3>
        <form onSubmit={handleSaveGeneral} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hotel Name</label>
            <input
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact Email</label>
            <input
              type="email"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="h-11 px-6 rounded-xl bg-[#111827] text-white text-sm font-semibold hover:bg-slate-800">
              Save Changes
            </button>
            {saved && <p className="text-sm text-emerald-600 font-medium">Saved ✓</p>}
          </div>
        </form>
      </div>

      {/* Workers */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-950">Housekeeping Team</h3>

        <div className="space-y-2">
          {workers.map((w) => (
            <div key={w.id} className="flex items-center justify-between rounded-xl bg-[#FAFBFD] border border-slate-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                  {w.name.slice(0, 1)}
                </div>
                <p className="text-sm font-semibold text-slate-900">{w.name}</p>
              </div>
              <button
                onClick={() => handleRemoveWorker(w.id)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddWorker} className="flex gap-2">
          <input
            className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
            placeholder="New worker name"
            value={newWorkerName}
            onChange={(e) => setNewWorkerName(e.target.value)}
          />
          <button
            disabled={adding}
            className="h-11 px-4 rounded-xl bg-[#F7B955] text-slate-950 text-sm font-semibold hover:bg-[#f4ad35] disabled:opacity-50 flex items-center gap-2"
          >
            <UserPlus size={16} /> Add
          </button>
        </form>
      </div>
    </section>
  );
}
