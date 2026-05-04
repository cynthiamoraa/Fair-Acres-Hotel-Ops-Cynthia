import { useState } from "react";
import { X } from "lucide-react";
import { API_URL } from "../services/api";

const floors = [1, 2, 3, 4];

export default function AddRoomModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ code: "", floor: 1, status: "available" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`${API_URL}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, floor: Number(form.floor) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Failed to add room.");
    onAdded();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-950">Add New Room</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
            placeholder="Room code (e.g. Room301)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
          <select
            className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
            value={form.floor}
            onChange={(e) => setForm({ ...form, floor: e.target.value })}
          >
            {floors.map((f) => <option key={f} value={f}>Floor {f}</option>)}
          </select>
          <select
            className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#111827] text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Adding…" : "Add Room"}
          </button>
        </form>
      </div>
    </div>
  );
}
