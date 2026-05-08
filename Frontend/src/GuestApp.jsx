import { useState } from "react";
import { postForm, fetchJson } from "./services/api";
import CustomerDashboard from "./pages/CustomerDashboard";
import { Building2, CheckCircle2, Clock, Search, Ticket } from "lucide-react";

export default function GuestApp() {
  const locationFromQuery = new URLSearchParams(window.location.search).get("location") || "";
  const [issueForm, setIssueForm] = useState({ location: locationFromQuery, description: "", image: null });
  const [ticket, setTicket] = useState(null); // set after successful complaint submission
  const [tab, setTab] = useState("portal"); // "portal" | "status"

  async function submitIssue(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("location", issueForm.location);
    formData.append("description", issueForm.description);
    if (issueForm.image) formData.append("image", issueForm.image);

    const response = await postForm("/issues", formData);
    const data = await response.json();

    if (!response.ok) return alert(data.error || "Submission failed.");

    setTicket(data.ticketNo);
    setIssueForm((c) => ({ ...c, description: "", image: null }));
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-slate-950">
      <header className="bg-[#BE185D] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#F9A8D4] text-[#BE185D] font-bold text-sm">FA</div>
          <div>
            <p className="font-bold leading-tight">Fair Acres</p>
            <p className="text-xs text-pink-200">Guest Portal</p>
          </div>
        </div>
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          <button onClick={() => { setTab("portal"); setTicket(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${tab === "portal" ? "bg-white text-[#BE185D]" : "text-white hover:bg-white/10"}`}>
            Portal
          </button>
          <button onClick={() => setTab("status")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${tab === "status" ? "bg-white text-[#BE185D]" : "text-white hover:bg-white/10"}`}>
            Check Ticket
          </button>
        </div>
      </header>

      <main className="p-4 md:p-8">
        {tab === "portal" && (
          ticket
            ? <TicketConfirmation ticketNo={ticket} onCheckStatus={() => setTab("status")} onNewComplaint={() => setTicket(null)} />
            : <CustomerDashboard issueForm={issueForm} onIssueFormChange={setIssueForm} onSubmitIssue={submitIssue} />
        )}
        {tab === "status" && <TicketStatus initialTicket={ticket} />}
      </main>
    </div>
  );
}

function TicketConfirmation({ ticketNo, onCheckStatus, onNewComplaint }) {
  return (
    <div className="max-w-md mx-auto mt-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 mx-auto">
        <CheckCircle2 size={32} className="text-emerald-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-950">Complaint Submitted</h2>
        <p className="text-sm text-slate-500 mt-1">Your complaint has been received. Please save your ticket number.</p>
      </div>
      <div className="rounded-2xl bg-pink-50 border border-pink-200 px-6 py-4">
        <p className="text-xs font-semibold text-pink-500 uppercase tracking-widest mb-1">Your Ticket Number</p>
        <p className="text-3xl font-bold text-[#BE185D] tracking-widest">{ticketNo}</p>
        <p className="text-xs text-slate-500 mt-2">Use this to check the status of your complaint</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onCheckStatus}
          className="flex-1 h-11 rounded-2xl bg-[#BE185D] text-white text-sm font-semibold hover:bg-pink-700 flex items-center justify-center gap-2">
          <Search size={15} /> Check Status
        </button>
        <button onClick={onNewComplaint}
          className="flex-1 h-11 rounded-2xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50">
          Done
        </button>
      </div>
    </div>
  );
}

function TicketStatus({ initialTicket }) {
  const [input, setInput] = useState(initialTicket || "");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLookup(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setError(""); setResult(null); setLoading(true);
    const data = await fetchJson(`/issues/ticket/${input.trim().toUpperCase()}`);
    setLoading(false);
    if (data.error) return setError(data.error);
    setResult(data);
  }

  const statusConfig = {
    open: { label: "Open — Being reviewed", color: "bg-rose-100 text-rose-700 border-rose-200", icon: <Clock size={16} /> },
    resolved: { label: "Resolved", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={16} /> },
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Ticket size={20} className="text-[#BE185D]" />
          <h2 className="font-bold text-slate-950">Check Ticket Status</h2>
        </div>
        <form onSubmit={handleLookup} className="flex gap-2">
          <input
            className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-pink-400 uppercase"
            placeholder="e.g. TKT-0001"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button disabled={loading}
            className="h-11 px-5 rounded-xl bg-[#BE185D] text-white text-sm font-semibold hover:bg-pink-700 disabled:opacity-50">
            {loading ? "…" : "Look up"}
          </button>
        </form>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>

      {result && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-bold text-slate-950 text-lg">{result.ticketNo}</p>
            <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig[result.status]?.color}`}>
              {statusConfig[result.status]?.icon}
              {statusConfig[result.status]?.label || result.status}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Location</span>
              <span className="font-medium text-slate-950">{result.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Submitted</span>
              <span className="font-medium text-slate-950">{new Date(result.createdAt).toLocaleString()}</span>
            </div>
            {result.resolvedAt && (
              <div className="flex justify-between">
                <span className="text-slate-500">Resolved</span>
                <span className="font-medium text-emerald-700">{new Date(result.resolvedAt).toLocaleString()}</span>
              </div>
            )}
            {result.description && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-slate-500 mb-1">Description</p>
                <p className="text-slate-700">{result.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
