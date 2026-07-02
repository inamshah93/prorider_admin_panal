"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useState } from "react"
import { adminApi } from "@/lib/api/admin"
import { api } from "@/lib/api/client"
import { StatusBadge } from "@/components/shared/status-badge"

export function Riders() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [cityId, setCityId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPhone, setEditPhone] = useState("")

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

  const toggleOnline = useMutation({
    mutationFn: ({ id, is_online }: { id: number; is_online: boolean }) => adminApi.updateRiderOnline(id, is_online),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["riders"] }),
    onError: (e: Error) => setError(e.message),
  })

  const updateUser = useMutation({
    mutationFn: () => {
      if (!editingId) throw new Error("No rider selected")
      return adminApi.updateRiderUser(editingId, { name: editName, email: editEmail, phone: editPhone })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["riders"] })
      setEditingId(null)
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
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Rider</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Cash to collect</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="px-4 py-3 font-medium">{r.user?.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.user?.phone ?? "—"}</td>
                  <td className="px-4 py-3">{r.assigned_city ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleOnline.mutate({ id: r.id, is_online: !r.is_online })}
                      className="hover:opacity-90"
                      title="Toggle online status"
                    >
                      <StatusBadge status={r.is_online ? "Active" : "Inactive"} />
                    </button>
                  </td>
                  <td className="px-4 py-3">₨ {Number(r.cash_in_hand ?? 0).toLocaleString("en-PK")}</td>
                  <td className="px-4 py-3">{((r.effective_commission_rate ?? 0.05) * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => {
                        setEditingId(r.id)
                        setEditName(r.user?.name ?? "")
                        setEditEmail(r.user?.email ?? "")
                        setEditPhone(r.user?.phone ?? "")
                      }}
                    >
                      Edit
                    </button>
                    <Link href={`/riders/${r.id}`} className="text-primary hover:underline">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingId && (
        <form
          className="rounded-2xl border border-border bg-card p-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            setError(null)
            updateUser.mutate()
          }}
        >
          <h2 className="font-semibold">Edit rider</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Full name"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              required
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="Email"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              required
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="Phone"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={updateUser.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {updateUser.isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-lg border border-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
