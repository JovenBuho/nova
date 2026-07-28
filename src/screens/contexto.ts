import { PILARES, Store } from '../types';
import { saveStore } from '../storage';

export function renderContexto(container: HTMLElement, store: Store) {
  container.innerHTML = '';

  const note = document.createElement('div');
  note.className = 'contexto-note';
  note.textContent = 'Esto no se puntúa. Solo calibra qué cuenta como difícil para ti.';
  container.appendChild(note);

  for (const p of PILARES) {
    const wrap = document.createElement('div');
    wrap.className = 'contexto-field';
    const label = document.createElement('label');
    label.textContent = p.label;
    const textarea = document.createElement('textarea');
    textarea.style.minHeight = '90px';
    textarea.value = store.contexto[p.id] ?? '';
    textarea.addEventListener('change', () => {
      store.contexto[p.id] = textarea.value;
      saveStore(store);
    });
    label.appendChild(textarea);
    wrap.appendChild(label);
    container.appendChild(wrap);
  }
}
