import { jwtDecode } from "jwt-decode";

export const normalizeToken = (rawToken) => {
  if (!rawToken || typeof rawToken !== "string") return null;

  const trimmed = rawToken.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;

  return trimmed.startsWith("Bearer ") ? trimmed.slice(7).trim() : trimmed;
};

export const isJwtFormat = (token) => {
  const normalized = normalizeToken(token);
  if (!normalized) return false;

  const parts = normalized.split(".");
  return parts.length === 3 && parts.every((part) => part.length > 0);
};

export const getStoredToken = () => {
  const normalized = normalizeToken(localStorage.getItem("token"));
  return isJwtFormat(normalized) ? normalized : null;
};

export const getStoredUserNumber = () => {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded?.userNumber ?? null;
  } catch (error) {
    localStorage.removeItem("token");
    return null;
  }
};
