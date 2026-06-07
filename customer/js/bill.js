export function buildBill(order, orderItems = []) {
  const amount = (value) => Number((Number(value) || 0).toFixed(2));
  const items = Array.isArray(orderItems) ? orderItems : [];
  const lineItems = items.map((item) => ({
    name: item.name_snapshot || item.name || 'Item',
    quantity: Number(item.quantity) || 0,
    unitPrice: Number(item.price_snapshot ?? item.price) || 0,
    lineTotal: (Number(item.quantity) || 0) * (Number(item.price_snapshot ?? item.price) || 0),
  }));

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  return {
    orderId: order?.id || null,
    status: order?.status || 'unknown',
    lineItems,
    subtotal: amount(subtotal),
    serviceCharge: amount(order?.service_charge),
    tipAmount: amount(order?.tip_amount),
    roundingAdjustment: amount(order?.rounding_adjustment),
    total: amount(order?.total || subtotal),
  };
}
