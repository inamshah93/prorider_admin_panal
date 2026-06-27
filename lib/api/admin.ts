import { api } from "@/lib/api/client"

export const adminApi = {
  dashboard: () => api<{ metrics: Record<string, number>; recent_activity: unknown[]; chart_data: { date: string; count: number }[] }>("/admin/dashboard"),
  cities: () => api<{ data: CityDto[] }>("/admin/cities"),
  updateCity: (id: number, body: Partial<CityDto>) =>
    api<{ data: CityDto }>(`/admin/cities/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  aliases: () => api<{ data: { id: number; typo: string; maps: string }[] }>("/admin/city-aliases"),
  merchants: (search?: string) =>
    api<{ data: MerchantDto[] }>(`/admin/merchants${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  riders: (onlineOnly?: boolean) =>
    api<{ data: RiderDto[] }>(`/admin/riders${onlineOnly ? "?online_only=1" : ""}`),
  approveRider: (id: number) => api(`/admin/riders/${id}/approve`, { method: "POST" }),
  staff: () => api<{ data: StaffDto[] }>("/admin/staff"),
  permissions: () => api<{ data: { key: string; label: string }[]; roles: string[] }>("/admin/permissions"),
  updateStaffPermissions: (userId: number, permissions: string[]) =>
    api(`/admin/staff/${userId}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissions }),
    }),
  orders: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams()
    if (params?.status) q.set("status", params.status)
    if (params?.search) q.set("search", params.search)
    const qs = q.toString()
    return api<{ data: OrderDto[] }>(`/admin/orders${qs ? `?${qs}` : ""}`)
  },
  pendingPayments: () => api<{ data: OrderDto[] }>("/admin/payments/pending"),
  paymentOverride: (body: { order_id: number; new_status: string; reason: string }) =>
    api("/admin/payments/override", { method: "POST", body: JSON.stringify(body) }),
}

export type CityDto = { id: number; name: string; province: string; is_active: boolean; aliases?: string[] }
export type MerchantDto = { id: number; store_name: string; manual_saved_items?: unknown[]; user?: { name: string; email: string } }
export type RiderDto = { id: number; is_online: boolean; cash_in_hand: string; documents_verified: boolean; user?: { name: string; phone: string } }
export type StaffDto = { id: number; name: string; email: string; roles: string[]; permissions: string[] }
export type OrderDto = {
  id: number
  order_reference_number: string
  order_status: string
  payment_status: string
  cod_amount: string
  customer_name: string
  target_city?: string
  merchant?: MerchantDto
}
