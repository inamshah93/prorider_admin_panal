"use client"

import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { useState } from "react"
import { api } from "@/lib/api/client"

type Merchant = {
  id: number
  store_name: string
  shopify_shop_url?: string
  orders_count?: number
  user?: { name: string; email: string }
}

export function Vendors() {
  const [query, setQuery] = useState("")
  const { data, isLoading } = useQuery({
    queryKey: ["merchants", query],
    queryFn: () => api<{ data: Merchant[] }>(`/admin/merchants?search=${encodeURIComponent(query)}`),
  })

  const merchants = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vendors…"
            className="w-72 rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm"
          />
        </div>
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
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Shopify</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m) => (
                <tr key={m.id} className="border-b border-border/60">
                  <td className="px-4 py-3 font-medium">{m.store_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.user?.email}</td>
                  <td className="px-4 py-3">{m.orders_count ?? 0}</td>
                  <td className="px-4 py-3">{m.shopify_shop_url ? "Connected" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
