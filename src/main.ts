import './styles/main.css';
import {
  attemptAdvance,
  attemptBack,
  attemptChange,
  type NavDecision,
} from './model/navigation';
import type { AddonId, OrderState, PlanId, Profile, StepIndex } from './model/types';
import { hasErrors, validateStep } from './model/validation';
import { renderActions } from './ui/actions';
import { renderBilling } from './ui/billing';
import { qs, qsa } from './ui/dom';
import { announceErrors, focusFirstError, renderErrors, resetStatus } from './ui/errors';
import { focusStepHeading, showStep, stepPanel } from './ui/panels';
import { renderSelection } from './ui/selection';
import { renderStepper } from './ui/stepper';
import { renderSummary } from './ui/summary';

const form = qs<HTMLFormElement>('#wizard');

const state: OrderState = {
  nav: { step: 0, returnTo: null },
  billing: 'monthly',
  plan: null,
  addons: new Set<AddonId>(),
  profile: { name: '', email: '', phone: '' },
};

/** Steps the user has tried to leave. Errors are only shown from that point on. */
let attempted: ReadonlySet<StepIndex> = new Set<StepIndex>();

function render(): void {
  const step = state.nav.step;
  const errors = attempted.has(step)
    ? validateStep(state)
    : { fields: {}, plan: null };

  showStep(step);
  renderStepper(step);
  renderBilling(state);
  renderSelection(state);
  renderSummary(state);
  renderErrors(errors);
  renderActions(state);

  // Fixing the last error retires the announcement as well.
  if (!hasErrors(errors)) resetStatus();
}

function apply(decision: NavDecision): void {
  state.nav = decision.nav;
  attempted = decision.attempted;
  render();

  if (decision.focus === 'heading') {
    resetStatus();
    focusStepHeading(state.nav.step);
    return;
  }

  announceErrors(validateStep(state));
  const panel = stepPanel(state.nav.step);
  if (panel !== undefined) focusFirstError(panel);
}

form.addEventListener('input', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;

  const field = target.dataset.profile as keyof Profile | undefined;
  if (field === undefined) return;

  // DOM -> state. Never the other way round: no value is written back here.
  state.profile[field] = target.value;
  render();
});

form.addEventListener('change', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;

  if (target.name === 'plan') {
    state.plan = target.value as PlanId;
  } else if (target.name === 'addons') {
    state.addons = new Set(
      qsa<HTMLInputElement>('input[name="addons"]:checked').map((box) => box.value as AddonId),
    );
  } else if (target.id === 'billing') {
    state.billing = target.checked ? 'yearly' : 'monthly';
  } else {
    return;
  }

  render();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  apply(attemptAdvance(state, attempted));
});

form.addEventListener('click', (event) => {
  const origin = event.target;
  if (!(origin instanceof Element)) return;

  const button = origin.closest<HTMLButtonElement>('button[data-action]');
  if (button === null) return;

  if (button.dataset.action === 'back') {
    apply(attemptBack(state, attempted));
    return;
  }

  const raw = button.dataset.target;
  if (button.dataset.action === 'change' && raw !== undefined) {
    apply(attemptChange(state, attempted, Number(raw) as StepIndex));
  }
});

render();
