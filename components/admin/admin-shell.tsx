"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Store,
  Bike,
  Users,
  UserCircle,
  Settings,
  Truck,
  Bell,
  Search,
  Menu,
  X,
  Package,
  Wallet,
  ClipboardList,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth, useRequireAuth } from "@/lib/auth/auth-context"

const NAV = [
  { href: "/dashboard", label: "Dashboard", desc: "Real-time operations", icon: LayoutDashboard },
  { href: "/vendors", label: "Vendors", desc: "Stores & ledgers", icon: Store },
  { href: "/riders", label: "Riders", desc: "Fleet & cash", icon: Bike },
  { href: "/customers", label: "Customers", desc: "App users & orders", icon: UserCircle },
  { href: "/orders", label: "Orders", desc: "Lifecycle & assign", icon: Package },
  { href: "/finance", label: "Finance", desc: "Payments & overrides", icon: Wallet },
  { href: "/reports", label: "Reports", desc: "Day-end & riders", icon: BarChart3 },
  { href: "/management", label: "Management", desc: "Roles & access", icon: Users },
  { href: "/activity-logs", label: "Activity Logs", desc: "Who did what & when", icon: ClipboardList },
  { href: "/settings/cities", label: "Settings", desc: "Cities & pricing", icon: Settings },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const auth = useRequireAuth()
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const current =
    NAV.find((n) => pathname.startsWith(n.href)) ??
    (pathname.startsWith("/riders/") ? NAV.find((n) => n.href === "/riders") : null) ??
    (pathname.startsWith("/vendors/") ? NAV.find((n) => n.href === "/vendors") : null) ??
    (pathname.startsWith("/orders/") ? NAV.find((n) => n.href === "/orders") : null) ??
    NAV[0]
  const initials = auth.user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "AO"

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (!auth.user) return null

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Truck className="size-5" />
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight">Velo</p>
            <p className="text-xs text-sidebar-foreground/60">Admin Web Portal</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 px-4">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-black/20"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-accent/60">
                  <Icon className="size-[18px]" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs opacity-70">{item.desc}</span>
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="m-4">
          <button
            type="button"
            onClick={() => auth.logout()}
            className="w-full rounded-xl border border-sidebar-border px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
          >
            Sign out
          </button>
        </div>
      </aside>

      {mobileNavOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 px-4 py-4 backdrop-blur lg:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setMobileNavOpen((s) => !s)}
                className="flex size-9 items-center justify-center rounded-lg border border-border lg:hidden"
              >
                {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Admin Web Portal
                </p>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">{current.label}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                aria-label="Notifications"
                className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground"
              >
                <Bell className="size-4" />
              </button>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card py-1 pl-1 pr-3">
                <div className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </div>
                <span className="hidden text-sm font-medium text-foreground sm:block">{auth.user.name}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
