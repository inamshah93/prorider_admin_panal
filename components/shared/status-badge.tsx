import { cn } from "@/lib/utils"

type Status =
  | "Created"
  | "Ready to Ship"
  | "ready to ship"
  | "Dispatched"
  | "dispatched"
  | "picked up"
  | "Picked Up"
  | "Out for Delivery"
  | "Delivered"
  | "delivered"
  | "cancelled"
  | "Pending"
  | "Verified"
  | "Printed Label"
  | "Packed"
  | "Active"
  | "Inactive"

const styles: Record<string, string> = {
  Created: "bg-muted text-muted-foreground ring-border",
  "created": "bg-muted text-muted-foreground ring-border",
  "Ready to Ship": "bg-accent text-accent-foreground ring-primary/20",
  "ready to ship": "bg-accent text-accent-foreground ring-primary/20",
  Dispatched: "bg-[oklch(0.95_0.05_260)] text-[oklch(0.42_0.18_260)] ring-[oklch(0.42_0.18_260)]/15",
  dispatched: "bg-[oklch(0.95_0.05_260)] text-[oklch(0.42_0.18_260)] ring-[oklch(0.42_0.18_260)]/15",
  "picked up": "bg-[oklch(0.96_0.07_70)] text-[oklch(0.45_0.14_60)] ring-[oklch(0.45_0.14_60)]/15",
  "Picked Up": "bg-[oklch(0.96_0.07_70)] text-[oklch(0.45_0.14_60)] ring-[oklch(0.45_0.14_60)]/15",
  "Out for Delivery": "bg-[oklch(0.96_0.07_70)] text-[oklch(0.45_0.14_60)] ring-[oklch(0.45_0.14_60)]/15",
  Delivered: "bg-[oklch(0.95_0.06_150)] text-[oklch(0.42_0.13_150)] ring-[oklch(0.42_0.13_150)]/15",
  delivered: "bg-[oklch(0.95_0.06_150)] text-[oklch(0.42_0.13_150)] ring-[oklch(0.42_0.13_150)]/15",
  cancelled: "bg-destructive/10 text-destructive ring-destructive/20",
  Pending: "bg-[oklch(0.96_0.07_70)] text-[oklch(0.45_0.14_60)] ring-[oklch(0.45_0.14_60)]/15",
  Verified: "bg-[oklch(0.95_0.06_150)] text-[oklch(0.42_0.13_150)] ring-[oklch(0.42_0.13_150)]/15",
  "Printed Label": "bg-accent text-accent-foreground ring-primary/20",
  Packed: "bg-secondary text-secondary-foreground ring-primary/20",
  Active: "bg-[oklch(0.95_0.06_150)] text-[oklch(0.42_0.13_150)] ring-[oklch(0.42_0.13_150)]/15",
  Inactive: "bg-muted text-muted-foreground ring-border",
}

export function StatusBadge({
  status,
  className,
}: {
  status: Status | string
  className?: string
}) {
  const label = status.replace(/_/g, " ")
  const style = styles[status] ?? styles[label] ?? styles.Created
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset capitalize",
        style,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  )
}
