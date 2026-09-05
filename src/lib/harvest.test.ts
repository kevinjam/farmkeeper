import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatProduceAmount, saleTotal, validateHarvestForm, validateSaleForm } from './harvest';

describe('harvest and sale form validation', () => {
  it('requires crop, date, quantity, and unit for a harvest', () => {
    const errors = validateHarvestForm({ cropId: '', harvestDate: '', quantity: '', unit: '' });
    assert.equal(errors.cropId, 'Select a crop.');
    assert.equal(errors.harvestDate, 'Choose a harvest date.');
    assert.equal(errors.quantity, 'Enter how much you harvested.');
    assert.equal(errors.unit, 'Select a unit.');
  });

  it('rejects selling more than remaining from a linked harvest', () => {
    const errors = validateSaleForm({
      cropId: 'coffee',
      saleDate: '2026-09-03',
      quantity: '500',
      unit: 'kg',
      pricePerUnit: '4',
      harvestId: 'h1',
      available: 400,
      harvestUnit: 'kg',
    });
    assert.match(errors.quantity, /You only have 400 kg available from this harvest/);
  });

  it('calculates total as quantity × price', () => {
    assert.equal(saleTotal(100, 4), 400);
    assert.equal(saleTotal('150', '4'), 600);
  });

  it('formats produce without NaN, Infinity, or negative zero', () => {
    assert.equal(formatProduceAmount(Number.NaN, 'kg'), '0 kg');
    assert.equal(formatProduceAmount(Number.POSITIVE_INFINITY, 'kg'), '0 kg');
    assert.equal(formatProduceAmount(-0, 'kg'), '0 kg');
    assert.doesNotMatch(formatProduceAmount(-0, 'kg'), /-/);
  });
});
