import { Camera, AlertCircle } from "lucide-react";
import { useState } from "react";
import Badge from "./Badge";
import OverdueBadge, { TASK_SLA_MS } from "./OverdueBadge";
import { API_BASE_URL } from "../services/api";

const MAX_PHOTO_AGE_MS = 2 * 60 * 1000; // 2 minutes

export default function WorkerTaskCard({ task, onComplete }) {
  const [file, setFile] = useState(null);
  const [warning, setWarning] = useState("");

  function handleFileChange(e) {
    const selected = e.target.files?.[0] || null;
    setWarning("");
    setFile(null);

    if (!selected) return;

    const ageMs = Date.now() - selected.lastModified;
    if (ageMs > MAX_PHOTO_AGE_MS) {
      setWarning("This photo appears to be older than 2 minutes. Please take a new photo right now.");
      e.target.value = "";
      return;
    }

    setFile(selected);
  }

  function handleComplete() {
    if (!file) return alert("Please take a photo first.");
    onComplete(task.id, file);
    setFile(null);
    setWarning("");
  }

  const startTime = task.assignedAt || task.createdAt;

  return (
    <div className={`bg-white border rounded-3xl p-4 ${
      task.status === "pending" ? "border-slate-200" : "border-slate-200"
    }`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-950">{task.title}</p>
          <p className="text-sm text-slate-600">{task.roomCode}</p>
          {task.notes && <p className="text-sm text-slate-500 mt-1">{task.notes}</p>}
        </div>
        <Badge value={task.status} />
      </div>

      {task.status === "pending" && (
        <div className="mt-2">
          <OverdueBadge isoDate={startTime} slaMs={TASK_SLA_MS} />
        </div>
      )}

      {task.status === "pending" ? (
        <div className="mt-4 space-y-2">
          <label className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-50 transition">
            <Camera size={22} className="text-slate-400" />
            <p className="text-sm font-medium text-slate-600">
              {file ? file.name : "Take a photo now"}
            </p>
            <p className="text-xs text-slate-400">Must be taken live — no uploads from gallery</p>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {warning && (
            <div className="flex items-start gap-2 rounded-2xl bg-rose-50 border border-rose-200 px-3 py-2.5">
              <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700">{warning}</p>
            </div>
          )}

          <button
            onClick={handleComplete}
            disabled={!file}
            className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-40"
          >
            Mark Complete
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-1">
          <p className="text-sm text-emerald-700 font-semibold">✓ Completed</p>
          {task.proofImageUrl && (
            <a
              className="text-sm text-sky-600 font-medium"
              target="_blank"
              rel="noreferrer"
              href={`${API_BASE_URL}${task.proofImageUrl}`}
            >
              View proof photo
            </a>
          )}
        </div>
      )}
    </div>
  );
}
