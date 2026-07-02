"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useMemo, useState } from "react"
import { adminApi } from "@/lib/api/admin"
import { StatusBadge } from "@/components/shared/status-badge"

export function OrdersPage() {
  const [status, setStatus] = useState("")
  const [search, setSearch] = useState("")

  const params = useMemo(() => {
    const p: { status?: string; search?: string } = {}
    if (status) p.status = status
    if (search.trim()) p.search = search.trim()
    return p
  }, [status, search])

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => adminApi.orders(params),
  })

  const orders = data?.data ?? []

  const filteredTotalCod = useMemo(() => {
    return orders.reduce((sum: number, o: any) => sum + (Number(o?.cod_amount) || 0), 0)
  }, [orders])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by reference or customer…"
          className="min-w-[220px] flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="created">Created</option>
          <option value="ready_to_ship">Ready to ship</option>
          <option value="dispatched">Dispatched</option>
          <option value="picked_up">Picked up</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          type="button"
          onClick={() => {
            setSearch("")
            setStatus("")
          }}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        >
          Clear
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card">
      {isLoading ? (
        <p className="p-6 text-muted-foreground">Loading orders…</p>
      ) : (
        <div>
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">COD</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border/60">
                  <td className="px-4 py-3 font-mono">
                    <Link href={`/orders/${o.id}`} className="text-primary hover:underline">
                      {o.order_reference_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{o.customer_name}</td>
                  <td className="px-4 py-3">{o.target_city ?? "—"}</td>
                  <td className="px-4 py-3">₨ {Number(o.cod_amount).toLocaleString("en-PK")}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.order_status.replace(/_/g, " ") as never} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
            <span className="text-muted-foreground">Total (filtered)</span>
            <span className="font-medium">₨ {filteredTotalCod.toLocaleString("en-PK")}</span>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
