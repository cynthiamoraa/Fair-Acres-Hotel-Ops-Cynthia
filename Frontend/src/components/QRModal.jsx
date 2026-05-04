import QRCode from "qrcode";
import { useEffect, useRef } from "react";
import { Download, X } from "lucide-react";

export default function QRModal({ onClose }) {
  const canvasRef = useRef(null);
  const guestUrl = `${window.location.origin}/guest`;

  useEffect(() => {
    QRCode.toCanvas(canvasRef.current, guestUrl, { width: 260, margin: 2 });
  }, [guestUrl]);

  function handleDownload() {
    const link = document.createElement("a");
    link.download = "GuestPortal-QR.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-xs space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-950 text-lg">Guest Portal QR</p>
            <p className="text-xs text-slate-500">Print and place at reception or in rooms</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex justify-center rounded-2xl bg-slate-50 p-4">
          <canvas ref={canvasRef} />
        </div>

        <p className="text-xs text-slate-400 text-center break-all">{guestUrl}</p>

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#111827] text-white py-3 text-sm font-semibold hover:bg-slate-800"
        >
          <Download size={16} /> Download PNG
        </button>
      </div>
    </div>
  );
}
