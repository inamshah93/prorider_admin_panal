"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { api } from "@/lib/api/client"

type PendingOrder = {
  id: number
  order_reference_number: string
  cod_amount: string
  payment_status: string
}

export function FinancePage() {
  const qc = useQueryClient()
  const [orderId, setOrderId] = useState("")
  const [reason, setReason] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["pending-payments"],
    queryFn: () => api<{ data: { data: PendingOrder[] } }>("/admin/payments/pending"),
  })

  const override = useMutation({
    mutationFn: () =>
      api("/admin/payments/override", {
        method: "POST",
        body: JSON.stringify({
          order_id: Number(orderId),
          new_status: "paid",
          reason,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pending-payments"] })
      setOrderId("")
      setReason("")
    },
  })

  const pending = data?.data?.data ?? []

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Pending payments</h2>
        {isLoading ? (
          <p className="mt-4 text-muted-foreground">Loading…</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {pending.map((o) => (
              <li key={o.id} className="flex justify-between rounded-xl border border-border px-3 py-2">
                <span className="font-mono">{o.order_reference_number}</span>
                <span>₨ {Number(o.cod_amount).toLocaleString("en-PK")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Manual override</h2>
        <div className="mt-4 space-y-3">
          <input
            placeholder="Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full rounded-xl border border-border px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Reason for override"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl border border-border px-3 py-2 text-sm"
            rows={3}
          />
          <button
            type="button"
            disabled={!orderId || reason.length < 5 || override.isPending}
            onClick={() => override.mutate()}
            className="w-full rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Mark as paid
          </button>
        </div>
      </div>
    </div>
  )
}
