"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useMemo, useState } from "react"
import { adminApi } from "@/lib/api/admin"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { StatusBadge } from "@/components/shared/status-badge"

export function OrdersPage() {
  const [status, setStatus] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const params = useMemo(() => {
    const p: { status?: string; search?: string; page?: number } = { page }
    if (status) p.status = status
    if (search.trim()) p.search = search.trim()
    return p
  }, [status, search, page])

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => adminApi.orders(params),
  })

  const orders = data?.data ?? []
  const meta = data?.meta

  const filteredTotalCod = useMemo(() => {
    return orders.reduce((sum: number, o: any) => sum + (Number(o?.cod_amount) || 0), 0)
  }, [orders])

  function exportCsv() {
    const header = ["Reference", "Customer", "City", "COD", "Status"]
    const rows = orders.map((o) => [
      o.order_reference_number,
      o.customer_name,
      o.target_city ?? "",
      String(o.cod_amount),
      o.order_status,
    ])
    const csv = [header, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orders-page-${page}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
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
          onClick={exportCsv}
          disabled={orders.length === 0}
          className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={() => {
            setSearch("")
            setStatus("")
            setPage(1)
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
            <span className="text-muted-foreground">Total COD (this page)</span>
            <span className="font-medium">₨ {filteredTotalCod.toLocaleString("en-PK")}</span>
          </div>
          <PaginationControls page={page} meta={meta} isLoading={isLoading} onPageChange={setPage} />
        </div>
      )}
      </div>
    </div>
  )
}
