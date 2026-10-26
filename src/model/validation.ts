import type {
  FieldErrors,
  OrderState,
  Profile,
  StepErrors,
  StepIndex,
} from './types';

/**
 * Deliberately permissive: we want "this does not look like an email",
 * not an RFC 5322 parser. A stricter rule than the browser's would flag
 * fields the user can see are fine.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateProfile(profile: Profile): FieldErrors {
  const errors: FieldErrors = {};

  if (profile.name.trim() === '') {
    errors.name = 'required';
  }

  const email = profile.email.trim();
  if (email === '') {
    errors.email = 'required';
  } else if (!EMAIL.test(email)) {
    errors.email = 'invalid-email';
  }

  // Phone: required only. A format regex rejects valid international numbers.
  if (profile.phone.trim() === '') {
    errors.phone = 'required';
  }

  return errors;
}

export function validateStep(state: OrderState): StepErrors {
  switch (state.nav.step) {
    case 0:
      return { fields: validateProfile(state.profile), plan: null };
    case 1:
      return { fields: {}, plan: state.plan === null ? 'plan-required' : null };
    default:
      // Step 3 is free: choosing no add-ons is a valid choice.
      return { fields: {}, plan: null };
  }
}

export function hasErrors(errors: StepErrors): boolean {
  return Object.keys(errors.fields).length > 0 || errors.plan !== null;
}

export function errorCount(errors: StepErrors): number {
  return Object.keys(errors.fields).length + (errors.plan === null ? 0 : 1);
}

/** First step that would block confirmation. */
export function firstInvalidStep(state: OrderState): StepIndex | null {
  const profileErrors = validateProfile(state.profile);
  if (Object.keys(profileErrors).length > 0) return 0;
  if (state.plan === null) return 1;
  return null;
}
