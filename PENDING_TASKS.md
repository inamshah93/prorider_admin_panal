# Velo Platform — Pending Tasks

Last updated: 2026-07-02

## Phase 1 — Done (minor gaps remain)

| # | Task | App | Notes |
|---|------|-----|-------|
| 1.1 | Firebase FCM wiring | Rider, Merchant, Backend | `DeviceTokenRegistry` ready; needs `google-services.json` + `firebase_messaging` |
| 1.2 | Push on assign/pickup/deliver | Backend + Apps | Partial — `OrderNotificationService` wired |
| 1.3 | Admin permission-gated nav | Admin UI | `hasPermission()` unused in sidebar |
| 1.4 | Rider document approve UI | Admin UI | API exists, no button |
| 1.5 | Assign city post-create | Admin UI | `PUT riders/{id}/city` not in UI |
| 1.6 | Reports page | Admin UI | **Done** (Phase 3) |
| 1.7 | Vendor ledger on detail | Admin UI | **Done** (Phase 3) |

Core Phase 1 complete: order assign/cancel, pagination, activity logs, rider GPS, merchant orders list.

---

## Phase 2 — Mostly done

| # | Task | App | Status |
|---|------|-----|--------|
| 2.1 | Live map + rider pin on track | Customer | Done |
| 2.2 | ETA on tracking | Backend + Customer | Done |
| 2.3 | Phone verify on public track | Customer + Backend | Done |
| 2.4 | Rider navigate to address | Rider | Done |
| 2.5 | Admin live rider map | Admin | Pending |
| 2.6 | Status push notifications | Backend | Partial (assign/pickup/deliver FCM) |
| 2.7 | Firebase config in mobile apps | All apps | Pending |

---

## Phase 3 — Done

| # | Task | App | Status |
|---|------|-----|--------|
| 3.1 | Admin reports page | Admin UI | Done — day-end + rider performance |
| 3.2 | Vendor ledger / payables detail | Admin UI | Done |
| 3.3 | Merchant earnings view | Merchant app + Backend | Done — totals + lifetime COD |
| 3.4 | Rider earnings breakdown | Rider app + Backend | Done — recent ledger entries |
| 3.5 | CSV export (orders) | Admin UI | Done — current page export |

---

## Phase 4 — Rider & Merchant complete

- Proof of delivery (photo + signature)
- Rider KYC upload + admin approve flow
- Accept/reject assignment
- Failed delivery flow
- Merchant catalog CRUD
- Label print/share

---

## Phase 5 — Customer polish

- Rate delivery
- Guest track → account link
- Order history filters
- Contact rider
- Customer web tracking portal

---

## Phase 6 — Scale

- Returns / RTO proper flow
- SMS notifications
- Merchant web dashboard (mockup → real)
- Bulk CSV import
- Zone / weight pricing
- Analytics dashboard

---

## Other backlog

| Task | App |
|------|-----|
| Shopify connect UI | Admin + Merchant |
| Create city / alias UI | Admin Settings |
| Staff permissions edit | Admin Management |
| Global search | Admin UI |
| Notifications bell | Admin UI |
| `velo_core` remote repo | velo_core |

See **TESTING.md** for full manual test checklist.
