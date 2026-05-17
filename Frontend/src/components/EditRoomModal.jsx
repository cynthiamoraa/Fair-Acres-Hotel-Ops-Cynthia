import { useState } from "react";
import { X } from "lucide-react";
import { patchJson } from "../services/api";

const floors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const roomTypes = ["Single", "Double", "Suite", "Deluxe", "Presidential"];

export default function EditRoomModal({ room, onClose, onUpdated }) {
  const [form, setForm] = useState({
    code: room.code || "",
    floor: room.floor || 1,
    status: room.status || "available",
    type: room.type || "Single",
    beds: room.beds || 1,
    notes: room.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(ev) {
    ev.preventDefault();
    setError("");
    setLoading(true);
    const res = await patchJson(`/rooms/${room.id}`, {
      ...form,
      floor: Number(form.floor),
      beds: Number(form.beds),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Failed to update room.");
    onUpdated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-950">Edit Room</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Room Code</label>
            <input
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Floor</label>
              <select
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
              >
                {floors.map((f) => <option key={f} value={f}>Floor {f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
              <select
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Room Type</label>
              <select
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {roomTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Beds</label>
              <input
                type="number"
                min={1}
                max={10}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                value={form.beds}
                onChange={(e) => setForm({ ...form, beds: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes</label>
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 resize-none"
              rows={3}
              placeholder="Special notes about this room..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <button
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#BE185D] text-white text-sm font-semibold hover:bg-[#9F1239] disabled:opacity-50"
          >
            {loading ? "Updating…" : "Update Room"}
          </button>
        </form>
      </div>
    </div>
  );
}
