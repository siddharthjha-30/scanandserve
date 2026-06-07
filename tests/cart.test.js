import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotals, roundToNearestFive } from '../customer/js/cart.js';

test('roundToNearestFive rounds to the nearest 5', () => {
  assert.equal(roundToNearestFive(102), 100);
  assert.equal(roundToNearestFive(103), 105);
});

test('calculateTotals computes subtotal/service/tip with rounding', () => {
  const totals = calculateTotals(
    [
      { price: 100, quantity: 2 },
      { price: 59, quantity: 1 },
    ],
    { serviceChargeRate: 0.1, tipPercent: 5, enableRoundToNearestFive: true },
  );

  assert.equal(totals.subtotal, 259);
  assert.equal(totals.serviceCharge, 25.9);
  assert.equal(totals.tipAmount, 12.95);
  assert.equal(totals.preRoundTotal, 297.85);
  assert.equal(totals.total, 300);
});
