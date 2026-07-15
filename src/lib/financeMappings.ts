/** Map expense form labels to backend finance categories. */
export const EXPENSE_CATEGORY_MAP: Record<string, string> = {
  Feed: 'feed_purchase',
  'Medication & Vaccines': 'veterinary',
  Bedding: 'other',
  'Utilities (Water/Electricity)': 'utilities',
  'Labor & Salaries': 'labor',
  'Equipment Purchase': 'equipment',
  'Equipment Maintenance': 'maintenance',
  'Marketing & Packaging': 'other',
  Transportation: 'other',
  Other: 'other',
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
