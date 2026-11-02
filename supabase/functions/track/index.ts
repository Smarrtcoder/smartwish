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

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const POLL_OPTIONS = ["keep", "let_go"];
const IMPORTANT_EVENTS = ["opened", "password_success", "password_failure", "personal_viewed"];
const DEVICE_CATEGORIES = ["mobile", "tablet", "desktop", "unknown"];

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

const isUuid = (value: unknown): value is string =>
  typeof value === "string" && UUID_PATTERN.test(value);

function requireIds(body: Record<string, unknown>) {
  if (!isUuid(body.anonId) || !isUuid(body.sessionId)) {
    throw new RequestError(400, "Invalid visitor details.");
  }
  return { anonId: body.anonId, sessionId: body.sessionId };
}

function sanitizeDevice(raw: unknown) {
  const device = (raw ?? {}) as Record<string, unknown>;
  const text = (value: unknown) =>
    typeof value === "string" && value.length > 0 ? value.slice(0, 40) : "Unknown";
  const dimension = (value: unknown) =>
    Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 20000 ? value : null;
  const category = DEVICE_CATEGORIES.includes(device.category as string) ? device.category : "unknown";
  return {
    device_category: category as string,
    os: text(device.os),
    browser: text(device.browser),
    screen_width: dimension(device.screenWidth),
    screen_height: dimension(device.screenHeight),
  };
}

function isFlagOn(name: string) {
  return Deno.env.get(name) === "true";
}

async function notify(subject: string, lines: string[]) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("NOTIFY_EMAIL");
  if (!apiKey || !to) return;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: Deno.env.get("NOTIFY_FROM") ?? "Birthday Site <onboarding@resend.dev>",
        to: [to],
        subject,
        text: lines.join("\n"),
      }),
    });
    if (!response.ok) console.error("notification email rejected", response.status);
  } catch (cause) {
    console.error("notification email failed", cause);
  }
}

async function ensureVisitor(anonId: string) {
  const { data, error } = await supabase
    .from("visitors")
    .upsert({ anon_id: anonId, last_seen: new Date().toISOString() }, { onConflict: "anon_id", ignoreDuplicates: true })
    .select("anon_id");
  if (error) throw error;
  if (!data?.length) {
    const { error: touchError } = await supabase
      .from("visitors")
      .update({ last_seen: new Date().toISOString() })
      .eq("anon_id", anonId);
    if (touchError) throw touchError;
  }
  return data?.length > 0;
}

async function recordVisit(body: Record<string, unknown>) {
  const { anonId, sessionId } = requireIds(body);
  const device = sanitizeDevice(body.device);
  const isNewVisitor = await ensureVisitor(anonId);

  const { data: insertedSession, error: sessionError } = await supabase
    .from("visitor_sessions")
    .upsert({ id: sessionId, anon_id: anonId, ...device }, { onConflict: "id", ignoreDuplicates: true })
    .select("id");
  if (sessionError) throw sessionError;
  if (!insertedSession?.length) {
    const { error: touchError } = await supabase
      .from("visitor_sessions")
      .update({ last_active_at: new Date().toISOString(), ended_at: null })
      .eq("id", sessionId)
      .eq("anon_id", anonId);
    if (touchError) throw touchError;
  }

  const { error: visitError } = await supabase
    .from("site_visits")
    .insert({ anon_id: anonId, session_id: sessionId });
  if (visitError) throw visitError;

  if (isNewVisitor && isFlagOn("NOTIFY_NEW_VISITOR")) {
    await notify("New visitor on your birthday site", [
      `A new anonymous visitor arrived at ${new Date().toISOString()}.`,
      `Device: ${device.device_category}, ${device.os}, ${device.browser}.`,
    ]);
  }
  return { ok: true };
}

async function touchSession(body: Record<string, unknown>, ended: boolean) {
  const { anonId, sessionId } = requireIds(body);
  const now = new Date().toISOString();
  const update = ended ? { ended_at: now } : { last_active_at: now, ended_at: null };
  const { data, error } = await supabase
    .from("visitor_sessions")
    .update(update)
    .eq("id", sessionId)
    .eq("anon_id", anonId)
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new RequestError(404, "Session not found.");
  if (!ended) {
    const { error: visitorError } = await supabase
      .from("visitors")
      .update({ last_seen: now })
      .eq("anon_id", anonId);
    if (visitorError) throw visitorError;
  }
  return { ok: true };
}

async function recordImportantEvent(body: Record<string, unknown>) {
  const { anonId, sessionId } = requireIds(body);
  if (!IMPORTANT_EVENTS.includes(body.event as string)) {
    throw new RequestError(400, "Unknown event.");
  }
  const { error } = await supabase
    .from("important_events")
    .insert({ anon_id: anonId, session_id: sessionId, event_type: body.event });
  if (error) throw error;
  return { ok: true };
}

