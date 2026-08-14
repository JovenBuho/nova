import { PILARES, Store } from './types';
import { pushStore } from './sync';

const KEY = 'giuliano_rose_data_v1';
const OLD_KEY = 'nova_data_v1';

function emptyStore(): Store {
  const contexto = {} as Store['contexto'];
  const lastSeenSuelo = {} as Store['lastSeenSuelo'];
  for (const p of PILARES) {
    contexto[p.id] = '';
    lastSeenSuelo[p.id] = 0;
  }
  return { decisions: [], manualEdits: [], contexto, hitos: [], lastSeenSuelo };
}

export function loadStore(): Store {
  const raw = localStorage.getItem(KEY) ?? localStorage.getItem(OLD_KEY);
  if (!raw) return emptyStore();
  try {
    const parsed = JSON.parse(raw);
    const base = emptyStore();
    return { ...base, ...parsed, contexto: { ...base.contexto, ...parsed.contexto }, lastSeenSuelo: { ...base.lastSeenSuelo, ...parsed.lastSeenSuelo } };
  } catch {
    return emptyStore();
  }
}

export function saveLocalCache(store: Store): void {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function saveStore(store: Store): void {
  saveLocalCache(store);
  pushStore(store);
  exportJSON(store);
}

export function exportJSON(store: Store): void {
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `giuliano-rose-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(file: File): Promise<Store> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const base = emptyStore();
        resolve({ ...base, ...parsed, contexto: { ...base.contexto, ...parsed.contexto }, lastSeenSuelo: { ...base.lastSeenSuelo, ...parsed.lastSeenSuelo } });
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
