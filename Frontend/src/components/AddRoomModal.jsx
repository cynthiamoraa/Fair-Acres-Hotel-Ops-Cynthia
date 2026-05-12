import { useState } from "react";
import { X } from "lucide-react";
import { postJson } from "../services/api";

const floors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function AddRoomModal({ onClose, onAdded }) {
  const [mode, setMode] = useState("bulk");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Single
  const [single, setSingle] = useState({ code: "", floor: 1, status: "available" });

  // Bulk
  const [bulk, setBulk] = useState({ prefix: "", floor: 1, from: "", to: "", status: "available" });

  // Preview codes for bulk
  const previewCodes = (() => {
    const s = Number(bulk.from);
    const e = Number(bulk.to);
    if (!bulk.prefix || isNaN(s) || isNaN(e) || s > e) return [];
    const count = Math.min(e - s + 1, 200);
    return Array.from({ length: count }, (_, i) => `${bulk.prefix}${s + i}`);
  })();

  async function handleSingle(ev) {
    ev.preventDefault();
    setError(""); setResult(null); setLoading(true);
    const res = await postJson("/rooms", { ...single, floor: Number(single.floor) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Failed to add room.");
    onAdded();
    onClose();
  }

  async function handleBulk(ev) {
    ev.preventDefault();
    setError(""); setResult(null);
    if (!bulk.prefix.trim()) return setError("Prefix is required.");
    if (!bulk.from || !bulk.to) return setError("From and To numbers are required.");
    if (Number(bulk.from) > Number(bulk.to)) return setError("'From' must be less than or equal to 'To'.");
    setLoading(true);
    const res = await postJson("/rooms/bulk", {
      prefix: bulk.prefix.trim(),
      floor: Number(bulk.floor),
      from: Number(bulk.from),
      to: Number(bulk.to),
      status: bulk.status,
    });
    let data = {};

    try {
      data = await res.json();
    } catch (err) {
      console.error("Invalid JSON response");
    }
    setLoading(false);
    if (!res.ok) return setError(data.error || "Failed to create rooms.");
    setResult(data);
    onAdded();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-950">Add Rooms</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {["bulk", "single"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); setResult(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
                ${mode === m ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {m === "bulk" ? "Bulk (Range)" : "Single Room"}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        {result && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 space-y-1">
            <p className="text-sm font-semibold text-emerald-700">✓ {result.created} room{result.created !== 1 ? "s" : ""} created</p>
            {result.skipped > 0 && (
              <p className="text-xs text-slate-500">{result.skipped} skipped (already exist): {result.skippedCodes.join(", ")}</p>
            )}
            <button onClick={onClose} className="mt-2 text-sm font-semibold text-emerald-700 underline">Close</button>
          </div>
        )}

        {/* ── BULK MODE ── */}
        {mode === "bulk" && !result && (
          <form onSubmit={handleBulk} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Room Prefix</label>
              <input className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                placeholder="e.g. Room, Suite, Apt"
                value={bulk.prefix} onChange={(e) => setBulk({ ...bulk, prefix: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">From #</label>
                <input type="number" min={1} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                  placeholder="101" value={bulk.from} onChange={(e) => setBulk({ ...bulk, from: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">To #</label>
                <input type="number" min={1} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                  placeholder="120" value={bulk.to} onChange={(e) => setBulk({ ...bulk, to: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Floor</label>
                <select className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                  value={bulk.floor} onChange={(e) => setBulk({ ...bulk, floor: e.target.value })}>
                  {floors.map((f) => <option key={f} value={f}>Floor {f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
                <select className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                  value={bulk.status} onChange={(e) => setBulk({ ...bulk, status: e.target.value })}>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            {/* Live preview */}
            {previewCodes.length > 0 && (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
                <p className="text-xs font-semibold text-slate-500 mb-2">Preview — {previewCodes.length} room{previewCodes.length !== 1 ? "s" : ""}</p>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-auto">
                  {previewCodes.map((c) => (
                    <span key={c} className="rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">{c}</span>
                  ))}
                </div>
              </div>
            )}

            <button disabled={loading || previewCodes.length === 0}
              className="w-full h-12 rounded-xl bg-[#111827] text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50">
              {loading ? "Creating…" : `Create ${previewCodes.length || ""} Room${previewCodes.length !== 1 ? "s" : ""}`}
            </button>
          </form>
        )}

        {/* ── SINGLE MODE ── */}
        {mode === "single" && (
          <form onSubmit={handleSingle} className="space-y-3">
            <input className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
              placeholder="Room code (e.g. Suite01)"
              value={single.code} onChange={(e) => setSingle({ ...single, code: e.target.value })} required />
            <select className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
              value={single.floor} onChange={(e) => setSingle({ ...single, floor: e.target.value })}>
              {floors.map((f) => <option key={f} value={f}>Floor {f}</option>)}
            </select>
            <select className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
              value={single.status} onChange={(e) => setSingle({ ...single, status: e.target.value })}>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <button disabled={loading}
              className="w-full h-12 rounded-xl bg-[#111827] text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50">
              {loading ? "Adding…" : "Add Room"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
