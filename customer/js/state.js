const STORAGE_KEYS = {
  restaurantId: 'restaurant_id',
  tableNumber: 'table_number',
  cart: 'cart',
  lastOrderId: 'last_order_id',
  localOrderPrefix: 'local_order_',
};

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, value),
    removeItem: (key) => map.delete(key),
  };
}

function resolveStorage(storage) {
  if (storage) return storage;
  try {
    if (globalThis.localStorage) return globalThis.localStorage;
  } catch (_err) {
    // ignored
  }
  return createMemoryStorage();
}

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (_err) {
    return fallback;
  }
}

export function createStateStore(storage) {
  const store = resolveStorage(storage);
  return {
    getRestaurantId: () => store.getItem(STORAGE_KEYS.restaurantId) || '',
    setRestaurantId: (value) => store.setItem(STORAGE_KEYS.restaurantId, String(value || '')),
    getTableNumber: () => store.getItem(STORAGE_KEYS.tableNumber) || '',
    setTableNumber: (value) => store.setItem(STORAGE_KEYS.tableNumber, String(value || '')),
    getCart: () => parseJson(store.getItem(STORAGE_KEYS.cart), []),
    setCart: (items) => store.setItem(STORAGE_KEYS.cart, JSON.stringify(items || [])),
    getLastOrderId: () => store.getItem(STORAGE_KEYS.lastOrderId) || '',
    setLastOrderId: (value) => store.setItem(STORAGE_KEYS.lastOrderId, String(value || '')),
    saveLocalOrder: (id, payload) => store.setItem(`${STORAGE_KEYS.localOrderPrefix}${id}`, JSON.stringify(payload || {})),
    getLocalOrder: (id) => parseJson(store.getItem(`${STORAGE_KEYS.localOrderPrefix}${id}`), null),
    clearLocalOrder: (id) => store.removeItem(`${STORAGE_KEYS.localOrderPrefix}${id}`),
  };
}

const defaultStore = createStateStore();

export const getRestaurantId = () => defaultStore.getRestaurantId();
export const setRestaurantId = (value) => defaultStore.setRestaurantId(value);
export const getTableNumber = () => defaultStore.getTableNumber();
export const setTableNumber = (value) => defaultStore.setTableNumber(value);
export const getCart = () => defaultStore.getCart();
export const setCart = (value) => defaultStore.setCart(value);
export const getLastOrderId = () => defaultStore.getLastOrderId();
export const setLastOrderId = (value) => defaultStore.setLastOrderId(value);
export const saveLocalOrder = (id, payload) => defaultStore.saveLocalOrder(id, payload);
export const getLocalOrder = (id) => defaultStore.getLocalOrder(id);
export const clearLocalOrder = (id) => defaultStore.clearLocalOrder(id);
