function money(value) {
  return Number((Number(value) || 0).toFixed(2));
}

export function roundToNearestFive(amount) {
  return Math.round((Number(amount) || 0) / 5) * 5;
}

export function calculateTotals(cartItems, options = {}) {
  const items = Array.isArray(cartItems) ? cartItems : [];
  const subtotal = money(items.reduce((sum, item) => sum + (Number(item.price_snapshot ?? item.price) || 0) * (Number(item.quantity) || 0), 0));
  const serviceChargeRate = Number(options.serviceChargeRate ?? 0.1);
  const serviceCharge = money(subtotal * serviceChargeRate);
  const tipPercent = Number(options.tipPercent ?? 0);
  const tipAmount = money(options.tipAmount ?? subtotal * (tipPercent / 100));
  const preRoundTotal = money(subtotal + serviceCharge + tipAmount);

  if (!options.enableRoundToNearestFive) {
    return { subtotal, serviceCharge, tipAmount, preRoundTotal, roundingAdjustment: 0, total: preRoundTotal };
  }

  const roundedTotal = roundToNearestFive(preRoundTotal);
  const roundingAdjustment = money(roundedTotal - preRoundTotal);
  return {
    subtotal,
    serviceCharge,
    tipAmount,
    preRoundTotal,
    roundingAdjustment,
    total: money(roundedTotal),
  };
}
