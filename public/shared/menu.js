import { collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";
import { setCachedSettings } from "./state.js";

export async function loadRestaurantSettings(restaurantId) {
  if (!db) return null;
  const snap = await getDoc(doc(db, "restaurants", restaurantId));
  if (!snap.exists()) return null;
  const data = snap.data();
  const settings = {
    name: data.name ?? "Restaurant",
    service_charge_pct: data.settings?.service_charge_pct ?? 0,
    rounding_rule: data.settings?.rounding_rule ?? "none",
    currency: data.settings?.currency ?? "USD",
  };
  setCachedSettings(settings);
  return { ...data, _settings: settings };
}

export async function loadMenu(restaurantId) {
  if (!db) return { categories: [], items: [] };
  const [catsSnap, itemsSnap] = await Promise.all([
    getDocs(query(collection(db, "categories"), where("restaurant_id", "==", restaurantId))),
    getDocs(query(collection(db, "menu_items"), where("restaurant_id", "==", restaurantId))),
  ]);
  const categories = catsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const items = itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    .filter((i) => i.available !== false);
  return { categories, items };
}