import { useMemo, useState } from "react";
import { formatDateTime, localDateKey, shortId } from "@/lib/adminFormat";

const PAGE_SIZE = 200;
const inputClass =
  "rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300";

export default function AdminVisitHistory({ visits }) {
  const [sort, setSort] = useState("newest");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [visitorQuery, setVisitorQuery] = useState("");

  const rows = useMemo(() => {
    const query = visitorQuery.trim().toLowerCase();
    const filtered = visits.filter((visit) => {
      const day = localDateKey(visit.visitedAt);
      if (fromDate && day < fromDate) return false;
      if (toDate && day > toDate) return false;
      if (query && !String(visit.anonId).toLowerCase().includes(query)) return false;
      return true;
    });
    filtered.sort((a, b) => {
      const diff = Date.parse(a.visitedAt) - Date.parse(b.visitedAt);
      return sort === "newest" ? -diff : diff;
    });
    return filtered;
  }, [visits, sort, fromDate, toDate, visitorQuery]);

  const shown = rows.slice(0, PAGE_SIZE);

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={inputClass}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          From
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          To
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs text-slate-400">
          Visitor ID contains
          <input
            type="text"
            value={visitorQuery}
            onChange={(e) => setVisitorQuery(e.target.value)}
            placeholder="e.g. 3f2a"
            className={`${inputClass} font-mono`}
          />
        </label>
      </div>

      <p className="mt-4 text-sm text-slate-400">
        Showing {shown.length} of {rows.length} matching visits. The most recent 1,000 visits are loaded.
      </p>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Visited at</th>
              <th className="px-4 py-3 font-medium">Visitor</th>
              <th className="px-4 py-3 font-medium">Device</th>
              <th className="px-4 py-3 font-medium">OS</th>
              <th className="px-4 py-3 font-medium">Browser</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No visits match these filters.
                </td>
              </tr>
            )}
            {shown.map((visit) => (
              <tr key={visit.id} className="text-slate-200">
                <td className="px-4 py-3">{formatDateTime(visit.visitedAt)}</td>
                <td className="px-4 py-3 font-mono text-xs">{shortId(visit.anonId)}</td>
                <td className="px-4 py-3">{visit.deviceCategory}</td>
                <td className="px-4 py-3">{visit.os}</td>
                <td className="px-4 py-3">{visit.browser}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
