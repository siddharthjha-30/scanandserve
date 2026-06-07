import { db } from './firebase.js';
import { calculateTotals } from './cart.js';
import { submitOrder } from './checkout.js';
import { fetchMenuItems } from './menu.js';
import {
  getCart,
  getRestaurantId,
  getTableNumber,
  setCart,
  setRestaurantId,
  setTableNumber,
} from './state.js';

const params = new URLSearchParams(window.location.search);
const restaurantId = params.get('restaurant') || getRestaurantId();
const tableNumber = params.get('table') || getTableNumber();

setRestaurantId(restaurantId);
setTableNumber(tableNumber);

document.getElementById('table-meta').textContent = `Restaurant: ${restaurantId || 'unknown'} · Table: ${tableNumber || 'unknown'}`;

let cart = getCart();
let menuItems = [];

function renderCart() {
  const cartList = document.getElementById('cart-list');
  const tipPercent = Number(document.getElementById('tip-percent').value || 0);
  const totals = calculateTotals(cart, { serviceChargeRate: 0.1, tipPercent, enableRoundToNearestFive: true });
  cartList.innerHTML = cart.map((item) => `<div class="flex justify-between text-sm"><span>${item.name} x ${item.quantity}</span><span>₹${(item.price * item.quantity).toFixed(2)}</span></div>`).join('') || '<p class="text-sm text-gray-500">Cart is empty</p>';
  document.getElementById('totals').textContent = JSON.stringify(totals, null, 2);
  setCart(cart);
  return totals;
}

function addToCart(item) {
  const existing = cart.find((entry) => entry.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: item.id, name: item.name, price: Number(item.price || 0), quantity: 1 });
  }
  renderCart();
}

function renderMenu() {
  const menu = document.getElementById('menu-list');
  menu.innerHTML = menuItems.map((item) => `
    <div class="flex justify-between items-center border rounded p-2">
      <div>
        <p class="font-medium text-sm">${item.name}</p>
        <p class="text-xs text-gray-500">₹${Number(item.price || 0).toFixed(2)}</p>
      </div>
      <button data-id="${item.id}" class="add-item rounded bg-black text-white px-2 py-1 text-xs">Add</button>
    </div>
  `).join('') || '<p class="text-sm text-gray-500">No menu items found.</p>';

  menu.querySelectorAll('.add-item').forEach((button) => {
    button.addEventListener('click', () => {
      const selected = menuItems.find((entry) => entry.id === button.dataset.id);
      if (selected) addToCart(selected);
    });
  });
}

async function initialize() {
  menuItems = await fetchMenuItems(db, restaurantId);
  renderMenu();
  renderCart();
}

initialize();

document.getElementById('tip-percent').addEventListener('input', renderCart);
document.getElementById('checkout-btn').addEventListener('click', async () => {
  const totals = renderCart();
  const result = await submitOrder({ db, restaurantId, tableNumber, cartItems: cart, totals });
  document.getElementById('checkout-status').textContent = result.offline
    ? `Offline order created: ${result.orderId}`
    : `Order placed: ${result.orderId}`;
  window.location.href = './track.html';
});
