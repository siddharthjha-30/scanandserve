import test from 'node:test';
import assert from 'node:assert/strict';
import { createStateStore } from '../customer/js/state.js';

function fakeStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
}

test('state store persists restaurant, table and cart', () => {
  const store = createStateStore(fakeStorage());

  store.setRestaurantId('demo123');
  store.setTableNumber('7');
  store.setCart([{ id: 'item-1', quantity: 2 }]);

  assert.equal(store.getRestaurantId(), 'demo123');
  assert.equal(store.getTableNumber(), '7');
  assert.deepEqual(store.getCart(), [{ id: 'item-1', quantity: 2 }]);
});
