"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { adminApi } from "@/lib/api/admin"

export function PricingSettings() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["pricing-settings"],
    queryFn: () => adminApi.pricing(),
  })

  const [deliveryCharge, setDeliveryCharge] = useState("400")
  const [commissionPercent, setCommissionPercent] = useState("5")

  useEffect(() => {
    if (data?.data) {
      setDeliveryCharge(String(data.data.default_delivery_charge))
      setCommissionPercent(String(data.data.default_rider_commission_percent))
    }
  }, [data])

  const save = useMutation({
    mutationFn: () =>
      adminApi.updatePricing({
        default_delivery_charge: Number(deliveryCharge),
        default_rider_commission_percent: Number(commissionPercent),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pricing-settings"] }),
  })

  if (isLoading) return <p className="text-muted-foreground">Loading pricing settings…</p>

  return (
    <div className="max-w-xl rounded-2xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">Default pricing</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Used when a merchant has no custom delivery charge. Rider commission is calculated as a percentage of delivery charge per order.
      </p>
      <div className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="text-muted-foreground">Default delivery charge (Rs)</span>
          <input
            type="number"
            value={deliveryCharge}
            onChange={(e) => setDeliveryCharge(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Default rider commission (%)</span>
          <input
            type="number"
            step="0.1"
            value={commissionPercent}
            onChange={(e) => setCommissionPercent(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
          />
        </label>
        <p className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
          Example: delivery charge Rs 300 at {commissionPercent}% commission = Rs{" "}
          {((Number(deliveryCharge || 300) * Number(commissionPercent || 5)) / 100).toFixed(0)} rider earnings per delivery.
        </p>
        <button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate()}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {save.isPending ? "Saving…" : "Save pricing"}
        </button>
      </div>
    </div>
  )
}
