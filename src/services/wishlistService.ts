import { collection, doc, setDoc, deleteDoc, getDocs, query, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export async function addToWishlist(productId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be signed in to add to wishlist');

  const wishlistRef = doc(db, 'users', user.uid, 'wishlist', productId);
  await setDoc(wishlistRef, {
    productId,
    addedAt: serverTimestamp()
  });
}

export async function removeFromWishlist(productId: string) {
  const user = auth.currentUser;
  if (!user) return;

  const wishlistRef = doc(db, 'users', user.uid, 'wishlist', productId);
  await deleteDoc(wishlistRef);
}

export async function getWishlist() {
  const user = auth.currentUser;
  if (!user) return [];

  const wishlistRef = collection(db, 'users', user.uid, 'wishlist');
  const snapshot = await getDocs(wishlistRef);
  return snapshot.docs.map(doc => doc.data().productId);
}
