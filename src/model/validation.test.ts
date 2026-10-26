import { describe, expect, it } from 'vitest';
import {
  errorCount,
  firstInvalidStep,
  hasErrors,
  validateProfile,
  validateStep,
} from './validation';
import type { OrderState, Profile, StepIndex } from './types';

const valid: Profile = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+1 234 567 890',
};

function state(step: StepIndex, profile: Partial<Profile> = {}): OrderState {
  return {
    nav: { step, returnTo: null },
    billing: 'monthly',
    plan: step === 0 ? null : 'arcade',
    addons: new Set(),
    profile: { ...valid, ...profile },
  };
}

describe('validateProfile', () => {
  it('accepts a complete profile', () => {
    expect(validateProfile(valid)).toEqual({});
  });

  it('requires every field', () => {
    expect(validateProfile({ name: '', email: '', phone: '' })).toEqual({
      name: 'required',
      email: 'required',
      phone: 'required',
    });
  });

  it('treats whitespace as empty', () => {
    expect(validateProfile({ ...valid, name: '   ' })).toEqual({ name: 'required' });
  });

  it('accepts reasonable addresses', () => {
    for (const email of ['a@b.co', 'first.last+tag@sub.domain.io', 'ADA@EXAMPLE.COM']) {
      expect(validateProfile({ ...valid, email })).toEqual({});
    }
  });

  it('rejects malformed addresses', () => {
    for (const email of ['a', 'a@', 'a@b', 'a@@b.co', 'a@b.', 'a b@c.com']) {
      expect(validateProfile({ ...valid, email })).toEqual({ email: 'invalid-email' });
    }
  });

  it('ignores the surrounding whitespace of an address', () => {
    expect(validateProfile({ ...valid, email: '  ada@example.com  ' })).toEqual({});
  });

  it('does not validate the phone format', () => {
    // Deliberate: a format regex rejects valid international numbers.
    expect(validateProfile({ ...valid, phone: 'abc' })).toEqual({});
    expect(validateProfile({ ...valid, phone: '+34 600 000 000' })).toEqual({});
  });
});

describe('validateStep', () => {
  it('checks the profile on step 1', () => {
    expect(validateStep(state(0)).fields).toEqual({});
    expect(validateStep(state(0, { email: 'nope' })).fields).toEqual({ email: 'invalid-email' });
  });

  it('requires a plan on step 2', () => {
    const withoutPlan = { ...state(1), plan: null };
    expect(validateStep(withoutPlan).plan).toBe('plan-required');
    expect(hasErrors(validateStep(withoutPlan))).toBe(true);
  });

  it('accepts no add-ons on step 3', () => {
    const noAddons = state(2);
    expect(noAddons.addons.size).toBe(0);
    expect(hasErrors(validateStep(noAddons))).toBe(false);
  });
});

describe('hasErrors / errorCount', () => {
  it('counts fields and the plan group', () => {
    expect(errorCount({ fields: { name: 'required', phone: 'required' }, plan: null })).toBe(2);
    expect(errorCount({ fields: {}, plan: 'plan-required' })).toBe(1);
    expect(hasErrors({ fields: {}, plan: null })).toBe(false);
  });
});

describe('firstInvalidStep', () => {
  it('points at the profile first', () => {
    expect(firstInvalidStep({ ...state(3), plan: null, profile: { ...valid, name: '' } })).toBe(0);
  });

  it('points at the plan next', () => {
    expect(firstInvalidStep({ ...state(3), plan: null })).toBe(1);
  });

  it('is null when everything is valid', () => {
    expect(firstInvalidStep(state(3))).toBeNull();
  });
});
