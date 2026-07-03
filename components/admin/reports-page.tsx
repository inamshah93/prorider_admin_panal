"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { adminApi } from "@/lib/api/admin"

function money(value: string | number | undefined) {
  return `₨ ${Number(value ?? 0).toLocaleString("en-PK")}`
}

export function ReportsPage() {
  const dayEnd = useQuery({
    queryKey: ["reports-day-end"],
    queryFn: () => adminApi.reportsDayEnd(14),
  })

  const riders = useQuery({
    queryKey: ["reports-riders"],
    queryFn: () => adminApi.reportsRiders(),
  })

  const analytics = useQuery({
    queryKey: ["reports-analytics"],
    queryFn: () => adminApi.reportsAnalytics(),
  })

  const snapshots = dayEnd.data?.data ?? []
  const riderRows = riders.data?.data ?? []
  const a = analytics.data?.data

  return (
    <div className="space-y-6">
      {a && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Delivered today", value: a.delivered_today },
            { label: "Failed (7d)", value: a.failed_last_7_days },
            { label: "Returned RTO (7d)", value: a.returned_last_7_days },
            { label: "Avg rating", value: a.average_delivery_rating ?? "—" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-2xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Day-end snapshots (last 14 days)</h2>
        <p className="mt-1 text-sm text-muted-foreground">COD collected, rider cash, payables, and net profit per day.</p>

        {dayEnd.isLoading ? (
          <p className="mt-4 text-muted-foreground">Loading…</p>
        ) : snapshots.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No snapshots yet. Run day-end accounting on the backend.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">COD collected</th>
                  <th className="pb-2">Rider cash</th>
                  <th className="pb-2">Merchant payables</th>
                  <th className="pb-2">Net profit</th>
                  <th className="pb-2">Delivered</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="py-2 pr-3">{row.snapshot_date}</td>
                    <td className="py-2 pr-3">{money(row.total_cod_collected)}</td>
                    <td className="py-2 pr-3">{money(row.total_rider_cash)}</td>
                    <td className="py-2 pr-3">{money(row.total_merchant_payables)}</td>
                    <td className="py-2 pr-3 font-medium">{money(row.platform_net_profit)}</td>
                    <td className="py-2">{row.orders_delivered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Rider performance</h2>
        <p className="mt-1 text-sm text-muted-foreground">Collections, commission earned, and settlements per rider.</p>

        {riders.isLoading ? (
          <p className="mt-4 text-muted-foreground">Loading…</p>
        ) : riderRows.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No riders found.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2">Rider</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Cash in hand</th>
                  <th className="pb-2">Collected</th>
                  <th className="pb-2">Commission</th>
                  <th className="pb-2">Settled</th>
                </tr>
              </thead>
              <tbody>
                {riderRows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-2 pr-3">
                      <Link href={`/riders/${r.id}`} className="font-medium text-primary hover:underline">
                        {r.name}
                      </Link>
                      {r.phone && <p className="text-xs text-muted-foreground">{r.phone}</p>}
                    </td>
                    <td className="py-2 pr-3">{r.is_online ? "Online" : "Offline"}</td>
                    <td className="py-2 pr-3">{money(r.cash_in_hand)}</td>
                    <td className="py-2 pr-3">{money(r.total_collected)}</td>
                    <td className="py-2 pr-3">{money(r.total_commission_earned)}</td>
                    <td className="py-2">{money(r.total_settled)}</td>
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
