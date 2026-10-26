import type { AddonId, OrderState } from '../model/types';
import { qsa } from './dom';

/**
 * State -> UI for the controls themselves. Text inputs are never written back;
 * these are only the radio and checkbox states, which are idempotent.
 */
export function renderSelection(state: OrderState): void {
  for (const radio of qsa<HTMLInputElement>('input[name="plan"]')) {
    radio.checked = radio.value === state.plan;
  }

  for (const box of qsa<HTMLInputElement>('input[name="addons"]')) {
    box.checked = state.addons.has(box.value as AddonId);
  }
}
