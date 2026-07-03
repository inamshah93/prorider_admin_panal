# Velo Platform — Complete Testing Checklist

Test after running backend (`php artisan serve`) and admin (`npm run dev`). Mobile apps point to `http://10.0.2.2:8000/api/v1` (Android emulator) or your machine IP.

---

## Setup

- [ ] Backend migrations run: `php artisan migrate`
- [ ] Admin `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`
- [ ] Test accounts: admin, merchant, rider, customer

---

## Phase 1 — Core ops

### Admin
- [ ] Login / logout
- [ ] Dashboard loads
- [ ] Orders: search, filter, pagination, COD total, **Export CSV**
- [ ] Order detail: **assign rider**, **reassign**, **cancel**
- [ ] Vendors: pagination, detail with **payables + ledger**
- [ ] Riders / customers pagination
- [ ] Activity logs after assign/cancel
- [ ] Finance: pending payments
- [ ] Settings: cities, pricing

### Rider app
- [ ] Login, **go online** → GPS permission
- [ ] Location updates while online

### Merchant app
- [ ] Dashboard, **orders list** (search/filter/pagination)
- [ ] Book order flow

---

## Phase 2 — Tracking

### Customer app
- [ ] Guest track: reference + optional phone
- [ ] **Live map** (store + rider pins)
- [ ] **ETA** minutes

### Rider app
- [ ] **Navigate** opens Google Maps

### Admin
- [ ] **Live map** (`/riders/map`) — online riders with GPS

### Push (optional — needs Firebase files)
- [ ] Device token sync after login

---

## Phase 3 — Finance & reports

### Admin
- [ ] **Reports** page: day-end snapshots
- [ ] Rider performance table
- [ ] **Analytics** cards (delivered today, failed, RTO, avg rating)

### Merchant app
- [ ] Dashboard: total orders, delivered all-time, **lifetime COD**

### Rider app
- [ ] Wallet: **earnings breakdown** (recent ledger entries)

---

## Phase 4 — Rider & merchant complete

### Rider app
- [ ] **Accept / reject** assignment (when admin assigns rider)
- [ ] Pickup only works after accept
- [ ] **Failed delivery** with reason
- [ ] **POD photo** on deliver (optional camera)
- [ ] **KYC upload** (`Profile → Documents`)

### Admin
- [ ] Rider detail: **Approve documents**
- [ ] Rider detail: **Assign city**
- [ ] Rider detail: view uploaded documents
- [ ] Order detail: **POD photo / signature** after delivery

### Merchant app
- [ ] **Catalog** tab: add/edit/remove items, save
- [ ] Lifecycle: generate label → **Share / print label**

---

## Phase 5 — Customer polish

### Customer app
- [ ] Track screen: **Call rider** (when out for delivery)
- [ ] Track screen: **Sign up CTA** to link order by phone
- [ ] Account: **order history filters** (all/delivered/in transit/cancelled)
- [ ] Login → orders linked by phone appear

### Web portal
- [ ] Open `http://localhost:3000/track/PR-XXXXXXXX?phone=0300...`
- [ ] Status + milestones display (no login)

---

## Phase 6 — Scale (partial)

### Backend / pricing
- [ ] New order in city with **delivery_surcharge** / **weight_rate_per_kg** → delivery charge includes extras
- [ ] Update city pricing in admin (API: `PUT /admin/cities/{id}`)

### RTO flow
- [ ] Rider marks **failed delivery**
- [ ] Rider marks **returned** (RTO) from failed state
- [ ] Admin reports: failed/returned counts in analytics

### Bulk orders (API)
- [ ] `POST /merchant/orders/bulk` with array of orders (Postman)

### SMS
- [ ] Check `storage/logs/laravel.log` for `[SMS stub]` on deliver/fail (real SMS needs provider config)

---

## End-to-end flow (recommended)

1. [ ] Merchant adds catalog items → books order → label → pack → ready to ship
2. [ ] Admin assigns rider
3. [ ] Rider **accepts** → navigates → picks up → delivers (with photo)
4. [ ] Customer tracks on map, calls rider if needed
5. [ ] Customer signs up → order appears in history
6. [ ] Admin: reports, activity log, POD on order detail
7. [ ] Rider wallet + merchant dashboard update

### Failure path
1. [ ] Rider **failed delivery** → customer sees update
2. [ ] Rider **returned (RTO)** → merchant notified

---

## Known limitations

| Item | Notes |
|------|-------|
| Firebase push | Add `google-services.json` + `firebase_messaging` to each app |
| CSV export | Current page only |
| Rating UI | Customer must sign in; rate via `POST /customer/orders/{id}/rate` |
| Merchant web dashboard | Mockup only, not API-backed |
| Admin bulk import | API for merchant bulk only; no admin UI yet |

---

## Report bugs

Note: app, screen, steps, expected vs actual, screenshot if possible.
