export type Billing = 'monthly' | 'yearly';

export type PlanId = 'arcade' | 'advanced' | 'pro';

export type AddonId = 'online' | 'storage' | 'profile';

/** Panels 0-3 are the wizard steps, 4 is the confirmation. */
export type StepIndex = 0 | 1 | 2 | 3 | 4;

export type FieldName = 'name' | 'email' | 'phone';

export type ErrorCode = 'required' | 'invalid-email' | 'plan-required';

export type FieldErrors = Partial<Record<FieldName, ErrorCode>>;

export interface StepErrors {
  fields: FieldErrors;
  plan: ErrorCode | null;
}

export interface Profile {
  name: string;
  email: string;
  phone: string;
}

export interface Nav {
  step: StepIndex;
  /** Set while editing from the summary: the step to return to. */
  returnTo: StepIndex | null;
}

export interface OrderState {
  nav: Nav;
  billing: Billing;
  plan: PlanId | null;
  addons: ReadonlySet<AddonId>;
  profile: Profile;
}
