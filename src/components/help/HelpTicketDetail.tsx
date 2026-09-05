'use client';

import { useEffect, useState } from 'react';
import { LifeBuoy, Loader2 } from 'lucide-react';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { apiClient } from '@/lib/api';
import {
  isSupportTicketNumber,
  supportCategoryLabel,
  supportPriorityLabel,
  supportStatusLabel,
  type SupportMessage,
  type SupportTicketDetail,
} from '@/lib/support';
import { HelpBackLink, HelpPageShell, helpFieldClass, helpFocus, helpStatusClass } from './HelpPageShell';

function isSafeAttachmentUrl(url?: string) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      (parsed.hostname === 'res.cloudinary.com' || parsed.hostname.endsWith('.cloudinary.com'))
    );
  } catch {
    return false;
  }
}

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function HelpTicketDetail({
  basePath,
  ticketNumber,
}: {
  basePath: string;
  ticketNumber: string;
}) {
  const { farmId } = useFarmPaths();
  const [ticket, setTicket] = useState<SupportTicketDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    if (!farmId || !isSupportTicketNumber(ticketNumber)) {
      setError('Support request not found.');
      setLoading(false);
      return;
    }
    setLoading(true);
    const response = await apiClient.getSupportTicket(farmId, ticketNumber);
    if (!response.success) {
      setError(response.error || 'Support request not found.');
      setTicket(null);
    } else {
      setError('');
      setTicket(response.data as SupportTicketDetail);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId, ticketNumber]);

  const handleReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;
    const message = reply.trim();
    if (!message) {
      setReplyError('Please enter a reply.');
      return;
    }
    setSending(true);
    setReplyError('');
    const response = await apiClient.replySupportTicket(farmId, ticketNumber, message);
    if (!response.success) {
      setReplyError(response.error || 'Unable to send your reply.');
      setSending(false);
      return;
    }
    setReply('');
    const created = response.data as SupportMessage;
    setTicket((current) =>
      current ? { ...current, messages: [...current.messages, created] } : current
    );
    setSending(false);
  };

  if (loading) {
    return (
      <HelpPageShell icon={<LifeBuoy className="h-6 w-6" />} title="Support request">
        <p className="text-sm text-gray-500">Loading…</p>
      </HelpPageShell>
    );
  }

  if (!ticket) {
    return (
      <HelpPageShell icon={<LifeBuoy className="h-6 w-6" />} title="Support request">
        <p className="text-sm text-red-600">{error}</p>
        <div className="mt-4">
          <HelpBackLink href={`${basePath}?section=support`}>Back to support</HelpBackLink>
        </div>
      </HelpPageShell>
    );
  }

  return (
    <HelpPageShell
      icon={<LifeBuoy className="h-6 w-6" />}
      title={ticket.ticketNumber}
      subtitle={ticket.subject || supportCategoryLabel(ticket.category)}
      crumbs={[
        { href: basePath, label: 'Help' },
        { href: `${basePath}?section=support`, label: 'Support' },
        { href: `${basePath}/tickets/${ticket.ticketNumber}`, label: ticket.ticketNumber },
      ]}
      actions={
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${helpStatusClass(ticket.status)}`}>
          {supportStatusLabel(ticket.status)}
        </span>
      }
    >
      <div className="space-y-6">
        <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm dark:border-gray-700 sm:grid-cols-4">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Category</dt>
            <dd className="mt-0.5 font-medium text-gray-900 dark:text-white">
              {supportCategoryLabel(ticket.category)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Status</dt>
            <dd className="mt-0.5 font-medium text-gray-900 dark:text-white">{supportStatusLabel(ticket.status)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Priority</dt>
            <dd className="mt-0.5 font-medium text-gray-900 dark:text-white">
              {supportPriorityLabel(ticket.priority)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Created</dt>
            <dd className="mt-0.5 font-medium text-gray-900 dark:text-white">{formatWhen(ticket.createdAt)}</dd>
          </div>
        </dl>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Conversation</h2>
          <ul className="space-y-3">
            {ticket.messages.map((item, index) => {
              const staff = item.senderType === 'staff';
              return (
                <li
                  key={`${item.createdAt}-${index}`}
                  className={`flex ${staff ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm sm:max-w-[80%] ${
                      staff
                        ? 'border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
                        : 'bg-sky-600 text-white'
                    }`}
                  >
                    <p className={`text-[11px] font-semibold ${staff ? 'text-gray-500' : 'text-sky-100'}`}>
                      {staff ? 'FarmKeeper Support' : 'You'}
                      {formatWhen(item.createdAt) ? ` · ${formatWhen(item.createdAt)}` : ''}
                    </p>
                    <p
                      className={`mt-1 whitespace-pre-wrap leading-relaxed ${
                        staff ? 'text-gray-800 dark:text-gray-100' : 'text-white'
                      }`}
                    >
                      {item.message}
                    </p>
                    {isSafeAttachmentUrl(item.attachmentUrl) ? (
                      <a
                        href={item.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-2 block ${helpFocus}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.attachmentUrl}
                          alt="Screenshot attached to this request"
                          className="max-h-48 rounded-xl border border-white/20"
                        />
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {ticket.canReply ? (
          <form
            onSubmit={handleReply}
            className="space-y-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-700"
          >
            <label htmlFor="ticket-reply" className="block text-sm font-medium text-gray-800 dark:text-gray-200">
              Reply
            </label>
            <textarea
              id="ticket-reply"
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              disabled={sending}
              placeholder="Add more detail or answer a question…"
              className={`min-h-[6.5rem] resize-y ${helpFieldClass} ${helpFocus}`}
              aria-invalid={Boolean(replyError)}
              aria-describedby={replyError ? 'ticket-reply-error' : undefined}
            />
            {replyError ? (
              <p id="ticket-reply-error" className="text-sm text-red-600" role="alert">
                {replyError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={sending}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {sending ? 'Sending…' : 'Send reply'}
            </button>
          </form>
        ) : (
          <p className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:bg-gray-900/50">
            This request is closed. Start a new request if you still need help.
          </p>
        )}

        <HelpBackLink href={`${basePath}?section=support`}>Back to support</HelpBackLink>
      </div>
    </HelpPageShell>
  );
}
