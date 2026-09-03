const textFromButton = (button) => {
  try { return decodeURIComponent(button.dataset.copyOffer || ''); } catch { return ''; }
};

const copyWithFallback = async (value) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  document.execCommand('copy');
  field.remove();
};

export const initOfferCopyButtons = () => {
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy-offer]');
    if (!button) return;
    const value = textFromButton(button);
    if (!value) return;
    const label = button.dataset.copyLabel || button.textContent;
    try {
      await copyWithFallback(value);
      button.textContent = 'Скопировано ✓';
      window.setTimeout(() => { button.textContent = label; }, 1800);
    } catch {
      button.textContent = 'Не удалось скопировать';
      window.setTimeout(() => { button.textContent = label; }, 1800);
    }
  });
};
