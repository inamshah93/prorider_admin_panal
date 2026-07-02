"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { adminApi } from "@/lib/api/admin"
import { StatusBadge } from "@/components/shared/status-badge"

export function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => adminApi.orders(),
  })

  const orders = data?.data ?? []

  return (
    <div className="rounded-2xl border border-border bg-card">
      {isLoading ? (
        <p className="p-6 text-muted-foreground">Loading orders…</p>
      ) : (
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
      )}
    </div>
  )
}
