import AdminStatCard from "@/components/admin/AdminStatCard";
import {
  POLL_EVENT_LABELS,
  POLL_OPTION_LABELS,
  formatDateTime,
  labelFor,
  shortId,
} from "@/lib/adminFormat";

const tableClass = "min-w-full text-left text-sm";
const headClass = "bg-slate-900 text-slate-400";
const thClass = "px-4 py-3 font-medium";
const tdClass = "px-4 py-3";

function OptionBar({ label, count, percent, color }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm text-slate-200">
        <span>{label}</span>
        <span className="tabular-nums">
          {count} ({percent}%)
        </span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function AdminPollPanel({ polls }) {
  const { summary, responses, events } = polls;
  const keep = summary.current_keep ?? 0;
  const letGo = summary.current_let_go ?? 0;
  const currentTotal = keep + letGo;
  const percentOf = (count) => (currentTotal ? Math.round((count / currentTotal) * 100) : 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <AdminStatCard label="Poll views" value={summary.views} />
        <AdminStatCard label="Selections" value={summary.selections} />
        <AdminStatCard label="Responders" value={summary.responders} />
        <AdminStatCard label="Total submissions" value={summary.total_responses} />
        <AdminStatCard label="Changed choices" value={summary.total_changes} />
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-white">Current choices</h2>
        <p className="mt-1 text-sm text-slate-400">Each visitor counted once, using their latest confirmed choice.</p>
        <div className="mt-5 space-y-5">
          <OptionBar label={POLL_OPTION_LABELS.keep} count={keep} percent={percentOf(keep)} color="bg-emerald-400" />
          <OptionBar label={POLL_OPTION_LABELS.let_go} count={letGo} percent={percentOf(letGo)} color="bg-sky-400" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Responses</h2>
        <p className="mt-1 text-sm text-slate-400">
          Every confirmed submission, newest first. The most recent 500 are shown.
        </p>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-800">
          <table className={tableClass}>
            <thead className={headClass}>
              <tr>
                <th className={thClass}>Visitor</th>
                <th className={thClass}>Choice</th>
                <th className={thClass}>Previous</th>
                <th className={thClass}>Selected at</th>
                <th className={thClass}>Confirmed at</th>
                <th className={thClass}>Device</th>
                <th className={thClass}>OS</th>
                <th className={thClass}>Browser</th>
                <th className={thClass}>Screen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {responses.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-slate-400">
                    No responses yet.
                  </td>
                </tr>
              )}
              {responses.map((row) => (
                <tr key={row.id} className="text-slate-200">
                  <td className={`${tdClass} font-mono text-xs`}>{shortId(row.anonId)}</td>
                  <td className={tdClass}>{labelFor(POLL_OPTION_LABELS, row.option)}</td>
                  <td className={tdClass}>{row.previousOption ? labelFor(POLL_OPTION_LABELS, row.previousOption) : "-"}</td>
                  <td className={tdClass}>{formatDateTime(row.selectedAt)}</td>
                  <td className={tdClass}>{formatDateTime(row.confirmedAt)}</td>
                  <td className={tdClass}>{row.deviceCategory ?? "-"}</td>
                  <td className={tdClass}>{row.os ?? "-"}</td>
                  <td className={tdClass}>{row.browser ?? "-"}</td>
                  <td className={tdClass}>
                    {row.screenWidth && row.screenHeight ? `${row.screenWidth} x ${row.screenHeight}` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Event history</h2>
        <p className="mt-1 text-sm text-slate-400">Views, selections, and confirmations, newest first.</p>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-800">
          <table className={tableClass}>
            <thead className={headClass}>
              <tr>
                <th className={thClass}>Event</th>
                <th className={thClass}>Choice</th>
                <th className={thClass}>Visitor</th>
                <th className={thClass}>When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {events.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    No events yet.
                  </td>
                </tr>
              )}
              {events.map((row) => (
                <tr key={row.id} className="text-slate-200">
                  <td className={tdClass}>{labelFor(POLL_EVENT_LABELS, row.eventType)}</td>
                  <td className={tdClass}>{row.option ? labelFor(POLL_OPTION_LABELS, row.option) : "-"}</td>
                  <td className={`${tdClass} font-mono text-xs`}>{shortId(row.anonId)}</td>
                  <td className={tdClass}>{formatDateTime(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
