import { useState } from "react";
import { Camera } from "lucide-react";
import Badge from "./Badge";
import { API_BASE_URL } from "../services/api";

export default function WorkerTaskCard({ task, onComplete }) {
  const [file, setFile] = useState(null);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4">
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="font-semibold">{task.title}</p>
          <p className="text-sm text-slate-600">{task.roomCode}</p>
          {task.notes && <p className="text-sm text-slate-500 mt-1">{task.notes}</p>}
        </div>
        <Badge value={task.status} />
      </div>

      {task.status === "pending" ? (
        <div className="mt-3 space-y-2">
          <label className="border rounded-2xl p-3 flex items-center gap-2 cursor-pointer text-sm">
            <Camera size={16} /> Upload completion proof
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          {file && <p className="text-xs text-slate-500">{file.name}</p>}
          <button onClick={() => onComplete(task.id, file)} className="w-full bg-emerald-600 text-white py-2.5 rounded-2xl font-semibold">
            Mark Complete
          </button>
        </div>
      ) : (
        <div className="mt-3 text-sm">
          <p className="text-emerald-700 font-medium">Completed</p>
          {task.proofImageUrl && (
            <a className="text-sky-600" target="_blank" rel="noreferrer" href={`${API_BASE_URL}${task.proofImageUrl}`}>
              View uploaded proof
            </a>
          )}
        </div>
      )}
    </div>
  );
}
