import Link from "next/link"
import { PricingSettings } from "@/components/admin/pricing-settings"

export default function PricingSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Link href="/settings/cities" className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
          Cities
        </Link>
        <Link href="/settings/pricing" className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground">
          Pricing
        </Link>
      </div>
      <PricingSettings />
    </div>
  )
}
