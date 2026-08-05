import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

import {
  Calendar,
  MapPin,
  Eye,
  XCircle,
  User,
  CreditCard,
  Loader2,
  Star,
} from "lucide-react";

import { toast } from "sonner";

import MainLayout from "@/layouts/MainLayout";
import { bookingsApi } from "@/api/bookings";
import type { BookingHistory } from "@/types";

export default function MyBookings() {

  const [, setLocation] = useLocation();

  const [bookings, setBookings] = useState<BookingHistory[]>([]);

  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("ALL");

  const [cancelLoading, setCancelLoading] =
    useState<number | null>(null);


  // =========================
  // LOAD BOOKINGS
  // =========================

  useEffect(() => {
    loadBookings();
  }, []);


  async function loadBookings() {

    try {

      const { data } =
        await bookingsApi.getMyBookings();

      setBookings(data);

    } catch (err: any) {

      toast.error(
        err?.response?.data?.message ??
        "Unable to load your bookings."
      );

    } finally {

      setLoading(false);

    }

  }


  // =========================
  // CANCEL BOOKING
  // =========================

  async function cancelBooking(
    bookingId: number
  ) {

    if (
      !window.confirm(
        "Are you sure you want to cancel this booking?"
      )
    ) {
      return;
    }

    try {

      setCancelLoading(bookingId);

      await bookingsApi.cancelBooking(
        bookingId
      );

      toast.success(
        "Booking cancelled successfully."
      );

      await loadBookings();

    } catch (err: any) {

      toast.error(
        err?.response?.data?.message ??
        "Unable to cancel booking."
      );

    } finally {

      setCancelLoading(null);

    }

  }


  // =========================
  // FILTER
  // =========================

  const filteredBookings = useMemo(() => {

    if (filter === "ALL") {
      return bookings;
    }

    return bookings.filter(
      (booking) =>
        booking.bookingStatus === filter
    );

  }, [bookings, filter]);


  // =========================
  // STATUS STYLES
  // =========================

  const statusClasses: Record<string, string> = {

    BOOKED:
      "bg-green-100 text-green-700",

    PAYMENT_PENDING:
      "bg-yellow-100 text-yellow-700",

    CANCELLED:
      "bg-red-100 text-red-700",

    EXPIRED:
      "bg-gray-200 text-gray-700",

  };


  const paymentClasses: Record<string, string> = {

    SUCCESS:
      "bg-green-100 text-green-700",

    PENDING:
      "bg-yellow-100 text-yellow-700",

    FAILED:
      "bg-red-100 text-red-700",

    EXPIRED:
      "bg-gray-200 text-gray-700",

  };


  // =========================
  // FORMATTERS
  // =========================

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );


  const formatPrice = (amount: number) =>
    Number(amount ?? 0).toLocaleString(
      "en-IN"
    );


  // =========================
  // UI
  // =========================

  return (
    <MainLayout>

      <div className="container max-w-7xl py-10">

        {/* =========================
            HEADER
        ========================== */}

        <div className="mb-10">

          <h1 className="font-serif text-4xl font-bold text-espresso">
            My Bookings
          </h1>

          <p className="mt-2 text-muted-foreground">
            View, manage and track all your hotel bookings.
          </p>

        </div>


        {/* =========================
            FILTERS
        ========================== */}

        <div className="mb-8 flex flex-wrap gap-3">

          {[
            "ALL",
            "BOOKED",
            "PAYMENT_PENDING",
            "CANCELLED",
            "EXPIRED",
          ].map((status) => (

            <button
              key={status}
              onClick={() =>
                setFilter(status)
              }
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${filter === status
                ? "bg-bronze text-white"
                : "border border-warm-stone/30 bg-white text-espresso hover:border-bronze"
                }`}
            >

              {status === "ALL"
                ? "All Bookings"
                : status.replace("_", " ")}

            </button>

          ))}

        </div>


        {/* =========================
            LOADING
        ========================== */}

        {loading && (

          <div className="flex h-72 items-center justify-center">

            <Loader2 className="h-10 w-10 animate-spin text-bronze" />

          </div>

        )}


        {/* =========================
            EMPTY STATE
        ========================== */}

        {!loading &&
          filteredBookings.length === 0 && (

            <div className="rounded-3xl border border-dashed border-warm-stone/30 bg-white p-16 text-center shadow-warm">

              <Calendar className="mx-auto h-16 w-16 text-muted-foreground" />

              <h2 className="mt-6 font-serif text-2xl font-semibold text-espresso">
                No Bookings Yet
              </h2>

              <p className="mt-2 text-muted-foreground">
                Looks like you haven't booked any hotels yet.
              </p>

              <button
                onClick={() =>
                  setLocation("/")
                }
                className="mt-8 rounded-xl bg-bronze px-8 py-3 font-medium text-white transition hover:bg-bronze-dark"
              >
                Explore Hotels
              </button>

            </div>

          )}


        {/* =========================
            BOOKING CARDS
        ========================== */}

        {!loading &&
          filteredBookings.length > 0 && (

            <div className="space-y-6">

              {filteredBookings.map(
                (booking, index) => {

                  /*
                   * Review is allowed only when:
                   *
                   * 1. Booking is BOOKED
                   * 2. Checkout date has passed
                   */

                  const canReview =
                    booking.bookingStatus === "BOOKED" &&
                    new Date(
                      booking.checkOutDate
                    ) < new Date();


                  return (

                    <motion.div
                      key={booking.bookingId}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.05,
                      }}
                      className="overflow-hidden rounded-3xl border border-warm-stone/20 bg-white shadow-warm"
                    >

                      <div className="flex flex-col md:flex-row">

                        {/* =========================
                            HOTEL IMAGE
                        ========================== */}

                        <img
                          src={booking.hotelImage}
                          alt={booking.hotelName}
                          className="h-72 w-full object-cover md:h-auto md:w-72"
                        />


                        {/* =========================
                            RIGHT SECTION
                        ========================== */}

                        <div className="flex-1 p-8">

                          {/* =========================
                              TOP ROW
                          ========================== */}

                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                            <div>

                              <h2 className="font-serif text-2xl font-bold text-espresso">
                                {booking.hotelName}
                              </h2>

                              <div className="mt-2 flex items-center gap-2 text-muted-foreground">

                                <MapPin className="h-4 w-4" />

                                <span>
                                  {booking.city}
                                </span>

                              </div>

                            </div>


                            {/* STATUS */}

                            <div className="flex flex-col gap-2">

                              <span
                                className={`rounded-full px-4 py-2 text-center text-sm font-semibold ${statusClasses[
                                  booking.bookingStatus
                                ]
                                  }`}
                              >
                                {booking.bookingStatus.replace(
                                  "_",
                                  " "
                                )}
                              </span>

                              <span
                                className={`rounded-full px-4 py-2 text-center text-sm font-semibold ${paymentClasses[
                                  booking.paymentStatus
                                ]
                                  }`}
                              >
                                {booking.paymentStatus}
                              </span>

                            </div>

                          </div>


                          {/* DIVIDER */}

                          <div className="my-6 h-px bg-warm-stone/20" />


                          {/* =========================
                              BOOKING INFO
                          ========================== */}

                          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                            <div>

                              <p className="text-sm text-muted-foreground">
                                Check In
                              </p>

                              <p className="mt-1 font-semibold text-espresso">
                                {formatDate(
                                  booking.checkInDate
                                )}
                              </p>

                            </div>


                            <div>

                              <p className="text-sm text-muted-foreground">
                                Check Out
                              </p>

                              <p className="mt-1 font-semibold text-espresso">
                                {formatDate(
                                  booking.checkOutDate
                                )}
                              </p>

                            </div>


                            <div>

                              <p className="text-sm text-muted-foreground">
                                Room Type
                              </p>

                              <p className="mt-1 font-semibold text-espresso">
                                {booking.roomType}
                              </p>

                            </div>


                            <div>

                              <p className="text-sm text-muted-foreground">
                                Guests
                              </p>

                              <div className="mt-1 flex items-center gap-2">

                                <User className="h-4 w-4 text-bronze" />

                                <span className="font-semibold text-espresso">

                                  {booking.adultCount} Adult
                                  {booking.adultCount > 1
                                    ? "s"
                                    : ""}

                                  {booking.childCount > 0 && (
                                    <>
                                      {" • "}
                                      {booking.childCount} Child
                                      {booking.childCount > 1
                                        ? "ren"
                                        : ""}
                                    </>
                                  )}

                                </span>

                              </div>

                            </div>

                          </div>


                          {/* DIVIDER */}

                          <div className="my-6 h-px bg-warm-stone/20" />


                          {/* =========================
                              BOTTOM ROW
                          ========================== */}

                          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                            {/* TOTAL PAID */}

                            <div>

                              <p className="text-sm text-muted-foreground">
                                Total Paid
                              </p>

                              <h3 className="mt-1 text-3xl font-bold text-bronze">
                                ₹
                                {formatPrice(
                                  Number(
                                    booking.amount
                                  )
                                )}
                              </h3>

                            </div>


                            {/* ACTIONS */}

                            <div className="flex flex-wrap gap-3">

                              {/* VIEW DETAILS */}

                              <button
                                onClick={() =>
                                  setLocation(
                                    `/my-bookings/${booking.bookingId}`
                                  )
                                }
                                className="flex items-center gap-2 rounded-xl border border-bronze px-5 py-3 font-medium text-bronze transition hover:bg-bronze hover:text-white"
                              >

                                <Eye className="h-4 w-4" />

                                View Details

                              </button>


                              {/* WRITE REVIEW */}

                              {canReview && !booking.reviewId && (
                                <button
                                  onClick={() =>
                                    setLocation(
                                      `/my-bookings/${booking.bookingId}/review`
                                    )
                                  }
                                  className="flex items-center gap-2 rounded-xl bg-bronze px-5 py-3 font-medium text-white transition hover:bg-bronze-dark"
                                >
                                  <Star className="h-4 w-4" />
                                  Write Review
                                </button>
                              )}

                              {canReview && booking.reviewId && (
                                <button
                                  onClick={() =>
                                    setLocation(
                                      `/my-bookings/review/${booking.reviewId}/edit`
                                    )
                                  }
                                  className="flex items-center gap-2 rounded-xl border border-bronze px-5 py-3 font-medium text-bronze transition hover:bg-bronze hover:text-white"
                                >
                                  <Star className="h-4 w-4" />
                                  Edit Review
                                </button>
                              )}


                              {/* CONTINUE PAYMENT */}

                              {booking.bookingStatus ===
                                "PAYMENT_PENDING" && (

                                  <button
                                    onClick={() =>
                                      setLocation(
                                        `/booking/${booking.bookingId}`
                                      )
                                    }
                                    className="flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-medium text-white transition hover:bg-yellow-600"
                                  >

                                    <CreditCard className="h-4 w-4" />

                                    Continue Payment

                                  </button>

                                )}


                              {/* CANCEL BOOKING */}

                              {(booking.bookingStatus ===
                                "BOOKED" ||
                                booking.bookingStatus ===
                                "PAYMENT_PENDING") && (

                                  <button
                                    onClick={() =>
                                      cancelBooking(
                                        booking.bookingId
                                      )
                                    }
                                    disabled={
                                      cancelLoading ===
                                      booking.bookingId
                                    }
                                    className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                  >

                                    {cancelLoading ===
                                      booking.bookingId ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <XCircle className="h-4 w-4" />
                                    )}

                                    Cancel Booking

                                  </button>

                                )}

                            </div>

                          </div>

                        </div>

                      </div>

                    </motion.div>

                  );

                }
              )}

            </div>

          )}

      </div>

    </MainLayout>
  );
}