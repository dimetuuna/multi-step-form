import { firstInvalidStep, hasErrors, validateStep } from './validation';
import type { Nav, OrderState, StepIndex } from './types';

export type FocusTarget = 'heading' | 'first-error';

export interface NavDecision {
  nav: Nav;
  attempted: ReadonlySet<StepIndex>;
  focus: FocusTarget;
}

function withAttempt(
  attempted: ReadonlySet<StepIndex>,
  step: StepIndex,
): ReadonlySet<StepIndex> {
  const next = new Set(attempted);
  next.add(step);
  return next;
}

/**
 * "Next" / "Update" / "Confirm" share this entry point.
 * Step 3 (summary) confirms; every other step validates and moves on,
 * returning to the summary first when editing.
 */
export function attemptAdvance(
  state: OrderState,
  attempted: ReadonlySet<StepIndex>,
): NavDecision {
  const step = state.nav.step;

  if (step === 4) {
    return { nav: state.nav, attempted, focus: 'heading' };
  }

  if (step === 3) {
    return attemptConfirm(state, attempted);
  }

  if (hasErrors(validateStep(state))) {
    return {
      nav: state.nav,
      attempted: withAttempt(attempted, step),
      focus: 'first-error',
    };
  }

  if (state.nav.returnTo !== null) {
    return {
      nav: { step: state.nav.returnTo, returnTo: null },
      attempted,
      focus: 'heading',
    };
  }

  return {
    nav: { step: (step + 1) as StepIndex, returnTo: null },
    attempted,
    focus: 'heading',
  };
}

export function attemptConfirm(
  state: OrderState,
  attempted: ReadonlySet<StepIndex>,
): NavDecision {
  const invalid = firstInvalidStep(state);

  if (invalid !== null) {
    return {
      nav: { step: invalid, returnTo: null },
      attempted: withAttempt(attempted, invalid),
      focus: 'first-error',
    };
  }

  return {
    nav: { step: 4, returnTo: null },
    attempted,
    focus: 'heading',
  };
}

/** When editing from the summary there is nothing behind: back goes to the summary. */
export function attemptBack(
  state: OrderState,
  attempted: ReadonlySet<StepIndex>,
): NavDecision {
  if (state.nav.returnTo !== null) {
    return {
      nav: { step: state.nav.returnTo, returnTo: null },
      attempted,
      focus: 'heading',
    };
  }

  const step = Math.max(0, state.nav.step - 1) as StepIndex;
  return { nav: { step, returnTo: null }, attempted, focus: 'heading' };
}

/** "Change" from the summary: remember where to come back to. */
export function attemptChange(
  state: OrderState,
  attempted: ReadonlySet<StepIndex>,
  target: StepIndex,
): NavDecision {
  return {
    nav: { step: target, returnTo: state.nav.step },
    attempted,
    focus: 'heading',
  };
}
