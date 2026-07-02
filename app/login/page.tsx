"use client"

import { useState } from "react"
import { Truck } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"

export default function LoginPage() {
  const { login } = useAuth()
  const [phone, setPhone] = useState("03001234567")
  const [password, setPassword] = useState("password")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(phone, password)
    } catch {
      setError("Invalid credentials. Try 03001234567 / password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Truck className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Velo Admin</h1>
            <p className="text-sm text-muted-foreground">Sign in to continue</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03001234567"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  )
}
