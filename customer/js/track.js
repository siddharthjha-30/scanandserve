import { doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getLocalOrder } from './state.js';

export function subscribeToOrder({ db, orderId, onUpdate, onError }) {
  if (!orderId) {
    onUpdate({ status: 'missing_order' });
    return () => {};
  }

  if (String(orderId).startsWith('L')) {
    const localOrder = getLocalOrder(orderId);
    onUpdate({ status: localOrder?.status || 'offline_pending', local: true, ...localOrder });
    return () => {};
  }

  return onSnapshot(
    doc(db, 'orders', orderId),
    (snapshot) => {
      onUpdate(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : { status: 'not_found' });
    },
    (err) => onError?.(err),
  );
}
