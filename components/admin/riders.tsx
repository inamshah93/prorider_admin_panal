"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Bike, Plus } from "lucide-react"
import { useState } from "react"
import { adminApi } from "@/lib/api/admin"
import { api } from "@/lib/api/client"

export function Riders() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [cityId, setCityId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["riders"],
    queryFn: () => adminApi.riders(),
  })

  const { data: citiesData } = useQuery({
    queryKey: ["cities"],
    queryFn: () => api<{ data: { id: number; name: string }[] }>("/admin/cities"),
  })

  const createRider = useMutation({
    mutationFn: () =>
      adminApi.createRider({
        name,
        email,
        phone,
        password,
        assigned_city_id: cityId ? Number(cityId) : null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["riders"] })
      setShowForm(false)
      setName("")
      setEmail("")
      setPhone("")
      setPassword("")
      setCityId("")
      setError(null)
    },
    onError: (e: Error) => setError(e.message),
  })

  const riders = data?.data ?? []
  const cities = citiesData?.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Riders are created by admin only — they cannot self-register.</p>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          <Plus className="size-4" />
          Add rider
        </button>
      </div>

      {showForm && (
        <form
          className="rounded-2xl border border-border bg-card p-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            setError(null)
            createRider.mutate()
          }}
        >
          <h2 className="font-semibold">New rider</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 8 chars)"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2"
            >
              <option value="">Assigned city (optional)</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createRider.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {createRider.isPending ? "Creating…" : "Create rider"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Loading riders…</p>
      ) : riders.length === 0 ? (
        <p className="text-muted-foreground">No riders yet. Add one above.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {riders.map((r) => (
            <Link
              key={r.id}
              href={`/riders/${r.id}`}
              className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bike className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">{r.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{r.assigned_city ?? "Unassigned"}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Remaining to pay</p>
                  <p className="font-medium">₨ {Number(r.cash_in_hand).toLocaleString("en-PK")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Commission</p>
                  <p className="font-medium">{((r.effective_commission_rate ?? 0.05) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
