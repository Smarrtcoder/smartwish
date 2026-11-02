import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SESSION_HOURS = 12;
const LOGIN_WINDOW_MINUTES = 15;
const MAX_FAILED_LOGINS = 10;
const ACTIVE_WINDOW_SECONDS = 90;
const LIVE_WINDOW_HOURS = 24;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

class RequestError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function login(body: Record<string, unknown>) {
  if (typeof body.password !== "string" || body.password.length === 0 || body.password.length > 200) {
    throw new RequestError(400, "Enter the password.");
  }
  const expected = Deno.env.get("ADMIN_PASSWORD");
  if (!expected) {
    console.error("ADMIN_PASSWORD secret is not set");
    throw new RequestError(503, "Admin access is not configured yet.");
  }

  const windowStart = new Date(Date.now() - LOGIN_WINDOW_MINUTES * 60_000).toISOString();
  const { count, error: countError } = await supabase
    .from("admin_login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("succeeded", false)
    .gte("created_at", windowStart);
  if (countError) throw countError;
  if ((count ?? 0) >= MAX_FAILED_LOGINS) {
    throw new RequestError(429, "Too many failed attempts. Please wait a few minutes and try again.");
  }

  const matches = safeEqual(await sha256Hex(body.password), await sha256Hex(expected));
  const { error: attemptError } = await supabase.from("admin_login_attempts").insert({ succeeded: matches });
  if (attemptError) throw attemptError;
  if (!matches) throw new RequestError(401, "Incorrect password.");

  await supabase.from("admin_sessions").delete().lt("expires_at", new Date().toISOString());
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3_600_000).toISOString();
  const { error: sessionError } = await supabase
    .from("admin_sessions")
    .insert({ token_hash: await sha256Hex(token), expires_at: expiresAt });
  if (sessionError) throw sessionError;

  return { token, expiresAt };
}

async function requireAdmin(body: Record<string, unknown>) {
  const unauthorized = new RequestError(401, "Your session has ended. Please sign in again.");
  if (typeof body.token !== "string" || body.token.length !== 64) throw unauthorized;
  const { data, error } = await supabase
    .from("admin_sessions")
    .select("token_hash")
    .eq("token_hash", await sha256Hex(body.token))
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  if (!data) throw unauthorized;
  return data.token_hash as string;
}

async function logout(tokenHash: string) {
  const { error } = await supabase.from("admin_sessions").delete().eq("token_hash", tokenHash);
  if (error) throw error;
  return { ok: true };
}

async function countRows(table: string) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

