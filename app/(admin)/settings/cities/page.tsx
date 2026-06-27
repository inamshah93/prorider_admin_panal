import Link from "next/link"
import { ActiveCities } from "@/components/admin/active-cities"

export default function CitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Link href="/settings/cities" className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground">
          Cities
        </Link>
        <Link href="/settings/pricing" className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
          Pricing
        </Link>
      </div>
      <ActiveCities />
    </div>
  )
}
