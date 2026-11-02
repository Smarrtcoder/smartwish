export const POLL_OPTION_LABELS = {
  keep: "Keep This Website",
  let_go: "Let It Go",
};

export const POLL_EVENT_LABELS = {
  viewed: "Poll viewed",
  option_selected: "Option selected",
  confirmation_submitted: "Choice confirmed",
  response_changed: "Choice changed",
};

export const IMPORTANT_EVENT_LABELS = {
  opened: "Section opened",
  password_success: "Password correct",
  password_failure: "Password incorrect",
  personal_viewed: "Personal page viewed",
  poll_viewed: "Poll viewed",
  poll_submitted: "Poll submitted",
};

export function labelFor(labels, key) {
  return labels[key] ?? String(key ?? "-").replaceAll("_", " ");
}

export function formatDateTime(iso) {
  if (!iso) return "-";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

export function localDateKey(iso) {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function shortId(id) {
  return typeof id === "string" ? id.slice(0, 8) : "-";
}
