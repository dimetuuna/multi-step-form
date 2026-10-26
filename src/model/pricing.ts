import { ADDONS, ADDON_ORDER, PLANS } from './catalog';
import type { AddonId, Billing, OrderState, PlanId } from './types';

type OrderSlice = Pick<OrderState, 'billing' | 'plan' | 'addons'>;

export function planPrice(plan: PlanId, billing: Billing): number {
  return PLANS[plan][billing];
}

export function addonPrice(addon: AddonId, billing: Billing): number {
  return ADDONS[addon][billing];
}

/** Catalogue order, never click order. */
export function selectedAddons(state: OrderSlice): AddonId[] {
  return ADDON_ORDER.filter((id) => state.addons.has(id));
}

export function total(state: OrderSlice): number {
  const base = state.plan === null ? 0 : planPrice(state.plan, state.billing);
  return selectedAddons(state).reduce(
    (sum, id) => sum + addonPrice(id, state.billing),
    base,
  );
}

export function formatAmount(amount: number, billing: Billing): string {
  return `$${amount}/${billing === 'monthly' ? 'mo' : 'yr'}`;
}

/** "Arcade (Yearly)" */
export function planLabel(plan: PlanId, billing: Billing): string {
  return `${PLANS[plan].label} (${billing === 'monthly' ? 'Monthly' : 'Yearly'})`;
}

/** "per month" | "per year" */
export function periodLong(billing: Billing): string {
  return billing === 'monthly' ? 'per month' : 'per year';
}
