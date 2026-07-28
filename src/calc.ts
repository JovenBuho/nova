import { Decision, ManualEdit, PilarId, PILARES } from './types';

const DECAY_GAP_DAYS = 21; // 3 semanas
const CONSOLIDATION_WINDOW_DAYS = 42; // 6 semanas
const DECAY_RATE = 0.1; // pierde 10% de la superficie por bloque
const CONSOLIDATION_RATE = 0.2; // 20% de la superficie pasa a suelo por bloque

function toUTC(dateISO: string): number {
  const [y, m, d] = dateISO.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function daysBetween(a: string, b: string): number {
  return (toUTC(b) - toUTC(a)) / 86400000;
}

function addDays(dateISO: string, days: number): string {
  const d = new Date(toUTC(dateISO));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export interface PilarState {
  suelo: number;
  superficie: number;
  total: number;
  isDecaying: boolean;
}

type Event =
  | { fecha: string; kind: 'decision'; effectiveDelta: number; esNegativa: boolean }
  | { fecha: string; kind: 'manual'; delta: number };

export function effectiveDelta(d: Decision): number {
  if (d.coherencia === 'visto') return 0;
  return d.signo === 'resta' ? -d.puntos : d.puntos;
}

export function simulatePilar(
  pilarId: PilarId,
  allDecisions: Decision[],
  allManualEdits: ManualEdit[],
  todayISO: string
): PilarState {
  const decs = allDecisions
    .filter((d) => d.pilar === pilarId)
    .map((d) => ({ fecha: d.fecha, kind: 'decision' as const, effectiveDelta: effectiveDelta(d), esNegativa: d.signo === 'resta' }));
  const edits = allManualEdits
    .filter((e) => e.pilar === pilarId)
    .map((e) => ({ fecha: e.fecha, kind: 'manual' as const, delta: e.delta }));

  const events: Event[] = [...decs, ...edits].sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0));

  let suelo = 0;
  let superficie = 0;
  let windowStart: string | null = null;
  let lastActivity: string | null = null;
  let decayCursor: string | null = null;

  function cap() {
    superficie = clamp(superficie, 0, 100 - suelo);
  }

  // Avanza el reloj hasta `target`, cruzando los boundaries de decaimiento y
  // consolidación en su orden cronológico real (un salto grande entre eventos
  // puede contener varios boundaries de ambos tipos intercalados).
  function advanceTo(target: string) {
    while (true) {
      const nextDecay = decayCursor ? addDays(decayCursor, DECAY_GAP_DAYS) : null;
      const nextConsolidate = windowStart ? addDays(windowStart, CONSOLIDATION_WINDOW_DAYS) : null;
      const candidates: { fecha: string; kind: 'decay' | 'consolidate' }[] = [];
      if (nextDecay && nextDecay <= target) candidates.push({ fecha: nextDecay, kind: 'decay' });
      if (nextConsolidate && nextConsolidate <= target) candidates.push({ fecha: nextConsolidate, kind: 'consolidate' });
      if (candidates.length === 0) break;
      candidates.sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : a.kind === 'decay' ? -1 : 1));
      const next = candidates[0];
      if (next.kind === 'decay') {
        superficie *= 1 - DECAY_RATE;
        decayCursor = next.fecha;
        windowStart = next.fecha; // hueco > 3 semanas rompe la racha de consolidación
      } else {
        const moved = superficie * CONSOLIDATION_RATE;
        suelo = clamp(suelo + moved, 0, 100);
        superficie -= moved;
        windowStart = next.fecha;
      }
    }
  }

  for (const ev of events) {
    advanceTo(ev.fecha);
    if (ev.kind === 'decision') {
      superficie = Math.max(0, superficie + ev.effectiveDelta);
      cap();
      lastActivity = ev.fecha;
      decayCursor = ev.fecha;
      if (windowStart === null) windowStart = ev.fecha;
      if (ev.esNegativa) windowStart = ev.fecha;
    } else {
      suelo = clamp(suelo + ev.delta, 0, 100);
      cap();
    }
  }
  advanceTo(todayISO);

  const isDecaying = lastActivity ? daysBetween(lastActivity, todayISO) >= DECAY_GAP_DAYS : false;

  return { suelo, superficie, total: suelo + superficie, isDecaying };
}

export function computeGlobal(totals: number[]): { global: number; bottleneckIndex: number } {
  const min = Math.min(...totals);
  const bottleneckIndex = totals.indexOf(min);
  const global = (totals.reduce((a, b) => a + b, 0) + min) / 7;
  return { global, bottleneckIndex };
}

export function computeAll(
  decisions: Decision[],
  manualEdits: ManualEdit[],
  todayISO: string
): { estados: Record<PilarId, PilarState>; global: number; bottleneck: PilarId } {
  const estados = {} as Record<PilarId, PilarState>;
  for (const p of PILARES) {
    estados[p.id] = simulatePilar(p.id, decisions, manualEdits, todayISO);
  }
  const totals = PILARES.map((p) => estados[p.id].total);
  const { global, bottleneckIndex } = computeGlobal(totals);
  return { estados, global, bottleneck: PILARES[bottleneckIndex].id };
}
