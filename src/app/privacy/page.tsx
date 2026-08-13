import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPageShell from '@/components/legal/LegalPageShell';

export const metadata: Metadata = {
  title: 'Privacy Policy | FarmKeeper',
  description:
    'How FarmKeeper collects, uses, and protects personal information for farm management accounts and billing.',
  alternates: { canonical: 'https://app.farmkeeper.co/en/privacy' },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      description="Effective date: August 13, 2026. This Privacy Policy explains how FarmKeeper collects, uses, stores, and shares information when you use app.farmkeeper.co and related services."
    >
      <section className="space-y-4">
        <h2>1. Who we are</h2>
        <p>
          FarmKeeper (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) provides farm management software at{' '}
          <a href="https://app.farmkeeper.co">https://app.farmkeeper.co</a>. Contact:{' '}
          <a href="mailto:info@farmkeeper.co">info@farmkeeper.co</a>.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>2. Information we collect</h2>
        <ul>
          <li>
            <strong>Account data:</strong> name, email address, password (hashed), farm name, and profile details you
            provide during signup or Google sign-in.
          </li>
          <li>
            <strong>Farm data:</strong> livestock, crops, finances, feed, eggs, tasks, weather preferences, and other
            records you enter into the product.
          </li>
          <li>
            <strong>Billing data:</strong> subscription plan, payment status, invoices, and payment references. Card
            payments are processed by Paddle; Uganda mobile money payments are processed by Flutterwave. We do not
            store full card numbers.
          </li>
          <li>
            <strong>Technical data:</strong> IP address, browser/device type, cookies/session tokens, and basic usage
            logs needed to operate and secure the service.
          </li>
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h2>3. How we use information</h2>
        <ul>
          <li>Provide, maintain, and improve FarmKeeper features</li>
          <li>Authenticate users and protect accounts</li>
          <li>Process subscriptions, renewals, invoices, and customer support</li>
          <li>Send transactional emails (signup, billing, security notices)</li>
          <li>Detect abuse, prevent fraud, and meet legal obligations</li>
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h2>4. Sharing</h2>
        <p>We share data only with processors needed to run the service, including:</p>
        <ul>
          <li>Hosting and database providers</li>
          <li>Paddle (card checkout and merchant of record)</li>
          <li>Flutterwave (Uganda mobile money)</li>
          <li>Email delivery providers</li>
          <li>Google (if you use Google sign-in)</li>
        </ul>
        <p>We do not sell personal information.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>5. Cookies and sessions</h2>
        <p>
          We use essential cookies and local storage for authentication, locale preferences, and session security. These
          are required for the app to function.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>6. Data retention</h2>
        <p>
          We retain account and farm data while your account is active. Billing records are retained as needed for
          accounting, tax, dispute handling, and legal compliance. You may request deletion by contacting{' '}
          <a href="mailto:info@farmkeeper.co">info@farmkeeper.co</a>.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>7. Security</h2>
        <p>
          We use industry-standard safeguards such as encrypted transport (HTTPS), access controls, and hashed
          passwords. No method of transmission or storage is 100% secure.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>8. Your rights</h2>
        <p>
          Depending on your location, you may request access, correction, export, or deletion of your personal data.
          Contact us at <a href="mailto:info@farmkeeper.co">info@farmkeeper.co</a>.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>9. Related policies</h2>
        <p>
          See also our <Link href="/en/terms">Terms &amp; Conditions</Link> and{' '}
          <Link href="/en/refund">Refund Policy</Link>.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>10. Changes</h2>
        <p>
          We may update this Privacy Policy from time to time. The effective date above will be revised when changes are
          published on this page.
        </p>
      </section>
    </LegalPageShell>
  );
}
