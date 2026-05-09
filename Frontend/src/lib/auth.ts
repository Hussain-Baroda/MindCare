import { api } from "./api";

export type User = { id: string; name: string; email: string };

export async function signup(
  name: string,
  email: string,
  password: string,
  trustedContact?: { name: string; email: string }
) {
  const res = await api.post("/api/auth/signup", {
    name,
    email,
    password,
    trustedContactName: trustedContact?.name,
    trustedContactEmail: trustedContact?.email,
  });
  localStorage.setItem("token", res.data.token);
  return res.data.user as User;
}

export async function login(email: string, password: string) {
  const res = await api.post("/api/auth/login", { email, password });
  localStorage.setItem("token", res.data.token);
  return res.data.user as User;
}

export async function getMe() {
  const res = await api.get("/api/auth/me");
  return res.data.user as User;
}

export function logout() {
  localStorage.removeItem("token");
}
