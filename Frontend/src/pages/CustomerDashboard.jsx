import { Camera, MessageSquare, Star, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { postJson } from "../services/api";

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star size={24} className={n <= value ? "fill-amber-400 text-rose-700" : "text-slate-300"} />
        </button>
      ))}
    </div>
  );
}

export default function CustomerDashboard({ issueForm, onIssueFormChange, onSubmitIssue }) {
  const [tab, setTab] = useState("review");
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
    <section className="max-w-xl mx-auto space-y-4">
      <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1">
        <TabBtn active={tab === "review"} onClick={() => setTab("review")} icon={<MessageSquare size={15} />} label="Leave a Review" />
        <TabBtn active={tab === "complaint"} onClick={() => setTab("complaint")} icon={<TriangleAlert size={15} />} label="Make a Complaint" />
      </div>

      {tab === "review" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3">
          <h2 className="text-lg font-semibold">Leave a Review</h2>
          {submitted && <p className="text-sm text-green-600 font-medium">Thank you for your review! ✓</p>}
          <form onSubmit={handleReviewSubmit} className="space-y-3">
            <input
              className="w-full border rounded-2xl p-3"
              placeholder="Your name (optional)"
              value={reviewForm.guestName}
              onChange={(e) => setReviewForm({ ...reviewForm, guestName: e.target.value })}
            />
            <input
              className="w-full border rounded-2xl p-3"
              placeholder="Room (e.g. Room101)"
              value={reviewForm.roomCode}
              onChange={(e) => setReviewForm({ ...reviewForm, roomCode: e.target.value })}
              required
            />
            <div className="border rounded-2xl p-3 space-y-1">
              <p className="text-sm text-slate-500">Overall rating</p>
              <StarRating value={reviewForm.rating} onChange={(n) => setReviewForm({ ...reviewForm, rating: n })} />
            </div>
            <textarea
              className="w-full border rounded-2xl p-3"
              placeholder="Share your experience..."
              rows={4}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              required
            />
            <button className="w-full bg-[#0F111A] text-white py-3 rounded-2xl font-semibold">Submit Review</button>
          </form>
        </div>
      )}

      {tab === "complaint" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3">
          <h2 className="text-lg font-semibold">Make a Complaint</h2>
          <form onSubmit={onSubmitIssue} className="space-y-3">
            <input
              className="w-full border rounded-2xl p-3"
              placeholder="Location (e.g. Room101)"
              value={issueForm.location}
              onChange={(e) => onIssueFormChange({ ...issueForm, location: e.target.value })}
              required
            />
            <textarea
              className="w-full border rounded-2xl p-3"
              placeholder="Describe your complaint..."
              rows={4}
              value={issueForm.description}
              onChange={(e) => onIssueFormChange({ ...issueForm, description: e.target.value })}
              required
            />
            <label className="border rounded-2xl p-3 flex items-center gap-2 cursor-pointer text-slate-500 hover:bg-slate-50">
              <Camera size={18} /> Attach a photo (optional)
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onIssueFormChange({ ...issueForm, image: e.target.files?.[0] || null })} />
            </label>
            {issueForm.image && <p className="text-sm text-slate-600">{issueForm.image.name}</p>}
            <button className="w-full bg-red-600 text-white py-3 rounded-2xl font-semibold hover:bg-red-700">Submit Complaint</button>
          </form>
        </div>
      )}
    </section>
  );
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
        active ? "bg-[#F7B955] text-slate-950 shadow" : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {icon} {label}
    </button>
  );
}
