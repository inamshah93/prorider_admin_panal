"use client"

import "leaflet/dist/leaflet.css"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet"
import { adminApi } from "@/lib/api/admin"

function toIsoLocal(date: Date) {
  return date.toISOString()
}

export function RiderRouteHistory() {
  const params = useParams()
  const riderId = Number(params.id)

  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [to, setTo] = useState(() => new Date())

  const fromIso = useMemo(() => toIsoLocal(from), [from])
  const toIso = useMemo(() => toIsoLocal(to), [to])

  const report = useQuery({
    queryKey: ["rider-route-report", riderId, fromIso, toIso],
    queryFn: () => adminApi.riderRouteReport(riderId, { from: fromIso, to: toIso }),
    enabled: !!riderId,
  })

  const history = useQuery({
    queryKey: ["rider-location-history", riderId, fromIso, toIso],
    queryFn: () => adminApi.riderLocationHistory(riderId, { from: fromIso, to: toIso }),
    enabled: !!riderId,
  })

  const line = useMemo(() => {
    const points = history.data?.data ?? []
    return points.map((p) => [p.lat, p.lng] as [number, number])
  }, [history.data])

  const center = useMemo(() => {
    if (line.length > 0) return line[Math.floor(line.length / 2)]
    return [31.5204, 74.3587] as [number, number]
  }, [line])

  const start = line[0]
  const end = line[line.length - 1]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Rider route history</h1>
          <p className="text-sm text-muted-foreground">Route polyline + timeline for selected time range.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/riders/${riderId}`} className="text-sm text-primary hover:underline">
            ← Back to rider
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <input
              type="datetime-local"
              className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={from.toISOString().slice(0, 16)}
              onChange={(e) => setFrom(new Date(e.target.value))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <input
              type="datetime-local"
              className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={to.toISOString().slice(0, 16)}
              onChange={(e) => setTo(new Date(e.target.value))}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {history.isLoading ? "Loading points…" : `${history.data?.meta?.count ?? line.length} points`}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-3">
          <div className="h-[520px] overflow-hidden rounded-xl">
            <MapContainer center={center} zoom={13} style={{ height: "520px", width: "100%" }}>
              <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {line.length > 1 && <Polyline positions={line} />}
              {start && (
                <Marker position={start}>
                  <Popup>Start</Popup>
                </Marker>
              )}
              {end && (
                <Marker position={end}>
                  <Popup>End</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-semibold">Summary</h2>
            {report.isLoading ? (
              <p className="mt-2 text-sm text-muted-foreground">Loading report…</p>
            ) : report.isError ? (
              <p className="mt-2 text-sm text-red-600">Failed to load report.</p>
            ) : (
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="font-medium tabular-nums">{report.data?.data.total_distance_km ?? 0} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active duration</span>
                  <span className="font-medium tabular-nums">{report.data?.data.active_duration_minutes ?? 0} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pings</span>
                  <span className="font-medium tabular-nums">{report.data?.data.ping_count ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stops</span>
                  <span className="font-medium tabular-nums">{report.data?.data.stops?.length ?? 0}</span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-semibold">Stops</h2>
            <div className="mt-2 space-y-2 text-sm">
              {(report.data?.data.stops ?? []).length === 0 ? (
                <p className="text-muted-foreground">No stops detected.</p>
              ) : (
                (report.data?.data.stops ?? []).slice(0, 8).map((s, idx) => (
                  <div key={idx} className="rounded-lg border border-border px-3 py-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium tabular-nums">{s.duration_minutes} min</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {s.arrived_at} → {s.left_at}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {s.lat.toFixed(5)}, {s.lng.toFixed(5)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <h2 className="font-semibold">Timeline (first 200 points)</h2>
        </div>
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="text-left text-muted-foreground">
                <th className="px-5 py-2 font-medium">Time</th>
                <th className="px-5 py-2 font-medium">Lat</th>
                <th className="px-5 py-2 font-medium">Lng</th>
                <th className="px-5 py-2 font-medium">Speed</th>
                <th className="px-5 py-2 font-medium">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {(history.data?.data ?? []).slice(0, 200).map((p, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-5 py-2 tabular-nums">{p.recorded_at ?? "—"}</td>
                  <td className="px-5 py-2 tabular-nums">{p.lat.toFixed(6)}</td>
                  <td className="px-5 py-2 tabular-nums">{p.lng.toFixed(6)}</td>
                  <td className="px-5 py-2 tabular-nums">{p.speed_mps ?? "—"}</td>
                  <td className="px-5 py-2 tabular-nums">{p.accuracy_m ?? "—"}</td>
                </tr>
              ))}
              {!history.isLoading && (history.data?.data ?? []).length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-muted-foreground" colSpan={5}>
                    No location points in this range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

