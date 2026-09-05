import { EXPENSE_CATEGORIES } from './expenses';

/** Map expense form labels to backend finance categories (legacy add-expense form). */
export const EXPENSE_CATEGORY_MAP: Record<string, string> = {
  Feed: 'feed',
  'Medication & Vaccines': 'medicine',
  Bedding: 'other',
  'Utilities (Water/Electricity)': 'utilities',
  'Labor & Salaries': 'labour',
  'Equipment Purchase': 'equipment',
  'Equipment Maintenance': 'repairs',
  'Marketing & Packaging': 'other',
  Transportation: 'transport',
  Other: 'other',
  ...Object.fromEntries(EXPENSE_CATEGORIES.map((item) => [item.label, item.value])),
};

/** Map income form labels to backend finance categories. */
export const INCOME_SOURCE_MAP: Record<string, string> = {
  Eggs: 'egg_sales',
  'Live Birds (Broilers)': 'livestock_sales',
  'Live Birds (Spent Layers)': 'livestock_sales',
  'Dressed/Processed Birds': 'livestock_sales',
  Manure: 'other',
  Other: 'other',
};

export const PAYMENT_METHOD_MAP: Record<string, string> = {
  Cash: 'cash',
  'Bank Transfer': 'bank_transfer',
  'Mobile Money': 'mobile_money',
  Credit: 'other',
};
