# Giuliano Rose

Sistema de progresión de identidad personal. Mide decisiones, no tareas.

## Instalación y arranque

```bash
cd nova
npm install
npm run dev
```

Abre la URL que muestra la terminal (por defecto `http://localhost:5173`).

## Build de producción

```bash
npm run build
npm run preview
```

El build es estático (`dist/`) y puede abrirse directamente en cualquier navegador o servirse desde cualquier hosting simple — no requiere backend.

## Datos

Todo se guarda en `localStorage` del navegador. Usa "Exportar datos (JSON)" para respaldar y "Importar datos (JSON)" para restaurar (reemplaza todos los datos actuales, pide confirmación).

## Verificar la lógica de cálculo

```bash
npm test
```

Corre `src/calc.test.ts`: comprueba que el pilar más bajo pesa doble en el global, que el decaimiento nunca toca el suelo, que la consolidación mueve el 20% correcto de superficie a suelo tras 6 semanas limpias, y que la coherencia anula puntos.
