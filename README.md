# Scan & Serve

QR-based restaurant ordering scaffold built with static HTML/Tailwind + Firebase.

## Features in this scaffold

- Multi-tenant data model via `restaurant_id`
- Customer flow: QR entry → menu → cart → checkout → track → bill
- LocalStorage session helpers for `restaurant_id`, `table_number`, cart, and `last_order_id`
- Cart totals with service charge, tip handling, and optional round-to-nearest-5
- Offline fallback order ids prefixed with `L`
- Firebase Cloud Functions for:
  - Stripe subscription checkout session creation
  - Per-restaurant order numbering on order creation
  - Menu item category name denormalization

## Project structure

- `/customer` static frontend pages and modular ES scripts
- `/functions` Firebase Cloud Functions scaffold
- `/tests` focused tests for state/cart modules

## Local run

```bash
# Static frontend
python -m http.server 5500
# or
npx http-server -p 5500
```

Open: `http://localhost:5500/customer/index.html?restaurant=demo123&table=7`

```bash
# Tests
npm test
```

```bash
# Functions local setup
cd functions
npm install
firebase emulators:start --only functions
```

Set function environment before deployment/emulation:

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`

## Notes

This is a lightweight scaffold. Add production-grade Firestore security rules and strong staff authz/authn before going live.
