import { api } from "@/lib/api/client"

export const adminApi = {
  dashboard: () => api<{ metrics: Record<string, number>; recent_activity: unknown[]; chart_data: { date: string; count: number }[] }>("/admin/dashboard"),
  cities: () => api<{ data: CityDto[] }>("/admin/cities"),
  updateCity: (id: number, body: Partial<CityDto>) =>
    api<{ data: CityDto }>(`/admin/cities/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      audit: { action: "city.update", entity: "city", entityId: id, context: body as unknown as Record<string, unknown> },
    }),
  aliases: () => api<{ data: { id: number; typo: string; maps: string }[] }>("/admin/city-aliases"),
  pricing: () => api<{ data: PricingDto }>("/admin/settings/pricing"),
  updatePricing: (body: { default_delivery_charge: number; default_rider_commission_percent: number }) =>
    api<{ data: PricingDto }>("/admin/settings/pricing", {
      method: "PUT",
      body: JSON.stringify(body),
      audit: { action: "pricing.update", entity: "pricing", context: body as unknown as Record<string, unknown> },
    }),
  merchants: (search?: string, page?: number) => {
    const q = new URLSearchParams()
    if (search) q.set("search", search)
    if (page) q.set("page", String(page))
    const qs = q.toString()
    return api<{ data: MerchantDto[]; meta?: PaginatedMeta }>(`/admin/merchants${qs ? `?${qs}` : ""}`)
  },
  createMerchant: (body: { name: string; email: string; phone?: string; store_name: string; password: string }) =>
    api<{ data: MerchantDto }>("/admin/merchants", {
      method: "POST",
      body: JSON.stringify(body),
      audit: { action: "merchant.create", entity: "merchant", message: body.store_name, context: { ...body, password: "***" } },
    }),
  customers: (search?: string, page?: number) => {
    const q = new URLSearchParams()
    if (search) q.set("search", search)
    if (page) q.set("page", String(page))
    const qs = q.toString()
    return api<{ data: CustomerDto[]; meta?: PaginatedMeta }>(`/admin/customers${qs ? `?${qs}` : ""}`)
  },
  updateMerchantDeliveryCharge: (id: number, delivery_charge: number | null) =>
    api(`/admin/merchants/${id}/delivery-charge`, {
      method: "PUT",
      body: JSON.stringify({ delivery_charge }),
      audit: {
        action: "merchant.delivery_charge.update",
        entity: "merchant",
        entityId: id,
        context: { delivery_charge },
      },
    }),
  riders: (onlineOnly?: boolean) =>
    api<{ data: RiderDto[] }>(`/admin/riders${onlineOnly ? "?online_only=1" : ""}`),
  updateRiderOnline: (id: number, is_online: boolean) =>
    api<{ data: RiderDto }>(`/admin/riders/${id}/online-status`, {
      method: "PUT",
      body: JSON.stringify({ is_online }),
      audit: { action: "rider.online.update", entity: "rider", entityId: id, context: { is_online } },
    }),
  updateRiderUser: (id: number, body: { name: string; email: string; phone: string }) =>
    api<{ data: RiderDto }>(`/admin/riders/${id}/user`, {
      method: "PUT",
      body: JSON.stringify(body),
      audit: { action: "rider.user.update", entity: "rider", entityId: id, context: body as unknown as Record<string, unknown> },
    }),
  createRider: (body: {
    name: string
    email: string
    phone: string
    password: string
    assigned_city_id?: number | null
  }) =>
    api<{ data: RiderDto }>("/admin/riders", {
      method: "POST",
      body: JSON.stringify(body),
      audit: { action: "rider.create", entity: "rider", message: body.name, context: { ...body, password: "***" } },
    }),
  approveRider: (id: number) =>
    api(`/admin/riders/${id}/approve`, { method: "POST", audit: { action: "rider.approve", entity: "rider", entityId: id } }),
  riderWallet: (id: number) => api<{ data: WalletDto }>(`/admin/riders/${id}/wallet`),
  riderSettlements: (id: number) => api<{ data: SettlementDto[] }>(`/admin/riders/${id}/settlements`),
  recordRiderSettlement: (id: number, form: FormData) =>
    api<{ data: SettlementDto }>(`/admin/riders/${id}/settlements`, {
      method: "POST",
      body: form,
      audit: { action: "rider.settlement.create", entity: "rider", entityId: id },
    }),
  updateRiderCommission: (id: number, commission_percent: number | null) =>
    api(`/admin/riders/${id}/commission-rate`, {
      method: "PUT",
      body: JSON.stringify({ commission_percent }),
      audit: { action: "rider.commission.update", entity: "rider", entityId: id, context: { commission_percent } },
    }),
  staff: () => api<{ data: StaffDto[] }>("/admin/staff"),
  permissions: () => api<{ data: { key: string; label: string }[]; roles: string[] }>("/admin/permissions"),
  roles: () => api<{ data: RoleDto[] }>("/admin/roles"),
  createRole: (body: { name: string; permissions?: string[] }) =>
    api<{ data: RoleDto }>("/admin/roles", {
      method: "POST",
      body: JSON.stringify(body),
      audit: { action: "role.create", entity: "role", message: body.name, context: body as unknown as Record<string, unknown> },
    }),
  createStaff: (body: { name: string; email: string; phone?: string; password: string; role: string; permissions?: string[] }) =>
    api<{ data: StaffDto }>("/admin/staff", {
      method: "POST",
      body: JSON.stringify(body),
      audit: { action: "staff.create", entity: "staff", message: body.email, context: { ...body, password: "***" } },
    }),
  updateStaffPermissions: (userId: number, permissions: string[]) =>
    api(`/admin/staff/${userId}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissions }),
      audit: { action: "staff.permissions.update", entity: "staff", entityId: userId, context: { permissions } },
    }),
  searchUsers: (q: string) =>
    api<{ data: UserRoleDto[] }>(`/admin/users/search?q=${encodeURIComponent(q)}`),
  updateUserRoles: (userId: number, body: { roles: string[]; store_name?: string }) =>
    api<{ data: UserRoleDto }>(`/admin/users/${userId}/roles`, {
      method: "PUT",
      body: JSON.stringify(body),
      audit: { action: "user.roles.update", entity: "user", entityId: userId, context: body as unknown as Record<string, unknown> },
    }),
  orders: (params?: { status?: string; search?: string; page?: number }) => {
    const q = new URLSearchParams()
    if (params?.status) q.set("status", params.status)
    if (params?.search) q.set("search", params.search)
    if (params?.page) q.set("page", String(params.page))
    const qs = q.toString()
    return api<{ data: OrderDto[]; meta?: PaginatedMeta }>(`/admin/orders${qs ? `?${qs}` : ""}`)
  },
  order: (id: number) => api<{ data: OrderDetailDto }>(`/admin/orders/${id}`),
  assignRider: (orderId: number, riderUserId: number) =>
    api<{ data: OrderDetailDto }>(`/admin/orders/${orderId}/assign-rider`, {
      method: "POST",
      body: JSON.stringify({ rider_id: riderUserId }),
    }),
  cancelOrder: (orderId: number) =>
    api<{ data: OrderDetailDto }>(`/admin/orders/${orderId}/cancel`, {
      method: "POST",
    }),
  riderOrders: (riderId: number, params?: { status?: string; page?: number }) => {
    const q = new URLSearchParams()
    if (params?.status) q.set("status", params.status)
    if (params?.page) q.set("page", String(params.page))
    const qs = q.toString()
    return api<{ data: OrderDto[]; meta?: { page?: number; per_page?: number; total?: number } }>(
      `/admin/riders/${riderId}/orders${qs ? `?${qs}` : ""}`,
    )
  },
  riderOrdersStats: (riderId: number) =>
    api<{ data: { total: number; delivered: number; returned: number; by_status: Record<string, number> } }>(
      `/admin/riders/${riderId}/orders/stats`,
    ),
  merchantOrders: (merchantId: number, params?: { status?: string; page?: number }) => {
    const q = new URLSearchParams()
    if (params?.status) q.set("status", params.status)
    if (params?.page) q.set("page", String(params.page))
    const qs = q.toString()
    return api<{ data: OrderDto[]; meta?: { page?: number; per_page?: number; total?: number } }>(
      `/admin/merchants/${merchantId}/orders${qs ? `?${qs}` : ""}`,
    )
  },
  merchantOrdersStats: (merchantId: number) =>
    api<{ data: { total: number; delivered: number; returned: number; by_status: Record<string, number> } }>(
      `/admin/merchants/${merchantId}/orders/stats`,
    ),
  merchant: (id: number) =>
    api<{
      data: MerchantDto
      ledger: LedgerEntryDto[]
      payables: number
    }>(`/admin/merchants/${id}`),
  reportsDayEnd: (limit?: number) =>
    api<{ data: DayEndSnapshotDto[] }>(`/admin/reports/day-end${limit ? `?limit=${limit}` : ""}`),
  reportsRiders: () =>
    api<{ data: RiderReportDto[] }>("/admin/reports/riders"),
  pendingPayments: () => api<{ data: { data: OrderDto[] } }>("/admin/payments/pending"),
  paymentOverride: (body: { order_id: number; new_status: string; reason: string }) =>
    api("/admin/payments/override", {
      method: "POST",
      body: JSON.stringify(body),
      audit: { action: "payment.override", entity: "order", entityId: body.order_id, message: body.reason, context: body as unknown as Record<string, unknown> },
    }),

  activityLogs: (params?: { q?: string; user_id?: number | string; action?: string; from?: string; to?: string; page?: number }) => {
    const q = new URLSearchParams()
    if (params?.q) q.set("q", params.q)
    if (params?.user_id) q.set("user_id", String(params.user_id))
    if (params?.action) q.set("action", params.action)
    if (params?.from) q.set("from", params.from)
    if (params?.to) q.set("to", params.to)
    if (params?.page) q.set("page", String(params.page))
    const qs = q.toString()
    return api<{ data: ActivityLogDto[]; meta?: { page?: number; per_page?: number; total?: number } }>(`/admin/activity-logs${qs ? `?${qs}` : ""}`)
  },
}

