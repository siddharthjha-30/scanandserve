import {
  addDoc,
  collection,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { saveLocalOrder, setLastOrderId } from './state.js';

function buildOrderPayload({ restaurantId, tableNumber, totals }) {
  return {
    restaurant_id: restaurantId,
    table_number: tableNumber,
    status: 'pending',
    subtotal: totals.subtotal,
    service_charge: totals.serviceCharge,
    tip_amount: totals.tipAmount,
    rounding_adjustment: totals.roundingAdjustment,
    total: totals.total,
    created_at: serverTimestamp(),
  };
}

export async function submitOrder({ db, restaurantId, tableNumber, cartItems, totals }) {
  const items = Array.isArray(cartItems) ? cartItems : [];
  try {
    const orderRef = await addDoc(collection(db, 'orders'), buildOrderPayload({ restaurantId, tableNumber, totals }));
    await Promise.all(items.map((item) => addDoc(collection(db, 'order_items'), {
      order_id: orderRef.id,
      restaurant_id: restaurantId,
      quantity: Number(item.quantity) || 0,
      menu_item_id: item.id || null,
      name_snapshot: item.name || '',
      price_snapshot: Number(item.price_snapshot ?? item.price) || 0,
      created_at: serverTimestamp(),
    })));
    setLastOrderId(orderRef.id);
    return { orderId: orderRef.id, offline: false };
  } catch (_err) {
    const localOrderId = `L${Date.now()}`;
    saveLocalOrder(localOrderId, {
      status: 'offline_pending',
      restaurant_id: restaurantId,
      table_number: tableNumber,
      totals,
      items,
      created_at: new Date().toISOString(),
    });
    setLastOrderId(localOrderId);
    return { orderId: localOrderId, offline: true };
  }
}
