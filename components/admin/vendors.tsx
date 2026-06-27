"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { useState } from "react"
import { adminApi } from "@/lib/api/admin"

export function Vendors() {
  const qc = useQueryClient()
  const [query, setQuery] = useState("")
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

  const merchants = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search vendors…"
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm"
        />
      </div>

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
