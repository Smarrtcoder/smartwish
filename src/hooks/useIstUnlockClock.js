import { useEffect, useState } from "react";

// IST is UTC+05:30 with no daylight saving, so a fixed offset is timezone-independent.
export const IMPORTANT_UNLOCK_AT_MS = Date.parse("2027-02-04T00:00:00+05:30");

export function useIstUnlockClock() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  return {
    remainingMs: Math.max(0, IMPORTANT_UNLOCK_AT_MS - now),
    unlocked: now >= IMPORTANT_UNLOCK_AT_MS,
  };
}
