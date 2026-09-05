import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatMarginLabel, formatUnitRate, profitSortValue, statusTone, type CropProfitRow } from './profitability';

const coffee: CropProfitRow = {
  cropId: '1',
  name: 'Coffee',
  revenue: 3000,
  expenses: 1800,
  profit: 1200,
  margin: 40,
  marginLabel: '40%',
  status: 'profit',
  statusLabel: 'Coffee is profitable',
  byUnit: [],
  remainingStock: [],
  costPerUnit: 1.8,
  revenuePerUnit: 4,
  profitPerUnit: 1.2,
  breakEvenQuantity: null,
  breakEvenUnit: null,
  breakEvenLabel: null,
  estimatedRemainingValue: null,
};

describe('profitability display', () => {
  it('formats margin and per-unit rates', () => {
    assert.equal(formatMarginLabel(40), '40%');
    assert.equal(formatMarginLabel(null), 'N/A');
    assert.equal(formatUnitRate(1.8, 'kg', 'USD'), 'USD 1.80/kg');
    assert.equal(formatUnitRate(4, 'kg', 'USD'), 'USD 4/kg');
  });

  it('sorts crops by profit by default', () => {
    const maize = { ...coffee, cropId: '2', name: 'Maize', profit: -300, revenue: 500, margin: -60 };
    const rows = [maize, coffee].sort(
      (a, b) => Number(profitSortValue(b, 'profit')) - Number(profitSortValue(a, 'profit'))
    );
    assert.equal(rows[0].name, 'Coffee');
    assert.equal(statusTone('loss').emoji, '🔴');
  });
});
