"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { adminApi } from "@/lib/api/admin"
import { StatusBadge } from "@/components/shared/status-badge"

export function RiderDetail() {
  const params = useParams()
  const riderId = Number(params.id)
  const qc = useQueryClient()

  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [proof, setProof] = useState<File | null>(null)
  const [commissionPercent, setCommissionPercent] = useState("")
  const [ordersStatus, setOrdersStatus] = useState<string>("")
  const [ordersPage, setOrdersPage] = useState(1)

  const wallet = useQuery({
    queryKey: ["rider-wallet", riderId],
    queryFn: () => adminApi.riderWallet(riderId),
    enabled: !!riderId,
  })

  const orderStats = useQuery({
    queryKey: ["rider-orders-stats", riderId],
    queryFn: () => adminApi.riderOrdersStats(riderId),
    enabled: !!riderId,
  })

  const orders = useQuery({
    queryKey: ["rider-orders", riderId, ordersStatus, ordersPage],
    queryFn: () => adminApi.riderOrders(riderId, { status: ordersStatus || undefined, page: ordersPage }),
    enabled: !!riderId,
  })

  const settlements = useQuery({
    queryKey: ["rider-settlements", riderId],
    queryFn: () => adminApi.riderSettlements(riderId),
    enabled: !!riderId,
  })

  const record = useMutation({
    mutationFn: () => {
      const form = new FormData()
      form.append("amount", amount)
      if (notes) form.append("notes", notes)
      if (proof) form.append("proof_image", proof)
      return adminApi.recordRiderSettlement(riderId, form)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rider-wallet", riderId] })
      qc.invalidateQueries({ queryKey: ["rider-settlements", riderId] })
      qc.invalidateQueries({ queryKey: ["riders"] })
      setAmount("")
      setNotes("")
      setProof(null)
    },
  })

  const updateCommission = useMutation({
    mutationFn: () =>
      adminApi.updateRiderCommission(
        riderId,
        commissionPercent === "" ? null : Number(commissionPercent),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rider-wallet", riderId] }),
  })

  const w = wallet.data?.data
  const stats = orderStats.data?.data
  const ordersList = orders.data?.data ?? []

  return (
    <div className="space-y-6">
      <Link href="/riders" className="text-sm text-primary hover:underline">
        ← Back to riders
      </Link>

      {wallet.isLoading ? (
        <p className="text-muted-foreground">Loading wallet…</p>
      ) : w ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total orders", value: stats?.total ?? "—" },
              { label: "Delivered", value: stats?.delivered ?? "—" },
              { label: "Returned", value: stats?.returned ?? "—" },
              { label: "Current status mix", value: stats ? Object.keys(stats.by_status ?? {}).length : "—" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-xl font-bold tabular-nums">{String(item.value)}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Remaining to pay", value: w.remaining_to_pay },
              { label: "Total collected", value: w.total_collected },
              { label: "Commission earned", value: w.total_commission_earned },
              { label: "Already settled", value: w.total_settled },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-xl font-bold">₨ {Number(item.value).toLocaleString("en-PK")}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Rider orders</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Orders assigned to this rider, with current status.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={ordersStatus}
                  onChange={(e) => {
                    setOrdersStatus(e.target.value)
                    setOrdersPage(1)
                  }}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">All statuses</option>
                  {Object.entries(stats?.by_status ?? {}).map(([k, v]) => (
                    <option key={k} value={k}>
                      {k.replace(/_/g, " ")} ({v})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
                  disabled={(orders.data?.meta?.page ?? ordersPage) <= 1 || orders.isLoading}
                  onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
                  disabled={ordersList.length === 0 || orders.isLoading}
                  onClick={() => setOrdersPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>

            {orders.isLoading ? (
              <p className="mt-4 text-muted-foreground">Loading orders…</p>
            ) : orders.isError ? (
              <p className="mt-4 text-destructive">Failed to load rider orders.</p>
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
                        <td className="py-2 text-right">₨ {Number(o.cod_amount ?? 0).toLocaleString("en-PK")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-semibold">Record rider payment</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload proof when rider remits cash to the company.
              </p>
              <div className="mt-4 space-y-3">
                <input
                  type="number"
                  placeholder="Amount (Rs)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                />
                <textarea
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                  rows={2}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProof(e.target.files?.[0] ?? null)}
                  className="w-full text-sm"
                />
                <button
                  type="button"
                  disabled={!amount || !proof || record.isPending}
                  onClick={() => record.mutate()}
                  className="w-full rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {record.isPending ? "Recording…" : "Record payment"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-semibold">Commission override</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Current effective rate: {((w.commission_rate ?? 0.05) * 100).toFixed(1)}%. Leave blank to use platform default.
              </p>
              <div className="mt-4 flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Commission %"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                  className="flex-1 rounded-xl border border-border px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => updateCommission.mutate()}
                  className="rounded-xl border border-border px-4 py-2 text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold">Settlement history</h2>
            <div className="mt-4 space-y-3">
              {(settlements.data?.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No settlements recorded yet.</p>
              ) : (
                (settlements.data?.data ?? []).map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">₨ {Number(s.amount).toLocaleString("en-PK")}</p>
                      <p className="text-muted-foreground">{s.notes ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{s.created_at}</p>
                    </div>
                    {s.proof_url && (
                      <a href={s.proof_url} target="_blank" rel="noreferrer" className="text-primary">
                        View proof
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
