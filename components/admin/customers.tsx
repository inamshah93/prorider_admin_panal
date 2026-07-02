"use client"

import { useQuery } from "@tanstack/react-query"
import { Search, UserCircle } from "lucide-react"
import { useState } from "react"
import { adminApi } from "@/lib/api/admin"
import { PaginationControls } from "@/components/shared/pagination-controls"

export function Customers() {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["customers", query, page],
    queryFn: () => adminApi.customers(query, page),
  })

  const customers = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
          placeholder="Search customers…"
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm"
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading customers…</p>
      ) : customers.length === 0 ? (
        <p className="text-muted-foreground">No customers found.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <UserCircle className="size-4 text-muted-foreground" />
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3">{c.orders_count ?? 0}</td>
                  <td className="px-4 py-3 capitalize">{c.status ?? "active"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationControls page={page} meta={data?.meta} isLoading={isLoading} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
