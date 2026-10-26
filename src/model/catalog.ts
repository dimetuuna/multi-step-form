import type { AddonId, PlanId } from './types';

/** Yearly billing charges ten months, hence "2 months free". */
export const MONTHS_CHARGED = 10;

export interface Plan {
  label: string;
  monthly: number;
  yearly: number;
}

export const PLANS: Record<PlanId, Plan> = {
  arcade: { label: 'Arcade', monthly: 9, yearly: 90 },
  advanced: { label: 'Advanced', monthly: 12, yearly: 120 },
  pro: { label: 'Pro', monthly: 15, yearly: 150 },
};

export const PLAN_ORDER = ['arcade', 'advanced', 'pro'] as const satisfies readonly PlanId[];

export interface Addon {
  label: string;
  monthly: number;
  yearly: number;
}

export const ADDONS: Record<AddonId, Addon> = {
  online: { label: 'Online service', monthly: 1, yearly: 10 },
  storage: { label: 'Larger storage', monthly: 2, yearly: 20 },
  profile: { label: 'Customizable Profile', monthly: 2, yearly: 20 },
};

export const ADDON_ORDER = ['online', 'storage', 'profile'] as const satisfies readonly AddonId[];
