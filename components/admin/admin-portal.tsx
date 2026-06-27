"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Store,
  Bike,
  Users,
  Settings,
  Truck,
  Bell,
  Search,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DashboardOverview } from "./dashboard-overview"
import { Vendors } from "./vendors"
import { Riders } from "./riders"
import { Management } from "./management"
import { ActiveCities } from "./active-cities"

type Module = "dashboard" | "vendors" | "riders" | "management" | "settings"

const NAV: { id: Module; label: string; desc: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", desc: "Real-time operations", icon: LayoutDashboard },
  { id: "vendors", label: "Vendors", desc: "Stores & ledgers", icon: Store },
  { id: "riders", label: "Riders", desc: "Fleet & cash", icon: Bike },
  { id: "management", label: "Management", desc: "Roles & access", icon: Users },
  { id: "settings", label: "Settings", desc: "Cities & aliases", icon: Settings },
]

export function AdminPortal() {
  const [module, setModule] = useState<Module>("dashboard")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const current = NAV.find((n) => n.id === module)!

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
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

        <div className="px-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Operations
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 px-4">
          {NAV.map((item) => {
            const active = module === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setModule(item.id)
                  setMobileNavOpen(false)
                }}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-black/20"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                {active && (
                  <span className="absolute -left-4 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
                )}
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    active ? "bg-white/15" : "bg-sidebar-accent/60 group-hover:bg-sidebar-accent",
                  )}
                >
                  <Icon className="size-[18px]" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span
                    className={cn(
                      "text-xs",
                      active ? "text-sidebar-primary-foreground/70" : "text-sidebar-foreground/45",
                    )}
                  >
                    {item.desc}
                  </span>
                </span>
              </button>
            )
          })}
        </nav>

        <div className="m-4 rounded-2xl bg-sidebar-accent/50 p-4">
          <p className="text-sm font-medium">Operations Live</p>
          <p className="mt-1 text-xs text-sidebar-foreground/60">12 cities active · 248 riders online</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-sidebar-primary" />
            <span className="text-xs text-sidebar-foreground/70">All systems operational</span>
          </div>
        </div>
      </aside>

      {mobileNavOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
        />
      )}

      {/* Main */}
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
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Search orders, riders, vendors…"
                  className="w-72 rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <button
                aria-label="Notifications"
                className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
              >
                <Bell className="size-4" />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
              </button>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card py-1 pl-1 pr-3">
                <div className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                  AO
                </div>
                <span className="hidden text-sm font-medium text-foreground sm:block">Admin Ops</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          {module === "dashboard" && <DashboardOverview />}
          {module === "vendors" && <Vendors />}
          {module === "riders" && <Riders />}
          {module === "management" && <Management />}
          {module === "settings" && <ActiveCities />}
        </main>
      </div>
    </div>
  )
}
