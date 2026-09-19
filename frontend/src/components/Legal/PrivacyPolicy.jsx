import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/Landing/Navbar/BrandLogo";

const EFFECTIVE_DATE = "September 19, 2025";
const CONTACT_EMAIL = "atique.sh2@gmail.com";

function Section({ title, id, children }) {
  return (
    <section id={id} className="mb-10 scroll-mt-20">
      <h2 className="text-sm font-bold text-[#111215] mb-3 tracking-tight border-b border-neutral-200 pb-2 uppercase font-mono">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-neutral-700 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Step({ number, children }) {
  return (
    <li className="flex gap-3 items-start">
      <span className="shrink-0 w-5 h-5 rounded-full bg-[#111215] text-[#f2eee5] text-[10px] font-bold flex items-center justify-center mt-0.5">
        {number}
      </span>
      <span>{children}</span>
    </li>
  );
}

export function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Privacy Policy — SwipIt";
  }, []);

  return (
    <div className="min-h-screen bg-[#f2ede3] text-[#111215]">
      <header className="sticky top-0 z-40 bg-[#f2ede3]/90 backdrop-blur-sm border-b border-neutral-300/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
            <Link to="/terms" className="hover:text-[#111215] transition-colors">
              Terms of Service
            </Link>
            <Link
              to="/signup"
              className="px-3 py-1.5 rounded-lg bg-[#111215] text-[#f2eee5] hover:bg-neutral-800 transition-colors text-xs font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-2">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111215] mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs text-neutral-500 font-mono">Effective date: {EFFECTIVE_DATE}</p>
          <p className="mt-4 text-sm text-neutral-600 max-w-xl leading-relaxed">
            SwipIt is committed to protecting your privacy. This policy explains exactly what data we
            collect, how we use it, and how you can delete or revoke it at any time.
          </p>
        </div>

        <Section id="who" title="1. Who We Are">
          <p>
            SwipIt ("we", "us", "our") is a personal finance tool that helps users track credit card
            transactions and maximize rewards. We parse bank alert emails from your Gmail inbox (with
            your explicit consent) to extract transaction data automatically.
          </p>
        </Section>

        <Section id="data" title="2. Data We Collect">
          <p>We collect only the minimum data necessary to provide the service:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Account data</strong> — your name, email address, and a securely hashed password.</li>
            <li><strong>Card metadata</strong> — card name, last 4 digits, bank name, reward type. We never store full card numbers, CVVs, or payment credentials.</li>
            <li><strong>Transaction data</strong> — merchant name, amount, date, category, and reward earned, extracted from bank alert emails.</li>
            <li><strong>Gmail OAuth token</strong> — a read-only access token granted by Google when you connect your account. Stored encrypted and used only when you trigger a sync.</li>
          </ul>
        </Section>

        <Section id="gmail" title="3. How We Use Gmail Data">
          <p>
            SwipIt's use of information received from Google APIs complies with the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 text-[#111215] hover:text-neutral-600 transition-colors"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>We request the <code className="bg-neutral-200/80 px-1 py-0.5 rounded text-[11px] font-mono">https://www.googleapis.com/auth/gmail.readonly</code> scope, which provides read-only access to Gmail messages.</li>
            <li>We access Gmail <strong>only</strong> to identify bank transaction alert emails and extract merchant, amount, and date fields.</li>
            <li>We do <strong>not</strong> read, store, index, or process any email that is not a recognized bank transaction alert.</li>
            <li>We do <strong>not</strong> use Gmail data for advertising, profiling, training ML models, or any purpose beyond transaction tracking.</li>
            <li>We do <strong>not</strong> allow any human to read your Gmail messages except at your explicit request for support.</li>
          </ul>
        </Section>

        <Section id="storage" title="4. How We Store Your Data">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Passwords</strong> are hashed with bcrypt and never stored in plain text.</li>
            <li><strong>Transaction and card data</strong> are stored in a PostgreSQL database with row-level access controls — only your account can query your records.</li>
            <li><strong>Gmail OAuth tokens</strong> are stored encrypted at rest and used only when you initiate a sync.</li>
            <li>All data in transit is protected using TLS/HTTPS.</li>
            <li>We do not sell, rent, trade, or share your personal data with third parties for any commercial purpose.</li>
          </ul>
        </Section>

        <Section id="sharing" title="5. Data Sharing">
          <p>We share your data only in the following limited cases:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>With infrastructure providers (cloud hosting, database services) under strict data processing agreements.</li>
            <li>When required by law or to protect the safety of our users.</li>
          </ul>
        </Section>

        <Section id="revoke" title="6. How to Revoke Gmail Access">
          <p>You can revoke SwipIt's Gmail access at any time. Here are the exact steps:</p>
          <ol className="mt-4 space-y-3">
            <Step number="1">
              Visit{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 text-[#111215] hover:text-neutral-600 font-medium"
              >
                myaccount.google.com/permissions
              </a>{" "}
              in your browser. Sign in with the Google account you linked to SwipIt if prompted.
            </Step>
            <Step number="2">
              Scroll through the list of "Third-party apps with account access" and find <strong>SwipIt</strong>.
            </Step>
            <Step number="3">
              Click on <strong>SwipIt</strong> to expand its permission details.
            </Step>
            <Step number="4">
              Click <strong>"Remove Access"</strong> and confirm when prompted.
            </Step>
          </ol>
          <div className="mt-5 p-4 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800 text-xs leading-relaxed">
            <strong>After revoking:</strong> SwipIt will no longer sync new Gmail transactions.
            Previously saved transaction data will remain in your account. You can delete all your
            data at any time by going to{" "}
            <Link to="/settings" className="underline font-medium">
              Settings → Delete Account
            </Link>{" "}
            in the dashboard, or email us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a>.
          </div>
        </Section>

        <Section id="rights" title="7. Your Rights">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Access</strong> — request a copy of the data we hold about you.</li>
            <li><strong>Correction</strong> — request correction of inaccurate data.</li>
            <li>
              <strong>Deletion</strong> — delete your account and all associated data at any time
              from{" "}
              <Link to="/settings" className="underline underline-offset-2 text-[#111215] hover:text-neutral-600">
                Settings → Delete Account
              </Link>{" "}
              in the dashboard. Data is permanently removed immediately.
            </li>
            <li><strong>Portability</strong> — request an export of your transaction data by emailing us.</li>
          </ul>
          <p className="mt-3">
            For other requests, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2 text-[#111215]">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <Section id="cookies" title="8. Cookies &amp; Tracking">
          <p>
            We use only essential session cookies required to keep you authenticated. We do not use
            advertising cookies, tracking pixels, or third-party analytics scripts that collect
            personal data.
          </p>
        </Section>

        <Section id="children" title="9. Children's Privacy">
          <p>
            SwipIt is not intended for users under 18. We do not knowingly collect data from minors.
            Contact us immediately if you believe we have inadvertently collected such data.
          </p>
        </Section>

        <Section id="changes" title="10. Changes to This Policy">
          <p>
            We may update this policy periodically. Material changes will be communicated via email or
            in-app notification before they take effect. The effective date at the top reflects the
            most recent revision.
          </p>
        </Section>

        <Section id="contact" title="11. Contact Us">
          <p>
            Privacy questions or data requests:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline underline-offset-2 text-[#111215] hover:text-neutral-600 transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>

        <div className="mt-12 pt-8 border-t border-neutral-300/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-neutral-400">
          <span>Copyright {new Date().getFullYear()} SwipIt Technologies.</span>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-[#111215] transition-colors">Terms of Service</Link>
            <span>|</span>
            <Link to="/" className="hover:text-[#111215] transition-colors">Back to Home</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PrivacyPolicy;
