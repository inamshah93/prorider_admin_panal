"use client"

type PaginationControlsProps = {
  page: number
  meta?: {
    page?: number
    current_page?: number
    last_page?: number
    total?: number
    per_page?: number
  }
  isLoading?: boolean
  onPageChange: (page: number) => void
}

export function PaginationControls({ page, meta, isLoading, onPageChange }: PaginationControlsProps) {
  const current = meta?.page ?? meta?.current_page ?? page
  const last = meta?.last_page ?? (meta?.total && meta?.per_page ? Math.ceil(meta.total / meta.per_page) : undefined)
  const canPrev = current > 1
  const canNext = last ? current < last : false

  if (!meta?.total && !canPrev) return null

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
      <span className="text-muted-foreground">
        {meta?.total != null ? `${meta.total} total` : `Page ${current}`}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canPrev || isLoading}
          onClick={() => onPageChange(Math.max(1, current - 1))}
          className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="tabular-nums text-muted-foreground">
          {current}
          {last ? ` / ${last}` : ""}
        </span>
        <button
          type="button"
          disabled={!canNext || isLoading}
          onClick={() => onPageChange(current + 1)}
          className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
