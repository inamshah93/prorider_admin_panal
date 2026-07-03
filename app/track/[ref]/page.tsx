"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export default function PublicTrackPage() {
  const params = useParams()
  const search = useSearchParams()
  const ref = decodeURIComponent(String(params.ref ?? ""))
  const phone = search.get("phone") ?? ""

  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = phone ? `?phone=${encodeURIComponent(phone)}` : ""
    fetch(`${API}/customer/track/${encodeURIComponent(ref)}${q}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found")
        return r.json()
      })
      .then(setData)
      .catch(() => setError("Order not found. Check reference and phone."))
  }, [ref, phone])

  if (error) {
    return (
      <main className="mx-auto max-w-lg p-8">
        <h1 className="text-xl font-bold">Track order</h1>
        <p className="mt-4 text-red-600">{error}</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-lg p-8">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    )
  }

  const milestones = (data.milestones as Array<Record<string, unknown>>) ?? []

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-background p-6">
      <h1 className="text-2xl font-bold">Velo Tracking</h1>
      <p className="mt-1 text-sm text-muted-foreground">{String(data.order_reference)}</p>
      <p className="mt-4 text-lg font-medium capitalize">{String(data.order_status ?? "").replace(/_/g, " ")}</p>
      {data.eta_minutes != null && (
        <p className="text-primary">ETA: ~{String(data.eta_minutes)} min</p>
      )}
      <p className="mt-2 text-sm">{String(data.delivery_address ?? "")}</p>

      <ol className="mt-8 space-y-3">
        {milestones.map((m) => (
          <li
            key={String(m.key)}
            className={`rounded-lg border px-4 py-3 ${m.active ? "border-primary bg-primary/5" : "border-border"}`}
          >
            {String(m.label)}
            {m.completed ? " ✓" : ""}
          </li>
        ))}
      </ol>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Customer web portal · same data as mobile app
      </p>
    </main>
  )
}
