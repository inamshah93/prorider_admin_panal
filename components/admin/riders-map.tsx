"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { adminApi } from "@/lib/api/admin"

function project(lat: number, lng: number, bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * 100
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat || 1)) * 100
  return { x: Math.min(96, Math.max(2, x)), y: Math.min(96, Math.max(2, y)) }
}

export function RidersMapPage() {
  const map = useQuery({
    queryKey: ["riders-map"],
    queryFn: () => adminApi.ridersMap(),
    refetchInterval: 30_000,
  })

  const riders = map.data?.data ?? []
  const bounds =
    riders.length > 0
      ? {
          minLat: Math.min(...riders.map((r) => r.lat)) - 0.02,
          maxLat: Math.max(...riders.map((r) => r.lat)) + 0.02,
          minLng: Math.min(...riders.map((r) => r.lng)) - 0.02,
          maxLng: Math.max(...riders.map((r) => r.lng)) + 0.02,
        }
      : { minLat: 31.4, maxLat: 31.6, minLng: 74.2, maxLng: 74.5 }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Live rider map</h1>
          <p className="text-sm text-muted-foreground">Online riders with GPS — refreshes every 30s</p>
        </div>
        <Link href="/riders" className="text-sm text-primary hover:underline">
          ← Back to riders
        </Link>
      </div>

      <div className="relative h-[420px] overflow-hidden rounded-2xl border border-border bg-[#e8f4ea]">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {map.isLoading ? (
          <p className="absolute inset-0 flex items-center justify-center text-muted-foreground">Loading map…</p>
        ) : riders.length === 0 ? (
          <p className="absolute inset-0 flex items-center justify-center text-muted-foreground">No online riders with GPS right now.</p>
        ) : (
          riders.map((r) => {
            const pos = project(r.lat, r.lng, bounds)
            return (
              <a
                key={r.id}
                href={`https://www.google.com/maps?q=${r.lat},${r.lng}`}
                target="_blank"
                rel="noreferrer"
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                title={`${r.name} · ${r.city ?? ""}`}
              >
                <span className="flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground shadow">
                  <span className="h-2 w-2 rounded-full bg-green-300" />
                  {r.name?.split(" ")[0] ?? "Rider"}
                </span>
              </a>
            )
          })
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Rider</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Cash</th>
            </tr>
          </thead>
          <tbody>
            {riders.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link href={`/riders/${r.id}`} className="font-medium text-primary hover:underline">
                    {r.name}
                  </Link>
                  {r.phone && <p className="text-xs text-muted-foreground">{r.phone}</p>}
                </td>
                <td className="px-4 py-3">{r.city ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {r.lat.toFixed(5)}, {r.lng.toFixed(5)}
                </td>
                <td className="px-4 py-3">₨ {r.cash_in_hand.toLocaleString("en-PK")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
