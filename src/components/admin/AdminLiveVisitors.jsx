import { formatDateTime } from "@/lib/adminFormat";

export default function AdminLiveVisitors({ live }) {
  const activeCount = live.filter((session) => session.status === "active").length;

  return (
    <section>
      <p className="text-sm text-slate-400">
        {activeCount} active now, {live.length} sessions in the last 24 hours. Active means seen in the last 90 seconds.
      </p>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Visitor</th>
              <th className="px-4 py-3 font-medium">Session started</th>
              <th className="px-4 py-3 font-medium">Last activity</th>
              <th className="px-4 py-3 font-medium">Visits</th>
              <th className="px-4 py-3 font-medium">Device</th>
              <th className="px-4 py-3 font-medium">OS</th>
              <th className="px-4 py-3 font-medium">Browser</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {live.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                  No visitors in the last 24 hours.
                </td>
              </tr>
            )}
            {live.map((session) => (
              <tr key={session.sessionId} className="text-slate-200">
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      session.status === "active"
                        ? "bg-emerald-400/15 text-emerald-300"
                        : "bg-slate-700/60 text-slate-300"
                    }`}
                  >
                    {session.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{session.anonId?.slice(0, 8)}</td>
                <td className="px-4 py-3">{formatDateTime(session.sessionStart)}</td>
                <td className="px-4 py-3">{formatDateTime(session.lastActivity)}</td>
                <td className="px-4 py-3 tabular-nums">{session.totalVisits}</td>
                <td className="px-4 py-3">{session.deviceCategory ?? "-"}</td>
                <td className="px-4 py-3">{session.os ?? "-"}</td>
                <td className="px-4 py-3">{session.browser ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
