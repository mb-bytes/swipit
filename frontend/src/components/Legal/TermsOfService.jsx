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

export function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Terms of Service — SwipIt";
  }, []);

  return (
    <div className="min-h-screen bg-[#f2ede3] text-[#111215]">
      <header className="sticky top-0 z-40 bg-[#f2ede3]/90 backdrop-blur-sm border-b border-neutral-300/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
            <Link to="/privacy" className="hover:text-[#111215] transition-colors">
              Privacy Policy
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
            Terms of Service
          </h1>
          <p className="text-xs text-neutral-500 font-mono">Effective date: {EFFECTIVE_DATE}</p>
          <p className="mt-4 text-sm text-neutral-600 max-w-xl leading-relaxed">
            Please read these terms carefully before using SwipIt. By creating an account or using
            the service, you agree to be bound by these terms.
          </p>
        </div>

        <Section id="service" title="1. The Service">
          <p>
            SwipIt provides tools to track credit card transactions and analyze spending. We integrate
            with Google Gmail (read-only) to automatically extract transaction data from bank alert
            emails, and allow manual entry of transactions.
          </p>
        </Section>

        <Section id="eligibility" title="2. Eligibility">
          <p>
            You must be at least 18 years old to use SwipIt. By using the service, you represent that
            you meet this requirement and that all information you provide is accurate and current.
          </p>
        </Section>

        <Section id="account" title="3. Your Account">
          <ul className="list-disc pl-5 space-y-2">
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
            <li>Notify us immediately at <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2 text-[#111215]">{CONTACT_EMAIL}</a> if you suspect unauthorized access.</li>
            <li>You may not share your account with others or create accounts on behalf of third parties without permission.</li>
          </ul>
        </Section>

        <Section id="gmail-permission" title="4. Gmail Integration &amp; Permissions">
          <p>
            SwipIt requests read-only Gmail access (
            <code className="bg-neutral-200/80 px-1 py-0.5 rounded text-[11px] font-mono">
              gmail.readonly
            </code>
            ) to scan for bank transaction alert emails. By connecting your Gmail account:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>You authorize SwipIt to access your Gmail messages in read-only mode.</li>
            <li>You confirm you have the right to grant this access.</li>
            <li>You understand we will only process bank alert emails and nothing else.</li>
            <li>You can revoke this access at any time via your Google Account settings at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer" className="underline underline-offset-2 text-[#111215]">myaccount.google.com/permissions</a>.</li>
          </ul>
        </Section>

        <Section id="acceptable-use" title="5. Acceptable Use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Use the service for any unlawful purpose or in violation of these terms.</li>
            <li>Attempt to reverse engineer, decompile, or extract source code from the service.</li>
            <li>Introduce malicious code, bots, or automated scrapers.</li>
            <li>Impersonate any person or entity or misrepresent your identity.</li>
            <li>Use the service in a way that could damage, disable, or impair its availability.</li>
          </ul>
        </Section>

        <Section id="data-accuracy" title="6. Data Accuracy">
          <p>
            SwipIt extracts transaction data from bank alert emails using automated parsing. While we
            strive for accuracy, we do not guarantee that all transaction data will be captured or
            categorized correctly. You are responsible for reviewing and verifying your transaction
            records. SwipIt is not a licensed financial advisor and does not provide financial advice.
          </p>
        </Section>

        <Section id="ip" title="7. Intellectual Property">
          <p>
            All content, design, code, and trademarks associated with SwipIt are owned by SwipIt
            Technologies. You are granted a limited, non-exclusive, non-transferable license to access
            and use the service for personal, non-commercial purposes.
          </p>
        </Section>

        <Section id="termination" title="8. Termination">
          <p>
            You may close your account at any time directly from the platform by going to{" "}
            <Link to="/settings" className="underline underline-offset-2 text-[#111215] hover:text-neutral-600">
              Settings → Delete Account
            </Link>
            . We may suspend or terminate your access if you violate these terms, with or without
            prior notice. Upon termination, your data will be deleted as described in our{" "}
            <Link to="/privacy" className="underline underline-offset-2 text-[#111215]">
              Privacy Policy
            </Link>
            .
          </p>
        </Section>

        <Section id="disclaimer" title="9. Disclaimer of Warranties">
          <p>
            SwipIt is provided "as is" and "as available" without any warranties, express or implied,
            including but not limited to warranties of merchantability, fitness for a particular
            purpose, or non-infringement. We do not warrant that the service will be uninterrupted,
            error-free, or completely secure.
          </p>
        </Section>

        <Section id="liability" title="10. Limitation of Liability">
          <p>
            To the fullest extent permitted by applicable law, SwipIt Technologies shall not be liable
            for any indirect, incidental, special, consequential, or punitive damages, including loss
            of profits or data, arising from your use of or inability to use the service.
          </p>
        </Section>

        <Section id="changes" title="11. Changes to These Terms">
          <p>
            We may update these terms from time to time. We will notify you of material changes via
            email or in-app notice before they take effect. Continued use after the effective date
            constitutes acceptance of the revised terms.
          </p>
        </Section>

        <Section id="governing-law" title="12. Governing Law">
          <p>
            These terms are governed by the laws of India. Any disputes arising from these terms or
            your use of the service shall be subject to the exclusive jurisdiction of courts in India.
          </p>
        </Section>

        <Section id="contact" title="13. Contact Us">
          <p>
            Questions about these terms?{" "}
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
            <Link to="/privacy" className="hover:text-[#111215] transition-colors">Privacy Policy</Link>
            <span>|</span>
            <Link to="/" className="hover:text-[#111215] transition-colors">Back to Home</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TermsOfService;
