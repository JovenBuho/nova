import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore';
import { Store } from './types';

const firebaseConfig = {
  apiKey: 'AIzaSyCfKHyTJf1f1qi6qZgFJV0k4i2_0tabhMw',
  authDomain: 'nova-progresion.firebaseapp.com',
  projectId: 'nova-progresion',
  storageBucket: 'nova-progresion.firebasestorage.app',
  messagingSenderId: '262055734782',
  appId: '1:262055734782:web:ac7918b789c76a205fe4af',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storeRef = doc(db, 'nova', 'store');

export async function initSync(localStore: Store, onRemoteUpdate: (store: Store) => void): Promise<void> {
  await signInAnonymously(auth);
  const snapshot = await getDoc(storeRef);
  if (!snapshot.exists()) {
    await setDoc(storeRef, localStore);
  }
  onSnapshot(storeRef, (snap) => {
    if (snap.exists()) {
      onRemoteUpdate(snap.data() as Store);
    }
  });
}

export function pushStore(store: Store): void {
  setDoc(storeRef, store).catch((err) => console.error('Error al sincronizar con la nube:', err));
}
