import { buildBill } from './bill.js';
import { db } from './firebase.js';
import { getLastOrderId, getLocalOrder } from './state.js';
import { collection, getDocs, query, where, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const output = document.getElementById('bill-output');
const orderId = getLastOrderId();

async function loadBill() {
  if (!orderId) {
    output.textContent = 'No order found.';
    return;
  }

  if (orderId.startsWith('L')) {
    const localOrder = getLocalOrder(orderId);
    const bill = buildBill({ id: orderId, ...(localOrder || {}) }, localOrder?.items || []);
    output.innerHTML = `<pre class="text-xs">${JSON.stringify({ offline: true, ...bill }, null, 2)}</pre>`;
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
  output.innerHTML = `<pre class="text-xs">${JSON.stringify(bill, null, 2)}</pre>`;
}

loadBill().catch(() => {
  output.textContent = 'Unable to generate bill while offline.';
});
