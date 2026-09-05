import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  helpTicketPath,
  isSupportTicketNumber,
  supportCategoryLabel,
  supportPriorityLabel,
  supportStatusLabel,
  validateSupportForm,
} from './support';

describe('support ticket client helpers', () => {
  it('requires category and message', () => {
    const errors = validateSupportForm({ category: '', message: '' });
    assert.equal(errors.category, 'Choose a category.');
    assert.equal(errors.message, 'Please describe what you need help with.');
  });

  it('accepts a valid request', () => {
    assert.deepEqual(
      validateSupportForm({ category: 'crops', message: 'Harvest totals look wrong.' }),
      {}
    );
  });

  it('uses public ticket numbers in routes', () => {
    assert.equal(isSupportTicketNumber('FK-1001'), true);
    assert.equal(isSupportTicketNumber('64a000000000000000000001'), false);
    assert.equal(
      helpTicketPath('/en/demo/dashboard/help', 'FK-1001'),
      '/en/demo/dashboard/help/tickets/FK-1001'
    );
    assert.equal(supportCategoryLabel('subscription'), 'Subscription / Billing');
    assert.equal(supportStatusLabel('IN_PROGRESS'), 'In progress');
    assert.equal(supportPriorityLabel('HIGH'), 'High');
    assert.equal(supportPriorityLabel('NORMAL'), 'Normal');
  });
});
