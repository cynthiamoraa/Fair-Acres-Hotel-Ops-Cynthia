import { Camera } from "lucide-react";

export default function CustomerReportPage({ issueForm, onIssueFormChange, onSubmitIssue }) {
  return (
    <section className="max-w-xl mx-auto">
      <form onSubmit={onSubmitIssue} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3">
        <h2 className="text-lg font-semibold">Report an Issue</h2>
        <input
          className="w-full border rounded-2xl p-3"
          placeholder="Location (e.g. Room101)"
          value={issueForm.location}
          onChange={(e) => onIssueFormChange({ ...issueForm, location: e.target.value })}
          required
        />
        <textarea
          className="w-full border rounded-2xl p-3"
          placeholder="Describe the issue..."
          value={issueForm.description}
          onChange={(e) => onIssueFormChange({ ...issueForm, description: e.target.value })}
        />
        <label className="border rounded-2xl p-3 flex items-center gap-2 cursor-pointer">
          <Camera size={18} /> Optional photo
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onIssueFormChange({ ...issueForm, image: e.target.files?.[0] || null })} />
        </label>
        {issueForm.image && <p className="text-sm text-slate-600">{issueForm.image.name}</p>}
        <button className="w-full bg-[#0F111A] text-white py-3 rounded-2xl font-semibold">Submit Report</button>
      </form>
    </section>
  );
}
