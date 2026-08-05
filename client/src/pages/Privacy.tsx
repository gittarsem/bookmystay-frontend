import MainLayout from "@/layouts/MainLayout";

export default function Privacy() {
  return (
    <MainLayout>
      <div className="container py-16 max-w-3xl">
        <h1 className="font-serif text-3xl font-bold text-espresso mb-8">Privacy Policy</h1>
        <div className="prose prose-stone max-w-none">
          <h2>1. Information We Collect</h2>
          <p className="text-espresso/70 leading-relaxed">
            We collect personal information necessary to provide our services, including
            your name, email address, phone number, and payment details. We also collect
            browsing data to improve your experience on our platform.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p className="text-espresso/70 leading-relaxed">
            Your information is used to process bookings, communicate with you about your
            reservations, improve our services, and comply with legal obligations. We never
            sell your personal data to third parties.
          </p>

          <h2>3. Data Sharing</h2>
          <p className="text-espresso/70 leading-relaxed">
            We share necessary information with property owners to facilitate your booking.
            Payment details are processed through secure third-party payment processors and
            are not stored on our servers.
          </p>

          <h2>4. Data Security</h2>
          <p className="text-espresso/70 leading-relaxed">
            We employ industry-standard encryption and security measures to protect your
            personal information. All data transmissions are encrypted using TLS/SSL.
          </p>

          <h2>5. Your Rights</h2>
          <p className="text-espresso/70 leading-relaxed">
            You have the right to access, modify, or delete your personal data at any time.
            You may also request a copy of all data we hold about you by contacting our
            support team.
          </p>

          <h2>6. Cookies</h2>
          <p className="text-espresso/70 leading-relaxed">
            We use cookies and similar technologies to enhance your browsing experience,
            remember your preferences, and analyze site usage patterns.
          </p>

          <h2>7. Contact</h2>
          <p className="text-espresso/70 leading-relaxed">
            For privacy-related inquiries, please contact us at privacy@bookmystay.com.
          </p>

          <p className="text-sm text-muted-foreground mt-8">
            Last updated: March 2025
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
