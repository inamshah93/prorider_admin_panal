"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { adminApi } from "@/lib/api/admin"

export function RiderDetail() {
  const params = useParams()
  const riderId = Number(params.id)
  const qc = useQueryClient()

  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [proof, setProof] = useState<File | null>(null)
  const [commissionPercent, setCommissionPercent] = useState("")

  const wallet = useQuery({
    queryKey: ["rider-wallet", riderId],
    queryFn: () => adminApi.riderWallet(riderId),
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