async function dashboard() {
  const now = Date.now();
  const activeSince = new Date(now - ACTIVE_WINDOW_SECONDS * 1000).toISOString();
  const liveSince = new Date(now - LIVE_WINDOW_HOURS * 3_600_000).toISOString();

  const [
    totalVisits,
    uniqueVisitors,
    totalSessions,
    activeNow,
    pollSummary,
    liveSessions,
    visitCounts,
    visits,
    responses,
    pollEvents,
    importantSummary,
    importantEvents,
  ] = await Promise.all([
    countRows("site_visits"),
    countRows("visitors"),
    countRows("visitor_sessions"),
    supabase
      .from("visitor_sessions")
      .select("id", { count: "exact", head: true })
      .gte("last_active_at", activeSince)
      .then(({ count, error }) => {
        if (error) throw error;
        return count ?? 0;
      }),
    supabase.rpc("admin_poll_summary").then(({ data, error }) => {
      if (error) throw error;
      return data;
    }),
    supabase
      .from("visitor_sessions")
      .select("id, anon_id, started_at, last_active_at, ended_at, device_category, os, browser, visitors(first_seen)")
      .gte("last_active_at", liveSince)
      .order("last_active_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (error) throw error;
        return data ?? [];
      }),
    supabase.rpc("admin_visit_counts").then(({ data, error }) => {
      if (error) throw error;
      return data ?? [];
    }),
    supabase
      .from("site_visits")
      .select("id, anon_id, session_id, created_at, visitor_sessions(device_category, os, browser)")
      .order("created_at", { ascending: false })
      .limit(1000)
      .then(({ data, error }) => {
        if (error) throw error;
        return data ?? [];
      }),
    supabase
      .from("poll_responses")
      .select("id, anon_id, session_id, option, previous_option, is_change, selected_at, confirmed_at, device_category, os, browser, screen_width, screen_height")
      .order("confirmed_at", { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (error) throw error;
        return data ?? [];
      }),
    supabase
      .from("poll_events")
      .select("id, anon_id, session_id, event_type, option, created_at")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (error) throw error;
        return data ?? [];
      }),
    supabase.rpc("admin_important_summary").then(({ data, error }) => {
      if (error) throw error;
      return data;
    }),
    supabase
      .from("important_events")
      .select("id, anon_id, session_id, event_type, created_at")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (error) throw error;
        return data ?? [];
      }),
  ]);

  const visitsByVisitor = new Map<string, number>(
    visitCounts.map((row: { anon_id: string; visits: number }) => [row.anon_id, Number(row.visits)]),
  );

  return {
    generatedAt: new Date(now).toISOString(),
    overview: {
      totalVisits,
      uniqueVisitors,
      totalSessions,
      activeNow,
      pollResponses: pollSummary.total_responses,
      keepCount: pollSummary.current_keep,
      letGoCount: pollSummary.current_let_go,
    },
    live: liveSessions.map((session: Record<string, any>) => ({
      sessionId: session.id,
      anonId: session.anon_id,
      firstSeen: session.visitors?.first_seen ?? null,
      sessionStart: session.started_at,
      lastActivity: session.last_active_at,
      status: Date.parse(session.last_active_at) >= now - ACTIVE_WINDOW_SECONDS * 1000 ? "active" : "inactive",
      totalVisits: visitsByVisitor.get(session.anon_id) ?? 0,
      deviceCategory: session.device_category,
      os: session.os,
      browser: session.browser,
    })),
    visits: visits.map((visit: Record<string, any>) => {
      const session = Array.isArray(visit.visitor_sessions) ? visit.visitor_sessions[0] : visit.visitor_sessions;
      return {
        id: visit.id,
        anonId: visit.anon_id,
        sessionId: visit.session_id,
        visitedAt: visit.created_at,
        deviceCategory: session?.device_category ?? "unknown",
        os: session?.os ?? "Unknown",
        browser: session?.browser ?? "Unknown",
      };
    }),
    polls: {
      summary: pollSummary,
      responses: responses.map((row: Record<string, any>) => ({
        id: row.id,
        anonId: row.anon_id,
        sessionId: row.session_id,
        option: row.option,
        previousOption: row.previous_option,
        isChange: row.is_change,
        selectedAt: row.selected_at,
        confirmedAt: row.confirmed_at,
        deviceCategory: row.device_category,
        os: row.os,
        browser: row.browser,
        screenWidth: row.screen_width,
        screenHeight: row.screen_height,
      })),
      events: pollEvents.map((row: Record<string, any>) => ({
        id: row.id,
        anonId: row.anon_id,
        sessionId: row.session_id,
        eventType: row.event_type,
        option: row.option,
        createdAt: row.created_at,
      })),
    },
    important: {
      summary: importantSummary,
      events: importantEvents.map((row: Record<string, any>) => ({
        id: row.id,
        anonId: row.anon_id,
        sessionId: row.session_id,
        eventType: row.event_type,
        createdAt: row.created_at,
      })),
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const body = (await req.json()) as Record<string, unknown>;
    switch (body.action) {
      case "login":
        return json(await login(body));
      case "logout":
        return json(await logout(await requireAdmin(body)));
      case "data":
        await requireAdmin(body);
        return json(await dashboard());
      default:
        return json({ error: "Unknown action." }, 400);
    }
  } catch (cause) {
    if (cause instanceof RequestError) return json({ error: cause.message }, cause.status);
    console.error("admin request failed", cause);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
