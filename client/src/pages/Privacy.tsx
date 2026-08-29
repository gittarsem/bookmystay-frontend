import { motion } from "framer-motion";
import MainLayout from "@/layouts/MainLayout";

export default function Privacy() {
  return (
    <MainLayout>
      <section className="py-16 md:py-20">
        <div className="container max-w-4xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >

            <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-bronze">
              Your Privacy
            </p>

            <h1 className="font-serif text-4xl font-bold text-espresso md:text-5xl">
              Privacy Policy
            </h1>

            <div className="mx-auto mt-4 h-0.5 w-16 bg-bronze" />

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              This policy explains how BookMyStay handles information provided
              when you use the platform.
            </p>

          </motion.div>


          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.1,
            }}
            className="
              rounded-2xl
              border
              border-warm-stone/20
              bg-white
              p-6
              shadow-warm
              md:p-10
            "
          >

            <div className="space-y-10">

              {/* 1 */}
              <section>

                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  1. Information We Collect
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  We may collect information required to create and manage your
                  account and provide booking services. This may include your
                  name, email address, phone number, booking information, guest
                  information, and other details that you voluntarily provide.
                </p>

              </section>


              {/* 2 */}
              <section>

                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  2. Booking Information
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  When you make a reservation, information associated with the
                  booking may include the hotel, room type, booking dates,
                  check-in and check-out times, number of guests, booking
                  status, and payment-related status.
                </p>

                <p className="mt-3 text-sm leading-7 text-espresso/70">
                  This information is used to create, manage, display, and
                  support your reservation.
                </p>

              </section>


              {/* 3 */}
              <section>

                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  3. Guest Information
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  If you provide guest details for a reservation, such
                  information may include the guest's name, age, and gender.
                  This information is used for booking and accommodation
                  management purposes.
                </p>

              </section>


              {/* 4 */}
              <section>

                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  4. Payment Information
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  Payments are processed through the payment gateway integrated
                  with BookMyStay. Payment-related information such as payment
                  status, transaction identifiers, refund status, and refunded
                  amounts may be associated with your booking.
                </p>

                <p className="mt-3 text-sm leading-7 text-espresso/70">
                  Sensitive payment credentials should be handled by the
                  payment provider rather than entered directly into
                  BookMyStay systems outside the supported payment flow.
                </p>

              </section>


              {/* 5 */}
              <section>

                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  5. How We Use Information
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  Information may be used to:
                </p>

                <ul
                  className="
                    mt-3
                    list-disc
                    space-y-2
                    pl-5
                    text-sm
                    leading-7
                    text-espresso/70
                  "
                >
                  <li>
                    Create and manage user accounts.
                  </li>

                  <li>
                    Process and manage hotel reservations.
                  </li>

                  <li>
                    Communicate booking and payment information.
                  </li>

                  <li>
                    Process cancellations and refunds.
                  </li>

                  <li>
                    Manage guest information.
                  </li>

                  <li>
                    Provide customer support.
                  </li>

                  <li>
                    Improve the platform and user experience.
                  </li>

                  <li>
                    Detect and prevent misuse or unauthorized activity.
                  </li>
                </ul>

              </section>


              {/* 6 */}
              <section>

                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  6. Information Sharing
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  Information necessary to fulfil a reservation may be shared
                  with the relevant hotel or property owner. Payment-related
                  information may also be processed by the payment provider
                  used to complete a transaction.
                </p>

                <p className="mt-3 text-sm leading-7 text-espresso/70">
                  We do not sell your personal information for advertising or
                  unrelated commercial purposes.
                </p>

              </section>


              {/* 7 */}
              <section>

                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  7. Reviews and Public Information
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  If you submit a hotel review, information associated with
                  that review may be displayed to other users as part of the
                  hotel's review and rating information.
                </p>

                <p className="mt-3 text-sm leading-7 text-espresso/70">
                  Do not include sensitive personal information in a review or
                  other publicly visible content.
                </p>

              </section>


              {/* 8 */}
              <section>

                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  8. Contact and Feedback
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  When you contact BookMyStay through the Contact page, the
                  information you enter is used to prepare your support or
                  feedback message. The contact form may open your configured
                  email application so that you can send the message directly
                  to BookMyStay.
                </p>

              </section>


              {/* 9 */}
              <section>

                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  9. Cookies and Local Technologies
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  BookMyStay may use cookies, browser storage, and similar
                  technologies where necessary to support authentication,
                  preferences, functionality, and the operation of the
                  platform.
                </p>

              </section>


              {/* 10 */}
              <section>

                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  10. Data Security
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  We take reasonable measures to protect information handled by
                  the platform. However, no internet-based service can
                  guarantee absolute security.
                </p>

              </section>


              {/* 11 */}
              <section>

                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  11. Your Rights
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  Subject to applicable law and the capabilities of the
                  platform, you may request access to, correction of, or
                  deletion of personal information associated with your
                  account.
                </p>

                <p className="mt-3 text-sm leading-7 text-espresso/70">
                  For privacy-related requests, please contact us through the
                  Contact Us page.
                </p>

              </section>


              {/* 12 */}
              <section>

                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  12. Data Retention
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  Information may be retained for as long as necessary to
                  provide services, maintain booking and transaction records,
                  resolve disputes, meet legal obligations, and protect the
                  security of the platform.
                </p>

              </section>


              {/* 13 */}
              <section>

                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  13. Changes to This Policy
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  This Privacy Policy may be updated from time to time.
                  Changes will be reflected on this page. You should review
                  this page periodically for the latest version.
                </p>

              </section>


              {/* 14 */}
              <section>

                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  14. Contact
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  For privacy-related questions or requests, please contact
                  BookMyStay through the Contact Us page.
                </p>

              </section>


              {/* Last Updated */}
              <div
                className="
                  border-t
                  border-warm-stone/20
                  pt-6
                "
              >

                <p className="text-xs text-muted-foreground">
                  Last updated: August 2026
                </p>

              </div>

            </div>

          </motion.div>

        </div>
      </section>
    </MainLayout>
  );
}