export const SUPPORT_CATEGORIES = [
  { id: 'crops', label: 'Crops' },
  { id: 'harvests', label: 'Harvests' },
  { id: 'sales', label: 'Sales' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'livestock', label: 'Livestock' },
  { id: 'feed', label: 'Feed Management' },
  { id: 'eggs', label: 'Eggs & Sales' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'weather', label: 'Weather' },
  { id: 'finances', label: 'Finances' },
  { id: 'profitability', label: 'Profitability' },
  { id: 'account', label: 'Account' },
  { id: 'subscription', label: 'Subscription / Billing' },
  { id: 'other', label: 'Something else' },
] as const;

export type SupportCategoryId = (typeof SUPPORT_CATEGORIES)[number]['id'];
export type SupportStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type SupportPriority = 'LOW' | 'NORMAL' | 'HIGH';

export type SupportTicketSummary = {
  ticketNumber: string;
  category: SupportCategoryId;
  subject: string;
  status: SupportStatus;
  priority: SupportPriority;
  currentPage?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
};

export type SupportMessage = {
  senderType: 'user' | 'staff';
  message: string;
  attachmentUrl?: string;
  createdAt: string;
};

export type SupportTicketDetail = SupportTicketSummary & {
  messages: SupportMessage[];
  canReply: boolean;
};

export const SUPPORT_TICKET_NUMBER_RE = /^FK-\d{4,}$/;

export function supportCategoryLabel(id: string) {
  return SUPPORT_CATEGORIES.find((item) => item.id === id)?.label || id;
}

export function supportStatusLabel(status: string) {
  if (status === 'IN_PROGRESS') return 'In progress';
  if (status === 'RESOLVED') return 'Resolved';
  if (status === 'CLOSED') return 'Closed';
  return 'Open';
}

export function supportPriorityLabel(priority: string) {
  if (priority === 'HIGH') return 'High';
  if (priority === 'LOW') return 'Low';
  return 'Normal';
}

export function isSupportTicketNumber(value: string) {
  return SUPPORT_TICKET_NUMBER_RE.test(value.trim().toUpperCase());
}

export function validateSupportForm(values: { category: string; message: string; subject?: string }) {
  const errors: Record<string, string> = {};
  if (!values.category) errors.category = 'Choose a category.';
  const message = values.message.trim();
  if (!message) errors.message = 'Please describe what you need help with.';
  if (message.length > 5000) errors.message = 'Message is too long.';
  if ((values.subject || '').trim().length > 160) errors.subject = 'Subject is too long.';
  return errors;
}

export function captureDeviceInfo() {
  if (typeof window === 'undefined') return '';
  if (window.matchMedia('(max-width: 767px)').matches) return 'mobile';
  if (window.matchMedia('(max-width: 1023px)').matches) return 'tablet';
  return 'desktop';
}

export function helpTicketPath(basePath: string, ticketNumber: string) {
  return `${basePath.replace(/\/$/, '')}/tickets/${ticketNumber}`;
}
