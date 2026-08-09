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

  function renderOptions() {
    list.innerHTML = '';
    Array.from(select.options).forEach((opt, i) => {
      const item = document.createElement('div');
      item.className = 'gr-select-option' + (opt.value === select.value ? ' active' : '');
      item.style.setProperty('--stagger-delay', i * 30 + 'ms');
      item.textContent = opt.textContent ?? '';
      item.addEventListener('click', () => {
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        syncActive();
        syncTrigger();
        close();
      });
      list.appendChild(item);
    });
  }

  function syncActive() {
    Array.from(list.children).forEach((item, i) => {
      item.classList.toggle('active', select.options[i]?.value === select.value);
    });
  }

  function syncTrigger() {
    trigger.textContent = select.options[select.selectedIndex]?.textContent ?? '';
  }

  function close() {
    list.classList.remove('gr-select-list--open');
    trigger.classList.remove('open');
  }

  function open() {
    list.classList.add('gr-select-list--open');
    trigger.classList.add('open');
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (list.classList.contains('gr-select-list--open')) close();
    else open();
  });
  document.addEventListener('click', close);

  renderOptions();
  syncTrigger();
  select.classList.add('gr-select-native');
  wrap.append(select, trigger, list);
  return wrap;
}
