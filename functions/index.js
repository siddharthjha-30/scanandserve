const admin = require('firebase-admin');
const { onRequest } = require('firebase-functions/v2/https');
const { onDocumentCreated, onDocumentWritten } = require('firebase-functions/v2/firestore');
const { logger } = require('firebase-functions');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.createCheckoutSession = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!stripeKey || !priceId) {
    res.status(500).json({ error: 'Stripe configuration missing' });
    return;
  }

  try {
    const stripe = require('stripe')(stripeKey);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: req.body.successUrl || 'https://example.com/success',
      cancel_url: req.body.cancelUrl || 'https://example.com/cancel',
      client_reference_id: req.body.restaurantId || null,
      metadata: {
        restaurant_id: String(req.body.restaurantId || ''),
      },
    });

    res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    logger.error('createCheckoutSession failed', err);
    res.status(500).json({ error: 'Unable to create checkout session' });
  }
});

exports.assignRestaurantOrderId = onDocumentCreated('orders/{orderId}', async (event) => {
  const order = event.data?.data();
  const orderRef = event.data?.ref;
  if (!order || !orderRef) return;

  const restaurantId = order.restaurant_id;
  if (!restaurantId) {
    logger.warn('Order missing restaurant_id', { orderId: event.params.orderId });
    return;
  }

  const counterRef = db.doc(`restaurants/${restaurantId}/meta/order_counter`);

  await db.runTransaction(async (tx) => {
    const counterSnap = await tx.get(counterRef);
    const nextValue = (counterSnap.exists ? counterSnap.data().value : 0) + 1;
    tx.set(counterRef, { value: nextValue, updated_at: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    tx.set(orderRef, { restaurant_order_id: nextValue }, { merge: true });
  });
});

exports.syncMenuItemCategory = onDocumentWritten('menu_items/{menuItemId}', async (event) => {
  const after = event.data?.after;
  if (!after?.exists) return;

  const item = after.data();
  const categoryId = item.category_id;
  if (!categoryId) {
    if (item.category_name !== null) {
      await after.ref.set({ category_name: null }, { merge: true });
    }
    return;
  }

  const categorySnap = await db.doc(`categories/${categoryId}`).get();
  const categoryName = categorySnap.exists ? categorySnap.data().name || null : null;

  if (item.category_name === categoryName) {
    return;
  }

  await after.ref.set({ category_name: categoryName }, { merge: true });
});
