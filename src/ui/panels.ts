import type { StepIndex } from '../model/types';
import { qsa } from './dom';

const panels = qsa<HTMLElement>('[data-step-panel]');

export function showStep(step: StepIndex): void {
  panels.forEach((panel, index) => {
    panel.hidden = index !== step;
  });
}

export function stepPanel(step: StepIndex): HTMLElement | undefined {
  return panels[step];
}

/** One rule for every navigation: focus the heading of the destination step. */
export function focusStepHeading(step: StepIndex): void {
  stepPanel(step)?.querySelector<HTMLElement>('h2')?.focus();
}
