import { PILARES } from '../types';
import { RASGOS } from '../data/rasgos';

export function renderRasgos(container: HTMLElement) {
  container.innerHTML = '';
  for (const p of PILARES) {
    const block = document.createElement('div');
    block.className = 'pilar-block';
    const h = document.createElement('h3');
    h.textContent = p.label;
    block.appendChild(h);

    const grid = document.createElement('div');
    grid.className = 'rasgos-grid';

    const expresanCol = document.createElement('div');
    expresanCol.className = 'rasgos-col expresan';
    expresanCol.innerHTML = `<h4>Expresan este pilar</h4><ul>${RASGOS[p.id].expresan.map((r) => `<li>${r}</li>`).join('')}</ul>`;

    const contradicenCol = document.createElement('div');
    contradicenCol.className = 'rasgos-col contradicen';
    contradicenCol.innerHTML = `<h4>Lo contradicen</h4><ul>${RASGOS[p.id].contradicen.map((r) => `<li>${r}</li>`).join('')}</ul>`;

    grid.append(expresanCol, contradicenCol);
    block.appendChild(grid);
    container.appendChild(block);
  }
}
