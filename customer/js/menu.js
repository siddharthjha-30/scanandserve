import {
  collection,
  getDocs,
  query,
  where,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export async function fetchMenuItems(db, restaurantId) {
  if (!restaurantId) return [];
  const menuQuery = query(collection(db, 'menu_items'), where('restaurant_id', '==', restaurantId));
  const snapshot = await getDocs(menuQuery);
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((item) => item.active !== false)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}
