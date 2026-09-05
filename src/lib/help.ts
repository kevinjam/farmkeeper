export type HelpCategoryId =
  | 'crops'
  | 'harvests'
  | 'sales'
  | 'expenses'
  | 'profitability'
  | 'livestock'
  | 'feed'
  | 'eggs'
  | 'tasks'
  | 'weather'
  | 'subscription'
  | 'account';

export type HelpCategory = {
  id: HelpCategoryId;
  label: string;
  description: string;
};

export type HelpArticle = {
  slug: string;
  title: string;
  description: string;
  categoryId: HelpCategoryId;
  keywords: string[];
  steps?: string[];
  notes?: string[];
};

export const HELP_CATEGORIES: HelpCategory[] = [
  { id: 'crops', label: '🌱 Crops', description: 'Add and manage what you plant.' },
  { id: 'harvests', label: '🌾 Harvests', description: 'Record what you picked from the field.' },
  { id: 'sales', label: '💰 Sales', description: 'Log produce you have already sold.' },
  { id: 'expenses', label: '💸 Expenses', description: 'Record money you have already spent.' },
  { id: 'profitability', label: '📊 Finances & Profitability', description: 'See what you earned, spent, and kept.' },
  { id: 'livestock', label: '🐄 Livestock', description: 'Register animals on your farm.' },
  { id: 'feed', label: '🌾 Feed Management', description: 'Track feed stock and low inventory.' },
  { id: 'eggs', label: '🥚 Eggs & Sales', description: 'Log daily egg collections.' },
  { id: 'tasks', label: '📋 Tasks', description: 'Keep farm work on a list.' },
  { id: 'weather', label: '🌦 Weather', description: 'See conditions for your farm location.' },
  { id: 'subscription', label: '💳 Subscription', description: 'Understand Free, Farmer, and Premium.' },
  { id: 'account', label: '⚙ Account', description: 'Farm settings, profile, and language.' },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: 'how-to-add-a-crop',
    title: 'How to add a crop',
    description: 'Register a new planting so you can track harvests and costs.',
    categoryId: 'crops',
    keywords: ['add crop', 'new crop', 'planting', 'field'],
    steps: [
      'Open Crops.',
      'Select Add Crop.',
      'Enter the crop name.',
      'Choose the crop type.',
      'Select a field or add a new field.',
      'Enter the area and planted date if you know them.',
      'Save.',
    ],
  },
  {
    slug: 'how-to-manage-crops',
    title: 'How to manage crops',
    description: 'Find, edit, archive, or open a crop to add activities.',
    categoryId: 'crops',
    keywords: ['edit crop', 'archive', 'filters', 'crop list'],
    steps: [
      'Open Crops.',
      'Use search or filters to find a crop.',
      'Open the crop to see details and activities.',
      'Edit the crop, archive it, or add an activity from there.',
    ],
  },
  {
    slug: 'how-to-record-a-harvest',
    title: 'How to record a harvest',
    description: 'Log produce you have already harvested.',
    categoryId: 'harvests',
    keywords: ['record harvest', 'picked', 'quantity', 'unit'],
    steps: [
      'Open Harvests.',
      'Select Record Harvest.',
      'Choose your crop.',
      'Enter quantity.',
      'Select the unit.',
      'Enter the harvest date.',
      'Save.',
    ],
  },
  {
    slug: 'how-available-produce-is-calculated',
    title: 'How available produce is calculated',
    description: 'Remaining stock is harvested minus sold, in the same unit.',
    categoryId: 'harvests',
    keywords: ['remaining', 'available', 'on hand', 'stock'],
    notes: [
      'Available produce = harvested quantity − sold quantity.',
      'FarmKeeper keeps each unit separate. A sale must use the same unit as the harvest. There is no conversion between kg, bags, or crates.',
      'The Harvest & Sales page shows harvested, sold, and remaining totals.',
    ],
  },
  {
    slug: 'how-to-record-a-sale',
    title: 'How to record a sale',
    description: 'Log produce you have already sold from a harvest.',
    categoryId: 'sales',
    keywords: ['record sale', 'sold', 'buyer', 'price'],
    steps: [
      'Open Harvests.',
      'Select Record Sale.',
      'Choose the crop and the harvest you sold from.',
      'Enter the quantity. Use the same unit as that harvest.',
      'Enter the price per unit.',
      'Add a buyer name if you want.',
      'Save.',
    ],
  },
  {
    slug: 'how-sales-affect-available-produce',
    title: 'How sales affect available produce',
    description: 'A sale reduces remaining stock on the linked harvest.',
    categoryId: 'sales',
    keywords: ['sold quantity', 'remaining', 'cannot sell more'],
    notes: [
      'Each sale is linked to a harvest and uses that harvest’s unit.',
      'The sold quantity is subtracted from that harvest’s remaining amount.',
      'You cannot sell more than what is still available on that harvest.',
      'Crop sales stay on Harvest & Sales. They are not copied into Finances, so income is not counted twice.',
    ],
  },
  {
    slug: 'how-to-record-an-expense',
    title: 'How to record an expense',
    description: 'Record money you have already spent.',
    categoryId: 'expenses',
    keywords: ['add expense', 'cost', 'category', 'receipt'],
    steps: [
      'Open Finances.',
      'Select Add Expense.',
      'Enter the amount and choose a category.',
      'Enter the date you spent the money.',
      'Link a crop only if the cost belongs to that crop. Leave it blank for farm-wide costs.',
      'Attach a receipt if you have one.',
      'Save.',
    ],
  },
  {
    slug: 'how-expenses-affect-profitability',
    title: 'How expenses affect profitability',
    description: 'Crop-linked costs reduce that crop’s profit. Farm-wide costs count on the whole farm.',
    categoryId: 'expenses',
    keywords: ['profit', 'crop expense', 'farm-wide', 'unassigned'],
    notes: [
      'An expense linked to a crop is subtracted from that crop’s profit.',
      'A farm-wide expense (no crop) is included in farm profit only. It is not assigned to a crop.',
      'Profit uses expenses you have already recorded. It is not an accounting ledger.',
    ],
  },
  {
    slug: 'how-farmkeeper-calculates-profit',
    title: 'How FarmKeeper calculates profit',
    description: 'Farm and crop profit from sales, other income, and expenses.',
    categoryId: 'profitability',
    keywords: ['profit', 'margin', 'revenue', 'income'],
    notes: [
      'Crop profit = crop sales − expenses linked to that crop.',
      'Farm profit = all farm revenue − all farm expenses.',
      'Farm revenue includes crop sales plus other income recorded in Finances.',
      'Margin = profit ÷ revenue. If revenue is 0, margin is N/A.',
      'Open Profitability and choose a period such as This month or This year.',
    ],
  },
  {
    slug: 'how-to-add-livestock',
    title: 'How to add livestock',
    description: 'Register an animal or flock on your farm.',
    categoryId: 'livestock',
    keywords: ['add livestock', 'animal', 'chicken', 'cow'],
    steps: [
      'Open Livestock.',
      'Select Add livestock.',
      'Enter the animal name and type.',
      'Enter age, gender, and the date you got the animal.',
      'Save.',
    ],
    notes: [
      'Your plan may limit how many animals you can add. If you reach the limit, FarmKeeper asks you to upgrade.',
    ],
  },
  {
    slug: 'understanding-farmkeeper-plans',
    title: 'Understanding FarmKeeper plans',
    description: 'What Free, Farmer, and Premium include.',
    categoryId: 'subscription',
    keywords: ['billing', 'upgrade', 'farmer', 'premium', 'free plan'],
    notes: [
      'Open Plan & Billing to see your current plan and available upgrades.',
      'Crops, harvests, livestock, weather, tasks, and settings are available on Free.',
      'Finances, profitability, feed, eggs, and analytics need a paid plan (Farmer or Premium).',
      'Farmer includes a livestock limit. Premium raises or removes that limit.',
      'Pay from Plan & Billing. Uganda farms can use mobile money. Other regions use card.',
    ],
  },
  {
    slug: 'how-to-add-feed-stock',
    title: 'How to add feed stock',
    description: 'Record a new bag, delivery, or feed type in inventory.',
    categoryId: 'feed',
    keywords: ['feed', 'stock', 'inventory', 'low stock'],
    steps: [
      'Open Feed management.',
      'Select Add feed stock.',
      'Choose the feed type and enter a name.',
      'Enter quantity, unit, and a low-stock threshold.',
      'Add supplier and purchase date if you know them.',
      'Save.',
    ],
  },
  {
    slug: 'how-to-log-egg-collection',
    title: 'How to log an egg collection',
    description: 'Record eggs collected for a day.',
    categoryId: 'eggs',
    keywords: ['eggs', 'collection', 'hens', 'layers'],
    steps: [
      'Open Eggs & sales.',
      'Stay on Collection.',
      'Enter the date, number of eggs, and number of hens.',
      'Add a note if you want.',
      'Save collection.',
    ],
  },
  {
    slug: 'how-to-add-a-task',
    title: 'How to add a task',
    description: 'Create a short reminder for crops, animals, or farm work.',
    categoryId: 'tasks',
    keywords: ['task', 'todo', 'reminder', 'due date'],
    steps: [
      'Open Tasks, or use Upcoming tasks on the dashboard.',
      'Select Add task.',
      'Pick a quick task or type your own.',
      'Choose a due date and priority.',
      'Save task.',
    ],
  },
  {
    slug: 'how-farm-weather-works',
    title: 'How farm weather works',
    description: 'Weather uses the location saved in farm settings.',
    categoryId: 'weather',
    keywords: ['weather', 'forecast', 'location', 'rain'],
    notes: [
      'Open Weather, or see the weather card on the dashboard.',
      'FarmKeeper uses your farm’s saved location. Set it in Settings if weather is missing.',
      'The snapshot shows temperature, humidity, wind, and rain. It is a forecast aid, not farm advice.',
    ],
  },
  {
    slug: 'how-to-update-farm-settings',
    title: 'How to update farm settings',
    description: 'Change farm name, location, currency, language, or profile.',
    categoryId: 'account',
    keywords: ['settings', 'profile', 'currency', 'language'],
    steps: [
      'Open Settings.',
      'Use Farm for name, URL, and location.',
      'Use Profile for your name, email, and phone.',
      'Use More for currency, language, and timezone.',
      'Save the section you changed.',
    ],
  },
];

