// LocalStorage helpers for ephemeral customer session.
const K = {
  restaurant: "ss.restaurant_id",
  table: "ss.table_number",
  cart: "ss.cart",
  tip: "ss.tip_pct",
  lastOrder: "ss.last_order_id",
  settings: "ss.restaurant_settings",
};

const read = (k, fallback = null) => {
  try { const v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); }
  catch { return fallback; }
};
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const getRestaurantId = () => read(K.restaurant);
export const setRestaurantId = (id) => write(K.restaurant, id);
export const getTableNumber = () => read(K.table);
export const setTableNumber = (n) => write(K.table, n);

export const getCart = () => read(K.cart, []);
export const setCart = (items) => write(K.cart, items);
export const clearCart = () => write(K.cart, []);
export const addToCart = (item) => {
  const cart = getCart();
  const existing = cart.find((c) => c.menu_item_id === item.menu_item_id);
  if (existing) existing.qty += item.qty ?? 1;
  else cart.push({ qty: 1, ...item });
  setCart(cart);
};
export const updateQty = (menuItemId, qty) => {
  const cart = getCart().map((c) => c.menu_item_id === menuItemId ? { ...c, qty } : c).filter((c) => c.qty > 0);
  setCart(cart);
};

export const getTipPct = () => read(K.tip, 0);
export const setTipPct = (p) => write(K.tip, p);

export const getLastOrderId = () => read(K.lastOrder);
export const setLastOrderId = (id) => write(K.lastOrder, id);

export const getCachedSettings = () => read(K.settings, { service_charge_pct: 0, rounding_rule: "none", currency: "USD" });
export const setCachedSettings = (s) => write(K.settings, s);