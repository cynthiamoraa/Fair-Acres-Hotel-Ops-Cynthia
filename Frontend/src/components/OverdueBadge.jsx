import { AlarmClock } from "lucide-react";

// SLA limits in milliseconds
export const TASK_SLA_MS = 2 * 60 * 60 * 1000;       // 2 hours
export const COMPLAINT_SLA_MS = 4 * 60 * 60 * 1000;  // 4 hours

export function isOverdue(isoDate, slaMs) {
  if (!isoDate) return false;
  return Date.now() - new Date(isoDate).getTime() > slaMs;
}

export function overdueBy(isoDate) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m overdue`;
  return `${m}m overdue`;
}

export default function OverdueBadge({ isoDate, slaMs }) {
  if (!isOverdue(isoDate, slaMs)) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-600 text-white text-xs font-bold px-2.5 py-0.5 animate-pulse">
      <AlarmClock size={11} />
      OVERDUE · {overdueBy(isoDate)}
    </span>
  );
}
