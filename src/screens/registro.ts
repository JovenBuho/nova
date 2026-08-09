import { Decision, ManualEdit, PILARES, PILARES_COHERENCIA, Store, TIPOS, Tipo } from '../types';
import { saveStore, todayISO, uid } from '../storage';
import { alertMessage, confirmAction } from '../confirm';
import { enhanceSelect } from '../customSelect';

export function renderRegistro(container: HTMLElement, store: Store, refresh: () => void) {
  container.innerHTML = '';

  const form = document.createElement('form');
  form.className = 'decision-form';

  const row1 = document.createElement('div');
  row1.className = 'row2';

  const fechaLabel = document.createElement('label');
  fechaLabel.textContent = 'Fecha';
  const fechaInput = document.createElement('input');
  fechaInput.type = 'date';
  fechaInput.value = todayISO();
  fechaLabel.appendChild(fechaInput);

  const pilarLabel = document.createElement('label');
  pilarLabel.textContent = 'Pilar';
  const pilarSelect = document.createElement('select');
  for (const p of PILARES) {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.label;
    pilarSelect.appendChild(opt);
  }
  pilarLabel.appendChild(enhanceSelect(pilarSelect));

  row1.append(fechaLabel, pilarLabel);
  form.appendChild(row1);

  const decisionLabel = document.createElement('label');
  decisionLabel.textContent = 'Decisión';
  const decisionInput = document.createElement('textarea');
  decisionInput.required = true;
  decisionLabel.appendChild(decisionInput);
  form.appendChild(decisionLabel);

  const evidenciaLabel = document.createElement('label');
  evidenciaLabel.textContent = 'Evidencia observable';
  const evidenciaInput = document.createElement('textarea');
  evidenciaInput.required = true;
  evidenciaLabel.appendChild(evidenciaInput);
  form.appendChild(evidenciaLabel);

  const row2 = document.createElement('div');
  row2.className = 'row2';

  const tipoLabel = document.createElement('label');
  tipoLabel.textContent = 'Tipo';
  const tipoSelect = document.createElement('select');
  (Object.keys(TIPOS) as Tipo[]).forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = TIPOS[t].label;
    tipoSelect.appendChild(opt);
  });
  tipoLabel.appendChild(enhanceSelect(tipoSelect));

  const signoLabel = document.createElement('label');
  signoLabel.textContent = 'Signo';
  const signoSelect = document.createElement('select');
  [['suma', 'Suma'], ['resta', 'Resta']].forEach(([v, t]) => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = t;
    signoSelect.appendChild(opt);
  });
  signoLabel.appendChild(enhanceSelect(signoSelect));

  row2.append(tipoLabel, signoLabel);
  form.appendChild(row2);

  const rangoHint = document.createElement('div');
  rangoHint.className = 'rango-hint';
  form.appendChild(rangoHint);

  const puntosLabel = document.createElement('label');
  puntosLabel.textContent = 'Puntos (%)';
  const puntosInput = document.createElement('input');
  puntosInput.type = 'number';
  puntosInput.step = '0.1';
  puntosLabel.appendChild(puntosInput);
  form.appendChild(puntosLabel);

  function updateRango() {
    const tipo = tipoSelect.value as Tipo;
    const rango = TIPOS[tipo];
    rangoHint.textContent = rango.max
      ? `Rango sugerido: ${rango.min}% – ${rango.max}%`
      : `Rango sugerido: mayor a ${rango.min}%`;
    puntosInput.value = String(rango.min);
    puntosInput.min = String(rango.min);
    if (rango.max) puntosInput.max = String(rango.max);
    else puntosInput.removeAttribute('max');
    justificacionWrap.style.display = tipo === 'extraordinaria' ? 'flex' : 'none';
    justificacionInput.required = tipo === 'extraordinaria';
  }
  tipoSelect.addEventListener('change', updateRango);

  const justificacionWrap = document.createElement('label');
  justificacionWrap.textContent = 'Justificación (obligatoria para Extraordinaria)';
  justificacionWrap.style.display = 'none';
  const justificacionInput = document.createElement('textarea');
  justificacionWrap.appendChild(justificacionInput);
  form.appendChild(justificacionWrap);

  const coherenciaWrap = document.createElement('label');
  coherenciaWrap.textContent = '¿Esto fue dominio de ti mismo, o buscabas que alguien lo viera?';
  const coherenciaSelect = document.createElement('select');
  [['dominio', 'Dominio de mí mismo'], ['visto', 'Buscaba que lo vieran']].forEach(([v, t]) => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = t;
    coherenciaSelect.appendChild(opt);
  });
  coherenciaWrap.appendChild(enhanceSelect(coherenciaSelect));
  coherenciaWrap.style.display = 'none';
  form.appendChild(coherenciaWrap);

  function updateCoherencia() {
    const visible = PILARES_COHERENCIA.includes(pilarSelect.value as any);
    coherenciaWrap.style.display = visible ? 'flex' : 'none';
  }
  pilarSelect.addEventListener('change', updateCoherencia);

  updateRango();
  updateCoherencia();

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'primary';
  submitBtn.textContent = 'Guardar decisión';
  form.appendChild(submitBtn);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!decisionInput.value.trim() || !evidenciaInput.value.trim()) {
      await alertMessage('Decisión y evidencia observable son obligatorias.');
      return;
    }
    const tipo = tipoSelect.value as Tipo;
    if (tipo === 'extraordinaria' && !justificacionInput.value.trim()) {
      await alertMessage('Una decisión extraordinaria requiere justificación escrita.');
      return;
    }
    const decision: Decision = {
      id: uid(),
      fecha: fechaInput.value || todayISO(),
      pilar: pilarSelect.value as Decision['pilar'],
      decision: decisionInput.value.trim(),
      evidencia: evidenciaInput.value.trim(),
      tipo,
      signo: signoSelect.value as Decision['signo'],
      puntos: Number(puntosInput.value),
      ...(coherenciaWrap.style.display !== 'none' ? { coherencia: coherenciaSelect.value as Decision['coherencia'] } : {}),
      ...(tipo === 'extraordinaria' ? { justificacion: justificacionInput.value.trim() } : {}),
    };
    store.decisions.push(decision);
    saveStore(store);
    refresh();
  });

  container.appendChild(form);

  const historyTitle = document.createElement('h3');
  historyTitle.textContent = 'Historial';
  container.appendChild(historyTitle);

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Fecha</th><th>Pilar</th><th>Decisión</th><th>Tipo</th><th>Puntos</th><th></th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');

  const sorted = [...store.decisions].sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
  for (const d of sorted) {
    const tr = document.createElement('tr');
    const pilarLabelText = PILARES.find((p) => p.id === d.pilar)?.label ?? d.pilar;
    const zeroed = d.coherencia === 'visto';
    const puntosDisplay = zeroed ? '0 (vanidad)' : `${d.signo === 'resta' ? '-' : '+'}${d.puntos}%`;
    tr.innerHTML = `
      <td>${d.fecha}</td>
      <td>${pilarLabelText}</td>
      <td>${escapeHtml(d.decision)}</td>
      <td><span class="pill ${d.signo}">${TIPOS[d.tipo].label}</span></td>
      <td>${puntosDisplay}</td>
      <td></td>
    `;
    const delBtn = document.createElement('button');
    delBtn.className = 'danger';
    delBtn.textContent = 'Eliminar';
    delBtn.addEventListener('click', async () => {
      const ok = await confirmAction('¿Eliminar esta decisión del registro?');
      if (!ok) return;
      store.decisions = store.decisions.filter((x) => x.id !== d.id);
      saveStore(store);
      refresh();
    });
    tr.lastElementChild!.appendChild(delBtn);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(table);

  const manualTitle = document.createElement('h3');
  manualTitle.textContent = 'Ajuste manual de suelo';
  manualTitle.style.marginTop = '32px';
  container.appendChild(manualTitle);

  const manualNote = document.createElement('div');
  manualNote.className = 'contexto-note';
  manualNote.textContent = 'Solo para correcciones. El suelo no baja por ningún camino automático — esta es la única vía, y requiere confirmación.';
  container.appendChild(manualNote);

  const manualForm = document.createElement('div');
  manualForm.className = 'hito-form';
  const manualPilar = document.createElement('select');
  for (const p of PILARES) {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.label;
    manualPilar.appendChild(opt);
  }
  const manualDelta = document.createElement('input');
  manualDelta.type = 'number';
  manualDelta.step = '0.1';
  manualDelta.placeholder = 'Delta (+/-)';
  const manualMotivo = document.createElement('input');
  manualMotivo.type = 'text';
  manualMotivo.placeholder = 'Motivo de la corrección';
  const manualBtn = document.createElement('button');
  manualBtn.className = 'secondary';
  manualBtn.textContent = 'Aplicar ajuste';
  manualBtn.addEventListener('click', async () => {
    const delta = Number(manualDelta.value);
    if (!delta || !manualMotivo.value.trim()) {
      await alertMessage('Indica un delta distinto de 0 y un motivo.');
      return;
    }
    const pilarLabel = PILARES.find((p) => p.id === manualPilar.value)?.label;
    const ok = await confirmAction(`¿Confirmas ajustar el suelo de "${pilarLabel}" en ${delta > 0 ? '+' : ''}${delta}%? Esta acción es manual y deliberada.`);
    if (!ok) return;
    const edit: ManualEdit = { id: uid(), fecha: todayISO(), pilar: manualPilar.value as ManualEdit['pilar'], delta, motivo: manualMotivo.value.trim() };
    store.manualEdits.push(edit);
    saveStore(store);
    refresh();
  });
  manualForm.append(enhanceSelect(manualPilar), manualDelta, manualMotivo, manualBtn);
  container.appendChild(manualForm);
}

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}
