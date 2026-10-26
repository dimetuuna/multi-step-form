import { ADDONS, PLANS } from '../model/catalog';
import { formatAmount, periodLong } from '../model/pricing';
import type { AddonId, Billing, OrderState, PlanId } from '../model/types';
import { qs, qsa } from './dom';

const switchInput = qs<HTMLInputElement>('#billing');
const priceSlots = qsa<HTMLElement>('[data-price-for]');
const notes = qsa<HTMLElement>('[data-billing-note]');
const longPeriods = qsa<HTMLElement>('[data-period-long]');

function priceOf(id: string, billing: Billing): number | null {
  if (id in PLANS) return PLANS[id as PlanId][billing];
  if (id in ADDONS) return ADDONS[id as AddonId][billing];
  return null;
}

export function renderBilling(state: OrderState): void {
  switchInput.checked = state.billing === 'yearly';

  for (const slot of priceSlots) {
    const id = slot.dataset.priceFor ?? '';
    const amount = priceOf(id, state.billing);
    if (amount === null) continue;

    const prefix = slot.hasAttribute('data-plus') ? '+' : '';
    slot.textContent = `${prefix}${formatAmount(amount, state.billing)}`;
  }

  for (const note of notes) {
    note.hidden = state.billing !== 'yearly';
  }

  for (const element of longPeriods) {
    element.textContent = periodLong(state.billing);
  }
}
