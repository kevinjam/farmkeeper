import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildSetupSteps,
  isEstablishedFarm,
  setupGuideDismissKey,
  setupProgress,
  shouldShowSetupGuide,
  type SetupCounts,
} from './setupGuide';

const empty: SetupCounts = {
  crops: 0,
  harvests: 0,
  sales: 0,
  expenses: 0,
  livestock: 0,
  feed: 0,
  eggs: 0,
};

const farmerAccess = { canUseFinances: true, canUseFeed: true, canUseEggs: true };

describe('setup guide', () => {
  it('shows crop steps for a brand-new farm', () => {
    const steps = buildSetupSteps(empty, farmerAccess);
    assert.deepEqual(
      steps.map((step) => step.id),
      ['add-crop', 'record-expense', 'record-harvest', 'record-sale']
    );
    assert.equal(steps.every((step) => !step.done), true);
    assert.equal(setupProgress(steps).label, '0 of 4 completed');
    assert.equal(shouldShowSetupGuide(empty, steps, false), true);
  });

  it('marks crop steps from real records', () => {
    const counts = { ...empty, crops: 1, expenses: 1 };
    const steps = buildSetupSteps(counts, farmerAccess);
    assert.equal(steps.find((step) => step.id === 'add-crop')?.done, true);
    assert.equal(steps.find((step) => step.id === 'record-expense')?.done, true);
    assert.equal(steps.find((step) => step.id === 'record-harvest')?.done, false);
    assert.equal(setupProgress(steps).label, '2 of 4 completed');
  });

  it('adds livestock steps only when livestock exists', () => {
    const counts = { ...empty, livestock: 1 };
    const steps = buildSetupSteps(counts, farmerAccess);
    assert.ok(steps.some((step) => step.id === 'add-livestock'));
    assert.ok(steps.some((step) => step.id === 'record-feed'));
    assert.ok(steps.some((step) => step.id === 'record-production'));
    assert.equal(steps.find((step) => step.id === 'record-production')?.href, '/dashboard/eggs/record');
    assert.ok(!steps.some((step) => step.id === 'add-crop'));
    assert.equal(steps.filter((step) => step.id === 'record-expense').length, 1);
  });

  it('hides feed and egg steps when those tools are locked', () => {
    const steps = buildSetupSteps(
      { ...empty, livestock: 1 },
      { canUseFinances: false, canUseFeed: false, canUseEggs: false }
    );
    assert.deepEqual(
      steps.map((step) => step.id),
      ['add-livestock']
    );
  });

  it('hides the guide for established farms', () => {
    const established = { crops: 4, harvests: 8, sales: 5, expenses: 6, livestock: 0, feed: 0, eggs: 0 };
    assert.equal(isEstablishedFarm(established), true);
    const steps = buildSetupSteps(established, farmerAccess);
    assert.equal(shouldShowSetupGuide(established, steps, false), false);
  });

  it('hides the guide after dismissal and when every step is done', () => {
    const mid = { ...empty, crops: 1 };
    const steps = buildSetupSteps(mid, farmerAccess);
    assert.equal(shouldShowSetupGuide(mid, steps, true), false);

    const finished = { ...empty, crops: 1, harvests: 1, sales: 1, expenses: 1 };
    const doneSteps = buildSetupSteps(finished, farmerAccess);
    assert.equal(doneSteps.every((step) => step.done), true);
    assert.equal(shouldShowSetupGuide(finished, doneSteps, false), false);
  });

  it('scopes the hide preference by user and farm', () => {
    assert.equal(setupGuideDismissKey('u1', 'green-acres'), 'setup-guide-dismissed:u1:green-acres');
  });
});
