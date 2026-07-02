"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { adminApi, type OrderDetailDto } from "@/lib/api/admin"
import { StatusBadge } from "@/components/shared/status-badge"

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium sm:text-right">{value ?? "—"}</dd>
    </div>
  )
}

function formatMoney(value?: string | number) {
  if (value === undefined || value === null || value === "") return "—"
  return `₨ ${Number(value).toLocaleString("en-PK")}`
}

function formatDate(value?: string) {
  if (!value) return "—"
  return new Date(value).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function ItemList({ items }: { items?: OrderDetailDto["item_details"] }) {
  if (!items?.length) {
    return <p className="text-sm text-muted-foreground">No items recorded.</p>
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border">
      {items.map((item, index) => {
        if (typeof item === "string") {
          return (
            <li key={index} className="px-4 py-3 text-sm">
              {item}
            </li>
          )
        }

        const qty = item.quantity ?? item.qty
        return (
          <li key={index} className="flex items-center justify-between px-4 py-3 text-sm">
            <span>{item.name ?? "Item"}</span>
            <span className="text-muted-foreground">
              {qty != null ? `× ${qty}` : ""}
              {item.price != null ? ` · ${formatMoney(item.price)}` : ""}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      {children}
    </section>
  )
}

const CANCELLABLE = new Set(["created", "ready_to_ship"])
const TERMINAL = new Set(["delivered", "cancelled"])

export function OrderDetail() {
  const params = useParams()
  const orderId = Number(params.id)
  const qc = useQueryClient()
  const [selectedRiderId, setSelectedRiderId] = useState<string>("")
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => adminApi.order(orderId),
    enabled: !!orderId,
  })

  const { data: ridersData } = useQuery({
    queryKey: ["riders"],
    queryFn: () => adminApi.riders(),
  })

  const assignRider = useMutation({
    mutationFn: () => adminApi.assignRider(orderId, Number(selectedRiderId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-order", orderId] })
      qc.invalidateQueries({ queryKey: ["admin-orders"] })
      setActionError(null)
    },
    onError: (e: Error) => setActionError(e.message),
  })

  const cancelOrder = useMutation({
    mutationFn: () => adminApi.cancelOrder(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-order", orderId] })
      qc.invalidateQueries({ queryKey: ["admin-orders"] })
      setActionError(null)
    },
    onError: (e: Error) => setActionError(e.message),
  })

  const order = data?.data
  const riders = ridersData?.data ?? []
  const canCancel = order ? CANCELLABLE.has(order.order_status) : false
  const canAssign = order ? !TERMINAL.has(order.order_status) : false

  if (isLoading) {
    return <p className="text-muted-foreground">Loading order…</p>
  }

  if (isError || !order) {
    return (
      <div className="space-y-4">
        <Link href="/orders" className="text-sm text-primary hover:underline">
          ← Back to orders
        </Link>
        <p className="text-destructive">Order not found or could not be loaded.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/orders" className="text-sm text-primary hover:underline">
            ← Back to orders
          </Link>
          <h1 className="mt-2 font-mono text-2xl font-bold">{order.order_reference_number}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Created {formatDate(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={order.order_status} />
          <StatusBadge status={order.payment_status} />
        </div>
      </div>

      {(canAssign || canCancel) && (
        <Section title="Actions">
          <div className="space-y-4">
            {canAssign && (
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[220px] flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Assign rider</label>
                  <select
                    value={selectedRiderId}
                    onChange={(e) => setSelectedRiderId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select rider…</option>
                    {riders.map((r) => (
                      <option key={r.id} value={r.user?.id ?? ""} disabled={!r.user?.id}>
                        {r.user?.name ?? "Rider"} · {r.user?.phone ?? "—"}
                        {r.is_online ? " (online)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  disabled={!selectedRiderId || assignRider.isPending}
                  onClick={() => assignRider.mutate()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {assignRider.isPending ? "Assigning…" : order.rider ? "Reassign rider" : "Assign rider"}
                </button>
              </div>
            )}

            {canCancel && (
              <div className="flex items-center gap-3 border-t border-border pt-4">
                <p className="flex-1 text-sm text-muted-foreground">
                  Cancel this order if it should no longer be fulfilled.
                </p>
                <button
                  type="button"
                  disabled={cancelOrder.isPending}
                  onClick={() => {
                    if (window.confirm(`Cancel order ${order.order_reference_number}?`)) {
                      cancelOrder.mutate()
                    }
                  }}
                  className="rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
                >
                  {cancelOrder.isPending ? "Cancelling…" : "Cancel order"}
                </button>
              </div>
            )}

            {actionError && <p className="text-sm text-destructive">{actionError}</p>}
          </div>
        </Section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Customer">
          <dl className="space-y-3 text-sm">
            <DetailRow label="Name" value={order.customer_name} />
            <DetailRow label="Phone" value={order.customer_phone} />
            <DetailRow label="Delivery address" value={order.delivery_address} />
            <DetailRow label="City" value={order.target_city} />
            {order.customer_user ? (
              <>
                <DetailRow label="Account" value={order.customer_user.name} />
                <DetailRow label="Account email" value={order.customer_user.email} />
                <DetailRow label="Account phone" value={order.customer_user.phone} />
              </>
            ) : (
              <DetailRow label="App account" value={<span className="text-muted-foreground">Guest / not linked</span>} />
            )}
          </dl>
        </Section>

        <Section title="Merchant & rider">
          <dl className="space-y-3 text-sm">
            <DetailRow label="Store" value={order.merchant?.store_name} />
            <DetailRow label="Merchant contact" value={order.merchant?.user?.name} />
            <DetailRow label="Merchant email" value={order.merchant?.user?.email} />
            <DetailRow
              label="Rider"
              value={
                order.rider ? (
                  <span>
                    {order.rider.name}
                    {order.rider.phone ? ` · ${order.rider.phone}` : ""}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Not assigned</span>
                )
              }
            />
            <DetailRow label="AWB" value={order.awb_number} />
            <DetailRow label="Prep status" value={order.merchant_prep_status?.replace(/_/g, " ")} />
          </dl>
        </Section>
      </div>

      <Section title="Order items">
        <ItemList items={order.item_details} />
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Payment">
          <dl className="space-y-3 text-sm">
            <DetailRow label="COD amount" value={formatMoney(order.cod_amount)} />
            <DetailRow label="Delivery charge" value={formatMoney(order.delivery_charge)} />
            <DetailRow label="Rider commission" value={formatMoney(order.rider_commission_amount)} />
            <DetailRow label="Payment method" value={order.payment_method?.replace(/_/g, " ")} />
            <DetailRow label="Payment status" value={order.payment_status?.replace(/_/g, " ")} />
            <DetailRow label="Parcel weight" value={order.parcel_weight ? `${order.parcel_weight} kg` : "—"} />
          </dl>
        </Section>

        <Section title="Timeline">
          {order.events?.length ? (
            <ol className="space-y-3 text-sm">
              {[...order.events].reverse().map((event) => (
                <li key={event.id} className="rounded-xl border border-border px-3 py-2">
                  <p className="font-medium capitalize">{event.event_type.replace(/_/g, " ")}</p>
                  {(event.from_status || event.to_status) && (
                    <p className="text-muted-foreground">
                      {event.from_status?.replace(/_/g, " ") ?? "—"} → {event.to_status?.replace(/_/g, " ")}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(event.created_at)}
                    {event.actor?.name ? ` · ${event.actor.name}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">No timeline events yet.</p>
          )}
        </Section>
      </div>
    </div>
  )
}
