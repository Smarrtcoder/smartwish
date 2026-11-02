import { useState } from "react";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getAdminSession } from "@/lib/adminApi";

export default function AdminPage() {
  const [session, setSession] = useState(getAdminSession);

  if (session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <AdminDashboard session={session} onSessionEnded={() => setSession(null)} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-slate-100">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <AdminLogin onSuccess={setSession} />
      </div>
    </div>
  );
}
