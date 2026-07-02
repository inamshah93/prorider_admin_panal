# Velo Platform — Pending Tasks

Last updated: 2026-07-02

## Phase 1 — Remaining (incomplete)

| # | Task | App | Notes |
|---|------|-----|-------|
| 1.1 | Firebase FCM wiring | Rider, Merchant, Backend | `DeviceTokenRegistry` ready; needs `google-services.json` + `firebase_messaging` |
| 1.2 | Push on assign/pickup/deliver | Backend + Apps | `SendFcmNotificationJob` exists; trigger from more events |
| 1.3 | Admin permission-gated nav | Admin UI | `hasPermission()` unused in sidebar |
| 1.4 | Rider document approve UI | Admin UI | API exists, no button |
| 1.5 | Assign city post-create | Admin UI | `PUT riders/{id}/city` not in UI |
| 1.6 | Reports page | Admin UI | `reports/day-end`, `reports/riders` APIs only |
| 1.7 | Vendor ledger on detail | Admin UI | `GET merchants/{id}` ledger not shown |
| 1.8 | Shopify connect UI | Admin + Merchant | API only |
| 1.9 | Create city / alias UI | Admin Settings | POST APIs exist |
| 1.10 | Staff permissions edit | Admin Management | Matrix is read-only |
| 1.11 | Global search | Admin UI | Header search icon dead |
| 1.12 | Notifications bell | Admin UI | No handler |
| 1.13 | `velo_core` remote repo | velo_core | Local only; no origin push target |

---

## Phase 2 — In progress

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

## Phase 3 — Finance & Reports

- Admin reports page (day-end, rider performance)
- Vendor ledger / payables detail
- Merchant earnings view
- Rider earnings breakdown
- CSV export (orders, settlements)

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
