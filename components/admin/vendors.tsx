"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { useState } from "react"
import { adminApi } from "@/lib/api/admin"

export function Vendors() {
  const qc = useQueryClient()
  const [query, setQuery] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [storeName, setStoreName] = useState("")
  const [contactName, setContactName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [createError, setCreateError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editCharge, setEditCharge] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["merchants", query],
    queryFn: () => adminApi.merchants(query),
  })

  const updateCharge = useMutation({
    mutationFn: ({ id, charge }: { id: number; charge: number | null }) =>
      adminApi.updateMerchantDeliveryCharge(id, charge),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["merchants"] })
      setEditingId(null)
    },
  })

  const createVendor = useMutation({
    mutationFn: () =>
      adminApi.createMerchant({
        name: contactName,
        email,
        phone: phone || undefined,
        store_name: storeName,
        password,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["merchants"] })
      setShowCreate(false)
      setStoreName("")
      setContactName("")
      setEmail("")
      setPhone("")
      setPassword("")
      setCreateError(null)
    },
    onError: (e: Error) => setCreateError(e.message),
  })

  const merchants = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vendors…"
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          {showCreate ? "Close" : "Add vendor"}
        </button>
      </div>

      {showCreate && (
        <form
          className="rounded-2xl border border-border bg-card p-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            setCreateError(null)
            createVendor.mutate()
          }}
        >
          <h2 className="font-semibold">New vendor</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Store name"
              className="rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Contact name"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
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
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 8 chars)"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          {createError && <p className="text-sm text-destructive">{createError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createVendor.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {createVendor.isPending ? "Creating…" : "Create vendor"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Loading vendors…</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Delivery charge</th>
                <th className="px-4 py-3">Orders</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m) => (
                <tr key={m.id} className="border-b border-border/60">
                  <td className="px-4 py-3 font-medium">{m.store_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.user?.email}</td>
                  <td className="px-4 py-3">
                    {editingId === m.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editCharge}
                          onChange={(e) => setEditCharge(e.target.value)}
                          className="w-24 rounded border border-border px-2 py-1"
                          placeholder="Default"
                        />
                        <button
                          type="button"
                          className="text-primary text-xs"
                          onClick={() =>
                            updateCharge.mutate({
                              id: m.id,
                              charge: editCharge === "" ? null : Number(editCharge),
                            })
                          }
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="text-left hover:text-primary"
                        onClick={() => {
                          setEditingId(m.id)
                          setEditCharge(m.delivery_charge != null ? String(m.delivery_charge) : "")
                        }}
                      >
                        ₨ {Number(m.effective_delivery_charge ?? m.delivery_charge ?? 400).toLocaleString("en-PK")}
                        {m.delivery_charge == null && (
                          <span className="ml-1 text-xs text-muted-foreground">(default)</span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">{m.orders_count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
