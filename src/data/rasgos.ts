import { PilarId } from '../types';

export const RASGOS: Record<PilarId, { expresan: string[]; contradicen: string[] }> = {
  presencia_confianza: {
    expresan: [
      'Mantener contacto visual sostenido en una conversación difícil',
      'Hablar a volumen estable sin acelerar',
      'Ocupar espacio físico sin pedir permiso',
      'Hacer una pausa antes de responder en vez de rellenar el silencio',
      'Entrar a un lugar sin escanear validación externa',
    ],
    contradicen: [
      'Disculparse por existir o por opinar',
      'Encoger postura o voz ante autoridad',
      'Llenar cada silencio por incomodidad',
      'Buscar aprobación antes de hablar',
      'Evitar mirar a los ojos al decir algo importante',
    ],
  },
  liderazgo_personal: {
    expresan: [
      'Decidir sin pedir permiso cuando la decisión es tuya',
      'Sostener un plan propio aunque alguien lo cuestione',
      'Tomar la iniciativa en un grupo sin que te la den',
      'Responsabilizarte por un error sin justificarlo',
      'Definir la agenda en vez de reaccionar a la de otros',
    ],
    contradicen: [
      'Esperar que alguien más decida por ti',
      'Abandonar un plan al primer cuestionamiento',
      'Culpar circunstancias externas por resultados propios',
      'Seguir la corriente del grupo por comodidad',
      'Posponer decisiones que ya tienen suficiente información',
    ],
  },
  limites_asertividad: {
    expresan: [
      'Decir no sin justificar de más',
      'Nombrar una incomodidad en el momento en que ocurre',
      'Sostener una postura bajo presión social',
      'Pedir lo que necesitas directamente',
      'Cerrar una conversación que ya no te sirve',
    ],
    contradicen: [
      'Decir sí para evitar el conflicto',
      'Tragarte una molestia para no incomodar',
      'Ceder terreno solo porque insistieron',
      'Dar explicaciones excesivas para justificar un límite',
      'Permitir que crucen un límite ya nombrado',
    ],
  },
  tolerancia_incertidumbre: {
    expresan: [
      'Actuar con información incompleta en vez de esperar certeza total',
      'Sostener ambigüedad sin forzar una resolución prematura',
      'Tomar una decisión reversible en vez de paralizarte',
      'Exponerte a un resultado que no controlas',
      'Seguir adelante sin la aprobación de todos',
    ],
    contradicen: [
      'Sobre-planificar para eliminar todo riesgo',
      'Pedir garantías antes de moverte',
      'Evitar cualquier situación sin resultado predecible',
      'Consultar a más personas de las necesarias para no decidir solo',
      'Abandonar algo apenas aparece una señal ambigua',
    ],
  },
  soberania_material: {
    expresan: [
      'Gestionar dinero con un sistema sostenido en el tiempo',
      'Generar ingreso por habilidad propia en vez de depender de otro',
      'Ahorrar o invertir de forma deliberada',
      'Negociar tu valor en vez de aceptar lo que ofrecen',
      'Construir algo que te da independencia económica',
    ],
    contradicen: [
      'Gastar para proyectar una imagen que no corresponde a tu situación',
      'Depender económicamente de alguien más por comodidad',
      'Evitar mirar tus finanzas reales',
      'Endeudarte por impulso o por estatus',
      'Aceptar condiciones económicas que no negociaste',
    ],
  },
  presencia_fisica: {
    expresan: [
      'Entrenar aunque no haya motivación ese día',
      'Comer con un criterio sostenido, no reactivo',
      'Dormir con una disciplina de horario',
      'Cuidar el cuerpo como base de todo lo demás, no como decoración',
      'Sostener una práctica física incómoda cuando el cuerpo la pide',
    ],
    contradicen: [
      'Entrenar solo cuando hay gente mirando',
      'Usar el cuerpo únicamente como imagen para otros',
      'Sacrificar el sueño por hábito sin necesidad real',
      'Abandonar la disciplina física ante la primera incomodidad',
      'Medir el cuerpo solo por cómo se ve, no por cómo funciona',
    ],
  },
};
