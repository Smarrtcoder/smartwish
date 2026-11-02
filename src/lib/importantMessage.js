import { callImportantRpc } from "@/lib/importantRpc";

export const MESSAGE_MAX_LENGTH = 4000;

export async function fetchImportantMessage(password) {
  const body = await callImportantRpc("get_important_personal_message", { attempt: password });
  if (typeof body !== "string") throw new Error("Unexpected message response");
  return body;
}

export async function saveImportantMessage(password, body) {
  const saved = await callImportantRpc("save_important_personal_message", { attempt: password, new_body: body });
  if (saved !== true) throw new Error("Unexpected save response");
}
