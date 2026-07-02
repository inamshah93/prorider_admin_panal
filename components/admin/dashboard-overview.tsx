"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Bike, PackageOpen, Banknote, ShieldCheck } from "lucide-react"
import { api } from "@/lib/api/client"
import { StatusBadge } from "@/components/shared/status-badge"

type DashboardData = {
  metrics: {
    active_riders: number
    live_orders: number
    cod_pending: number
    bank_approvals: number
    rider_payable_cash?: number
    merchant_payable_cash?: number
    net_profit?: number
  }
  recent_activity: Array<{
    id: number
    order_reference_number: string
    order_status: string
    target_city?: string
    created_at: string
  }>
  chart_data: Array<{ date: string; count: number }>
}

export function DashboardOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api<DashboardData>("/admin/dashboard"),
  })

  if (isLoading) return <p className="text-muted-foreground">Loading dashboard…</p>
  if (error || !data) return <p className="text-destructive">Failed to load dashboard.</p>

  const metrics: Array<{
    label: string
    value: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }> = [
    { label: "Active Riders", value: String(data.metrics.active_riders), href: "/riders", icon: Bike },
    { label: "Live Orders", value: String(data.metrics.live_orders), href: "/orders", icon: PackageOpen },
    { label: "COD Pending Cash", value: `₨ ${Number(data.metrics.cod_pending).toLocaleString("en-PK")}`, href: "/finance", icon: Banknote },
    { label: "Bank Approvals Pending", value: String(data.metrics.bank_approvals), href: "/finance", icon: ShieldCheck },
    {
      label: "Rider Payable Cash",
      value: `₨ ${Number(data.metrics.rider_payable_cash ?? 0).toLocaleString("en-PK")}`,
      href: "/riders",
      icon: Bike,
    },
    {
      label: "Vendor Payables",
      value: `₨ ${Number(data.metrics.merchant_payable_cash ?? 0).toLocaleString("en-PK")}`,
      href: "/vendors",
      icon: PackageOpen,
    },
    {
      label: "Net Profit",
      value: `₨ ${Number(data.metrics.net_profit ?? 0).toLocaleString("en-PK")}`,
      href: "/finance",
      icon: Banknote,
    },
  ]

  const maxBar = Math.max(...(data.chart_data.map((d) => d.count) || [1]), 1)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <Link
              key={m.label}
              href={m.href}
              className="group rounded-2xl border border-border bg-gradient-to-br from-accent/60 to-card p-5 transition hover:border-primary/40 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary/15">
                <Icon className="size-5" />
              </div>
              <p className="mt-4 text-2xl font-semibold tabular-nums">{m.value}</p>
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <p className="mt-3 text-xs text-primary/80 opacity-0 transition group-hover:opacity-100">
                View →
              </p>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Orders (14 days)</h2>
          <div className="mt-4 flex h-40 items-end gap-1">
            {data.chart_data.map((d) => (
              <div
                key={d.date}
                className="flex-1 rounded-t bg-primary/80"
                style={{ height: `${(d.count / maxBar) * 100}%`, minHeight: 4 }}
                title={`${d.date}: ${d.count}`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Recent activity</h2>
          <ul className="mt-4 space-y-3">
            {data.recent_activity.map((order) => (
              <li key={order.id} className="flex items-center justify-between text-sm">
                <Link href={`/orders/${order.id}`} className="font-mono text-primary hover:underline">
                  {order.order_reference_number}
                </Link>
                <StatusBadge status={order.order_status.replace(/_/g, " ") as never} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
