// Parse restaurant + table from URL query (?restaurant=demo123&table=7) and persist.
import { setRestaurantId, setTableNumber, getRestaurantId, getTableNumber } from "./state.js";

export function captureFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const r = params.get("restaurant");
  const t = params.get("table");
  if (r) setRestaurantId(r);
  if (t) setTableNumber(t);
  return { restaurantId: r ?? getRestaurantId(), tableNumber: t ?? getTableNumber() };
}

export function requireRestaurant() {
  const id = getRestaurantId();
  if (!id) {
    document.body.innerHTML = `<div class="p-8 text-center text-slate-700">No restaurant selected. Please scan the QR code at your table.</div>`;
    throw new Error("no restaurant_id");
  }
  return id;
}