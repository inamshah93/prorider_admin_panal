# Velo Platform — Testing Checklist

Use this while testing all apps. Backend should run at `http://localhost:8000` and admin at `http://localhost:3000`.

---

## Setup (once)

- [ ] Backend: `php artisan serve` (port 8000)
- [ ] Admin UI: `npm run dev` (port 3000)
- [ ] `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`
- [ ] Test accounts: admin, merchant, rider, customer (or create via admin)

---

## 1. Admin Portal (`prorider_UI`)

### Auth & shell
- [ ] Login with admin credentials
- [ ] Dashboard loads without 500 errors
- [ ] Sidebar navigation works (all menu items)
- [ ] Logout works

### Dashboard
- [ ] Metrics cards show numbers
- [ ] Recent activity list loads
- [ ] Chart renders (if data exists)

### Orders
- [ ] Orders list loads with pagination
- [ ] Search by reference / customer name works
- [ ] Status filter works (created, dispatched, delivered, etc.)
- [ ] COD total for current page is correct
- [ ] **Export CSV** downloads file for current page
- [ ] Click order → detail page opens

### Order detail
- [ ] Order info, customer, COD, status display correctly
- [ ] **Assign rider** — pick online rider, confirm assignment
- [ ] **Reassign rider** — change to another rider
- [ ] **Cancel order** — confirm cancellation, status updates
- [ ] Activity reflects in Activity Logs (assign / cancel)

### Vendors (Merchants)
- [ ] List loads with search + pagination
- [ ] Create new merchant works
- [ ] Vendor detail page shows store info
- [ ] **Payables** amount visible on detail
- [ ] **Financial ledger** table shows entries
- [ ] Merchant orders list + status filter on detail page

### Riders
- [ ] Riders list loads
- [ ] Toggle online/offline status
- [ ] Rider detail: wallet, settlements
- [ ] Create rider, approve rider (if pending)

### Customers
- [ ] List loads with search + pagination

### Finance
- [ ] Pending payments list loads
- [ ] Payment override (if applicable) works with reason

### Reports (Phase 3)
- [ ] **Reports** nav opens `/reports`
- [ ] Day-end snapshots table loads (or empty state message)
- [ ] Rider performance table loads
- [ ] Rider name links to `/riders/[id]` correctly

### Activity logs
- [ ] Logs list loads with pagination
- [ ] Search / filter by action works
- [ ] Assign & cancel actions appear after testing orders

### Settings
- [ ] Cities list loads, toggle active city
- [ ] Pricing settings load and save

---

## 2. Backend API (optional curl / Postman)

- [ ] `GET /api/v1/admin/dashboard` — 200
- [ ] `GET /api/v1/admin/activity-logs` — 200
- [ ] `GET /api/v1/admin/reports/day-end` — 200
- [ ] `GET /api/v1/admin/reports/riders` — 200
- [ ] `GET /api/v1/admin/merchants/{id}` — includes `ledger` + `payables`
- [ ] Assign rider creates audit log entry
- [ ] Cancel order creates audit log entry

---

## 3. Rider App (`prorider_rider_app`)

### Auth & profile
- [ ] Login with rider credentials
- [ ] Profile / home loads

### Online & GPS (Phase 1)
- [ ] Toggle **Go online** — location permission prompt (Android)
- [ ] While online, location updates sent (~every 30s)
- [ ] Toggle offline stops tracking

### Orders
- [ ] Assigned orders appear in list
- [ ] Open order detail
- [ ] **Navigate** button opens Google Maps (Phase 2)
- [ ] Mark **picked up** — status updates
- [ ] Mark **delivered** — COD collected, status updates

### Wallet (Phase 3)
- [ ] Wallet screen shows cash in hand, collected, commission, settled
- [ ] Commission rate displayed
- [ ] **Earnings breakdown** — recent ledger entries list

### Push (if Firebase configured)
- [ ] Device token registered after login
- [ ] Notification on new assignment (needs FCM setup)

---

## 4. Merchant App (`prorider_merchant_app`)

### Auth & dashboard
- [ ] Login with merchant credentials
- [ ] Dashboard shows delivered today + payables
- [ ] **Total orders** and **Delivered (all time)** cards (Phase 3)
- [ ] **Lifetime COD delivered** card (Phase 3)
- [ ] Recent orders list on dashboard

### Orders (Phase 1)
- [ ] **Orders** tab — full list with search / filter / pagination
- [ ] "View all" from dashboard navigates to orders
- [ ] Order detail shows correct status

### Book order
- [ ] Create new order (book flow)
- [ ] Label → pack → ship lifecycle (if implemented)

### Push (if Firebase configured)
- [ ] Token sync after login

---

## 5. Customer App (`prorider_customer_app`)

### Guest tracking (Phase 2)
- [ ] Track screen: enter order reference
- [ ] Optional phone field for verification
- [ ] Timeline / status steps display
- [ ] **Live map** shows store + rider pins (when dispatched)
- [ ] **ETA minutes** shown when rider location available

### Account (if logged in)
- [ ] Login / register
- [ ] Order history loads

### Push (if Firebase configured)
- [ ] Token registered on login

---

## 6. End-to-end flow (recommended)

1. [ ] Admin creates merchant + rider (or use existing)
2. [ ] Merchant books order → status `created` / `ready_to_ship`
3. [ ] Merchant ships order → `dispatched`
4. [ ] Admin assigns rider (or auto-assign if configured)
5. [ ] Rider sees assignment → navigates → picks up → delivers
6. [ ] Customer tracks on map with ETA
7. [ ] Admin: order `delivered`, finance/reports update
8. [ ] Rider wallet shows commission entry
9. [ ] Merchant dashboard payables / lifetime COD update
10. [ ] Admin activity log shows assign/cancel events

---

## Known limitations (not bugs)

| Item | Status |
|------|--------|
| Firebase FCM push | Needs `google-services.json` in mobile apps |
| Admin live rider map | Phase 2.5 — not built yet |
| CSV export | Current **page only**, not full dataset |
| velo_core package | Local only, no remote repo |

---

## Report issues

Note: app name, screen, steps, expected vs actual, screenshot if possible.
