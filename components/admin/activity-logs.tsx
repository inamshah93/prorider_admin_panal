"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { adminApi, type ActivityLogDto } from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"

function fmtDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

export function ActivityLogs() {
  const [q, setQ] = useState("")
  const [action, setAction] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [page, setPage] = useState(1)
  const [applied, setApplied] = useState({ q: "", action: "", from: "", to: "", page: 1 })

  const params = useMemo(
    () => ({
      q: applied.q || undefined,
      action: applied.action || undefined,
      from: applied.from || undefined,
      to: applied.to || undefined,
      page: applied.page || undefined,
    }),
    [applied],
  )

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["activity-logs", params],
    queryFn: () => adminApi.activityLogs(params),
  })

  const logs: ActivityLogDto[] = data?.data ?? []
  const meta = data?.meta
  const canPrev = (meta?.page ?? page) > 1
  const canNext = meta?.total !== undefined && meta?.per_page !== undefined && meta.page !== undefined
    ? meta.page * meta.per_page < meta.total
    : logs.length > 0

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px]">
            <label className="text-xs font-medium text-muted-foreground">Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="user, entity, message…"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="min-w-[180px]">
            <label className="text-xs font-medium text-muted-foreground">Action</label>
            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder='e.g. "rider.approve"'
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setPage(1)
              setApplied({ q: q.trim(), action: action.trim(), from, to, page: 1 })
            }}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Apply
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {isFetching ? "Refreshing…" : "Tip: search supports user name/email, entity, and message."}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Activity logs</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => {
                const next = Math.max(1, (applied.page ?? 1) - 1)
                setPage(next)
                setApplied((p) => ({ ...p, page: next }))
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={!canNext}
              onClick={() => {
                const next = (applied.page ?? 1) + 1
                setPage(next)
                setApplied((p) => ({ ...p, page: next }))
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="mt-4 text-muted-foreground">Loading…</p>
        ) : error ? (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <p className="font-medium">Failed to load logs.</p>
            {error instanceof ApiError ? (
              <p className="mt-1 text-xs text-destructive/80">
                {error.status} · {error.message}
              </p>
            ) : (
              <p className="mt-1 text-xs text-destructive/80">{(error as Error)?.message ?? String(error)}</p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Endpoint: <span className="font-mono">/admin/activity-logs</span>
            </p>
          </div>
        ) : logs.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No logs found.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">User</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Entity</th>
                  <th className="pb-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t border-border align-top">
                    <td className="py-2 pr-3 whitespace-nowrap">{fmtDate(l.created_at)}</td>
                    <td className="py-2 pr-3">
                      <div className="font-medium">{l.user?.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{l.user?.email ?? ""}</div>
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs">{l.action}</td>
                    <td className="py-2 pr-3">
                      <div className="font-medium">{l.entity ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{l.entity_id ?? ""}</div>
                    </td>
                    <td className="py-2">{l.message ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

