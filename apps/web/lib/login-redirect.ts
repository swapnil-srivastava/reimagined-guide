// Remembers which page someone was on when they went to log in, so /enter can
// send them back there afterwards. Only same-site paths are ever accepted, so
// /enter?next=... can't be used to bounce people to another website.

const STORAGE_KEY = "login-return-to";
// OAuth and magic-link logins leave the site and come back to /enter, so the
// path is also kept in localStorage. Old entries are ignored after this long.
const MAX_AGE_MS = 30 * 60 * 1000;
const BASE = "http://same-site.invalid";

export function safeReturnPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  if (/[\u0000-\u001f\u007f]/.test(value)) return null;
  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE) return null;
    if (url.pathname === "/enter") return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

// Link to the login page that returns to `returnTo` afterwards
export function loginHref(returnTo?: string): string {
  const path = safeReturnPath(returnTo);
  return path && path !== "/" ? `/enter?next=${encodeURIComponent(path)}` : "/enter";
}

export function rememberReturnPath(path: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ path, at: Date.now() }));
  } catch {
    // Storage blocked: the ?next= query still covers password logins
  }
}

export function clearReturnPath(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// Returns the remembered path (if still fresh) and forgets it
export function takeReturnPath(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    if (!raw) return null;
    const { path, at } = JSON.parse(raw);
    if (typeof at !== "number" || Date.now() - at > MAX_AGE_MS) return null;
    return safeReturnPath(path);
  } catch {
    return null;
  }
}
