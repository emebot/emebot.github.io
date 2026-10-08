import { client } from "../client/client.gen";

const ACCESS_TOKEN_KEY = "majakka.access-token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

client.setConfig({
  baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  auth: () => getAccessToken() ?? undefined,
});
