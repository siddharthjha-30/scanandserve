import { db } from './firebase.js';
import { getLastOrderId } from './state.js';
import { subscribeToOrder } from './track.js';

const statusElement = document.getElementById('track-status');
const orderId = getLastOrderId();
const STATUS_LABELS = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready for pickup',
  served: 'Served',
  paid: 'Paid',
  offline_pending: 'Pending (offline)',
  not_found: 'Order not found',
  missing_order: 'No order selected',
};

subscribeToOrder({
  db,
  orderId,
  onUpdate: (order) => {
    const statusText = STATUS_LABELS[order.status] || 'Unknown';
    statusElement.textContent = `Order ${orderId || '-'} status: ${statusText}`;
  },
  onError: () => {
    statusElement.textContent = 'Unable to load order status right now.';
  },
});
