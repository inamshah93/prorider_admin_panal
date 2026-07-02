import { api } from "@/lib/api/client"

export const adminApi = {
  dashboard: () => api<{ metrics: Record<string, number>; recent_activity: unknown[]; chart_data: { date: string; count: number }[] }>("/admin/dashboard"),
  cities: () => api<{ data: CityDto[] }>("/admin/cities"),
  updateCity: (id: number, body: Partial<CityDto>) =>
    api<{ data: CityDto }>(`/admin/cities/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  aliases: () => api<{ data: { id: number; typo: string; maps: string }[] }>("/admin/city-aliases"),
  pricing: () => api<{ data: PricingDto }>("/admin/settings/pricing"),
  updatePricing: (body: { default_delivery_charge: number; default_rider_commission_percent: number }) =>
    api<{ data: PricingDto }>("/admin/settings/pricing", { method: "PUT", body: JSON.stringify(body) }),
  merchants: (search?: string) =>
    api<{ data: MerchantDto[] }>(`/admin/merchants${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  createMerchant: (body: { name: string; email: string; phone?: string; store_name: string; password: string }) =>
    api<{ data: MerchantDto }>("/admin/merchants", { method: "POST", body: JSON.stringify(body) }),
  customers: (search?: string) =>
    api<{ data: CustomerDto[] }>(`/admin/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  updateMerchantDeliveryCharge: (id: number, delivery_charge: number | null) =>
    api(`/admin/merchants/${id}/delivery-charge`, {
      method: "PUT",
      body: JSON.stringify({ delivery_charge }),
    }),
  riders: (onlineOnly?: boolean) =>
    api<{ data: RiderDto[] }>(`/admin/riders${onlineOnly ? "?online_only=1" : ""}`),
  createRider: (body: {
    name: string
    email: string
    phone: string
    password: string
    assigned_city_id?: number | null
  }) => api<{ data: RiderDto }>("/admin/riders", { method: "POST", body: JSON.stringify(body) }),
  approveRider: (id: number) => api(`/admin/riders/${id}/approve`, { method: "POST" }),
  riderWallet: (id: number) => api<{ data: WalletDto }>(`/admin/riders/${id}/wallet`),
  riderSettlements: (id: number) => api<{ data: SettlementDto[] }>(`/admin/riders/${id}/settlements`),
  recordRiderSettlement: (id: number, form: FormData) =>
    api<{ data: SettlementDto }>(`/admin/riders/${id}/settlements`, { method: "POST", body: form }),
  updateRiderCommission: (id: number, commission_percent: number | null) =>
    api(`/admin/riders/${id}/commission-rate`, {
      method: "PUT",
      body: JSON.stringify({ commission_percent }),
    }),
  staff: () => api<{ data: StaffDto[] }>("/admin/staff"),
  permissions: () => api<{ data: { key: string; label: string }[]; roles: string[] }>("/admin/permissions"),
  roles: () => api<{ data: RoleDto[] }>("/admin/roles"),
  createRole: (body: { name: string; permissions?: string[] }) =>
    api<{ data: RoleDto }>("/admin/roles", { method: "POST", body: JSON.stringify(body) }),
  createStaff: (body: { name: string; email: string; phone?: string; password: string; role: string; permissions?: string[] }) =>
    api<{ data: StaffDto }>("/admin/staff", { method: "POST", body: JSON.stringify(body) }),
  updateStaffPermissions: (userId: number, permissions: string[]) =>
    api(`/admin/staff/${userId}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissions }),
    }),
  searchUsers: (q: string) =>
    api<{ data: UserRoleDto[] }>(`/admin/users/search?q=${encodeURIComponent(q)}`),
  updateUserRoles: (userId: number, body: { roles: string[]; store_name?: string }) =>
    api<{ data: UserRoleDto }>(`/admin/users/${userId}/roles`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  orders: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams()
    if (params?.status) q.set("status", params.status)
    if (params?.search) q.set("search", params.search)
    const qs = q.toString()
    return api<{ data: OrderDto[] }>(`/admin/orders${qs ? `?${qs}` : ""}`)
  },
  order: (id: number) => api<{ data: OrderDetailDto }>(`/admin/orders/${id}`),
  pendingPayments: () => api<{ data: OrderDto[] }>("/admin/payments/pending"),
  paymentOverride: (body: { order_id: number; new_status: string; reason: string }) =>
    api("/admin/payments/override", { method: "POST", body: JSON.stringify(body) }),
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
  user?: { name: string; phone: string }
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
