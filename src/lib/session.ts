const SESSION_KEY = "nexus-session";

export type UserSession = { name: string; email: string };

export function getSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as unknown;
    if (o && typeof o === "object" && "email" in o && "name" in o) {
      const { email, name } = o as { email: string; name: string };
      if (typeof email === "string" && typeof name === "string") return { email, name };
    }
    return null;
  } catch {
    return null;
  }
}

export function setSession(session: UserSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim() || "User";
  return (
    local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ") || "User"
  );
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}
