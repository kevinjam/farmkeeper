import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatExpenseAmount, validateExpenseForm } from './expenses';

describe('expense form validation', () => {
  it('requires amount, category, description, and date', () => {
    const errors = validateExpenseForm({
      amount: '',
      category: '',
      description: '',
      date: '',
    });
    assert.equal(errors.amount, 'Enter the amount spent.');
    assert.equal(errors.category, 'Choose a category.');
    assert.equal(errors.description, 'Describe this expense.');
    assert.equal(errors.date, 'Choose a date.');
  });

  it('rejects zero and non-numeric amounts', () => {
    assert.equal(
      validateExpenseForm({
        amount: '0',
        category: 'fuel',
        description: 'Tractor fuel',
        date: '2026-09-03',
      }).amount,
      'Amount must be greater than zero.'
    );
    assert.equal(
      validateExpenseForm({
        amount: 'abc',
        category: 'fuel',
        description: 'Tractor fuel',
        date: '2026-09-03',
      }).amount,
      'Amount must be greater than zero.'
    );
  });

  it('requires a crop before linking an activity', () => {
    const errors = validateExpenseForm({
      amount: '50000',
      category: 'fuel',
      description: 'Tractor fuel',
      date: '2026-09-03',
      activityId: 'act-1',
    });
    assert.equal(errors.activityId, 'Select a crop before linking an activity.');
  });

  it('accepts a general farm expense without crop or activity', () => {
    const errors = validateExpenseForm({
      amount: '50000',
      category: 'fuel',
      description: 'Tractor fuel',
      date: '2026-09-03',
    });
    assert.deepEqual(errors, {});
  });

  it('formats amounts as CURRENCY 150,000', () => {
    assert.equal(formatExpenseAmount(150000, 'UGX'), 'UGX 150,000');
  });
});
