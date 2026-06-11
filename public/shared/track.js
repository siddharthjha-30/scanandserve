import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";
import { loadLocalOrder } from "./checkout.js";

export function subscribeOrder(id, onUpdate) {
  if (id.startsWith("L") || !db) {
    const local = loadLocalOrder(id);
    onUpdate({ local: true, order: local?.order ?? null, items: local?.items ?? [] });
    return () => {};
  }
  return onSnapshot(doc(db, "orders", id), (snap) => {
    onUpdate({ local: false, order: snap.exists() ? { id: snap.id, ...snap.data() } : null });
  });
}

export const STATUS_LABELS = {
  new: "Order received",
  preparing: "Being prepared",
  ready: "Ready to serve",
  served: "Served",
  paid: "Paid",
  cancelled: "Cancelled",
};

export const STATUS_FLOW = ["new", "preparing", "ready", "served", "paid"];