export type PaginatedMeta = {
  page?: number
  per_page?: number
  total?: number
  current_page?: number
  last_page?: number
}

export type ActivityLogDto = {
  id: number
  action: string
  entity?: string | null
  entity_id?: string | number | null
  message?: string | null
  ip?: string | null
  user_agent?: string | null
  created_at: string
  user?: { id: number; name: string; email?: string | null } | null
  context?: Record<string, unknown> | null
}

export type DayEndSnapshotDto = {
  id: number
  snapshot_date: string
  total_cod_collected: string | number
  total_rider_cash: string | number
  total_merchant_payables: string | number
  platform_net_profit: string | number
  orders_delivered: number
}

export type RiderReportDto = {
  id: number
  name: string
  phone?: string
  is_online: boolean
  cash_in_hand: number
  total_collected: number
  total_commission_earned: number
  total_settled: number
}

export type LedgerEntryDto = {
  id: number
  entry_type: string
  amount: string | number
  reference?: string | null
  notes?: string | null
  created_at?: string
}

export type PricingDto = {
  default_delivery_charge: number
  default_rider_commission_rate: number
  default_rider_commission_percent: number
}
export type CityDto = { id: number; name: string; province: string; is_active: boolean; aliases?: string[] }
export type MerchantDto = {
  id: number
  store_name: string
  delivery_charge?: number | null
  effective_delivery_charge?: number
  orders_count?: number
  manual_saved_items?: unknown[]
  user?: { name: string; email: string }
}
export type CustomerDto = {
  id: number
  name: string
  email: string
  phone?: string
  status?: string
  orders_count?: number
  created_at?: string
}
export type RiderDto = {
  id: number
  is_online: boolean
  cash_in_hand: string
  commission_rate?: number | null
  effective_commission_rate?: number
  documents_verified: boolean
  user?: { id: number; name: string; email?: string; phone: string }
  assigned_city?: string
}
export type WalletDto = {
  cash_in_hand: number
  remaining_to_pay: number
  total_collected: number
  total_commission_earned: number
  total_settled: number
  commission_rate?: number
  is_online: boolean
}
export type SettlementDto = {
  id: number
  amount: number | string
  cash_before?: number | string
  cash_after?: number | string
  notes?: string | null
  proof_url?: string
  created_at?: string
}
export type StaffDto = { id: number; name: string; email: string; roles: string[]; permissions: string[] }
export type RoleDto = { name: string; permissions: string[] }
export type UserRoleDto = {
  id: number
  name: string
  email: string
  phone?: string
  roles: string[]
  merchant?: { store_name: string }
}
export type OrderDto = {
  id: number
  order_reference_number: string
  order_status: string
  payment_status: string
  cod_amount: string
  delivery_charge?: string
  customer_name: string
  target_city?: string
  merchant?: MerchantDto
}

export type OrderDetailDto = OrderDto & {
  customer_phone?: string
  customer_user?: { id: number; name: string; email: string; phone?: string } | null
  delivery_address?: string
  parcel_weight?: string
  item_details?: Array<{ name?: string; quantity?: number; qty?: number; price?: number } | string>
  rider_commission_amount?: string
  payment_method?: string
  merchant_prep_status?: string
  awb_number?: string | null
  rider?: { id: number; name: string; phone?: string } | null
  events?: Array<{
    id: number
    event_type: string
    from_status?: string | null
    to_status?: string | null
    created_at?: string
    actor?: { id: number; name: string } | null
  }>
  created_at?: string
  updated_at?: string
}
