"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ShieldCheck, UserCog, UserPlus } from "lucide-react"
import { useState } from "react"
import { adminApi } from "@/lib/api/admin"
import { api } from "@/lib/api/client"

type StaffUser = {
  id: number
  name: string
  email: string
  phone?: string
  roles: string[]
  permissions: string[]
}

const ASSIGNABLE_ROLES = [
  "Customer",
  "Merchant",
  "Rider",
  "OperationsManager",
  "FinanceUser",
  "SuperAdmin",
]

export function Management() {
  const qc = useQueryClient()
  const [staffName, setStaffName] = useState("")
  const [staffEmail, setStaffEmail] = useState("")
  const [staffPhone, setStaffPhone] = useState("")
  const [staffPassword, setStaffPassword] = useState("")
  const [staffRole, setStaffRole] = useState("OperationsManager")
  const [staffPerms, setStaffPerms] = useState<string[]>([])
  const [staffError, setStaffError] = useState<string | null>(null)

  const [newRoleName, setNewRoleName] = useState("")
  const [newRolePerms, setNewRolePerms] = useState<string[]>([])
  const [roleError, setRoleError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [storeName, setStoreName] = useState("")
  const [activeUserId, setActiveUserId] = useState<number | null>(null)

  const { data: staffData, isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: () => api<{ data: StaffUser[] }>("/admin/staff"),
  })
  const { data: permsData } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => api<{ data: Array<{ key: string; label: string }> }>("/admin/permissions"),
  })

  const rolesList = (permsData as any)?.roles as string[] | undefined

  const createStaff = useMutation({
    mutationFn: () =>
      adminApi.createStaff({
        name: staffName,
        email: staffEmail,
        phone: staffPhone || undefined,
        password: staffPassword,
        role: staffRole,
        permissions: staffPerms,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff"] })
      setStaffName("")
      setStaffEmail("")
      setStaffPhone("")
      setStaffPassword("")
      setStaffRole("OperationsManager")
      setStaffPerms([])
      setStaffError(null)
    },
    onError: (e: Error) => setStaffError(e.message),
  })

  const createRole = useMutation({
    mutationFn: () =>
      adminApi.createRole({
        name: newRoleName,
        permissions: newRolePerms,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["permissions"] })
      qc.invalidateQueries({ queryKey: ["staff"] })
      setNewRoleName("")
      setNewRolePerms([])
      setRoleError(null)
    },
    onError: (e: Error) => setRoleError(e.message),
  })

  const searchUsers = useQuery({
    queryKey: ["user-role-search", search],
    queryFn: () => adminApi.searchUsers(search),
    enabled: search.trim().length >= 3,
  })

  const saveRoles = useMutation({
    mutationFn: () => {
      if (!activeUserId) throw new Error("No user selected")
      return adminApi.updateUserRoles(activeUserId, {
        roles: selectedRoles,
        store_name: storeName || undefined,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-role-search"] })
      qc.invalidateQueries({ queryKey: ["staff"] })
    },
  })

  const staff = staffData?.data ?? []
  const permissions = permsData?.data ?? []
  const searchResults = searchUsers.data?.data ?? []

  if (isLoading) return <p className="text-muted-foreground">Loading staff…</p>

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="rounded-2xl border border-border bg-card p-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            setStaffError(null)
            createStaff.mutate()
          }}
        >
          <div className="flex items-center gap-2">
            <UserPlus className="size-5 text-primary" />
            <h2 className="font-semibold">Add user</h2>
          </div>
          <p className="text-sm text-muted-foreground">Create a new user and assign a role + permissions.</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="Full name"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              value={staffPhone}
              onChange={(e) => setStaffPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              required
              type="email"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              placeholder="Email"
              className="rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              required
              type="password"
              minLength={8}
              value={staffPassword}
              onChange={(e) => setStaffPassword(e.target.value)}
              placeholder="Password (min 8 chars)"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <select
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              {(rolesList ?? ASSIGNABLE_ROLES).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-border p-3">
            <p className="text-sm font-medium">Permissions</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {permissions.map((p) => {
                const checked = staffPerms.includes(p.key)
                return (
                  <label key={p.key} className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setStaffPerms((prev) => (checked ? prev.filter((x) => x !== p.key) : [...prev, p.key]))
                      }
                    />
                    {p.label}
                  </label>
                )
              })}
            </div>
          </div>

          {staffError && <p className="text-sm text-destructive">{staffError}</p>}
          <button
            type="submit"
            disabled={createStaff.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            {createStaff.isPending ? "Creating…" : "Create user"}
          </button>
        </form>

        <form
          className="rounded-2xl border border-border bg-card p-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            setRoleError(null)
            createRole.mutate()
          }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="font-semibold">Add role</h2>
          </div>
          <p className="text-sm text-muted-foreground">Create a new role and attach permissions.</p>

          <input
            required
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="Role name (e.g. SupportAgent)"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />

          <div className="rounded-xl border border-border p-3">
            <p className="text-sm font-medium">Permissions</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {permissions.map((p) => {
                const checked = newRolePerms.includes(p.key)
                return (
                  <label key={p.key} className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setNewRolePerms((prev) => (checked ? prev.filter((x) => x !== p.key) : [...prev, p.key]))
                      }
                    />
                    {p.label}
                  </label>
                )
              })}
            </div>
          </div>

          {roleError && <p className="text-sm text-destructive">{roleError}</p>}
          <button
            type="submit"
            disabled={createRole.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            {createRole.isPending ? "Creating…" : "Create role"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <UserCog className="size-5 text-primary" />
          <h2 className="font-semibold">Multi-role accounts</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          One phone + password for admin portal, merchant app, and customer app. Search a user and assign roles.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by phone, name, or email…"
            className="min-w-[240px] flex-1 rounded-xl border border-border px-3 py-2 text-sm"
          />
        </div>
        {searchUsers.isFetching && <p className="mt-2 text-sm text-muted-foreground">Searching…</p>}
        {searchResults.length > 0 && (
          <ul className="mt-3 space-y-2">
            {searchResults.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveUserId(u.id)
                    setSelectedRoles(u.roles ?? [])
                    setStoreName(u.merchant?.store_name ?? "")
                  }}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                    activeUserId === u.id ? "border-primary bg-accent/40" : "border-border"
                  }`}
                >
                  <p className="font-medium">{u.name}</p>
                  <p className="text-muted-foreground">
                    {u.phone ?? "—"} · {u.email}
                  </p>
                  <p className="text-xs text-muted-foreground">Roles: {(u.roles ?? []).join(", ") || "none"}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
        {activeUserId && (
          <div className="mt-4 space-y-3 rounded-xl border border-border p-4">
            <p className="text-sm font-medium">Assign roles</p>
            <div className="flex flex-wrap gap-2">
              {ASSIGNABLE_ROLES.map((role) => {
                const checked = selectedRoles.includes(role)
                return (
                  <label key={role} className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelectedRoles((prev) =>
                          checked ? prev.filter((r) => r !== role) : [...prev, role],
                        )
                      }
                    />
                    {role}
                  </label>
                )
              })}
            </div>
            {selectedRoles.includes("Merchant") && (
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Store name (required for new merchant access)"
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
              />
            )}
            <button
              type="button"
              disabled={selectedRoles.length === 0 || saveRoles.isPending}
              onClick={() => saveRoles.mutate()}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {saveRoles.isPending ? "Saving…" : "Save roles"}
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-semibold">Staff profiles</h2>
          <ul className="mt-3 space-y-2">
            {staff.map((s) => (
              <li key={s.id} className="rounded-xl border border-border px-3 py-2">
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.roles.join(", ")}
                  {s.phone ? ` · ${s.phone}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="font-semibold">Permission matrix</h2>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2">Permission</th>
                  {staff.map((s) => (
                    <th key={s.id} className="px-2 pb-2">
                      {s.name.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((p) => (
                  <tr key={p.key} className="border-t border-border">
                    <td className="py-2">{p.label}</td>
                    {staff.map((s) => (
                      <td key={s.id} className="px-2 py-2 text-center">
                        {s.permissions.includes(p.key) ? "✓" : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
