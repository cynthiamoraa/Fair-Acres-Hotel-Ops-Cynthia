import { useState } from "react";
import { postForm } from "./services/api";
import CustomerDashboard from "./pages/CustomerDashboard";

export default function GuestApp() {
  const locationFromQuery = new URLSearchParams(window.location.search).get("location") || "";
  const [issueForm, setIssueForm] = useState({ location: locationFromQuery, description: "", image: null });

  async function submitIssue(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("location", issueForm.location);
    formData.append("description", issueForm.description);
    if (issueForm.image) formData.append("image", issueForm.image);

    const response = await postForm("/issues", formData);
    const data = await response.json();

    if (!response.ok) return alert(data.error || "Submission failed.");

    alert("Your complaint has been submitted. Thank you.");
    setIssueForm((c) => ({ ...c, description: "", image: null }));
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-slate-950">
      <header className="bg-[#111827] text-white px-6 py-4 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#F7B955] text-slate-950 font-bold text-sm">FA</div>
        <div>
          <p className="font-bold leading-tight">Fair Acres</p>
          <p className="text-xs text-slate-400">Guest Portal</p>
        </div>
      </header>

      <main className="p-4 md:p-8">
        <CustomerDashboard issueForm={issueForm} onIssueFormChange={setIssueForm} onSubmitIssue={submitIssue} />
      </main>
    </div>
  );
}
