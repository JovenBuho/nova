export type PilarId =
  | 'presencia_confianza'
  | 'liderazgo_personal'
  | 'limites_asertividad'
  | 'tolerancia_incertidumbre'
  | 'soberania_material'
  | 'presencia_fisica';

export const PILARES: { id: PilarId; label: string; icon: string; short: string }[] = [
  { id: 'presencia_confianza', label: 'Presencia y confianza', icon: '◈', short: 'Presencia' },
  { id: 'liderazgo_personal', label: 'Liderazgo personal', icon: '⬢', short: 'Liderazgo' },
  { id: 'limites_asertividad', label: 'Límites y asertividad', icon: '⊘', short: 'Límites' },
  { id: 'tolerancia_incertidumbre', label: 'Tolerancia a la incertidumbre', icon: '◐', short: 'Incertidumbre' },
  { id: 'soberania_material', label: 'Soberanía material', icon: '▲', short: 'Soberanía' },
  { id: 'presencia_fisica', label: 'Presencia física', icon: '✦', short: 'Físico' },
];

export const PILARES_COHERENCIA: PilarId[] = ['soberania_material', 'presencia_fisica'];

export type Tipo = 'muy_pequena' | 'relevante' | 'transformadora' | 'extraordinaria';

export const TIPOS: Record<Tipo, { label: string; min: number; max: number | null }> = {
  muy_pequena: { label: 'Muy pequeña', min: 0.1, max: 0.5 },
  relevante: { label: 'Relevante', min: 0.5, max: 2.0 },
  transformadora: { label: 'Transformadora', min: 2.0, max: 5.0 },
  extraordinaria: { label: 'Extraordinaria', min: 5.0, max: null },
};

export type Signo = 'suma' | 'resta';
export type Coherencia = 'dominio' | 'visto';

export interface Decision {
  id: string;
  fecha: string; // ISO yyyy-mm-dd
  pilar: PilarId;
  decision: string;
  evidencia: string;
  tipo: Tipo;
  signo: Signo;
  puntos: number;
  coherencia?: Coherencia;
  justificacion?: string;
}

export interface ManualEdit {
  id: string;
  fecha: string;
  pilar: PilarId;
  delta: number;
  motivo: string;
}

export interface Hito {
  id: string;
  fecha: string;
  descripcion: string;
}

export interface Store {
  decisions: Decision[];
  manualEdits: ManualEdit[];
  contexto: Record<PilarId, string>;
  hitos: Hito[];
  lastSeenSuelo: Record<PilarId, number>;
}
