import { Eye, EyeOff, KeyRound, Trash2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteReq, fetchJson, patchJson, postJson } from "../services/api";

export default function SettingsPage({ workers, onWorkersChange }) {
  const [hotelName, setHotelName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerPin, setNewWorkerPin] = useState("");
  const [newWorkerTeam, setNewWorkerTeam] = useState("Housekeeping");
  const [showNewPin, setShowNewPin] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState("all");

  const [changingPinFor, setChangingPinFor] = useState(null);
  const [newPin, setNewPin] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    fetchJson("/settings").then((s) => {
      setHotelName(s.hotelName || "");
      setContactEmail(s.contactEmail || "");
    });
  }, []);

  async function handleSaveSettings(e) {
    e.preventDefault();
    await patchJson("/settings", { hotelName, contactEmail });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  }

  async function handleAddWorker(e) {
    e.preventDefault();
    if (!newWorkerName.trim()) return;
    if (newWorkerPin.length < 4) return alert("PIN must be at least 4 digits.");
    setAdding(true);
    const res = await postJson("/workers", {
      name: newWorkerName.trim(),
      pin: newWorkerPin,
      team: newWorkerTeam,
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) return alert(data.error || "Failed to add worker.");
    setNewWorkerName("");
    setNewWorkerPin("");
    setNewWorkerTeam("Housekeeping");
    onWorkersChange();
  }

  async function handleChangePin(workerId) {
    if (newPin.length < 4) return alert("PIN must be at least 4 digits.");
    const res = await patchJson(`/workers/${workerId}/pin`, { pin: newPin });
    if (!res.ok) return alert("Failed to update PIN.");
    setChangingPinFor(null);
    setNewPin("");
  }

  async function handleRemoveWorker(id) {
    if (!window.confirm("Remove this worker?")) return;
    await deleteReq(`/workers/${id}`);
    onWorkersChange();
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwMsg(null);
    const res = await postJson("/auth/manager/change-password", {
      currentPassword,
      newPassword,
    });
    const data = await res.json();
    if (!res.ok) return setPwMsg({ ok: false, text: data.error });
    setPwMsg({ ok: true, text: "Password changed successfully." });
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-slate-500">Workspace</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Settings
        </h2>
      </div>

      {/* General */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-950">General</h3>
        <form onSubmit={handleSaveSettings} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Hotel Name
            </label>
            <input
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Contact Email
            </label>
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
            {settingsSaved && (
              <p className="text-sm text-emerald-600 font-medium">Saved ✓</p>
            )}
          </div>
        </form>
      </div>

      {/* Manager Password */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-950">Manager Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <input
            type="password"
            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
            placeholder="New password (min 6 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          {pwMsg && (
            <p
              className={`text-sm font-medium ${
                pwMsg.ok ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {pwMsg.text}
            </p>
          )}
          <button className="h-11 px-6 rounded-xl bg-[#111827] text-white text-sm font-semibold hover:bg-slate-800">
            Change Password
          </button>
        </form>
      </div>

      {/* Workers */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-950">Team Members</h3>
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-slate-400"
          >
            <option value="all">All Teams</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Security">Security</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Front Desk">Front Desk</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          {workers
            .filter(
              (w) =>
                selectedTeamFilter === "all" || w.team === selectedTeamFilter
            )
            .map((w) => (
              <div
                key={w.id}
                className="rounded-xl bg-[#FAFBFD] border border-slate-200 px-4 py-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                      {w.name.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {w.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {w.team || "Housekeeping"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setChangingPinFor(
                          changingPinFor === w.id ? null : w.id
                        );
                        setNewPin("");
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                      title="Change PIN"
                    >
                      <KeyRound size={15} />
                    </button>
                    <button
                      onClick={() => handleRemoveWorker(w.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {changingPinFor === w.id && (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={8}
                      className="h-9 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                      placeholder="New PIN (min 4 digits)"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                    />
                    <button
                      onClick={() => handleChangePin(w.id)}
                      className="h-9 px-4 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-slate-800"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            ))}
          {!workers.length && (
            <p className="text-sm text-slate-500">No workers yet.</p>
          )}
          {workers.length > 0 &&
            workers.filter(
              (w) =>
                selectedTeamFilter === "all" || w.team === selectedTeamFilter
            ).length === 0 && (
              <p className="text-sm text-slate-500">No workers in this team.</p>
            )}
        </div>

        <form onSubmit={handleAddWorker} className="space-y-2">
          <input
            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
            placeholder="Worker name"
            value={newWorkerName}
            onChange={(e) => setNewWorkerName(e.target.value)}
          />
          <select
            value={newWorkerTeam}
            onChange={(e) => setNewWorkerTeam(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
          >
            <option value="Housekeeping">Housekeeping</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Security">Security</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Front Desk">Front Desk</option>
            <option value="Other">Other</option>
          </select>
          <div className="relative">
            <input
              type={showNewPin ? "text" : "password"}
              inputMode="numeric"
              maxLength={8}
              className="h-11 w-full rounded-xl border border-slate-200 px-4 pr-10 text-sm outline-none focus:border-slate-400"
              placeholder="Set PIN (min 4 digits)"
              value={newWorkerPin}
              onChange={(e) => setNewWorkerPin(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowNewPin((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showNewPin ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <button
            disabled={adding}
            className="h-11 w-full rounded-xl bg-[#F7B955] text-slate-950 text-sm font-semibold hover:bg-[#f4ad35] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <UserPlus size={16} /> Add Worker
          </button>
        </form>
      </div>
    </section>
  );
}
