/**
 * Mirrors admin isCustomCakeOrder / isAwaitingQuote logic (no build step).
 * Run: node scripts/verify-order-classification.mjs
 */

function orderHasCatalogItem(order) {
  return (order.items ?? []).some((item) => {
    if (item.cakeId == null || item.cakeId === "") return false;
    return String(item.cakeId).trim().length > 0;
  });
}

function isCustomCakeOrder(order) {
  return !orderHasCatalogItem(order);
}

function isAwaitingQuote(order) {
  return (
    isCustomCakeOrder(order) &&
    order.totalAmount === 0 &&
    (order.quotedAmount == null || order.quotedAmount === 0)
  );
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
  console.log(`PASS: ${msg}`);
}

assert(
  !isCustomCakeOrder({
    totalAmount: 0,
    items: [{ cakeId: "abc", cakeName: "Zero" }],
  }),
  "Zero-price catalog = Active only",
);
assert(
  !isCustomCakeOrder({
    totalAmount: 1000,
    items: [{ cakeId: "abc", cakeName: "Paid" }],
  }),
  "Paid catalog = Active only",
);
assert(
  !isCustomCakeOrder({
    totalAmount: 0,
    items: [{ cakeId: "combo1", cakeName: "Combo" }],
  }),
  "Combo catalog = Active only",
);
assert(
  isCustomCakeOrder({
    totalAmount: 0,
    items: [{ cakeName: "Custom" }],
  }) &&
    isAwaitingQuote({
      totalAmount: 0,
      items: [{ cakeName: "Custom" }],
    }),
  "Custom cake = Active + Custom Cakes (awaiting quote)",
);
assert(
  isCustomCakeOrder({
    totalAmount: 0,
    quotedAmount: 3000,
    items: [{ cakeName: "Custom" }],
  }) &&
    !isAwaitingQuote({
      totalAmount: 0,
      quotedAmount: 3000,
      items: [{ cakeName: "Custom" }],
    }),
  "Quoted custom cake still custom; quote workflow eligibility via isCustomCakeOrder",
);

console.log("\nAll admin verify-order-classification checks passed.");
