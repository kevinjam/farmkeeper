import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  formatUnsoldHeadline,
  isOnboardingComplete,
  recommendNextAction,
  sortQuickActions,
  type NextStepAccess,
} from './nextStep';
import type { SetupCounts } from './setupGuide';

const empty: SetupCounts = {
  crops: 0,
  harvests: 0,
  sales: 0,
  expenses: 0,
  livestock: 0,
  feed: 0,
  eggs: 0,
};

const farmer: NextStepAccess = { canUseFinances: true, canUseFeed: true, canUseEggs: true };
const freePlan: NextStepAccess = { canUseFinances: false, canUseFeed: false, canUseEggs: false };

function rec(counts: Partial<SetupCounts>, extra: Partial<Parameters<typeof recommendNextAction>[0]> = {}) {
  return recommendNextAction({
    counts: { ...empty, ...counts },
    remaining: extra.remaining,
    cropName: extra.cropName,
    access: extra.access || farmer,
  });
}

describe('next step recommendations', () => {
  it('no crops: add your first crop', () => {
    const step = rec({});
    assert.equal(step.id, 'add-crop');
    assert.equal(step.title, 'Add your first crop.');
    assert.equal(step.href, '/dashboard/crops/add');
  });

  it('crops / no harvest: record first harvest when expense already exists', () => {
    const step = rec({ crops: 1, expenses: 1 });
    assert.equal(step.id, 'add-harvest');
    assert.equal(step.title, 'Record your first harvest.');
  });

  it('crops / no harvest: record first expense before harvest when neither exists', () => {
    const step = rec({ crops: 1 });
    assert.equal(step.id, 'add-expense');
    assert.equal(step.title, 'Record your first farm expense.');
  });

  it('crops / no harvest on free plan: skip locked expense and ask for harvest', () => {
    const step = rec({ crops: 1 }, { access: freePlan });
    assert.equal(step.id, 'add-harvest');
    assert.equal(step.title, 'Record your first harvest.');
  });

  it('harvest / no sale: record a sale', () => {
    const step = rec({ crops: 1, harvests: 1, expenses: 1 });
    assert.equal(step.id, 'record-sale');
    assert.equal(step.title, 'Record a sale.');
    assert.equal(step.action, 'Record a sale →');
    assert.equal(step.href, '/dashboard/harvests/sales/add');
  });

  it('unsold produce: names leftover stock and asks to record a sale', () => {
    const step = rec(
      { crops: 1, harvests: 2, sales: 1, expenses: 1 },
      { remaining: [{ unit: 'kg', remaining: 700 }], cropName: 'coffee' }
    );
    assert.equal(step.id, 'sell-produce');
    assert.equal(step.title, 'You have 700 kg of coffee available.');
    assert.equal(step.action, 'Record a sale →');
    assert.equal(formatUnsoldHeadline([{ unit: 'kg', remaining: 700 }], 'coffee'), 'You have 700 kg of coffee available.');
  });

  it('sale / no expense: add expenses to understand profitability', () => {
    const step = recommendNextAction({
      counts: { ...empty, crops: 1, harvests: 1, sales: 1 },
      remaining: [],
      access: farmer,
    });
    assert.equal(step.id, 'add-expenses-profit');
    assert.equal(step.title, 'Add your farm expenses to understand profitability.');
  });

  it('complete farm: review profitability when nothing is unsold', () => {
    const step = recommendNextAction({
      counts: { ...empty, crops: 2, harvests: 3, sales: 2, expenses: 4 },
      remaining: [{ unit: 'kg', remaining: 0 }],
      access: farmer,
    });
    assert.equal(isOnboardingComplete({ ...empty, crops: 2, harvests: 3, sales: 2, expenses: 4 }, farmer), true);
    assert.equal(step.id, 'review-profit');
    assert.equal(step.title, 'Review your farm profitability.');
    assert.equal(step.href, '/dashboard/profitability');
  });

  it('does not keep asking for a first crop or expense after those records exist', () => {
    const afterCrop = rec({ crops: 1, expenses: 1 });
    assert.notEqual(afterCrop.id, 'add-crop');
    assert.notEqual(afterCrop.title, 'Add your first crop.');

    const afterExpense = rec({ crops: 1, expenses: 1, harvests: 1, sales: 1 });
    assert.notEqual(afterExpense.id, 'add-expense');
    assert.notEqual(afterExpense.title, 'Record your first farm expense.');
  });

  it('livestock-only farmer: never asks to add a first crop', () => {
    const start = rec({ livestock: 3 });
    assert.notEqual(start.id, 'add-crop');
    assert.equal(start.id, 'record-feed');
    assert.equal(start.title, 'Record feed for your livestock.');

    const afterFeed = rec({ livestock: 3, feed: 2 });
    assert.equal(afterFeed.id, 'record-production');

    const afterProduction = rec({ livestock: 3, feed: 2, eggs: 1 });
    assert.equal(afterProduction.id, 'add-expense');

    const complete = rec({ livestock: 3, feed: 2, eggs: 1, expenses: 2 });
    assert.equal(complete.id, 'review-profit');
    assert.equal(complete.title, 'Review your farm profitability.');
  });

  it('never prints NaN, Infinity, null, or undefined leftover stock', () => {
    const step = rec(
      { crops: 1, harvests: 2, sales: 1, expenses: 1 },
      {
        remaining: [
          { unit: 'kg', remaining: Number.POSITIVE_INFINITY },
          { unit: 'bags', remaining: Number.NaN },
        ],
        cropName: 'undefined',
      }
    );
    assert.doesNotMatch(step.title, /NaN|Infinity|undefined|null/i);
    assert.equal(
      formatUnsoldHeadline([{ unit: 'kg', remaining: Number.POSITIVE_INFINITY }], 'coffee'),
      ''
    );
  });

  it('puts the matching Quick Action first without dropping others', () => {
    const links = [
      { key: 'add-livestock' },
      { key: 'record-eggs' },
      { key: 'add-expense' },
      { key: 'record-sale' },
    ];
    const sold = sortQuickActions(links, 'sell-produce').map((item) => item.key);
    assert.deepEqual(sold, ['record-sale', 'add-expense', 'add-livestock', 'record-eggs']);
    assert.equal(sold.length, 4);

    const harvest = sortQuickActions(
      [...links, { key: 'add-harvest' }],
      'add-harvest'
    ).map((item) => item.key);
    assert.equal(harvest[0], 'add-harvest');
    assert.ok(harvest.includes('add-livestock'));
  });
});