export function getHelpCategory(id: string | null | undefined) {
  return HELP_CATEGORIES.find((category) => category.id === id) || null;
}

export function getHelpArticle(slug: string | null | undefined) {
  return HELP_ARTICLES.find((article) => article.slug === slug) || null;
}

export function articlesForCategory(categoryId: string) {
  return HELP_ARTICLES.filter((article) => article.categoryId === categoryId);
}

export function helpArticlePath(basePath: string, slug: string) {
  const base = basePath.replace(/\/$/, '');
  return `${base}/articles/${slug}`;
}

const POPULAR_HELP_SLUGS = [
  'how-to-add-a-crop',
  'how-to-record-a-harvest',
  'how-to-record-a-sale',
  'how-to-record-an-expense',
  'how-farmkeeper-calculates-profit',
  'how-to-add-livestock',
] as const;

export function popularHelpArticles() {
  return POPULAR_HELP_SLUGS.map((slug) => getHelpArticle(slug)).filter(
    (article): article is HelpArticle => Boolean(article)
  );
}

export function searchHelpArticles(query: string) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  return HELP_ARTICLES.filter((article) => {
    const category = getHelpCategory(article.categoryId);
    const haystack = [
      article.title,
      article.description,
      article.categoryId,
      category?.label || '',
      ...article.keywords,
    ]
      .join(' ')
      .toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}
