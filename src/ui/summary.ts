import { ADDON_ORDER } from '../model/catalog';
import { addonPrice, formatAmount, planLabel, planPrice, total } from '../model/pricing';
import type { OrderState } from '../model/types';
import { qs } from './dom';

export function renderSummary(state: OrderState): void {
  const plan = state.plan;

  qs<HTMLElement>('[data-plan-name]').textContent =
    plan === null ? '' : planLabel(plan, state.billing);
  qs<HTMLElement>('[data-plan-price]').textContent =
    plan === null ? '' : formatAmount(planPrice(plan, state.billing), state.billing);

  for (const id of ADDON_ORDER) {
    const selected = state.addons.has(id);
    qs<HTMLElement>(`[data-addon-row="${id}"]`).hidden = !selected;

    if (selected) {
      qs<HTMLElement>(`[data-addon-price="${id}"]`).textContent =
        `+${formatAmount(addonPrice(id, state.billing), state.billing)}`;
    }
  }

  qs<HTMLElement>('[data-total]').textContent = formatAmount(total(state), state.billing);

  // textContent, never innerHTML: a name containing "<" is not markup.
  qs<HTMLElement>('[data-contact="name"]').textContent = state.profile.name.trim();
  qs<HTMLElement>('[data-contact="email"]').textContent = state.profile.email.trim();
  qs<HTMLElement>('[data-contact="phone"]').textContent = state.profile.phone.trim();
}
