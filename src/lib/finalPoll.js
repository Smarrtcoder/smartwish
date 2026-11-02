import { callTrack, sendTracking } from "@/lib/siteTracking";

const POLL_VALUES = ["keep", "let_go"];

export async function loadPollChoice() {
  const data = await callTrack("poll_status");
  const current = data?.current ?? null;
  if (current && !POLL_VALUES.includes(current.option)) throw new Error("Unexpected poll response");
  return current;
}

export function recordPollView() {
  return sendTracking("poll_view");
}

export function recordPollSelection(option) {
  return sendTracking("poll_select", { option });
}

export async function submitPollChoice(option) {
  const data = await callTrack("poll_submit", { option });
  if (!data || data.option !== option) throw new Error("Unexpected poll response");
  return data;
}
