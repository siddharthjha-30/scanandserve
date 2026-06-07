import { db } from './firebase.js';
import { getLastOrderId } from './state.js';
import { subscribeToOrder } from './track.js';

const statusElement = document.getElementById('track-status');
const orderId = getLastOrderId();

subscribeToOrder({
  db,
  orderId,
  onUpdate: (order) => {
    statusElement.textContent = `Order ${orderId || '-'} status: ${order.status || 'unknown'}`;
  },
  onError: () => {
    statusElement.textContent = 'Unable to load order status right now.';
  },
});
