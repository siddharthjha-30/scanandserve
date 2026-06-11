// Pure cart math.
export const subtotal = (items) => items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);

export const serviceCharge = (sub, pct) => sub * (Number(pct) || 0) / 100;

export const applyTip = (base, tipPct) => base * (Number(tipPct) || 0) / 100;

// Round-to-nearest-5 (used by some restaurants — e.g. round 247 -> 245, 248 -> 250).
export const roundToNearest5 = (n) => Math.round(n / 5) * 5;

export function computeTotals(items, settings, tipPct) {
  const sub = subtotal(items);
  const svc = serviceCharge(sub, settings.service_charge_pct);
  const tip = applyTip(sub + svc, tipPct);
  let total = sub + svc + tip;
  let roundingAdjustment = 0;
  if (settings.rounding_rule === "nearest_5") {
    const rounded = roundToNearest5(total);
    roundingAdjustment = rounded - total;
    total = rounded;
  }
  return { subtotal: sub, service_charge: svc, tip, rounding_adjustment: roundingAdjustment, total };
}