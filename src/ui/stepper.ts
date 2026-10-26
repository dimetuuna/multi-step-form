import type { StepIndex } from '../model/types';
import { qsa } from './dom';

const items = qsa<HTMLElement>('[data-step-indicator]');

/**
 * The confirmation (step 4) has no indicator of its own: the last one stays current.
 */
export function renderStepper(step: StepIndex): void {
  const current = Math.min(step, 3);

  items.forEach((item, index) => {
    if (index === current) {
      item.setAttribute('aria-current', 'step');
    } else {
      item.removeAttribute('aria-current');
    }
  });
}
