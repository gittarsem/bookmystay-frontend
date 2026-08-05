import MainLayout from "@/layouts/MainLayout";

export default function Terms() {
  return (
    <MainLayout>
      <div className="container py-16 max-w-3xl">
        <h1 className="font-serif text-3xl font-bold text-espresso mb-8">Terms of Service</h1>
        <div className="prose prose-stone max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p className="text-espresso/70 leading-relaxed">
            By accessing and using BookMyStay, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our services.
          </p>

          <h2>2. Description of Service</h2>
          <p className="text-espresso/70 leading-relaxed">
            BookMyStay is a platform that connects travelers with verified hotel properties.
            We facilitate the booking process and payment collection, but the actual stay
            is provided by the individual hotel owners.
          </p>

          <h2>3. Booking and Payment</h2>
          <p className="text-espresso/70 leading-relaxed">
            All bookings are subject to availability and confirmation. Payment is processed
            securely through our payment gateway. Refund policies vary by property and are
            displayed at the time of booking.
          </p>

          <h2>4. Cancellation Policy</h2>
          <p className="text-espresso/70 leading-relaxed">
            Cancellation policies are set by individual property owners and are clearly
            displayed on each listing. We recommend reviewing the cancellation policy
            before confirming your booking.
          </p>

          <h2>5. User Responsibilities</h2>
          <p className="text-espresso/70 leading-relaxed">
            Users are responsible for providing accurate information during booking,
            complying with property rules, and reporting any issues promptly to both
            the property and BookMyStay support.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p className="text-espresso/70 leading-relaxed">
            BookMyStay acts as an intermediary between travelers and property owners.
            While we verify all properties, we are not liable for the quality of service
            provided by individual hotels.
          </p>

          <h2>7. Privacy</h2>
          <p className="text-espresso/70 leading-relaxed">
            Please refer to our Privacy Policy for details on how we collect, use, and
            protect your personal information.
          </p>

          <h2>8. Changes to Terms</h2>
          <p className="text-espresso/70 leading-relaxed">
            We reserve the right to modify these terms at any time. Continued use of
            the platform after changes constitutes acceptance of the updated terms.
          </p>

          <p className="text-sm text-muted-foreground mt-8">
            Last updated: March 2025
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
