import { addDoc, collection, writeBatch, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";

// Returns { id, local } where local=true means the order was saved offline with an L-prefix id.
export async function placeOrder({ restaurantId, tableNumber, customerName, items, totals }) {
  const orderPayload = {
    restaurant_id: restaurantId,
    table_number: tableNumber,
    customer_name: customerName ?? null,
    status: "new",
    totals,
    created_at: serverTimestamp ? serverTimestamp() : new Date().toISOString(),
  };

  if (!db) return offlineFallback(orderPayload, items);

  try {
    const orderRef = await addDoc(collection(db, "orders"), orderPayload);
    const batch = writeBatch(db);
    for (const it of items) {
      const itemRef = doc(collection(db, "order_items"));
      batch.set(itemRef, {
        order_id: orderRef.id,
        restaurant_id: restaurantId,
        menu_item_id: it.menu_item_id,
        name_snapshot: it.name,
        price_snapshot: Number(it.price),
        qty: Number(it.qty),
        notes: it.notes ?? null,
      });
    }
    await batch.commit();
    return { id: orderRef.id, local: false };
  } catch (err) {
    console.warn("[checkout] online place failed, falling back to local id", err);
    return offlineFallback(orderPayload, items);
  }
}

function offlineFallback(orderPayload, items) {
  const id = "L" + Date.now();
  const stub = { id, order: orderPayload, items };
  try { localStorage.setItem(`ss.local_order.${id}`, JSON.stringify(stub)); } catch {}
  return { id, local: true };
}

export function loadLocalOrder(id) {
  try { return JSON.parse(localStorage.getItem(`ss.local_order.${id}`) || "null"); } catch { return null; }
}