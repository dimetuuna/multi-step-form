import { describe, expect, it } from 'vitest';
import { ADDONS, ADDON_ORDER, MONTHS_CHARGED, PLANS, PLAN_ORDER } from './catalog';
import {
  addonPrice,
  formatAmount,
  periodLong,
  planLabel,
  planPrice,
  selectedAddons,
  total,
} from './pricing';
import type { AddonId, Billing, OrderState, PlanId } from './types';

function order(
  options: { billing?: Billing; plan?: PlanId | null; addons?: AddonId[] } = {},
): Pick<OrderState, 'billing' | 'plan' | 'addons'> {
  return {
    billing: options.billing ?? 'monthly',
    plan: options.plan === undefined ? 'arcade' : options.plan,
    addons: new Set(options.addons ?? []),
  };
}

describe('price data', () => {
  it('charges ten months for a yearly subscription', () => {
    for (const id of PLAN_ORDER) {
      expect(PLANS[id].yearly).toBe(PLANS[id].monthly * MONTHS_CHARGED);
    }

    for (const id of ADDON_ORDER) {
      expect(ADDONS[id].yearly).toBe(ADDONS[id].monthly * MONTHS_CHARGED);
    }
  });

  it('reads the price for the current billing period', () => {
    expect(planPrice('arcade', 'monthly')).toBe(9);
    expect(planPrice('arcade', 'yearly')).toBe(90);
    expect(addonPrice('storage', 'monthly')).toBe(2);
    expect(addonPrice('storage', 'yearly')).toBe(20);
  });
});

describe('total', () => {
  it('is the plan alone when no add-ons are selected', () => {
    expect(total(order({ plan: 'arcade' }))).toBe(9);
    expect(total(order({ plan: 'pro', billing: 'yearly' }))).toBe(150);
  });

  it('adds every selected add-on', () => {
    expect(total(order({ plan: 'arcade', addons: ['online'] }))).toBe(10);
    expect(total(order({ plan: 'arcade', addons: ['online', 'storage'], billing: 'yearly' }))).toBe(
      120,
    );
  });

  it('is only the add-ons when no plan is chosen yet', () => {
    expect(total(order({ plan: null, addons: ['online', 'profile'] }))).toBe(3);
  });
});

describe('selectedAddons', () => {
  it('follows catalogue order, not click order', () => {
    const selected = selectedAddons(order({ addons: ['profile', 'online'] }));
    expect(selected).toEqual(['online', 'profile']);
  });
});

describe('formatting', () => {
  it('formats amounts per period', () => {
    expect(formatAmount(9, 'monthly')).toBe('$9/mo');
    expect(formatAmount(90, 'yearly')).toBe('$90/yr');
  });

  it('labels the plan with its period', () => {
    expect(planLabel('arcade', 'monthly')).toBe('Arcade (Monthly)');
    expect(planLabel('pro', 'yearly')).toBe('Pro (Yearly)');
  });

  it('spells out the period for the total row', () => {
    expect(periodLong('monthly')).toBe('per month');
    expect(periodLong('yearly')).toBe('per year');
  });
});
