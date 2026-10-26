import type { ErrorCode, FieldName, StepErrors } from '../model/types';
import { errorCount } from '../model/validation';
import { qs } from './dom';

const MESSAGES: Record<ErrorCode, string> = {
  required: 'This field is required',
  'invalid-email': 'Please enter a valid email address',
  'plan-required': 'Please select a plan',
};

const FIELDS: readonly FieldName[] = ['name', 'email', 'phone'];

export function renderErrors(errors: StepErrors): void {
  for (const field of FIELDS) {
    const input = qs<HTMLInputElement>(`[data-profile="${field}"]`);
    const code = errors.fields[field];

    qs<HTMLElement>(`[data-error-for="${field}"]`).textContent = code ? MESSAGES[code] : '';

    if (code) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  }

  qs<HTMLElement>('[data-error-for="plan"]').textContent =
    errors.plan === null ? '' : MESSAGES[errors.plan];
}

const status = qs<HTMLElement>('[data-status]');

/**
 * Covers the case the focus move cannot: the user was already on the
 * invalid field, so nothing new would be announced.
 */
export function announceErrors(errors: StepErrors): void {
  const count = errorCount(errors);
  status.textContent = count === 0 ? '' : `${count} error${count > 1 ? 's' : ''} found`;
}

export function resetStatus(): void {
  status.textContent = '';
}

export function focusFirstError(panel: HTMLElement): void {
  const invalid = panel.querySelector<HTMLElement>('[aria-invalid="true"]');
  if (invalid !== null) {
    invalid.focus();
    return;
  }

  // The plan group cannot carry aria-invalid: focus its first radio.
  panel.querySelector<HTMLElement>('input[type="radio"]')?.focus();
}
