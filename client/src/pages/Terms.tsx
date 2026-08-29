import { motion } from "framer-motion";
import MainLayout from "@/layouts/MainLayout";

export default function Terms() {
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
              Legal
            </p>

            <h1 className="font-serif text-4xl font-bold text-espresso md:text-5xl">
              Terms of Service
            </h1>

            <div className="mx-auto mt-4 h-0.5 w-16 bg-bronze" />

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Please read these terms carefully before using BookMyStay,
              making a reservation, or listing a property.
            </p>
          </motion.div>


          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
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
                  1. Acceptance of Terms
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  By accessing or using BookMyStay, you agree to be bound by
                  these Terms of Service. If you do not agree with these terms,
                  please do not use the platform.
                </p>
              </section>


              {/* 2 */}
              <section>
                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  2. About BookMyStay
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  BookMyStay is an online hotel-booking platform that connects
                  guests with hotel properties listed on the platform. We
                  provide tools for discovering properties, obtaining booking
                  information, making reservations, processing payments, and
                  managing bookings.
                </p>

                <p className="mt-3 text-sm leading-7 text-espresso/70">
                  The accommodation itself is provided by the respective hotel
                  or property owner. Property-specific information, amenities,
                  availability, pricing, and applicable policies may vary.
                </p>
              </section>


              {/* 3 */}
              <section>
                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  3. User Accounts
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  Users are responsible for providing accurate information when
                  creating an account and making a booking. You are responsible
                  for maintaining the confidentiality of your account
                  credentials and for activity performed through your account.
                </p>
              </section>


              {/* 4 */}
              <section>
                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  4. Hotel Listings and Availability
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  Hotel listings are subject to availability. Prices,
                  room availability, amenities, images, descriptions, and
                  property information may change from time to time.
                </p>

                <p className="mt-3 text-sm leading-7 text-espresso/70">
                  A search result or quote does not necessarily guarantee
                  availability until the booking process has been successfully
                  completed and confirmed.
                </p>
              </section>


              {/* 5 */}
              <section>
                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  5. Bookings
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  BookMyStay may support both daily and hourly accommodation
                  bookings. Users are responsible for selecting the correct
                  property, room type, booking mode, dates, times, and number of
                  guests before confirming a reservation.
                </p>

                <p className="mt-3 text-sm leading-7 text-espresso/70">
                  Once a booking is successfully confirmed, the booking details
                  are made available in the user's My Bookings section.
                </p>
              </section>


              {/* 6 */}
              <section>
                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  6. Payment
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  Payments are processed through the payment gateway supported
                  by BookMyStay. Users must provide valid payment information
                  and complete the payment process required for their booking.
                </p>

                <p className="mt-3 text-sm leading-7 text-espresso/70">
                  A booking should not be considered successfully paid unless
                  the payment has been successfully processed and the booking
                  has been confirmed by the platform.
                </p>
              </section>


              {/* 7 */}
              <section>
                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  7. Cancellation and Refunds
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  Cancellation eligibility and refund amounts depend on the
                  applicable cancellation rules and the timing of the
                  cancellation.
                </p>

                <p className="mt-3 text-sm leading-7 text-espresso/70">
                  Before confirming a cancellation, users may be shown a
                  cancellation preview containing the applicable refund amount.
                  The refund amount may be lower than the amount originally
                  paid because certain charges may be non-refundable.
                </p>

                <p className="mt-3 text-sm leading-7 text-espresso/70">
                  In some cases, a booking may be cancelled with a refund amount
                  of ₹0. Cancellation and refund status may be displayed in the
                  booking details after cancellation.
                </p>
              </section>


              {/* 8 */}
              <section>
                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  8. Check-In and Booking Expiration
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  Cancellation and guest-management options may no longer be
                  available once the applicable check-in date or time has
                  started or passed.
                </p>

                <p className="mt-3 text-sm leading-7 text-espresso/70">
                  For hourly bookings, the selected check-in time is relevant
                  when determining whether the booking has started.
                </p>
              </section>


              {/* 9 */}
              <section>
                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  9. Guest Information
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  Users are responsible for providing accurate guest
                  information. Guest details may be added or modified through
                  the booking-management functionality while the booking
                  remains eligible for modification.
                </p>
              </section>


              {/* 10 */}
              <section>
                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  10. Reviews and Ratings
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  Eligible guests may submit reviews and ratings for completed
                  stays. Reviews should be truthful, relevant, and based on the
                  user's actual experience.
                </p>

                <p className="mt-3 text-sm leading-7 text-espresso/70">
                  BookMyStay may remove reviews that violate applicable
                  platform rules or contain inappropriate, misleading, or
                  abusive content.
                </p>
              </section>


              {/* 11 */}
              <section>
                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  11. User Responsibilities
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  Users agree to use BookMyStay lawfully and responsibly.
                  Users must not provide fraudulent information, misuse the
                  booking system, interfere with the platform, or attempt to
                  gain unauthorized access to another user's account or data.
                </p>
              </section>


              {/* 12 */}
              <section>
                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  12. Property Owner Responsibilities
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  Property owners are responsible for maintaining accurate
                  property information, room availability, pricing, amenities,
                  and other information associated with their listings.
                </p>
              </section>


              {/* 13 */}
              <section>
                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  13. Limitation of Liability
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  BookMyStay provides a platform for connecting guests and
                  accommodation providers. To the extent permitted by
                  applicable law, BookMyStay is not responsible for matters
                  arising directly from the conduct, services, facilities, or
                  conditions of an individual property.
                </p>
              </section>


              {/* 14 */}
              <section>
                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  14. Changes to These Terms
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  BookMyStay may update these Terms of Service from time to
                  time. Updated terms will be published on this page.
                  Continued use of the platform after an update constitutes
                  acceptance of the revised terms.
                </p>
              </section>


              {/* 15 */}
              <section>
                <h2 className="mb-3 font-serif text-2xl font-semibold text-espresso">
                  15. Contact
                </h2>

                <p className="text-sm leading-7 text-espresso/70">
                  If you have questions about these Terms of Service, please
                  contact BookMyStay through the Contact Us page.
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