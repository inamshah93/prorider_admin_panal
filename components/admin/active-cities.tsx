"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api/client"
import { adminApi } from "@/lib/api/admin"

type City = {
  id: number
  name: string
  province?: string
  is_active: boolean
}

type Alias = { id: number; typo: string; maps: string; city_id: number }

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        on ? "bg-primary" : "bg-muted-foreground/30",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 transform rounded-full bg-card shadow transition-transform",
          on ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  )
}

export function ActiveCities() {
  const qc = useQueryClient()
  const { data: citiesData, isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: () => api<{ data: City[] }>("/admin/cities"),
  })
  const { data: aliasesData } = useQuery({
    queryKey: ["city-aliases"],
    queryFn: () => api<{ data: Alias[] }>("/admin/city-aliases"),
  })

  const toggleCity = useMutation({
    mutationFn: (city: City) =>
      adminApi.updateCity(city.id, { is_active: !city.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cities"] }),
  })

  const cities = citiesData?.data ?? []
  const aliases = aliasesData?.data ?? []

  if (isLoading) return <p className="text-muted-foreground">Loading cities…</p>

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Active cities</h2>
        <ul className="mt-4 space-y-3">
          {cities.map((city) => (
            <li key={city.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
              <div>
                <p className="font-medium">{city.name}</p>
                <p className="text-xs text-muted-foreground">{city.province}</p>
              </div>
              <Toggle on={city.is_active} onClick={() => toggleCity.mutate(city)} />
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">City alias mapping</h2>
        <ul className="mt-4 space-y-2">
          {aliases.map((a) => (
            <li key={a.id} className="flex items-center gap-2 text-sm">
              <span className="rounded-lg bg-muted px-2 py-1 font-mono">{a.typo}</span>
              <ArrowRight className="size-4 text-muted-foreground" />
              <span className="font-medium">{a.maps}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
