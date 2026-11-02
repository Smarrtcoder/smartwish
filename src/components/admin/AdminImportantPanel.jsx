import AdminStatCard from "@/components/admin/AdminStatCard";
import { IMPORTANT_EVENT_LABELS, formatDateTime, labelFor, shortId } from "@/lib/adminFormat";

const CARDS = [
  { label: "Section opened", key: "opened" },
  { label: "Unique openers", key: "unique_openers" },
  { label: "Password correct", key: "password_success" },
  { label: "Password incorrect", key: "password_failure" },
  { label: "Personal page viewed", key: "personal_viewed" },
  { label: "Poll viewed", key: "poll_viewed" },
  { label: "Poll submitted", key: "poll_submitted" },
];

export default function AdminImportantPanel({ important }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {CARDS.map((card) => (
          <AdminStatCard key={card.key} label={card.label} value={important.summary[card.key]} />
        ))}
      </div>

      <section>
        <h2 className="text-lg font-semibold text-white">Recent activity</h2>
        <p className="mt-1 text-sm text-slate-400">The most recent 500 events, newest first.</p>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Visitor</th>
                <th className="px-4 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {important.events.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                    No activity yet.
                  </td>
                </tr>
              )}
              {important.events.map((row) => (
                <tr key={row.id} className="text-slate-200">
                  <td className="px-4 py-3">{labelFor(IMPORTANT_EVENT_LABELS, row.eventType)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{shortId(row.anonId)}</td>
                  <td className="px-4 py-3">{formatDateTime(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
