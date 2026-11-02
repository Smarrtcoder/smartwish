import { callImportantRpc } from "@/lib/importantRpc";

export async function verifyImportantPassword(attempt) {
  const result = await callImportantRpc("check_important_password", { attempt });
  if (typeof result !== "boolean") throw new Error("Unexpected password check response");
  return result;
}
