export function parseRoles(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    if (raw.includes("[") || raw.includes("{")) return [];
    return raw
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean);
  }
}

export function loadRoles(storage: Storage = localStorage): string[] {
  const raw = storage.getItem("roles");
  if (!raw) return [];
  return parseRoles(raw);
}
