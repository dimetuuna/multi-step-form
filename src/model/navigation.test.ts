import { describe, expect, it } from 'vitest';
import {
  attemptAdvance,
  attemptBack,
  attemptChange,
  attemptConfirm,
} from './navigation';
import type { AddonId, OrderState, PlanId, Profile, StepIndex } from './types';

const profile: Profile = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+1 234 567 890',
};

function state(
  step: StepIndex,
  options: {
    returnTo?: StepIndex | null;
    plan?: PlanId | null;
    addons?: AddonId[];
    profile?: Partial<Profile>;
  } = {},
): OrderState {
  return {
    nav: { step, returnTo: options.returnTo ?? null },
    billing: 'monthly',
    plan: options.plan === undefined ? 'arcade' : options.plan,
    addons: new Set(options.addons ?? []),
    profile: { ...profile, ...options.profile },
  };
}

const none = new Set<StepIndex>();

describe('attemptAdvance', () => {
  it('moves forward when the step is valid', () => {
    const decision = attemptAdvance(state(0), none);

    expect(decision.nav).toEqual({ step: 1, returnTo: null });
    expect(decision.focus).toBe('heading');
  });

  it('blocks and remembers the attempt when the profile is invalid', () => {
    const decision = attemptAdvance(state(0, { profile: { name: ' ' } }), none);

    expect(decision.nav).toEqual({ step: 0, returnTo: null });
    expect(decision.focus).toBe('first-error');
    expect(decision.attempted.has(0)).toBe(true);
  });

  it('blocks the plan step until a plan is chosen', () => {
    const decision = attemptAdvance(state(1, { plan: null }), none);

    expect(decision.nav.step).toBe(1);
    expect(decision.focus).toBe('first-error');
  });

  it('lets step 3 through with no add-ons', () => {
    const decision = attemptAdvance(state(2), none);

    expect(decision.nav.step).toBe(3);
    expect(decision.focus).toBe('heading');
  });

  it('confirms from the summary', () => {
    const decision = attemptAdvance(state(3), none);

    expect(decision.nav.step).toBe(4);
  });

  it('does not mutate the attempted set it is given', () => {
    const attempted = new Set<StepIndex>();
    attemptAdvance(state(0, { profile: { email: 'nope' } }), attempted);

    expect(attempted.size).toBe(0);
  });

  it('does nothing once confirmed', () => {
    const decision = attemptAdvance(state(4), none);
    expect(decision.nav.step).toBe(4);
  });
});

describe('editing from the summary', () => {
  it('remembers where to return to', () => {
    const decision = attemptChange(state(3), none, 1);

    expect(decision.nav).toEqual({ step: 1, returnTo: 3 });
    expect(decision.focus).toBe('heading');
  });

  it('returns to the summary instead of advancing', () => {
    const decision = attemptAdvance(state(1, { returnTo: 3 }), none);

    expect(decision.nav).toEqual({ step: 3, returnTo: null });
  });

  it('still validates while editing', () => {
    const decision = attemptAdvance(state(0, { returnTo: 3, profile: { name: '' } }), none);

    expect(decision.nav).toEqual({ step: 0, returnTo: 3 });
    expect(decision.focus).toBe('first-error');
  });

  it('sends back to the summary, not to the previous step', () => {
    const decision = attemptBack(state(1, { returnTo: 3 }), none);

    expect(decision.nav).toEqual({ step: 3, returnTo: null });
  });
});

describe('attemptBack', () => {
  it('walks back one step', () => {
    expect(attemptBack(state(2), none).nav).toEqual({ step: 1, returnTo: null });
  });

  it('stays on the first step', () => {
    expect(attemptBack(state(0), none).nav.step).toBe(0);
  });
});

describe('attemptConfirm', () => {
  it('jumps to the offending step when the state is inconsistent', () => {
    const decision = attemptConfirm(state(3, { plan: null }), none);

    expect(decision.nav).toEqual({ step: 1, returnTo: null });
    expect(decision.focus).toBe('first-error');
    expect(decision.attempted.has(1)).toBe(true);
  });

  it('clears any leftover returnTo', () => {
    const decision = attemptConfirm(state(3, { returnTo: 3 }), none);

    expect(decision.nav).toEqual({ step: 4, returnTo: null });
  });
});
