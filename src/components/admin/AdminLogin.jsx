import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { adminLogin } from "@/lib/adminApi";

const ERROR_TEXT = {
  401: "That password is not right.",
  429: "Too many attempts. Please wait a few minutes and try again.",
  503: "Private access is not available right now.",
};
const FALLBACK_ERROR = "Something went wrong. Please try again.";

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy || password.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const session = await adminLogin(password);
      onSuccess(session);
    } catch (cause) {
      setError(ERROR_TEXT[cause?.status] ?? FALLBACK_ERROR);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-white">Private Access</h2>
      <p className="mt-2 text-sm text-slate-400">Enter the access password to continue.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="relative">
          <input
            id="admin-password"
            type={show ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            autoComplete="off"
            autoFocus
            aria-invalid={error !== null}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-4 pr-12 text-base text-white placeholder:text-slate-500 outline-none transition-colors focus:border-amber-300"
          />
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-400 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={busy || password.length === 0}
          className="w-full rounded-xl bg-amber-300 px-4 py-3 font-medium text-slate-950 transition-colors hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Checking..." : "Enter Dashboard"}
        </button>
      </form>

      <p role="alert" className="mt-4 min-h-[1.5rem] text-sm text-rose-300">
        {error}
      </p>
    </div>
  );
}
