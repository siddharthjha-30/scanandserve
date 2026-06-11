import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";
import { loadLocalOrder } from "./checkout.js";

export async function loadBill(orderId) {
  if (orderId.startsWith("L") || !db) {
    const local = loadLocalOrder(orderId);
    return { local: true, order: local?.order ?? null, items: local?.items ?? [] };
  }
  const orderSnap = await getDoc(doc(db, "orders", orderId));
  if (!orderSnap.exists()) return { local: false, order: null, items: [] };
  const order = { id: orderSnap.id, ...orderSnap.data() };
  const itemsSnap = await getDocs(query(collection(db, "order_items"), where("order_id", "==", orderId)));
  const items = itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return { local: false, order, items };
}