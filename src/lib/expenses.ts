/** Expense categories, formatting, and form validation for FarmKeeper finances. */

export const EXPENSE_CATEGORIES = [
  { value: 'seeds', label: 'Seeds', emoji: '🌱' },
  { value: 'fertilizer', label: 'Fertilizer', emoji: '🧪' },
  { value: 'pesticides', label: 'Pesticides', emoji: '🐛' },
  { value: 'herbicides', label: 'Herbicides', emoji: '🌿' },
  { value: 'labour', label: 'Labour', emoji: '👷' },
  { value: 'feed', label: 'Feed', emoji: '🌾' },
  { value: 'medicine', label: 'Medicine', emoji: '💊' },
  { value: 'fuel', label: 'Fuel', emoji: '⛽' },
  { value: 'transport', label: 'Transport', emoji: '🚚' },
  { value: 'equipment', label: 'Equipment', emoji: '🛠' },
  { value: 'repairs', label: 'Repairs', emoji: '🔧' },
  { value: 'irrigation', label: 'Irrigation', emoji: '💧' },
  { value: 'land', label: 'Land', emoji: '🏞' },
  { value: 'utilities', label: 'Utilities', emoji: '💡' },
  { value: 'other', label: 'Other', emoji: '📝' },
] as const;

const LEGACY_LABELS: Record<string, string> = {
  feed_purchase: 'Feed',
  veterinary: 'Medicine',
  labor: 'Labour',
  maintenance: 'Repairs',
};

export type ExpenseRecord = {
  _id: string;
  type: 'expense' | 'income';
  category: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  reference?: string;
  attachments?: string[];
  cropId?: { _id: string; name: string; cropType?: string } | string | null;
  activityId?:
    | { _id: string; activityType: string; activityDate: string; otherType?: string; description?: string }
    | string
    | null;
  metadata?: { notes?: string; quantity?: number };
  createdAt?: string;
  updatedAt?: string;
};

export type ExpenseSummary = {
  currency: string;
  totalAmount: number;
  totalCount: number;
  thisMonthAmount: number;
  thisMonthCount: number;
  recent: ExpenseRecord[];
};

export function expenseCategoryLabel(value: string) {
  const match = EXPENSE_CATEGORIES.find((item) => item.value === value);
  if (match) return `${match.emoji} ${match.label}`;
  if (LEGACY_LABELS[value]) return LEGACY_LABELS[value];
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function expenseCategoryShortLabel(value: string) {
  const match = EXPENSE_CATEGORIES.find((item) => item.value === value);
  if (match) return match.label;
  return LEGACY_LABELS[value] || expenseCategoryLabel(value);
}

export function formatExpenseAmount(amount: number, currency = 'UGX') {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `${String(currency || 'UGX').toUpperCase()} ${Math.round(safe).toLocaleString('en-US')}`;
}

export function formatExpenseDate(dateString?: string | null) {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function toDateInput(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function expenseCropId(expense: ExpenseRecord) {
  const crop = expense.cropId;
  if (!crop) return '';
  if (typeof crop === 'string') return crop;
  return crop._id || '';
}

export function expenseCropName(expense: ExpenseRecord) {
  const crop = expense.cropId;
  if (!crop) return '';
  if (typeof crop === 'string') return '';
  return crop.name || '';
}

export function expenseActivityId(expense: ExpenseRecord) {
  const activity = expense.activityId;
  if (!activity) return '';
  if (typeof activity === 'string') return activity;
  return activity._id || '';
}

export function expenseNotes(expense: ExpenseRecord) {
  return expense.metadata?.notes || '';
}

export function validateExpenseForm(input: {
  amount: string;
  category: string;
  description: string;
  date: string;
  cropId?: string;
  activityId?: string;
}) {
  const errors: Record<string, string> = {};
  const amount = Number(String(input.amount).replace(/,/g, ''));
  if (!String(input.amount).trim()) errors.amount = 'Enter the amount spent.';
  else if (!Number.isFinite(amount) || amount <= 0) errors.amount = 'Amount must be greater than zero.';

  if (!input.category) errors.category = 'Choose a category.';
  if (!String(input.description || '').trim()) errors.description = 'Describe this expense.';

  if (!input.date) errors.date = 'Choose a date.';
  else if (Number.isNaN(new Date(input.date).getTime())) errors.date = 'Enter a valid date.';

  if (input.activityId && !input.cropId) {
    errors.activityId = 'Select a crop before linking an activity.';
  }

  return errors;
}

export const expenseFormInputClass =
  'w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 dark:border-gray-600 dark:bg-gray-700 dark:text-white max-md:min-h-12 max-md:text-base [font-size:16px]';
