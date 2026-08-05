import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, Users, ArrowLeft, FileText, Star } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { MOCK_BOOKINGS, MOCK_HOTELS, MOCK_ROOMS } from "@/lib/mockData";

export default function BookingConfirmation() {
  const [, params] = useRoute<{ bookingId: string }>("/booking/:bookingId/confirmation");
  const [, setLocation] = useLocation();

  const booking = MOCK_BOOKINGS.find((b) => b.id === params?.bookingId);
  const hotel = booking?.hotel;
  const room = booking?.room;

  if (!booking || !hotel || !room) {
    return (
      <MainLayout>
        <div className="container py-20 text-center">
          <h1 className="font-serif text-3xl text-espresso mb-4">Confirmation Not Found</h1>
          <button onClick={() => setLocation("/")} className="text-bronze font-medium">
            Go back home
          </button>
        </div>
      </MainLayout>
    );
  }

  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <MainLayout>
      <div className="container py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Success Animation */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
            </motion.div>
            <h1 className="font-serif text-3xl font-bold text-espresso mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Your reservation has been successfully confirmed. We've sent the details to your email.
            </p>
          </div>

          {/* Booking Card */}
          <div className="bg-white rounded-2xl shadow-warm-lg border border-warm-stone/20 overflow-hidden">
            {/* Header */}
            <div className="bg-espresso p-6">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest">Booking ID</span>
              </div>
              <p className="text-white font-mono text-lg">{booking.id}</p>
            </div>

            {/* Hotel Info */}
            <div className="p-6 border-b border-warm-stone/20">
              <div className="flex gap-4">
                <img
                  src={hotel.images[0]}
                  alt={hotel.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div>
                  <h2 className="font-serif text-xl font-semibold text-espresso">
                    {hotel.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{room.type}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {hotel.location.city}, {hotel.location.state}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Check In
                </p>
                <p className="font-semibold text-espresso">{booking.checkIn}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Check Out
                </p>
                <p className="font-semibold text-espresso">{booking.checkOut}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Guests
                </p>
                <p className="font-semibold text-espresso">
                  {booking.adults} Adults{booking.children > 0 ? `, ${booking.children} Children` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Duration
                </p>
                <p className="font-semibold text-espresso">{nights} Night{nights > 1 ? "s" : ""}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Payment Status
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                  <CheckCircle2 className="w-3 h-3" /> {booking.paymentStatus}
                </span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Total Amount
                </p>
                <p className="font-bold text-2xl text-espresso">
                  ₹{booking.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-cream flex flex-wrap gap-3">
              <button
                onClick={() => setLocation(`/booking/${booking.id}`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl border border-warm-stone/30 text-sm font-medium text-espresso hover:border-bronze/40 transition-colors"
              >
                <FileText className="w-4 h-4" /> View Invoice
              </button>
              <button
                onClick={() => setLocation(`/hotel/${hotel.id}`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-bronze text-white rounded-xl text-sm font-medium hover:bg-bronze-dark transition-colors"
              >
                <Star className="w-4 h-4" /> Leave a Review
              </button>
              <button
                onClick={() => setLocation("/my-bookings")}
                className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl border border-warm-stone/30 text-sm font-medium text-espresso hover:border-bronze/40 transition-colors"
              >
                <Calendar className="w-4 h-4" /> My Bookings
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
