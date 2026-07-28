import { computeGlobal, simulatePilar } from './calc';
import { Decision } from './types';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error('FALLO: ' + msg);
  console.log('OK: ' + msg);
}

// 1. Global pondera doble el pilar más bajo
{
  const totals = [80, 80, 80, 80, 80, 20];
  const { global, bottleneckIndex } = computeGlobal(totals);
  const esperado = (80 * 5 + 20 + 20) / 7;
  assert(Math.abs(global - esperado) < 1e-9, `global pondera cuello de botella (${global} == ${esperado})`);
  assert(bottleneckIndex === 5, 'bottleneckIndex identifica el pilar más bajo');
}

// 2. Decaimiento: 3 semanas sin decisiones pierde 10% de superficie
{
  const d: Decision = { id: '1', fecha: '2026-01-01', pilar: 'presencia_confianza', decision: 'x', evidencia: 'y', tipo: 'relevante', signo: 'suma', puntos: 10 };
  const estado = simulatePilar('presencia_confianza', [d], [], '2026-01-22'); // 21 días después
  assert(Math.abs(estado.superficie - 9) < 1e-9, `decae 10% tras 1 bloque de 3 semanas (superficie=${estado.superficie})`);
}

// Decisiones periódicas (cada 14 días, sin huecos > 3 semanas) durante 6 semanas exactas
const decisionesPeriodicas: Decision[] = [
  { id: '1', fecha: '2026-01-01', pilar: 'liderazgo_personal', decision: 'x', evidencia: 'y', tipo: 'transformadora', signo: 'suma', puntos: 10 },
  { id: '2', fecha: '2026-01-15', pilar: 'liderazgo_personal', decision: 'x', evidencia: 'y', tipo: 'transformadora', signo: 'suma', puntos: 10 },
  { id: '3', fecha: '2026-01-29', pilar: 'liderazgo_personal', decision: 'x', evidencia: 'y', tipo: 'transformadora', signo: 'suma', puntos: 10 },
];

// 3. Consolidación: 6 semanas limpias (sin huecos >3 semanas, sin negativas) mueve 20% de superficie a suelo
{
  const estado = simulatePilar('liderazgo_personal', decisionesPeriodicas, [], '2026-02-12'); // exactamente 42 días desde la primera
  assert(Math.abs(estado.suelo - 6) < 1e-9, `consolida 20% de 30 = 6 de suelo (suelo=${estado.suelo})`);
  assert(Math.abs(estado.superficie - 24) < 1e-9, `superficie restante 24 (superficie=${estado.superficie})`);
}

// 4. Decaimiento no toca el suelo, incluso tras un hueco largo posterior a la consolidación
{
  const sueloTrasConsolidar = simulatePilar('liderazgo_personal', decisionesPeriodicas, [], '2026-02-12').suelo;
  const estadoConHueco = simulatePilar('liderazgo_personal', decisionesPeriodicas, [], '2026-06-01');
  assert(estadoConHueco.suelo >= sueloTrasConsolidar - 1e-9, `suelo nunca baja por decaimiento (${estadoConHueco.suelo} >= ${sueloTrasConsolidar})`);
  assert(estadoConHueco.superficie < 24 - 1e-9, `superficie decae tras el hueco (${estadoConHueco.superficie} < 24)`);
}

// 5. Coherencia: decisión "vista" suma 0 puntos
{
  const d: Decision = { id: '1', fecha: '2026-01-01', pilar: 'soberania_material', decision: 'x', evidencia: 'y', tipo: 'relevante', signo: 'suma', puntos: 2, coherencia: 'visto' };
  const estado = simulatePilar('soberania_material', [d], [], '2026-01-01');
  assert(estado.superficie === 0, 'coherencia visto anula puntos');
}

console.log('Todos los checks de calc.ts pasaron.');
