'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { CheckCircle2, LifeBuoy, Loader2, Ticket } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { apiClient } from '@/lib/api';
import { getLocaleFromPathname } from '@/lib/farmPaths';
import {
  SUPPORT_CATEGORIES,
  captureDeviceInfo,
  helpTicketPath,
  supportCategoryLabel,
  supportStatusLabel,
  validateSupportForm,
  type SupportTicketSummary,
} from '@/lib/support';
import { formatReceiptSize, validateReceiptFile } from '@/lib/receiptUpload';
import { HelpBackLink, HelpPageShell, helpFieldClass, helpFocus, helpStatusClass } from './HelpPageShell';

const labelClass = 'block text-sm font-medium text-gray-800 dark:text-gray-200';

function formatTicketDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function HelpSupport({ basePath }: { basePath: string }) {
  const { t } = useTranslations('common');
  const { farmId, locale } = useFarmPaths();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFarmHelp = Boolean(farmId) && basePath.includes('/dashboard/help');

  const [tickets, setTickets] = useState<SupportTicketSummary[]>([]);
  const [listError, setListError] = useState('');
  const [loadingList, setLoadingList] = useState(isFarmHelp);
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdNumber, setCreatedNumber] = useState('');

  const currentPage = useMemo(() => {
    return searchParams.get('from') || pathname || '';
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isFarmHelp || !farmId) return;
    let cancelled = false;
    const load = async () => {
      setLoadingList(true);
      const response = await apiClient.getSupportTickets(farmId);
      if (cancelled) return;
      if (!response.success) {
        setListError(response.error || 'Unable to load your support requests.');
        setTickets([]);
      } else {
        setListError('');
        setTickets((response.data as SupportTicketSummary[]) || []);
      }
      setLoadingList(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [farmId, isFarmHelp, createdNumber]);

  if (!isFarmHelp) {
    const loginHref = `/${getLocaleFromPathname(pathname) || locale || 'en'}/auth/login`;
    return (
      <HelpPageShell
        icon={<LifeBuoy className="h-6 w-6" strokeWidth={2} />}
        title={t('help.supportTitle', 'Get Support')}
        subtitle={t('help.supportSignIn', 'Sign in to send a support request from your farm.')}
        crumbs={[
          { href: basePath, label: 'Help' },
          { href: `${basePath}?section=support`, label: 'Support' },
        ]}
      >
        <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-8 text-center dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Support requests stay attached to your farm so we can see your records.
          </p>
          <Link
            href={loginHref}
            className={`btn btn-primary mt-4 inline-flex min-h-11 items-center justify-center ${helpFocus}`}
          >
            Sign in
          </Link>
        </div>
        <div className="mt-5">
          <HelpBackLink href={basePath}>{t('help.backToHelp', 'Back to Help & Support')}</HelpBackLink>
        </div>
      </HelpPageShell>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const errors = validateSupportForm({ category, message, subject });
    setFieldErrors(errors);
    setFormError('');
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    try {
      let screenshotUrl = '';
      if (screenshot) {
        const fileError = validateReceiptFile(screenshot);
        if (fileError || screenshot.type === 'application/pdf') {
          setFormError('Screenshots must be a JPG, PNG, or WebP image.');
          setSubmitting(false);
          return;
        }
        const upload = await apiClient.uploadSupportScreenshot(farmId, screenshot);
        if (upload.success && upload.data?.url) {
          screenshotUrl = upload.data.url;
        } else if (upload.error && !upload.error.includes('not available')) {
          setFormError(upload.error);
          setSubmitting(false);
          return;
        }
      }

      const response = await apiClient.createSupportTicket(farmId, {
        category,
        subject: subject.trim() || undefined,
        message: message.trim(),
        currentPage,
        deviceInfo: captureDeviceInfo(),
        ...(screenshotUrl ? { screenshotUrl } : {}),
      });

      if (!response.success) {
        const existing = (response.data as { data?: SupportTicketSummary } | undefined)?.data?.ticketNumber;
        if (existing) {
          setCreatedNumber(existing);
          setFormError('');
          return;
        }
        setFormError(response.error || 'Unable to send your request.');
        return;
      }

      const ticketNumber = (response.data as SupportTicketSummary | undefined)?.ticketNumber || '';
      if (ticketNumber) setCreatedNumber(ticketNumber);
      setCategory('');
      setSubject('');
      setMessage('');
      setScreenshot(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <HelpPageShell
      icon={<LifeBuoy className="h-6 w-6" strokeWidth={2} />}
      title={t('help.supportTitle', 'Get Support')}
      subtitle={t('help.supportReady', 'Tell us what is not working. We will review your request.')}
      crumbs={[
        { href: basePath, label: 'Help' },
        { href: `${basePath}?section=support`, label: 'Support' },
      ]}
      scrollBody={false}
    >
      <div className="flex h-full min-h-0 flex-col gap-4">
        {createdNumber ? (
          <div
            role="status"
            className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 dark:border-emerald-900/50 dark:bg-emerald-950/40"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden />
            <div>
              <p className="font-semibold text-emerald-950 dark:text-emerald-100">We&apos;ve received your request.</p>
              <p className="mt-1 font-mono text-sm font-bold text-emerald-900 dark:text-emerald-100">
                Ticket {createdNumber}
              </p>
              <p className="mt-1 text-sm text-emerald-900/80 dark:text-emerald-100/80">
                Thanks for contacting FarmKeeper. We&apos;ll review your request and get back to you.
              </p>
              <Link
                href={helpTicketPath(basePath, createdNumber)}
                className={`mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-emerald-900 underline dark:text-emerald-100 ${helpFocus}`}
              >
                View request
              </Link>
            </div>
          </div>
        ) : null}

        <div className="grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[minmax(0,1.15fr)_minmax(17rem,0.85fr)]">
          <form
            onSubmit={handleSubmit}
            className="min-h-0 space-y-4 overflow-y-auto rounded-2xl border border-gray-200 p-4 dark:border-gray-700 md:p-5"
            noValidate
          >
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">New request</h2>
              <p className="mt-0.5 text-sm text-gray-500">Describe the problem. We will reply on this ticket.</p>
            </div>
            <div>
              <label htmlFor="support-category" className={labelClass}>
                Category
              </label>
              <select
                id="support-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={`mt-1.5 ${helpFieldClass}`}
                required
                disabled={submitting}
                aria-invalid={Boolean(fieldErrors.category)}
                aria-describedby={fieldErrors.category ? 'support-category-error' : undefined}
              >
                <option value="">Select a category</option>
                {SUPPORT_CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              {fieldErrors.category ? (
                <p id="support-category-error" className="mt-1 text-sm text-red-600" role="alert">
                  {fieldErrors.category}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="support-subject" className={labelClass}>
                Subject <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <input
                id="support-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className={`mt-1.5 ${helpFieldClass}`}
                maxLength={160}
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="support-message" className={labelClass}>
                Message
              </label>
              <textarea
                id="support-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className={`mt-1.5 min-h-[8.5rem] resize-y ${helpFieldClass}`}
                maxLength={5000}
                required
                disabled={submitting}
                aria-invalid={Boolean(fieldErrors.message)}
                aria-describedby={fieldErrors.message ? 'support-message-error' : undefined}
              />
              {fieldErrors.message ? (
                <p id="support-message-error" className="mt-1 text-sm text-red-600" role="alert">
                  {fieldErrors.message}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="support-screenshot" className={labelClass}>
                Screenshot <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <input
                id="support-screenshot"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={submitting}
                onChange={(event) => setScreenshot(event.target.files?.[0] || null)}
                className="mt-1.5 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-semibold dark:text-gray-300 dark:file:bg-gray-700"
              />
              {screenshot ? (
                <p className="mt-1 text-xs text-gray-500">
                  {screenshot.name} · {formatReceiptSize(screenshot.size)}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-gray-500">
                Do not include passwords, API keys, payment card details, or login tokens.
              </p>
            </div>

            {formError ? (
              <p className="text-sm text-red-600" role="alert">
                {formError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {submitting ? 'Sending…' : 'Send request'}
            </button>
          </form>

          <aside className="min-h-0 overflow-y-auto rounded-2xl border border-gray-200 p-4 dark:border-gray-700 md:p-5">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-gray-500" aria-hidden />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Your tickets</h2>
            </div>
            {loadingList ? <p className="mt-4 text-sm text-gray-500">Loading…</p> : null}
            {listError ? <p className="mt-4 text-sm text-red-600">{listError}</p> : null}
            {!loadingList && !tickets.length ? (
              <p className="mt-4 text-sm text-gray-500">No requests yet. New tickets will appear here.</p>
            ) : null}
            {tickets.length ? (
              <ul className="mt-3 divide-y divide-gray-100 dark:divide-gray-800">
                {tickets.map((ticket) => (
                  <li key={ticket.ticketNumber}>
                    <Link
                      href={helpTicketPath(basePath, ticket.ticketNumber)}
                      className={`flex items-start justify-between gap-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/40 ${helpFocus}`}
                    >
                      <span className="min-w-0">
                        <span className="block font-mono text-sm font-semibold text-gray-900 dark:text-white">
                          {ticket.ticketNumber}
                        </span>
                        <span className="mt-0.5 block truncate text-[13px] text-gray-600 dark:text-gray-300">
                          {ticket.subject || supportCategoryLabel(ticket.category)}
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-500">
                          {supportCategoryLabel(ticket.category)}
                          {formatTicketDate(ticket.createdAt) ? ` · ${formatTicketDate(ticket.createdAt)}` : ''}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${helpStatusClass(ticket.status)}`}
                      >
                        {supportStatusLabel(ticket.status)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </aside>
        </div>

        <div className="shrink-0">
          <HelpBackLink href={basePath}>{t('help.backToHelp', 'Back to Help & Support')}</HelpBackLink>
        </div>
      </div>
    </HelpPageShell>
  );
}
