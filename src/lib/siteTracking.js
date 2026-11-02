const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const VISITOR_KEY = "arshia-visitor-id";
const SESSION_KEY = "arshia-session-id";
const HEARTBEAT_MS = 30_000;

function storedId(storage, key) {
  try {
    let id = storage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      storage.setItem(key, id);
    }
    return id;
  } catch {
    return null;
  }
}

export function getTrackingIds() {
  const anonId = storedId(window.localStorage, VISITOR_KEY);
  const sessionId = storedId(window.sessionStorage, SESSION_KEY);
  return anonId && sessionId ? { anonId, sessionId } : null;
}

function detectDevice() {
  const ua = navigator.userAgent || "";
  let category = "desktop";
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobi/i.test(ua))) category = "tablet";
  else if (/Mobi|iPhone|iPod|Android|IEMobile|Opera Mini/i.test(ua)) category = "mobile";

  let os = "Unknown";
  if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/CrOS/i.test(ua)) os = "ChromeOS";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "Other";
  if (/SamsungBrowser/i.test(ua)) browser = "Samsung Internet";
  else if (/Edg(e|A|iOS)?\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/Firefox|FxiOS/i.test(ua)) browser = "Firefox";
  else if (/Chrome|CriOS|Chromium/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua)) browser = "Safari";

  return {
    category,
    os,
    browser,
    screenWidth: window.screen?.width ?? null,
    screenHeight: window.screen?.height ?? null,
  };
}

export async function callTrack(action, payload = {}, { keepalive = false } = {}) {
  const ids = getTrackingIds();
  if (!ids) throw new Error("Browser storage is unavailable.");
  const response = await fetch(`${SUPABASE_URL}/functions/v1/track`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, ...ids, ...payload }),
    keepalive,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`);
  return data;
}

export function sendTracking(action, payload, options) {
  return callTrack(action, payload, options).catch(() => null);
}

export function trackImportantEvent(event) {
  return sendTracking("important", { event });
}

export function startVisitTracking() {
  if (!getTrackingIds()) return () => {};

  let timer = null;
  const beat = () => sendTracking("heartbeat");
  const stopBeating = () => {
    clearInterval(timer);
    timer = null;
  };
  const startBeating = () => {
    stopBeating();
    timer = setInterval(beat, HEARTBEAT_MS);
  };
  const onVisibility = () => {
    if (document.visibilityState === "visible") {
      beat();
      startBeating();
    } else {
      stopBeating();
    }
  };
  const onPageHide = () => {
    stopBeating();
    sendTracking("end", {}, { keepalive: true });
  };

  sendTracking("visit", { device: detectDevice() });
  if (document.visibilityState === "visible") startBeating();
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", onPageHide);

  return () => {
    stopBeating();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", onPageHide);
  };
}
