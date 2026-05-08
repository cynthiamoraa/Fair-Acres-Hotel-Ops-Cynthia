import { Camera, MessageSquare, Sparkles, Star, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { postJson } from "../services/api";

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star size={24} className={n <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
        </button>
      ))}
    </div>
  );
}

export default function CustomerDashboard({ issueForm, onIssueFormChange, onSubmitIssue }) {
  const [tab, setTab] = useState("home");
  const [reviewForm, setReviewForm] = useState({ guestName: "", roomCode: "", rating: 0, comment: "" });
  const [submitted, setSubmitted] = useState(false);

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (reviewForm.rating === 0) return alert("Please select a star rating.");
    const res = await postJson("/reviews", reviewForm);
    if (!res.ok) return alert("Failed to submit review.");
    setSubmitted(true);
    setReviewForm({ guestName: "", roomCode: "", rating: 0, comment: "" });
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <section className="max-w-2xl mx-auto space-y-5">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Welcome to Fair Acres!</h1>
            <p className="text-pink-100 text-sm leading-relaxed max-w-md">
              We're delighted to have you as our guest. Your comfort is our priority. 
              Feel free to share feedback, request services, or report any concerns.
            </p>
          </div>
          <div className="hidden sm:block text-6xl opacity-20">🏨</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 bg-white border border-pink-100 rounded-2xl p-1.5 shadow-sm">
        <TabBtn active={tab === "home"} onClick={() => setTab("home")} label="Home" />
        <TabBtn active={tab === "review"} onClick={() => setTab("review")} label="Review" />
        <TabBtn active={tab === "complaint"} onClick={() => setTab("complaint")} label="Report" />
      </div>

      {/* Home Tab */}
      {tab === "home" && (
        <div className="space-y-4">
          {/* Quick Services */}
          <div className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Services</h2>
            <div className="grid grid-cols-2 gap-3">
              <ServiceCard title="WiFi" desc="Free high-speed internet" color="bg-pink-50 text-pink-600" />
              <ServiceCard title="Room Service" desc="Available 24/7" color="bg-rose-50 text-rose-600" />
              <ServiceCard title="Breakfast" desc="7:00 AM - 10:30 AM" color="bg-pink-50 text-pink-600" />
              <ServiceCard title="Concierge" desc="Call ext. 100" color="bg-rose-50 text-rose-600" />
            </div>
          </div>

          {/* Hotel Information */}
          <div className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Hotel Information</h2>
            <div className="space-y-3 text-sm">
              <InfoRow label="Check-out Time" value="11:00 AM" />
              <InfoRow label="Front Desk" value="24/7 Available" />
              <InfoRow label="Emergency" value="Dial 0 from room phone" />
              <InfoRow label="Housekeeping" value="Daily at 10:00 AM" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTab("review")}
              className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl p-4 text-left hover:shadow-lg transition">
              <p className="font-semibold">Leave Review</p>
              <p className="text-xs text-pink-100 mt-1">Share your experience</p>
            </button>
            <button
              onClick={() => setTab("complaint")}
              className="bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl p-4 text-left hover:shadow-lg transition">
              <p className="font-semibold">Report Issue</p>
              <p className="text-xs text-rose-100 mt-1">We'll fix it quickly</p>
            </button>
          </div>
        </div>
      )}

      {tab === "review" && (
        <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Leave a Review</h2>
            <p className="text-xs text-slate-500">Share your experience with us</p>
          </div>
          {submitted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-sm text-emerald-700 font-medium">
              ✓ Thank you for your review!
            </div>
          )}
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <input
              className="w-full border border-pink-200 rounded-2xl p-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              placeholder="Your name (optional)"
              value={reviewForm.guestName}
              onChange={(e) => setReviewForm({ ...reviewForm, guestName: e.target.value })}
            />
            <input
              className="w-full border border-pink-200 rounded-2xl p-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              placeholder="Room number (e.g. 101)"
              value={reviewForm.roomCode}
              onChange={(e) => setReviewForm({ ...reviewForm, roomCode: e.target.value })}
              required
            />
            <div className="border border-pink-200 rounded-2xl p-4 space-y-2 bg-pink-50/30">
              <p className="text-sm font-semibold text-slate-700">Overall rating</p>
              <StarRating value={reviewForm.rating} onChange={(n) => setReviewForm({ ...reviewForm, rating: n })} />
            </div>
            <textarea
              className="w-full border border-pink-200 rounded-2xl p-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              placeholder="Share your experience with us..."
              rows={4}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              required
            />
            <button className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition">Submit Review</button>
          </form>
        </div>
      )}

      {tab === "complaint" && (
        <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Report an Issue</h2>
            <p className="text-xs text-slate-500">We'll address it immediately</p>
          </div>
          <form onSubmit={onSubmitIssue} className="space-y-4">
            <input
              className="w-full border border-pink-200 rounded-2xl p-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              placeholder="Location (e.g. Room 101, Lobby, Pool)"
              value={issueForm.location}
              onChange={(e) => onIssueFormChange({ ...issueForm, location: e.target.value })}
              required
            />
            <textarea
              className="w-full border border-pink-200 rounded-2xl p-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              placeholder="Describe the issue in detail..."
              rows={4}
              value={issueForm.description}
              onChange={(e) => onIssueFormChange({ ...issueForm, description: e.target.value })}
              required
            />
            <label className="border border-pink-200 rounded-2xl p-4 flex items-center gap-3 cursor-pointer text-slate-600 hover:bg-pink-50 transition">
              <div className="flex-1">
                <p className="text-sm font-semibold">📷 Attach a photo</p>
                <p className="text-xs text-slate-400">Optional but helpful</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onIssueFormChange({ ...issueForm, image: e.target.files?.[0] || null })} />
            </label>
            {issueForm.image && (
              <div className="bg-pink-50 border border-pink-200 rounded-2xl p-3 text-sm text-pink-700">
                📎 {issueForm.image.name}
              </div>
            )}
            <button className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition">Submit Report</button>
          </form>
        </div>
      )}
    </section>
  );
}

function TabBtn({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
        active ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md" : "text-slate-500 hover:text-slate-800 hover:bg-pink-50"
      }`}
    >
      {label}
    </button>
  );
}

function ServiceCard({ title, desc, color }) {
  return (
    <div className={`${color} rounded-2xl p-4 space-y-2`}>
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs opacity-80">{desc}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-pink-50 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
