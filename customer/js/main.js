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

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function renderCart() {
  const cartList = document.getElementById('cart-list');
  const tipPercent = Number(document.getElementById('tip-percent').value || 0);
  const totals = calculateTotals(cart, { serviceChargeRate: 0.1, tipPercent, enableRoundToNearestFive: true });
  clearChildren(cartList);
  if (!cart.length) {
    const empty = document.createElement('p');
    empty.className = 'text-sm text-gray-500';
    empty.textContent = 'Cart is empty';
    cartList.appendChild(empty);
  } else {
    for (const item of cart) {
      const row = document.createElement('div');
      row.className = 'flex justify-between text-sm';
      const left = document.createElement('span');
      left.textContent = `${item.name} x ${item.quantity}`;
      const right = document.createElement('span');
      right.textContent = `₹${(item.price * item.quantity).toFixed(2)}`;
      row.append(left, right);
      cartList.appendChild(row);
    }
  }
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
  clearChildren(menu);
  if (!menuItems.length) {
    const empty = document.createElement('p');
    empty.className = 'text-sm text-gray-500';
    empty.textContent = 'No menu items found.';
    menu.appendChild(empty);
    return;
  }

  for (const item of menuItems) {
    const row = document.createElement('div');
    row.className = 'flex justify-between items-center border rounded p-2';

    const details = document.createElement('div');
    const name = document.createElement('p');
    name.className = 'font-medium text-sm';
    name.textContent = item.name || 'Unnamed item';
    const price = document.createElement('p');
    price.className = 'text-xs text-gray-500';
    price.textContent = `₹${Number(item.price || 0).toFixed(2)}`;
    details.append(name, price);

    const button = document.createElement('button');
    button.className = 'add-item rounded bg-black text-white px-2 py-1 text-xs';
    button.textContent = 'Add';
    button.addEventListener('click', () => addToCart(item));

    row.append(details, button);
    menu.appendChild(row);
  }
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
