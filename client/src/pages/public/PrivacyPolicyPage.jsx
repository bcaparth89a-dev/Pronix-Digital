// --- PolicySection helper -----------------------------------------------------

function PolicySection({ title, children }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3 text-foreground">{title}</h2>
      <div className="text-muted-foreground text-sm leading-7 space-y-3">{children}</div>
    </section>
  );
}

// --- Page ---------------------------------------------------------------------

export function PrivacyPolicyPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-10 border-b pb-8">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">Last updated: January 1, 2025</p>
        </div>

        {/* Intro */}
        <p className="text-muted-foreground text-sm leading-7 mb-10">
          Pronix Digital ("we," "our," or "us") is committed to protecting your privacy. This
          Privacy Policy explains how we collect, use, disclose, and safeguard your information
          when you visit our website or engage with our services. Please read this policy carefully.
          If you disagree with its terms, please discontinue use of our site.
        </p>

        {/* Content sections */}
        <div className="prose prose-slate max-w-none space-y-8">
          <PolicySection title="1. Information We Collect">
            <p>
              We collect information you provide directly to us when you fill out our contact form,
              request a consultation, subscribe to our newsletter, or otherwise communicate with us.
              This may include your name, email address, phone number, company name, and details
              about your project or inquiry.
            </p>
            <p>
              We also automatically collect certain information when you visit our website,
              including your IP address, browser type and version, operating system, referring URLs,
              pages visited, time spent on pages, and other usage statistics. This data is collected
              via cookies, web beacons, and similar tracking technologies.
            </p>
            <p>
              We do not collect sensitive personal data such as financial account numbers, government
              ID numbers, or health information through our public website. Any payment transactions
              are processed by third-party payment providers who maintain their own privacy policies
              and security standards.
            </p>
          </PolicySection>

          <PolicySection title="2. How We Use Your Information">
            <p>
              We use the information we collect to respond to your inquiries, provide quotes, deliver
              requested services, and communicate with you about your project. If you have opted in,
              we may also send you service updates, promotional material, or educational content
              related to our offerings.
            </p>
            <p>
              Usage data is used to analyze site performance, understand how visitors interact with
              our content, improve our website experience, and detect and prevent security issues.
              We may also use aggregated, anonymized data for internal reporting and marketing
              analytics.
            </p>
            <p>
              We will never sell your personal information to third parties. We do not use your data
              for automated decision-making that produces legal or similarly significant effects on
              you without your explicit consent.
            </p>
          </PolicySection>

          <PolicySection title="3. Cookies and Tracking Technologies">
            <p>
              Our website uses cookies - small text files stored on your device - to enhance your
              browsing experience. Strictly necessary cookies ensure core site functionality such as
              form submissions. Analytics cookies (e.g., Google Analytics) help us understand
              visitor behavior in aggregate form. Marketing cookies may be used to deliver relevant
              advertising if you have consented.
            </p>
            <p>
              You can control cookie preferences through your browser settings. Most browsers allow
              you to refuse cookies, delete existing cookies, or alert you when cookies are being
              placed. Disabling certain cookies may affect the functionality of parts of our website.
            </p>
            <p>
              We use Google Analytics with IP anonymization enabled, meaning your full IP address is
              never stored by Google in connection with your Analytics data. You may opt out of
              Google Analytics tracking by installing the Google Analytics opt-out browser add-on
              available at tools.google.com/dlpage/gaoptout.
            </p>
          </PolicySection>

          <PolicySection title="4. Data Sharing and Disclosure">
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may
              share your information with trusted service providers who assist us in operating our
              website and delivering our services - such as hosting providers, email delivery
              platforms, CRM systems, and analytics services. These providers are contractually
              obligated to keep your information confidential and use it only for the purposes we
              specify.
            </p>
            <p>
              We may disclose your information if required to do so by law, in response to valid
              legal process (such as a court order or subpoena), or when we believe disclosure is
              necessary to protect our rights, your safety, or the safety of others. In the event of
              a merger, acquisition, or sale of all or a portion of our business, your information
              may be transferred as part of that transaction.
            </p>
            <p>
              Any third-party links on our website lead to external sites with their own privacy
              practices. We are not responsible for the content or privacy policies of those sites
              and encourage you to review their policies independently.
            </p>
          </PolicySection>

          <PolicySection title="5. Data Security">
            <p>
              We implement industry-standard technical and organizational security measures to
              protect your personal information from unauthorized access, alteration, disclosure, or
              destruction. Our website is served over HTTPS using SSL/TLS encryption. Access to
              personal data within our systems is restricted to authorized personnel on a
              need-to-know basis.
            </p>
            <p>
              Our servers and databases are hosted with reputable cloud infrastructure providers
              that maintain SOC 2 and ISO 27001 certifications. We perform regular security reviews
              and apply timely patches to address known vulnerabilities.
            </p>
            <p>
              While we take every reasonable precaution, no method of transmission over the internet
              or electronic storage is 100% secure. We cannot guarantee absolute security but are
              committed to responding promptly and transparently to any potential data breach in
              accordance with applicable law.
            </p>
          </PolicySection>

          <PolicySection title="6. Your Rights">
            <p>
              Depending on your jurisdiction, you may have the following rights regarding your
              personal data: the right to access a copy of the data we hold about you; the right to
              request correction of inaccurate or incomplete data; the right to request deletion of
              your data (subject to certain legal retention obligations); the right to restrict or
              object to certain processing; and the right to data portability in a machine-readable
              format.
            </p>
            <p>
              If you are located in the European Economic Area (EEA) or the United Kingdom, your
              rights are protected under the General Data Protection Regulation (GDPR) or the UK
              GDPR respectively. If you are a California resident, you may have additional rights
              under the California Consumer Privacy Act (CCPA), including the right to opt out of
              the sale of personal information (we do not sell personal information).
            </p>
            <p>
              To exercise any of these rights, please contact us using the information in Section 7.
              We will respond to verified requests within 30 days. We may need to verify your
              identity before processing your request. You also have the right to lodge a complaint
              with your applicable supervisory authority if you believe your rights have been
              violated.
            </p>
          </PolicySection>

          <PolicySection title="7. Data Retention">
            <p>
              We retain personal information for as long as necessary to fulfill the purposes
              outlined in this policy, unless a longer retention period is required or permitted by
              law. Contact form submissions are typically retained for 24 months for follow-up and
              service improvement purposes. Analytics data is retained in aggregated, anonymized form
              indefinitely.
            </p>
            <p>
              If you request deletion of your data, we will remove it from active systems within 30
              days, subject to any legal obligations that may require us to retain certain records
              for a longer period (such as financial transaction records).
            </p>
          </PolicySection>

          <PolicySection title="8. Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or how
              we handle your personal data, please contact our privacy team:
            </p>
            <p>
              <strong className="text-foreground">Email:</strong>{" "}
              <a
                href="mailto:privacy@pronixdigital.com"
                className="text-primary hover:underline"
              >
                privacy@pronixdigital.com
              </a>
            </p>
            <p>
              <strong className="text-foreground">Pronix Digital</strong>
              <br />
              Digital Agency
              <br />
              contact@pronixdigital.com
            </p>
            <p>
              We are committed to working with you to resolve any concerns about your privacy. If
              you are not satisfied with our response, you have the right to escalate the matter to
              your local data protection authority.
            </p>
          </PolicySection>
        </div>
      </div>
    </div>
  );
}
