# Cloud Functions setup

1. `cd functions && npm install`
2. `firebase login` and `firebase use <your-project-id>`
3. Set Stripe secrets:
   ```
   firebase functions:secrets:set STRIPE_SECRET_KEY
   firebase functions:secrets:set STRIPE_PRICE_BASIC
   firebase functions:secrets:set STRIPE_PRICE_PRO
   ```
4. Deploy: `firebase deploy --only functions,firestore:rules,firestore:indexes`

## Local dev

- Static site: `npx http-server public -p 5500`
- Functions emulator: `firebase emulators:start --only functions,firestore`

## First-time data

Create a Firestore doc at `restaurants/demo123` with `{ name, settings: { service_charge_pct, rounding_rule, currency } }`, then visit `/customer/index.html?restaurant=demo123&table=7`.
