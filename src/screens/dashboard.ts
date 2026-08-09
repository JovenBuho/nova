import { computeAll } from '../calc';
import { PILARES, Store } from '../types';
import { saveLocalCache, todayISO } from '../storage';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Un valor de 0.1% mide 0 píxeles: sin suelo mínimo la barra es invisible y la UI parece muerta.
const visibleWidth = (pct: number) => (pct > 0 ? `max(${pct}%, 6px)` : '0%');

const SVG_NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag: string, attrs: Record<string, string | number>) => {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
};

/** Vértice del eje `i` (de 6) a la fracción `r` del radio, empezando arriba. */
function vertex(i: number, r: number, radius = 100, cx = 150, cy = 150) {
  const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
  return [cx + Math.cos(angle) * radius * r, cy + Math.sin(angle) * radius * r] as const;
}

function buildRadar(totals: number[]): SVGElement {
  // Con totales de 0.1% un radar a escala 0-100 sería un punto invisible: la escala sigue al dato.
  const scale = Math.max(1, Math.max(...totals) * 1.25);
  const svg = svgEl('svg', { viewBox: '0 0 300 300', class: 'radar' });

  for (const ring of [0.25, 0.5, 0.75, 1]) {
    svg.appendChild(
      svgEl('polygon', {
        points: Array.from({ length: 6 }, (_, i) => vertex(i, ring).join(',')).join(' '),
        class: 'radar-ring',
      })
    );
  }

  for (let i = 0; i < 6; i++) {
    const [x, y] = vertex(i, 1);
    svg.appendChild(svgEl('line', { x1: 150, y1: 150, x2: x, y2: y, class: 'radar-axis' }));
  }

  // Suelo del 8%: sin el, valores casi nulos colapsan en un punto y el poligono deja de leerse.
  const points = totals.map((t, i) => vertex(i, Math.max(0.08, Math.min(1, t / scale))));
  svg.appendChild(svgEl('polygon', { points: points.map((p) => p.join(',')).join(' '), class: 'radar-area' }));

  for (const [x, y] of points) {
    svg.appendChild(svgEl('circle', { cx: x, cy: y, r: 3.5, class: 'radar-dot' }));
  }

  PILARES.forEach((p, i) => {
    const [x, y] = vertex(i, 1.22);
    const label = svgEl('text', { x, y, class: 'radar-label', 'text-anchor': 'middle', 'dominant-baseline': 'middle' });
    label.textContent = p.short;
    svg.appendChild(label);
  });

  return svg;
}

/** Días consecutivos con decisiones. Hoy sin registrar no rompe la racha: el día aún no termina. */
function streak(dates: Set<string>, today: string): number {
  const cursor = new Date(today + 'T00:00:00');
  if (!dates.has(today)) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function buildStats(store: Store, today: string): HTMLElement {
  const dates = new Set(store.decisions.map((d) => d.fecha));
  const thisMonth = store.decisions.filter((d) => d.fecha.slice(0, 7) === today.slice(0, 7)).length;
  const dias = streak(dates, today);

  const stats = [
    { value: String(store.decisions.length), label: 'Decisiones' },
    { value: String(thisMonth), label: 'Este mes' },
    { value: String(dias), label: dias === 1 ? 'Día seguido' : 'Días seguidos' },
    { value: String(store.hitos.length), label: store.hitos.length === 1 ? 'Hito' : 'Hitos' },
  ];

  const row = document.createElement('div');
  row.className = 'stats-row';
  for (const s of stats) {
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `<div class="stat-value num-tabular">${s.value}</div><div class="stat-label">${s.label}</div>`;
    row.appendChild(card);
  }
  return row;
}

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

  const overview = document.createElement('div');
  overview.className = 'overview';
  const radarCard = document.createElement('div');
  radarCard.className = 'radar-card';
  radarCard.appendChild(buildRadar(PILARES.map((p) => estados[p.id].total)));
  overview.append(radarCard, buildStats(store, today));
  container.appendChild(overview);

  let consolidatedAny = false;

  PILARES.forEach((p, i) => {
    const estado = estados[p.id];
    const isBottleneck = p.id === bottleneck;
    const justConsolidated = estado.suelo > (store.lastSeenSuelo[p.id] ?? 0) + 1e-9;
    if (justConsolidated) consolidatedAny = true;

    const block = document.createElement('div');
    block.className = 'pilar-block' + (isBottleneck ? ' bottleneck' : '') + (justConsolidated && !isBottleneck ? ' consolidating' : '');
    if (!reduceMotion()) block.style.animationDelay = i * 60 + 'ms';

    const head = document.createElement('div');
    head.className = 'pilar-head';
    const nameSpan = document.createElement('span');
    nameSpan.innerHTML = `<span class="pilar-icon">${p.icon}</span>`;
    nameSpan.append(p.label);
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
      barSuelo.style.width = visibleWidth(estado.suelo);
      barSuperficie.style.width = visibleWidth(estado.superficie);
      animateNumber(pctSpan, estado.total);
    }, delay);
  });

  setTimeout(() => {
    globalBarSuelo.style.width = visibleWidth(globalSuelo);
    globalBarSuperficie.style.width = visibleWidth(globalSuperficie);
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
