import { Building2, Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { postJson, API_URL } from "../services/api";

export default function ManagerLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      console.log('Attempting login to:', `${API_URL}/auth/manager/login`);
      const res = await postJson("/auth/manager/login", { password });
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      setLoading(false);
      if (!res.ok) return setError(data.error || "Login failed.");
      localStorage.setItem("mgr_auth", "1");
      onLogin();
    } catch (err) {
      setLoading(false);
      setError("Cannot connect to server. Please check your connection.");
      console.error("Login error:", err);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#BE185D]">
            <Building2 size={26} className="text-[#F7B955]" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-950">Manager Login</h1>
            <p className="text-sm text-slate-500 mt-1">Enter your password to access the dashboard</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={show ? "text" : "password"}
              className="h-12 w-full rounded-xl border border-slate-200 pl-9 pr-10 text-sm outline-none focus:border-slate-400"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button disabled={loading}
            className="w-full h-12 rounded-xl bg-[#BE185D] text-white font-semibold text-sm hover:bg-pink-700 disabled:opacity-50">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
