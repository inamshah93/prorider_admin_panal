"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import { ApiError } from "@/lib/api/client"
import {
  fetchMe,
  login as apiLogin,
  logout as apiLogout,
  type AuthUser,
} from "@/lib/auth/api"

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (phone: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (perm: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(
    async (phone: string, password: string) => {
      const u = await apiLogin(phone, password)
      setUser(u)
      router.push("/dashboard")
    },
    [router],
  )

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
    router.push("/login")
  }, [router])

  const hasPermission = useCallback(
    (perm: string) =>
      !!user?.permissions?.includes(perm) || !!user?.roles?.includes("SuperAdmin"),
    [user],
  )

  const value = useMemo(
    () => ({ user, loading, login, logout, hasPermission }),
    [user, loading, login, logout, hasPermission],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function useRequireAuth() {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.replace("/login")
    }
  }, [auth.loading, auth.user, router])

  return auth
}
