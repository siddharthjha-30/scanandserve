import { buildBill } from './bill.js';
import { db } from './firebase.js';
import { getLastOrderId, getLocalOrder } from './state.js';
import { collection, getDocs, query, where, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const output = document.getElementById('bill-output');
const orderId = getLastOrderId();

function renderBillJson(value) {
  output.textContent = '';
  const pre = document.createElement('pre');
  pre.className = 'text-xs';
  pre.textContent = JSON.stringify(value, null, 2);
  output.appendChild(pre);
}

async function loadBill() {
  if (!orderId) {
    output.textContent = 'No order found.';
    return;
  }

  if (orderId.startsWith('L')) {
    const localOrder = getLocalOrder(orderId);
    const bill = buildBill({ id: orderId, ...(localOrder || {}) }, localOrder?.items || []);
    renderBillJson({ offline: true, ...bill });
    return;
  }

  const orderDoc = await getDoc(doc(db, 'orders', orderId));
  if (!orderDoc.exists()) {
    output.textContent = 'Order not found.';
    return;
  }

  const itemsSnapshot = await getDocs(query(collection(db, 'order_items'), where('order_id', '==', orderId)));
  const items = itemsSnapshot.docs.map((d) => d.data());
  const bill = buildBill({ id: orderDoc.id, ...orderDoc.data() }, items);
  renderBillJson(bill);
}

loadBill().catch(() => {
  output.textContent = 'Unable to generate bill while offline.';
});