async function recordPollView(body: Record<string, unknown>) {
  const { anonId, sessionId } = requireIds(body);
  const { error: viewError } = await supabase
    .from("poll_events")
    .insert({ anon_id: anonId, session_id: sessionId, event_type: "viewed" });
  if (viewError) throw viewError;
  const { error: importantError } = await supabase
    .from("important_events")
    .insert({ anon_id: anonId, session_id: sessionId, event_type: "poll_viewed" });
  if (importantError) throw importantError;
  return { ok: true };
}

async function recordPollSelection(body: Record<string, unknown>) {
  const { anonId, sessionId } = requireIds(body);
  if (!POLL_OPTIONS.includes(body.option as string)) throw new RequestError(400, "Unknown option.");
  const { error } = await supabase.from("poll_events").insert({
    anon_id: anonId,
    session_id: sessionId,
    event_type: "option_selected",
    option: body.option,
  });
  if (error) throw error;
  return { ok: true };
}

async function currentPollChoice(anonId: string) {
  const { data, error } = await supabase
    .from("poll_responses")
    .select("option, confirmed_at")
    .eq("anon_id", anonId)
    .order("confirmed_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? { option: data.option as string, confirmedAt: data.confirmed_at as string } : null;
}

async function pollStatus(body: Record<string, unknown>) {
  if (!isUuid(body.anonId)) throw new RequestError(400, "Invalid visitor details.");
  return { current: await currentPollChoice(body.anonId) };
}

async function submitPoll(body: Record<string, unknown>) {
  const { anonId, sessionId } = requireIds(body);
  if (!POLL_OPTIONS.includes(body.option as string)) throw new RequestError(400, "Unknown option.");
  const option = body.option as string;

  const { data: session, error: sessionError } = await supabase
    .from("visitor_sessions")
    .select("device_category, os, browser, screen_width, screen_height")
    .eq("id", sessionId)
    .eq("anon_id", anonId)
    .maybeSingle();
  if (sessionError) throw sessionError;
  if (!session) throw new RequestError(404, "Session not found.");

  const previous = await currentPollChoice(anonId);
  if (previous && previous.option === option) {
    return { status: "unchanged", option };
  }

  const { data: selection, error: selectionError } = await supabase
    .from("poll_events")
    .select("created_at")
    .eq("anon_id", anonId)
    .eq("event_type", "option_selected")
    .eq("option", option)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (selectionError) throw selectionError;

  const isChange = previous !== null;
  const { error: insertError } = await supabase.from("poll_responses").insert({
    anon_id: anonId,
    session_id: sessionId,
    option,
    previous_option: previous?.option ?? null,
    is_change: isChange,
    selected_at: selection?.created_at ?? null,
    device_category: session.device_category,
    os: session.os,
    browser: session.browser,
    screen_width: session.screen_width,
    screen_height: session.screen_height,
  });
  if (insertError) throw insertError;

  const events = [{ anon_id: anonId, session_id: sessionId, event_type: "confirmation_submitted", option }];
  if (isChange) {
    events.push({ anon_id: anonId, session_id: sessionId, event_type: "response_changed", option });
  }
  const { error: eventError } = await supabase.from("poll_events").insert(events);
  if (eventError) throw eventError;
  const { error: importantError } = await supabase
    .from("important_events")
    .insert({ anon_id: anonId, session_id: sessionId, event_type: "poll_submitted" });
  if (importantError) throw importantError;

  const label = option === "keep" ? "Keep This Website" : "Let It Go";
  if (!isChange && isFlagOn("NOTIFY_POLL_SUBMIT")) {
    await notify("New poll response", [`A visitor chose: ${label}.`, `Submitted at ${new Date().toISOString()}.`]);
  }
  if (isChange && isFlagOn("NOTIFY_POLL_CHANGE")) {
    await notify("Poll response changed", [
      `A visitor changed their choice to: ${label}.`,
      `Changed at ${new Date().toISOString()}.`,
    ]);
  }

  return { status: isChange ? "changed" : "recorded", option };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const body = (await req.json()) as Record<string, unknown>;
    switch (body.action) {
      case "visit":
        return json(await recordVisit(body));
      case "heartbeat":
        return json(await touchSession(body, false));
      case "end":
        return json(await touchSession(body, true));
      case "important":
        return json(await recordImportantEvent(body));
      case "poll_view":
        return json(await recordPollView(body));
      case "poll_select":
        return json(await recordPollSelection(body));
      case "poll_status":
        return json(await pollStatus(body));
      case "poll_submit":
        return json(await submitPoll(body));
      default:
        return json({ error: "Unknown action." }, 400);
    }
  } catch (cause) {
    if (cause instanceof RequestError) return json({ error: cause.message }, cause.status);
    console.error("track failed", cause);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
