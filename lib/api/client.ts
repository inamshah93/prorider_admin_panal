const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export type AuditMeta = {
  action: string
  entity?: string
  entityId?: string | number
  message?: string
  context?: Record<string, unknown>
}

type ApiOptions = RequestInit & {
  audit?: AuditMeta
}

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
  options: ApiOptions = {},
): Promise<T> {
  const token = getToken()
  const { audit, ...fetchOptions } = options
  const isFormData = typeof FormData !== "undefined" && fetchOptions.body instanceof FormData
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(fetchOptions.headers ?? {}),
  }

  if (token) {
    ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }

  if (audit) {
    ;(headers as Record<string, string>)["X-Audit-Action"] = audit.action
    if (audit.entity) (headers as Record<string, string>)["X-Audit-Entity"] = audit.entity
    if (audit.entityId !== undefined) (headers as Record<string, string>)["X-Audit-Entity-Id"] = String(audit.entityId)
    if (audit.message) (headers as Record<string, string>)["X-Audit-Message"] = audit.message
    if (audit.context) (headers as Record<string, string>)["X-Audit-Context"] = JSON.stringify(audit.context)
  }

  const res = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(body?.message ?? res.statusText, res.status, body)
  }

  return res.json() as Promise<T>
}
