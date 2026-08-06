// --- TermsSection helper ------------------------------------------------------

function TermsSection({ title, children }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3 text-foreground">{title}</h2>
      <div className="text-muted-foreground text-sm leading-7 space-y-3">{children}</div>
    </section>
  );
}

// --- Page ---------------------------------------------------------------------

export function TermsPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-10 border-b pb-8">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground text-sm">Last updated: January 1, 2025</p>
        </div>

        {/* Intro */}
        <p className="text-muted-foreground text-sm leading-7 mb-10">
          These Terms of Service ("Terms") govern your access to and use of the Pronix Digital
          website and services. By accessing our website or engaging our services, you agree to be
          bound by these Terms. If you do not agree to these Terms, please do not use our website
          or services. These Terms apply to all visitors, clients, and others who access or use our
          services.
        </p>

        {/* Content sections */}
        <div className="prose prose-slate max-w-none space-y-8">
          <TermsSection title="1. Acceptance of Terms">
            <p>
              By accessing or using Pronix Digital's website, requesting a consultation, entering
              into a project agreement, or otherwise using our services, you confirm that you are at
              least 18 years of age, have the legal capacity to enter into binding agreements, and
              agree to be bound by these Terms and our Privacy Policy, which is incorporated herein
              by reference.
            </p>
            <p>
              If you are accessing or using our services on behalf of a company or other legal
              entity, you represent and warrant that you have the authority to bind that entity to
              these Terms. In that case, "you" and "your" will refer to that entity.
            </p>
            <p>
              We reserve the right to update or modify these Terms at any time at our sole
              discretion. We will notify you of material changes by posting the updated Terms on our
              website with a revised "Last updated" date. Continued use of our services after any
              changes constitutes your acceptance of the new Terms. We encourage you to review these
              Terms periodically.
            </p>
          </TermsSection>

          <TermsSection title="2. Services Description">
            <p>
              Pronix Digital provides web development, mobile application development, custom
              software development, and digital marketing services to businesses and individuals.
              The specific scope, deliverables, timeline, and pricing for each project are defined
              in a separate project agreement, statement of work, or proposal signed by both parties
              ("Project Agreement").
            </p>
            <p>
              We reserve the right to refuse service to any person or entity at our discretion.
              Service availability may vary by region or project type. We may engage qualified
              subcontractors to assist in fulfilling services, provided that we remain responsible
              for the quality and delivery of all contracted work.
            </p>
            <p>
              All timelines and delivery estimates are provided in good faith based on the
              information available at the time of agreement. Changes to project scope, delayed
              feedback from the client, or unforeseen technical complexities may affect delivery
              schedules. We will communicate any such changes promptly and work collaboratively to
              agree on a revised timeline.
            </p>
          </TermsSection>

          <TermsSection title="3. User Responsibilities">
            <p>
              You agree to provide accurate, complete, and current information when engaging our
              services or contacting us through our website. You are responsible for providing
              timely feedback, content, access credentials, and other materials required for us to
              complete your project as outlined in the Project Agreement. Delays caused by late
              client response may affect delivery timelines and may be subject to revised fees.
            </p>
            <p>
              You agree not to use our website or services for any unlawful purpose or in any way
              that violates applicable local, national, or international laws or regulations. You
              must not attempt to gain unauthorized access to any part of our systems, interfere
              with the proper operation of our website, or transmit any harmful, offensive, or
              disruptive content through our communication channels.
            </p>
            <p>
              You are solely responsible for ensuring that any content, data, images, or materials
              you provide to us for use in your project do not infringe the intellectual property
              rights, privacy rights, or other rights of any third party. You agree to indemnify
              Pronix Digital against any claims arising from your supplied materials.
            </p>
          </TermsSection>

          <TermsSection title="4. Payment Terms">
            <p>
              Payment terms for each project are specified in the Project Agreement. Unless
              otherwise agreed in writing, projects require a non-refundable deposit of 50% of the
              total project fee before work commences. The remaining balance is due upon project
              completion and before final deliverables or source code are released to the client.
            </p>
            <p>
              Invoices are due within 14 days of the invoice date unless a different payment
              schedule has been agreed in writing. Overdue invoices are subject to a late payment
              charge of 1.5% per month (or the maximum rate permitted by law, whichever is lower)
              on the outstanding balance. Pronix Digital reserves the right to suspend work on any
              project with an outstanding overdue invoice until payment is received.
            </p>
            <p>
              All fees are quoted exclusive of applicable taxes (such as VAT or GST) unless
              explicitly stated otherwise. Clients are responsible for any taxes applicable to the
              services in their jurisdiction. Refund requests for completed work will be evaluated
              on a case-by-case basis; work already delivered in accordance with the Project
              Agreement is generally non-refundable.
            </p>
          </TermsSection>

          <TermsSection title="5. Intellectual Property">
            <p>
              Upon receipt of full payment, Pronix Digital assigns to the client all intellectual
              property rights in the custom deliverables created specifically for that client under
              the Project Agreement, including custom code, designs, and written content, unless the
              Project Agreement specifies otherwise. This assignment does not include third-party
              components (e.g., open-source libraries, stock assets, licensed fonts) which remain
              subject to their respective licenses.
            </p>
            <p>
              Pronix Digital retains all rights to its pre-existing intellectual property,
              proprietary tools, frameworks, methodologies, and general-purpose code libraries
              developed independently of any specific client project. We may incorporate such
              materials into client deliverables under a non-exclusive license that allows the
              client to use the deliverables as intended.
            </p>
            <p>
              Unless the client has requested a white-label arrangement in writing, Pronix Digital
              reserves the right to display completed projects in our portfolio and marketing
              materials, including our website, social media, and case studies. We will never
              disclose confidential client information in such materials without explicit written
              permission.
            </p>
          </TermsSection>

          <TermsSection title="6. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, Pronix Digital and its directors,
              employees, and contractors shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages - including loss of profits, loss of data, loss of
              goodwill, business interruption, or cost of substitute services - arising out of or
              in connection with these Terms or the use of our services, even if we have been
              advised of the possibility of such damages.
            </p>
            <p>
              Our total aggregate liability to you for any and all claims arising from or related to
              our services shall not exceed the total fees paid by you to Pronix Digital in the
              three months immediately preceding the event giving rise to the claim. This limitation
              applies whether the claim is based on warranty, contract, tort (including negligence),
              or any other legal theory.
            </p>
            <p>
              Our services and website are provided "as is" and "as available" without warranties
              of any kind, either express or implied, including but not limited to implied
              warranties of merchantability, fitness for a particular purpose, or non-infringement.
              We do not warrant that our services will be error-free, uninterrupted, or free of
              viruses or other harmful components.
            </p>
          </TermsSection>

          <TermsSection title="7. Confidentiality">
            <p>
              Both parties agree to treat as confidential all non-public information disclosed by
              the other party in connection with a project, including but not limited to business
              plans, financial data, technical specifications, client lists, and trade secrets
              ("Confidential Information"). Neither party will disclose the other's Confidential
              Information to any third party without prior written consent, except as required by
              law or as necessary to deliver the agreed services.
            </p>
            <p>
              This confidentiality obligation shall survive the termination of any Project Agreement
              for a period of three years. Information that is or becomes publicly available through
              no breach of this obligation, or that was already known to the receiving party at the
              time of disclosure, is not subject to these restrictions.
            </p>
          </TermsSection>

          <TermsSection title="8. Termination">
            <p>
              Either party may terminate a Project Agreement with 14 days' written notice. Upon
              termination by the client, the client agrees to pay for all work completed up to the
              date of termination, plus any committed third-party costs that cannot be cancelled.
              Pronix Digital will deliver all completed work product to the client upon receipt of
              such payment.
            </p>
            <p>
              Pronix Digital may terminate a Project Agreement immediately if the client breaches
              any material term of these Terms or the Project Agreement, including failure to make
              payment when due, and the breach is not remedied within 7 days of written notice.
              Upon such termination, all outstanding fees become immediately due and payable.
            </p>
            <p>
              Sections of these Terms that by their nature should survive termination - including
              intellectual property rights, payment obligations, limitation of liability,
              confidentiality, and dispute resolution - will continue to apply after any termination
              or expiration of the agreement.
            </p>
          </TermsSection>

          <TermsSection title="9. Governing Law and Disputes">
            <p>
              These Terms are governed by and construed in accordance with applicable law. Any
              dispute arising out of or relating to these Terms or the services shall first be
              subject to good-faith negotiation between the parties. If the dispute cannot be
              resolved through negotiation within 30 days, the parties agree to attempt mediation
              before pursuing any other legal remedy.
            </p>
            <p>
              If mediation fails, disputes shall be resolved by binding arbitration or, where
              arbitration is not available, by the courts of competent jurisdiction. You waive any
              right to participate in a class action lawsuit or class-wide arbitration against
              Pronix Digital.
            </p>
          </TermsSection>

          <TermsSection title="10. Contact">
            <p>
              If you have questions about these Terms of Service, please contact us:
            </p>
            <p>
              <strong className="text-foreground">Email:</strong>{" "}
              <a
                href="mailto:legal@pronixdigital.com"
                className="text-primary hover:underline"
              >
                legal@pronixdigital.com
              </a>
            </p>
            <p>
              <strong className="text-foreground">General Inquiries:</strong>{" "}
              <a
                href="mailto:contact@pronixdigital.com"
                className="text-primary hover:underline"
              >
                contact@pronixdigital.com
              </a>
            </p>
            <p>
              We aim to respond to all legal and contractual inquiries within 3 business days.
            </p>
          </TermsSection>
        </div>
      </div>
    </div>
  );
}
