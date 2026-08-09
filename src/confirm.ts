function buildOverlay(message: string, buttons: { label: string; className: string; value: boolean }[]): { overlay: HTMLElement; resolve: (v: boolean) => void; promise: Promise<boolean> } {
  let resolveFn!: (v: boolean) => void;
  const promise = new Promise<boolean>((resolve) => (resolveFn = resolve));

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:1000;';

  const box = document.createElement('div');
  box.style.cssText =
    'background:var(--nova-bg-panel);backdrop-filter:var(--nova-glass-blur);-webkit-backdrop-filter:var(--nova-glass-blur);border:1px solid var(--nova-purple);border-radius:10px;padding:20px 24px;max-width:360px;font-family:var(--font-body);color:var(--nova-text);box-shadow:0 0 24px var(--nova-suelo-glow);';

  const p = document.createElement('div');
  p.textContent = message;
  p.style.cssText = 'margin-bottom:16px;font-size:14px;line-height:1.5;';

  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;';

  function close(v: boolean) {
    overlay.remove();
    resolveFn(v);
  }

  let firstBtn: HTMLButtonElement | null = null;
  for (const b of buttons) {
    const btn = document.createElement('button');
    btn.className = b.className;
    btn.textContent = b.label;
    btn.addEventListener('click', () => close(b.value));
    btnRow.appendChild(btn);
    if (!firstBtn) firstBtn = btn;
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close(false);
  });

  box.append(p, btnRow);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  firstBtn?.focus();

  return { overlay, resolve: resolveFn, promise };
}

export function confirmAction(message: string): Promise<boolean> {
  const { promise } = buildOverlay(message, [
    { label: 'Cancelar', className: 'secondary', value: false },
    { label: 'Confirmar', className: 'primary', value: true },
  ]);
  return promise;
}

export function alertMessage(message: string): Promise<void> {
  const { promise } = buildOverlay(message, [{ label: 'Entendido', className: 'primary', value: true }]);
  return promise.then(() => undefined);
}
