import { computeAll } from '../calc';
import { PILARES, Store } from '../types';
import { saveLocalCache, todayISO } from '../storage';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateNumber(el: HTMLElement, to: number, decimals = 1) {
  if (reduceMotion()) {
    el.textContent = to.toFixed(decimals) + '%';
    return;
  }
  const from = 0;
  const duration = 900;
  const start = performance.now();
  function step(now: number) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = from + (to - from) * eased;
    el.textContent = val.toFixed(decimals) + '%';
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export function renderDashboard(container: HTMLElement, store: Store) {
  const today = todayISO();
  const { estados, global, bottleneck } = computeAll(store.decisions, store.manualEdits, today);

  container.innerHTML = '';

  const globalPanel = document.createElement('div');
  globalPanel.className = 'global-panel';
  const globalNum = document.createElement('div');
  globalNum.className = 'global-percent num-tabular';
  globalNum.textContent = '0.0%';
  globalPanel.appendChild(globalNum);

  const bottleneckLabel = document.createElement('div');
  bottleneckLabel.className = 'bottleneck-label';
  const bottleneckName = PILARES.find((p) => p.id === bottleneck)!.label;
  bottleneckLabel.innerHTML = `Cuello de botella: <strong>${bottleneckName}</strong>`;
  globalPanel.appendChild(bottleneckLabel);

  const bottleneckEstado = estados[bottleneck];
  const globalSuelo = PILARES.reduce((s, p) => s + estados[p.id].suelo, 0) / 7 + bottleneckEstado.suelo / 7;
  const globalSuperficie = PILARES.reduce((s, p) => s + estados[p.id].superficie, 0) / 7 + bottleneckEstado.superficie / 7;

  const globalBarWrap = document.createElement('div');
  globalBarWrap.className = 'bar-wrap global';
  const globalBarSuelo = document.createElement('div');
  globalBarSuelo.className = 'bar-suelo';
  const globalBarSuperficie = document.createElement('div');
  globalBarSuperficie.className = 'bar-superficie';
  globalBarWrap.append(globalBarSuelo, globalBarSuperficie);
  globalPanel.appendChild(globalBarWrap);

  container.appendChild(globalPanel);

  let consolidatedAny = false;

  PILARES.forEach((p, i) => {
    const estado = estados[p.id];
    const isBottleneck = p.id === bottleneck;
    const justConsolidated = estado.suelo > (store.lastSeenSuelo[p.id] ?? 0) + 1e-9;
    if (justConsolidated) consolidatedAny = true;

    const block = document.createElement('div');
    block.className = 'pilar-block' + (isBottleneck ? ' bottleneck' : '') + (justConsolidated && !isBottleneck ? ' consolidating' : '');

    const head = document.createElement('div');
    head.className = 'pilar-head';
    const nameSpan = document.createElement('span');
    nameSpan.textContent = p.label;
    if (estado.isDecaying) {
      const flag = document.createElement('span');
      flag.className = 'decay-flag';
      flag.textContent = '◦ decayendo';
      nameSpan.appendChild(flag);
    }
    const pctSpan = document.createElement('span');
    pctSpan.className = 'pilar-percent num-tabular';
    pctSpan.textContent = '0.0%';
    head.append(nameSpan, pctSpan);
    block.appendChild(head);

    const barWrap = document.createElement('div');
    barWrap.className = 'bar-wrap';
    const barSuelo = document.createElement('div');
    barSuelo.className = 'bar-suelo';
    const barSuperficie = document.createElement('div');
    barSuperficie.className = 'bar-superficie';
    barWrap.append(barSuelo, barSuperficie);
    block.appendChild(barWrap);

    const tip = document.createElement('div');
    tip.className = 'breakdown-tip';
    tip.textContent = `Suelo ${estado.suelo.toFixed(1)}% · Superficie ${estado.superficie.toFixed(1)}%`;
    block.appendChild(tip);

    container.appendChild(block);

    const delay = reduceMotion() ? 0 : i * 120;
    setTimeout(() => {
      barSuelo.style.width = estado.suelo + '%';
      barSuperficie.style.width = estado.superficie + '%';
      animateNumber(pctSpan, estado.total);
    }, delay);
  });

  setTimeout(() => {
    globalBarSuelo.style.width = globalSuelo + '%';
    globalBarSuperficie.style.width = globalSuperficie + '%';
    animateNumber(globalNum, global);
  }, reduceMotion() ? 0 : 60);

  if (consolidatedAny) {
    const justNames = PILARES.filter((p) => estados[p.id].suelo > (store.lastSeenSuelo[p.id] ?? 0) + 1e-9).map((p) => p.label);
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = `Consolidado: ${justNames.join(', ')}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  for (const p of PILARES) {
    store.lastSeenSuelo[p.id] = estados[p.id].suelo;
  }
  saveLocalCache(store);
}
