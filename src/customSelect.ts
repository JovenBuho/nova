/**
 * Los <option> nativos no aceptan :hover en Chrome/Edge/Firefox (el navegador
 * dibuja esa lista, no CSS). Para el hover rojo real hace falta reemplazar la
 * UI. El <select> nativo se queda oculto como fuente de verdad: .value y
 * 'change' siguen funcionando igual para quien lo consuma, cero cambios en
 * el resto del código.
 */
export function enhanceSelect(select: HTMLSelectElement): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'gr-select';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'gr-select-trigger';

  const list = document.createElement('div');
  list.className = 'gr-select-list';
  list.hidden = true;

  function renderOptions() {
    list.innerHTML = '';
    Array.from(select.options).forEach((opt) => {
      const item = document.createElement('div');
      item.className = 'gr-select-option' + (opt.value === select.value ? ' active' : '');
      item.textContent = opt.textContent ?? '';
      item.addEventListener('click', () => {
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        syncTrigger();
        close();
      });
      list.appendChild(item);
    });
  }

  function syncTrigger() {
    trigger.textContent = select.options[select.selectedIndex]?.textContent ?? '';
  }

  function close() {
    list.hidden = true;
    trigger.classList.remove('open');
  }

  function open() {
    renderOptions();
    list.hidden = false;
    trigger.classList.add('open');
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (list.hidden) open();
    else close();
  });
  document.addEventListener('click', close);

  syncTrigger();
  select.classList.add('gr-select-native');
  wrap.append(select, trigger, list);
  return wrap;
}
