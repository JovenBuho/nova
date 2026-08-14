import './style.css';
import { loadStore, saveStore, saveLocalCache, exportJSON, importJSON } from './storage';
import { alertMessage, confirmAction } from './confirm';
import { initSync } from './sync';
import { backupDirSupported, pickBackupDir } from './backupDir';
import { renderDashboard } from './screens/dashboard';
import { renderRegistro } from './screens/registro';
import { renderContexto } from './screens/contexto';
import { renderRasgos } from './screens/rasgos';
import { renderHitos } from './screens/hitos';

type Tab = 'dashboard' | 'registro' | 'contexto' | 'rasgos' | 'hitos';

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'registro', label: 'Registro' },
  { id: 'contexto', label: 'Contexto de partida' },
  { id: 'rasgos', label: 'Rasgos de Giuliano Rose' },
  { id: 'hitos', label: 'Hitos' },
];

let store = loadStore();
let currentTab: Tab = 'dashboard';

const app = document.getElementById('app')!;

function refresh() {
  render();
}

function render() {
  app.innerHTML = '';

  const nav = document.createElement('nav');
  nav.className = 'tabs';
  for (const t of TABS) {
    const btn = document.createElement('button');
    btn.textContent = t.label;
    if (t.id === currentTab) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentTab = t.id;
      render();
    });
    nav.appendChild(btn);
  }
  app.appendChild(nav);

  const screen = document.createElement('div');
  screen.className = 'screen';
  app.appendChild(screen);

  switch (currentTab) {
    case 'dashboard':
      renderDashboard(screen, store);
      break;
    case 'registro':
      renderRegistro(screen, store, refresh);
      break;
    case 'contexto':
      renderContexto(screen, store);
      break;
    case 'rasgos':
      renderRasgos(screen);
      break;
    case 'hitos':
      renderHitos(screen, store, refresh);
      break;
  }

  const ioRow = document.createElement('div');
  ioRow.className = 'io-row';
  const exportBtn = document.createElement('button');
  exportBtn.className = 'secondary';
  exportBtn.textContent = 'Exportar datos (JSON)';
  exportBtn.addEventListener('click', () => exportJSON(store));

  const importBtn = document.createElement('button');
  importBtn.className = 'secondary';
  importBtn.textContent = 'Importar datos (JSON)';
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json';
  fileInput.style.display = 'none';
  importBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const ok = await confirmAction('Importar reemplazará todos los datos actuales. ¿Continuar?');
    if (!ok) return;
    try {
      store = await importJSON(file);
      saveStore(store);
      render();
    } catch {
      await alertMessage('El archivo no es un respaldo válido de Giuliano Rose.');
    }
  });

  ioRow.append(exportBtn, importBtn, fileInput);

  if (backupDirSupported()) {
    const dirBtn = document.createElement('button');
    dirBtn.className = 'secondary';
    dirBtn.textContent = 'Elegir carpeta de respaldo automático';
    dirBtn.addEventListener('click', async () => {
      try {
        await pickBackupDir();
        await alertMessage('Carpeta elegida. Cada registro se guardará ahí automáticamente.');
      } catch {
        /* usuario canceló el selector */
      }
    });
    ioRow.append(dirBtn);
  }

  app.appendChild(ioRow);
}

render();

initSync(store, (remoteStore) => {
  store = remoteStore;
  saveLocalCache(store);
  render();
}).catch((err) => console.error('No se pudo conectar la sincronización en la nube:', err));
