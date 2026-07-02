"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useMemo, useState } from "react"
import { adminApi } from "@/lib/api/admin"
import { StatusBadge } from "@/components/shared/status-badge"

function money(value: string | number | undefined) {
  return `₨ ${Number(value ?? 0).toLocaleString("en-PK")}`
}

export function VendorDetail() {
  const params = useParams()
  const merchantId = Number(params.id)

  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)

  const merchant = useQuery({
    queryKey: ["merchant-detail", merchantId],
    queryFn: () => adminApi.merchant(merchantId),
    enabled: !!merchantId,
  })

  const stats = useQuery({
    queryKey: ["merchant-orders-stats", merchantId],
    queryFn: () => adminApi.merchantOrdersStats(merchantId),
    enabled: !!merchantId,
  })

  const listParams = useMemo(
    () => ({ status: status || undefined, page }),
    [status, page],
  )

  const orders = useQuery({
    queryKey: ["merchant-orders", merchantId, listParams],
    queryFn: () => adminApi.merchantOrders(merchantId, listParams),
    enabled: !!merchantId,
  })

  const s = stats.data?.data
  const ordersList = orders.data?.data ?? []
  const m = merchant.data?.data
  const ledger = merchant.data?.ledger ?? []

  return (
    <div className="space-y-6">
      <Link href="/vendors" className="text-sm text-primary hover:underline">
        ← Back to vendors
      </Link>

      {m && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h1 className="text-xl font-bold">{m.store_name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{m.user?.email}</p>
          <p className="mt-3 text-sm">
            Outstanding payables: <span className="font-semibold">{money(merchant.data?.payables)}</span>
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total orders", value: s?.total ?? "—" },
          { label: "Delivered", value: s?.delivered ?? "—" },
          { label: "Returned", value: s?.returned ?? "—" },
          { label: "Current status mix", value: s ? Object.keys(s.by_status ?? {}).length : "—" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-xl font-bold tabular-nums">{String(item.value)}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Financial ledger</h2>
        <p className="mt-1 text-sm text-muted-foreground">Recent payable and settlement entries.</p>
        {merchant.isLoading ? (
          <p className="mt-4 text-muted-foreground">Loading ledger…</p>
        ) : ledger.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No ledger entries yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Reference</th>
                  <th className="pb-2">Notes</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry) => (
                  <tr key={entry.id} className="border-t border-border">
                    <td className="py-2 pr-3 capitalize">{String(entry.entry_type).replace(/_/g, " ")}</td>
                    <td className="py-2 pr-3">{money(entry.amount)}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{entry.reference ?? "—"}</td>
                    <td className="py-2 pr-3">{entry.notes ?? "—"}</td>
                    <td className="py-2">{entry.created_at ? new Date(entry.created_at).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Vendor orders</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Orders created by this vendor, with current status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              {Object.entries(s?.by_status ?? {}).map(([k, v]) => (
                <option key={k} value={k}>
                  {k.replace(/_/g, " ")} ({v})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
              disabled={(orders.data?.meta?.page ?? page) <= 1 || orders.isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
              disabled={ordersList.length === 0 || orders.isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>

        {orders.isLoading ? (
          <p className="mt-4 text-muted-foreground">Loading orders…</p>
        ) : orders.isError ? (
          <p className="mt-4 text-destructive">Failed to load vendor orders.</p>
        ) : ordersList.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No orders found.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2">Order</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">City</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">COD</th>
                </tr>
              </thead>
              <tbody>
                {ordersList.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="py-2 pr-3 font-mono">
                      <Link href={`/orders/${o.id}`} className="text-primary hover:underline">
                        {o.order_reference_number}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">{o.customer_name}</td>
                    <td className="py-2 pr-3">{o.target_city ?? "—"}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={o.order_status.replace(/_/g, " ") as never} />
                    </td>
                    <td className="py-2 text-right">{money(o.cod_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
