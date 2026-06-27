"use client"

import { useQuery } from "@tanstack/react-query"
import { ShieldCheck } from "lucide-react"
import { api } from "@/lib/api/client"

type StaffUser = {
  id: number
  name: string
  email: string
  roles: string[]
  permissions: string[]
}

export function Management() {
  const { data: staffData, isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: () => api<{ data: StaffUser[] }>("/admin/staff"),
  })
  const { data: permsData } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => api<{ data: Array<{ key: string; label: string }> }>("/admin/permissions"),
  })

  const staff = staffData?.data ?? []
  const permissions = permsData?.data ?? []

  if (isLoading) return <p className="text-muted-foreground">Loading staff…</p>

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="font-semibold">Staff profiles</h2>
        <ul className="mt-3 space-y-2">
          {staff.map((s) => (
            <li key={s.id} className="rounded-xl border border-border px-3 py-2">
              <p className="font-medium">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.roles[0]}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <h2 className="font-semibold">Permission matrix</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pb-2">Permission</th>
                {staff.map((s) => (
                  <th key={s.id} className="pb-2 px-2">{s.name.split(" ")[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p.key} className="border-t border-border">
                  <td className="py-2">{p.label}</td>
                  {staff.map((s) => (
                    <td key={s.id} className="px-2 py-2 text-center">
                      {s.permissions.includes(p.key) ? "✓" : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
