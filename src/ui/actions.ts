import type { OrderState } from '../model/types';
import { qsa } from './dom';

const submits = qsa<HTMLButtonElement>('[data-submit]');
const backs = qsa<HTMLButtonElement>('[data-action="back"]');

export function renderActions(state: OrderState): void {
  const editing = state.nav.returnTo !== null;

  for (const button of submits) {
    // While editing, the primary button returns to the summary: say so.
    button.textContent =
      editing && state.nav.step < 3 ? 'Update' : (button.dataset.label ?? '');
  }

  for (const button of backs) {
    // Step 1 has no "Go Back" unless we arrived from the summary.
    button.hidden = state.nav.step === 0 && !editing;
  }
}
