const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function verifyImportantPassword(attempt) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_important_password`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ attempt }),
  });
  if (!response.ok) throw new Error(`Password check failed (${response.status})`);
  const result = await response.json();
  if (typeof result !== "boolean") throw new Error("Unexpected password check response");
  return result;
}
