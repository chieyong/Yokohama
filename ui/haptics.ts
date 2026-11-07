/**
 * Haptische tik. Android: vibrate. iOS (18+): een verborgen <input switch>
 * aanklikken geeft een systeem-haptic. Anders: niets.
 */
let label: HTMLLabelElement | null = null;

export function haptic() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(10);
      return;
    }
    if (!label) {
      label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      label.appendChild(input);
      label.style.cssText = 'position:fixed;left:-100px;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
      label.setAttribute('aria-hidden', 'true');
      document.body.appendChild(label);
    }
    label.click();
  } catch {
    /* geen haptiek beschikbaar */
  }
}
