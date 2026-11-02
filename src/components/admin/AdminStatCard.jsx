export default function AdminStatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-white">{value ?? 0}</p>
    </div>
  );
}
