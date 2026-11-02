import AdminStatCard from "@/components/admin/AdminStatCard";

const CARDS = [
  { label: "Total visits", key: "totalVisits" },
  { label: "Unique visitors", key: "uniqueVisitors" },
  { label: "Total sessions", key: "totalSessions" },
  { label: "Active now", key: "activeNow" },
  { label: "Poll responses", key: "pollResponses" },
  { label: "Keep This Website", key: "keepCount" },
  { label: "Let It Go", key: "letGoCount" },
];

export default function AdminOverview({ overview }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {CARDS.map((card) => (
        <AdminStatCard key={card.key} label={card.label} value={overview[card.key]} />
      ))}
    </div>
  );
}
