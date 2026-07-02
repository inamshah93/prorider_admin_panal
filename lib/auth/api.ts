import { api, clearToken, setToken } from "@/lib/api/client"

export type AuthUser = {
  id: number
  name: string
  email: string
  roles: string[]
  permissions: string[]
}

export async function login(phone: string, password: string) {
  const res = await api<{ token: string; user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone, password }),
  })
  setToken(res.token)
  return res.user
}

export async function logout() {
  try {
    await api("/auth/logout", { method: "POST" })
  } finally {
    clearToken()
  }
}

export async function fetchMe() {
  const res = await api<{ user: AuthUser }>("/auth/me")
  return res.user
}
