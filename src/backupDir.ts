const DB_NAME = 'nova-backup-dir';
const STORE = 'handles';
const KEY = 'dir';

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key: string): Promise<any> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: any): Promise<void> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function backupDirSupported(): boolean {
  return typeof (window as any).showDirectoryPicker === 'function';
}

export async function pickBackupDir(): Promise<void> {
  const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
  await idbSet(KEY, handle);
}

export async function getBackupDir(): Promise<any | null> {
  if (!backupDirSupported()) return null;
  const handle = await idbGet(KEY);
  if (!handle) return null;
  let perm = await handle.queryPermission({ mode: 'readwrite' });
  if (perm !== 'granted') perm = await handle.requestPermission({ mode: 'readwrite' });
  return perm === 'granted' ? handle : null;
}

export async function writeBackup(dir: any, filename: string, content: string): Promise<void> {
  const fileHandle = await dir.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}
