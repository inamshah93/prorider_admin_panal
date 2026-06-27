"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bike } from "lucide-react"
import { api } from "@/lib/api/client"

type Rider = {
  id: number
  is_online: boolean
  cash_in_hand: string
  documents_verified: boolean
  user?: { name: string; phone: string }
  assigned_city?: string
}

export function Riders() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["riders"],
    queryFn: () => api<{ data: Rider[] }>("/admin/riders"),
  })

  const approve = useMutation({
    mutationFn: (id: number) => api(`/admin/riders/${id}/approve`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["riders"] }),
  })

  const riders = data?.data ?? []

  return (
    <div className="space-y-4">
      {isLoading ? (
        <p className="text-muted-foreground">Loading riders…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {riders.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bike className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">{r.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{r.assigned_city ?? "Unassigned"}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Cash in hand</p>
                  <p className="font-medium">₨ {Number(r.cash_in_hand).toLocaleString("en-PK")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">{r.is_online ? "Online" : "Offline"}</p>
                </div>
              </div>
              {!r.documents_verified && (
                <button
                  type="button"
                  onClick={() => approve.mutate(r.id)}
                  className="mt-4 w-full rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground"
                >
                  Approve documents
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
