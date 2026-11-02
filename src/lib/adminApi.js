const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SESSION_KEY = "arshia-admin-session";

export class AdminRequestError extends Error {
  constructor(status) {
    super(`Admin request failed (${status})`);
    this.status = status;
  }
}

async function callAdmin(body) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/admin`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new AdminRequestError(response.status);
  return data;
}

export function clearAdminSession() {
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function getAdminSession() {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (
      typeof session?.token === "string" &&
      typeof session?.expiresAt === "string" &&
      Date.parse(session.expiresAt) > Date.now()
    ) {
      return session;
    }
  } catch {
    // unreadable stored session is discarded below
  }
  clearAdminSession();
  return null;
}

export async function adminLogin(password) {
  const data = await callAdmin({ action: "login", password });
  if (typeof data?.token !== "string" || typeof data?.expiresAt !== "string") {
    throw new AdminRequestError(500);
  }
  const session = { token: data.token, expiresAt: data.expiresAt };
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function adminLogout(token) {
  clearAdminSession();
  await callAdmin({ action: "logout", token }).catch(() => null);
}

export async function fetchAdminData(token) {
  const data = await callAdmin({ action: "data", token });
  if (
    !data?.overview ||
    !data.polls ||
    !data.important ||
    !Array.isArray(data.live) ||
    !Array.isArray(data.visits)
  ) {
    throw new AdminRequestError(500);
  }
  return data;
}
