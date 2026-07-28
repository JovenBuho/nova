import { Hito, Store } from '../types';
import { saveStore, todayISO, uid } from '../storage';
import { confirmAction } from '../confirm';

export function renderHitos(container: HTMLElement, store: Store, refresh: () => void) {
  container.innerHTML = '';

  const note = document.createElement('div');
  note.className = 'contexto-note';
  note.textContent = 'Registro de memoria y celebración. No afecta ningún cálculo.';
  container.appendChild(note);

  const form = document.createElement('div');
  form.className = 'hito-form';
  const fechaInput = document.createElement('input');
  fechaInput.type = 'date';
  fechaInput.value = todayISO();
  const descInput = document.createElement('input');
  descInput.type = 'text';
  descInput.placeholder = 'Descripción del hito';
  const addBtn = document.createElement('button');
  addBtn.className = 'primary';
  addBtn.textContent = 'Añadir';
  addBtn.addEventListener('click', () => {
    if (!descInput.value.trim()) return;
    const hito: Hito = { id: uid(), fecha: fechaInput.value || todayISO(), descripcion: descInput.value.trim() };
    store.hitos.push(hito);
    saveStore(store);
    refresh();
  });
  form.append(fechaInput, descInput, addBtn);
  container.appendChild(form);

  const list = document.createElement('div');
  const sorted = [...store.hitos].sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
  for (const h of sorted) {
    const item = document.createElement('div');
    item.className = 'hito-item';
    item.innerHTML = `<div class="hito-date">${h.fecha}</div><div>${escapeHtml(h.descripcion)}</div>`;
    const delBtn = document.createElement('button');
    delBtn.className = 'danger';
    delBtn.textContent = 'Eliminar';
    delBtn.style.marginTop = '6px';
    delBtn.addEventListener('click', async () => {
      const ok = await confirmAction('¿Eliminar este hito?');
      if (!ok) return;
      store.hitos = store.hitos.filter((x) => x.id !== h.id);
      saveStore(store);
      refresh();
    });
    item.appendChild(delBtn);
    list.appendChild(item);
  }
  container.appendChild(list);
}

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}
