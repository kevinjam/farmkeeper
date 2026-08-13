import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPageShell from '@/components/legal/LegalPageShell';

export const metadata: Metadata = {
  title: 'Refund Policy | FarmKeeper',
  description:
    'FarmKeeper refund policy for subscription payments processed via Paddle and Flutterwave.',
  alternates: { canonical: 'https://app.farmkeeper.co/en/refund' },
};

export default function RefundPolicyPage() {
  return (
    <LegalPageShell
      title="Refund Policy"
      description="Effective date: August 13, 2026. This Refund Policy explains when and how FarmKeeper handles refunds for paid subscriptions."
    >
      <section className="space-y-4">
        <h2>1. Overview</h2>
        <p>
          FarmKeeper offers Free, Farmer, and Premium plans. Paid plans may be billed monthly or yearly. Card payments
          are processed by Paddle. Uganda mobile money payments are processed by Flutterwave.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>2. Free trial</h2>
        <p>
          Where a free Farmer trial is offered at signup, you will not be charged during the trial period. If you do not
          subscribe before the trial ends, your account may move to the Free plan with limited features. No refund is
          needed for unused trial time.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>3. Cancellation</h2>
        <p>
          You can cancel a paid subscription from Plan &amp; billing in the app. Cancellation stops future renewals.
          Access generally continues through the end of the current paid period already purchased, unless otherwise
          stated at cancellation.
        </p>
        <p>
          Cancelling does not automatically refund amounts already paid for the current billing period.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>4. Refund eligibility</h2>
        <p>We may issue a refund in these cases:</p>
        <ul>
          <li>Duplicate or accidental charges</li>
          <li>Technical failure that prevented you from using paid features after payment, where we cannot restore access</li>
          <li>Billing errors clearly caused by FarmKeeper or our payment processors</li>
        </ul>
        <p>Refund requests are reviewed case by case. We may decline refunds where:</p>
        <ul>
          <li>The request is made after substantial use of paid features during the billing period</li>
          <li>The charge was authorized and the service was available as described</li>
          <li>The request conflicts with processor or bank rules for that payment method</li>
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h2>5. How to request a refund</h2>
        <p>
          Email <a href="mailto:info@farmkeeper.co">info@farmkeeper.co</a> with:
        </p>
        <ul>
          <li>Account email</li>
          <li>Farm name</li>
          <li>Payment date and amount</li>
          <li>Payment reference / invoice number if available</li>
          <li>Reason for the request</li>
        </ul>
        <p>We aim to respond within 5 business days.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>6. Processing time</h2>
        <p>
          Approved refunds are issued through the original payment provider (Paddle or Flutterwave). Timing depends on
          the provider and your bank or mobile money operator and may take several business days after approval.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>7. Chargebacks</h2>
        <p>
          Please contact us before opening a chargeback so we can help resolve billing issues quickly. Unresolved
          chargebacks may result in account suspension while the dispute is investigated.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>8. Related policies</h2>
        <p>
          See our <Link href="/en/terms">Terms &amp; Conditions</Link> and <Link href="/en/privacy">Privacy Policy</Link>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
