// Scan & Serve Cloud Functions
// ----------------------------------------------------------------------------
// TODO before deploy:
//   1. Set Firebase project id with `firebase use <project>`.
//   2. Configure secrets: `firebase functions:secrets:set STRIPE_SECRET_KEY`
//      and price IDs (STRIPE_PRICE_BASIC, STRIPE_PRICE_PRO).
//   3. `npm install` inside this folder, then `firebase deploy --only functions`.
// ----------------------------------------------------------------------------
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentWritten } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";

initializeApp();
const db = getFirestore();

const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_PRICE_BASIC = defineSecret("STRIPE_PRICE_BASIC");
const STRIPE_PRICE_PRO = defineSecret("STRIPE_PRICE_PRO");

// 1) Stripe Checkout session for SaaS subscription.
export const createCheckoutSession = onCall(
  { secrets: [STRIPE_SECRET_KEY, STRIPE_PRICE_BASIC, STRIPE_PRICE_PRO] },
  async (req) => {
    if (!req.auth) throw new Error("Sign in required.");
    const { planId, restaurantId } = req.data || {};
    const priceId = planId === "pro" ? STRIPE_PRICE_PRO.value() : STRIPE_PRICE_BASIC.value();
    const stripe = new Stripe(STRIPE_SECRET_KEY.value());
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      // TODO: replace with your domain
      success_url: "https://example.com/admin/subscription.html?status=success",
      cancel_url: "https://example.com/admin/subscription.html?status=cancel",
      client_reference_id: restaurantId ?? null,
      metadata: { restaurantId: restaurantId ?? "", uid: req.auth.uid },
    });
    return { url: session.url };
  }
);

// 2) Per-restaurant sequential order numbers (display_number starts at 1).
export const assignRestaurantOrderId = onDocumentCreated("orders/{orderId}", async (event) => {
  const order = event.data?.data();
  if (!order?.restaurant_id) return;
  const counterRef = db.doc(`restaurants/${order.restaurant_id}/counters/orders`);
  const next = await db.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const current = (snap.exists ? snap.data().value : 0) || 0;
    const value = current + 1;
    tx.set(counterRef, { value }, { merge: true });
    return value;
  });
  await event.data.ref.update({ display_number: next });
});

// 3) Denormalize category name onto menu_items for fast reads.
export const syncMenuItemCategory = onDocumentWritten("menu_items/{itemId}", async (event) => {
  const after = event.data?.after?.data();
  if (!after?.category_id) return;
  const catSnap = await db.doc(`categories/${after.category_id}`).get();
  if (!catSnap.exists) return;
  const name = catSnap.data().name;
  if (after.category_name === name) return;
  await event.data.after.ref.update({ category_name: name });
});