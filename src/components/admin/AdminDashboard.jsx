import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminLiveVisitors from "@/components/admin/AdminLiveVisitors";
import AdminVisitHistory from "@/components/admin/AdminVisitHistory";
import AdminPollPanel from "@/components/admin/AdminPollPanel";
import AdminImportantPanel from "@/components/admin/AdminImportantPanel";
import { AdminRequestError, adminLogout, fetchAdminData } from "@/lib/adminApi";
import { formatDateTime } from "@/lib/adminFormat";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "live", label: "Live visitors" },
  { id: "visits", label: "Visit history" },
  { id: "poll", label: "Poll" },
  { id: "important", label: "Important section" },
];

export default function AdminDashboard({ session, onSessionEnded }) {
  const [tab, setTab] = useState("overview");
  const query = useQuery({
    queryKey: ["admin-data", session.token],
    queryFn: () => fetchAdminData(session.token),
    refetchInterval: 30_000,
    retry: false,
  });
  const data = query.data;

  useEffect(() => {
    if (query.error instanceof AdminRequestError && query.error.status === 401) onSessionEnded();
  }, [query.error, onSessionEnded]);

  const handleLogout = async () => {
    await adminLogout(session.token);
    onSessionEnded();
  };

  let content;
  if (query.isPending) {
    content = <p className="text-slate-400">Loading the dashboard...</p>;
  } else if (query.isError) {
    content = (
      <div className="rounded-2xl border border-rose-900 bg-rose-950/40 p-6">
        <p className="text-rose-200">The dashboard could not be loaded. Please try again.</p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="mt-4 rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-100 transition-colors hover:bg-slate-800"
        >
          Try again
        </button>
      </div>
    );
  } else if (tab === "overview") {
    content = <AdminOverview overview={data.overview} />;
  } else if (tab === "live") {
    content = <AdminLiveVisitors live={data.live} />;
  } else if (tab === "visits") {
    content = <AdminVisitHistory visits={data.visits} />;
  } else if (tab === "poll") {
    content = <AdminPollPanel polls={data.polls} />;
  } else {
    content = <AdminImportantPanel important={data.important} />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Private Dashboard</h1>
          <p className="text-sm text-slate-400">
            {data ? `Updated ${formatDateTime(data.generatedAt)}` : "Loading..."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
            className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-100 transition-colors hover:bg-slate-800 disabled:opacity-60"
          >
            {query.isFetching ? "Refreshing..." : "Refresh"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-white"
          >
            Log out
          </button>
        </div>
      </header>

      <nav className="mt-6 flex gap-2 overflow-x-auto pb-1" aria-label="Dashboard sections">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? "page" : undefined}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
              tab === item.id
                ? "bg-amber-300 font-medium text-slate-950"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-6">{content}</div>
    </div>
  );
}
