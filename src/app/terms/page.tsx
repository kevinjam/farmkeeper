import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPageShell from '@/components/legal/LegalPageShell';

export const metadata: Metadata = {
  title: 'Terms & Conditions | FarmKeeper',
  description:
    'Terms and conditions for using FarmKeeper farm management software and paid subscriptions.',
  alternates: { canonical: 'https://app.farmkeeper.co/en/terms' },
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms & Conditions"
      description="Effective date: August 13, 2026. These Terms govern your access to and use of FarmKeeper at https://app.farmkeeper.co."
    >
      <section className="space-y-4">
        <h2>1. Agreement</h2>
        <p>
          By creating an account or using FarmKeeper, you agree to these Terms and our{' '}
          <Link href="/en/privacy">Privacy Policy</Link>. If you do not agree, do not use the service.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>2. The service</h2>
        <p>
          FarmKeeper provides software tools for farm management, including livestock, crops, finances, feed, eggs,
          weather, analytics, and billing features depending on your plan.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>3. Accounts</h2>
        <ul>
          <li>You must provide accurate registration information.</li>
          <li>You are responsible for activity under your account and for keeping credentials secure.</li>
          <li>You must be legally able to enter a binding agreement in your jurisdiction.</li>
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h2>4. Plans and billing</h2>
        <ul>
          <li>
            Free, Farmer, and Premium plans are offered as described in the app. Farmer may include a free trial at
            signup.
          </li>
          <li>
            Paid subscriptions renew according to the billing cycle you choose (monthly or yearly), unless cancelled.
          </li>
          <li>
            Uganda mobile money payments are processed by Flutterwave. Card payments are processed by Paddle as merchant
            of record.
          </li>
          <li>
            Prices are shown in UGX for Uganda and USD for other supported countries, unless otherwise stated at
            checkout.
          </li>
        </ul>
        <p>
          Refunds are described in our <Link href="/en/refund">Refund Policy</Link>.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>5. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Misuse the service, attempt unauthorized access, or disrupt operations</li>
          <li>Upload unlawful, harmful, or infringing content</li>
          <li>Resell or reverse engineer the service except as allowed by law</li>
          <li>Use FarmKeeper to violate applicable laws or third-party rights</li>
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h2>6. Your content</h2>
        <p>
          You retain ownership of farm and business data you enter. You grant us a limited license to host, process, and
          display that data solely to operate the service for you.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>7. Intellectual property</h2>
        <p>
          FarmKeeper software, branding, and related materials are owned by FarmKeeper or its licensors. These Terms do
          not transfer ownership of our intellectual property to you.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>8. Disclaimers</h2>
        <p>
          FarmKeeper is provided &quot;as is&quot; and &quot;as available.&quot; We do not guarantee uninterrupted
          service, error-free operation, or specific farm business outcomes. Weather and third-party data are provided
          for convenience and may be incomplete or delayed.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>9. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, FarmKeeper is not liable for indirect, incidental, special,
          consequential, or lost-profit damages arising from use of the service. Our total liability for any claim
          relating to the service is limited to the fees you paid to us for the service in the three (3) months before
          the claim.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>10. Termination</h2>
        <p>
          You may stop using FarmKeeper and cancel a paid plan as described in the billing settings. We may suspend or
          terminate accounts that violate these Terms or pose security, legal, or operational risk.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>11. Changes</h2>
        <p>
          We may update these Terms. Continued use after changes are posted on this page constitutes acceptance of the
          updated Terms.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>12. Contact</h2>
        <p>
          Questions about these Terms: <a href="mailto:info@farmkeeper.co">info@farmkeeper.co</a>
        </p>
      </section>
    </LegalPageShell>
  );
}
