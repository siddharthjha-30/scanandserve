export const money = (n, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(n) || 0);

export function toast(msg, kind = "info") {
  const el = document.createElement("div");
  el.textContent = msg;
  el.className = `fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg text-sm z-50 ${
    kind === "error" ? "bg-red-600 text-white" : kind === "success" ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"
  }`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));