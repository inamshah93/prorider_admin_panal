const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("velo_token")
}

export function setToken(token: string) {
  localStorage.setItem("velo_token", token)
}

export function clearToken() {
  localStorage.removeItem("velo_token")
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message)
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  }

  if (token) {
    ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(body?.message ?? res.statusText, res.status, body)
  }

  return res.json() as Promise<T>
}
