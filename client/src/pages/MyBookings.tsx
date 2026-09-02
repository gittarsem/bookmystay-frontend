import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

import {
  Calendar,
  MapPin,
  Eye,
  XCircle,
  User,
  CreditCard,
  Loader2,
  Star,
  Hotel,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  Ban,
  CircleAlert,
} from "lucide-react";

import { toast } from "sonner";

import MainLayout from "@/layouts/MainLayout";

import {
  bookingsApi,
} from "@/api/bookings";

import type {
  BookingHistory,
} from "@/api/bookings";

/* =========================================================
   TYPES
========================================================= */

type BookingFilter =
  | "UPCOMING"
  | "PENDING"
  | "PAST"
  | "CANCELLED";

type BookingCategory =
  | "UPCOMING"
  | "PENDING"
  | "PAST"
  | "CANCELLED";

/* =========================================================
   COMPONENT
========================================================= */

export default function MyBookings() {
  const [, setLocation] =
    useLocation();

  const [bookings, setBookings] =
    useState<BookingHistory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [filter, setFilter] =
    useState<BookingFilter>(
      "UPCOMING"
    );

  const [cancelLoading, setCancelLoading] =
    useState<number | null>(null);

  const [cancelBookingId, setCancelBookingId] =
    useState<number | null>(null);

  /* =======================================================
     LOAD BOOKINGS
  ====================================================== */

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);

      const { data } =
        await bookingsApi.getMyBookings();

      setBookings(data);
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      toast.error(
        error?.response?.data?.message ??
          "Unable to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     CANCEL CONFIRMATION
  ====================================================== */

  function openCancelConfirmation(
    bookingId: number
  ) {
    setCancelBookingId(
      bookingId
    );
  }

  function closeCancelConfirmation() {
    if (
      cancelLoading !== null
    ) {
      return;
    }

    setCancelBookingId(null);
  }

  /* =======================================================
     CANCEL BOOKING
  ====================================================== */

  async function cancelBooking(
    bookingId: number
  ) {
    try {
      setCancelLoading(
        bookingId
      );

      await bookingsApi.cancelBooking(
        bookingId
      );

      toast.success(
        "Booking cancelled successfully."
      );

      setCancelBookingId(null);

      await loadBookings();
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      toast.error(
        error?.response?.data?.message ??
          "Unable to cancel booking."
      );
    } finally {
      setCancelLoading(null);
    }
  }

  /* =======================================================
     PARSE LOCAL CALENDAR DATE

     Avoid:
       new Date("2026-09-06")

     because date-only ISO strings are interpreted as UTC.
  ====================================================== */

  function createLocalDate(
    dateString: string
  ): Date | null {
    const parts =
      dateString
        .slice(0, 10)
        .split("-")
        .map(Number);

    if (
      parts.length !== 3 ||
      parts.some(
        (value) =>
          Number.isNaN(value)
      )
    ) {
      return null;
    }

    const [
      year,
      month,
      day,
    ] = parts;

    const date =
      new Date();

    date.setFullYear(
      year,
      month - 1,
      day
    );

    date.setHours(
      0,
      0,
      0,
      0
    );

    return date;
  }

  /* =======================================================
     BOOKING START DATE/TIME

     DAILY:
       Calendar date only.

     HOURLY:
       Exact check-in date + time.
  ====================================================== */

  function getBookingStartDateTime(
    booking: BookingHistory
  ): Date | null {
    if (
      !booking.checkInDate
    ) {
      return null;
    }

    const checkIn =
      createLocalDate(
        booking.checkInDate
      );

    if (!checkIn) {
      return null;
    }

    /* =====================================================
       HOURLY
    ===================================================== */

    if (
      booking.bookingMode ===
        "HOURLY" &&
      booking.checkInTime
    ) {
      const [
        hours,
        minutes,
        seconds = 0,
      ] =
        booking.checkInTime
          .slice(0, 8)
          .split(":")
          .map(Number);

      checkIn.setHours(
        hours || 0,
        minutes || 0,
        seconds || 0,
        0
      );

      return checkIn;
    }

    /* =====================================================
       DAILY

       Already midnight, intentionally.
    ===================================================== */

    return checkIn;
  }

  /* =======================================================
     NORMALIZE STATUS
  ====================================================== */

  function normalizeStatus(
    status?: string | null
  ): string {
    return String(
      status ?? ""
    ).toUpperCase();
  }

  /* =======================================================
     EXPIRED BOOKINGS

     IMPORTANT:
     Expired bookings must not appear anywhere.

     This includes:
       bookingStatus = EXPIRED
       paymentStatus = EXPIRED
  ====================================================== */

  function isHiddenBooking(
    booking: BookingHistory
  ): boolean {
    const bookingStatus =
      normalizeStatus(
        booking.bookingStatus
      );

    const paymentStatus =
      normalizeStatus(
        booking.paymentStatus
      );

    return (
      bookingStatus ===
        "EXPIRED" ||
      paymentStatus ===
        "EXPIRED"
    );
  }

  /* =======================================================
     BOOKING CATEGORY

     Priority:

     1. Cancelled
     2. Payment pending/failed
     3. Booked + date/time

     Expired bookings are handled separately and hidden.
  ====================================================== */

  function getBookingCategory(
    booking: BookingHistory
  ): BookingCategory {
    const bookingStatus =
      normalizeStatus(
        booking.bookingStatus
      );

    const paymentStatus =
      normalizeStatus(
        booking.paymentStatus
      );

    /* =====================================================
       CANCELLED
    ===================================================== */

    if (
      bookingStatus ===
      "CANCELLED"
    ) {
      return "CANCELLED";
    }

    /* =====================================================
       PAYMENT PENDING

       Payment status takes priority over BOOKED.

       Example:

       BOOKED + PENDING
       → PENDING
    ===================================================== */

    if (
      paymentStatus ===
        "PENDING" ||
      bookingStatus ===
        "PAYMENT_PENDING"
    ) {
      return "PENDING";
    }

    /* =====================================================
       PAYMENT FAILED
    ===================================================== */

    if (
      paymentStatus ===
      "FAILED"
    ) {
      return "PENDING";
    }

    /* =====================================================
       BOOKED

       Only BOOKED + SUCCESS reaches date classification.
    ===================================================== */

    if (
      bookingStatus !==
        "BOOKED" ||
      paymentStatus !==
        "SUCCESS"
    ) {
      return "PENDING";
    }

    /* =====================================================
       DAILY
    ===================================================== */

    if (
      booking.bookingMode !==
      "HOURLY"
    ) {
      const checkIn =
        createLocalDate(
          booking.checkInDate
        );

      if (!checkIn) {
        return "UPCOMING";
      }

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      /*
       * Check-in TODAY is still upcoming.
       */

      if (
        checkIn.getTime() >=
        today.getTime()
      ) {
        return "UPCOMING";
      }

      return "PAST";
    }

    /* =====================================================
       HOURLY
    ===================================================== */

    const start =
      getBookingStartDateTime(
        booking
      );

    if (!start) {
      return "UPCOMING";
    }

    const now =
      new Date();

    if (
      start.getTime() <=
      now.getTime()
    ) {
      return "PAST";
    }

    return "UPCOMING";
  }

  /* =======================================================
     CAN CANCEL

     Only successfully booked reservations can be cancelled.

     Payment pending bookings are not cancelled from this
     button because they are not confirmed bookings.
  ====================================================== */

  function canCancelBooking(
    booking: BookingHistory
  ): boolean {
    const bookingStatus =
      normalizeStatus(
        booking.bookingStatus
      );

    const paymentStatus =
      normalizeStatus(
        booking.paymentStatus
      );

    if (
      bookingStatus !==
      "BOOKED"
    ) {
      return false;
    }

    if (
      paymentStatus !==
      "SUCCESS"
    ) {
      return false;
    }

    const checkIn =
      getBookingStartDateTime(
        booking
      );

    if (!checkIn) {
      return false;
    }

    return (
      Date.now() <
      checkIn.getTime()
    );
  }

  /* =======================================================
     FILTERED BOOKINGS

     EXPIRED bookings are removed FIRST.
  ====================================================== */

  const filteredBookings =
    useMemo(() => {
      return bookings.filter(
        (booking) => {
          if (
            isHiddenBooking(
              booking
            )
          ) {
            return false;
          }

          return (
            getBookingCategory(
              booking
            ) === filter
          );
        }
      );
    }, [
      bookings,
      filter,
    ]);

  /* =======================================================
     TAB COUNTS

     EXPIRED bookings are NOT counted.
  ====================================================== */

  const bookingCounts =
    useMemo(() => {
      const counts: Record<
        BookingCategory,
        number
      > = {
        UPCOMING: 0,
        PENDING: 0,
        PAST: 0,
        CANCELLED: 0,
      };

      bookings.forEach(
        (booking) => {
          if (
            isHiddenBooking(
              booking
            )
          ) {
            return;
          }

          const category =
            getBookingCategory(
              booking
            );

          counts[
            category
          ] += 1;
        }
      );

      return counts;
    }, [bookings]);

  /* =======================================================
     SELECTED CANCEL BOOKING
  ====================================================== */

  const selectedCancelBooking =
    useMemo(() => {
      if (
        cancelBookingId ===
        null
      ) {
        return null;
      }

      return (
        bookings.find(
          (booking) =>
            booking.bookingId ===
            cancelBookingId
        ) ?? null
      );
    }, [
      bookings,
      cancelBookingId,
    ]);

  /* =======================================================
     STATUS LABELS
  ====================================================== */

  function getBookingStatusLabel(
    status?: string | null
  ): string {
    const normalized =
      normalizeStatus(status);

    switch (normalized) {
      case "BOOKED":
        return "BOOKED";

      case "PAYMENT_PENDING":
        return "PAYMENT PENDING";

      case "CANCELLED":
        return "CANCELLED";

      case "EXPIRED":
        return "EXPIRED";

      default:
        return status
          ? status.replaceAll(
              "_",
              " "
            )
          : "UNKNOWN";
    }
  }

  function getPaymentStatusLabel(
    status?: string | null
  ): string {
    const normalized =
      normalizeStatus(status);

    switch (normalized) {
      case "SUCCESS":
        return "PAID";

      case "PENDING":
        return "PAYMENT PENDING";

      case "FAILED":
        return "PAYMENT FAILED";

      case "REFUNDED":
        return "REFUNDED";

      case "EXPIRED":
        return "EXPIRED";

      default:
        return status
          ? status.replaceAll(
              "_",
              " "
            )
          : "UNKNOWN";
    }
  }

  /* =======================================================
     STATUS ICONS
  ====================================================== */

  function getBookingStatusIcon(
    status?: string | null
  ) {
    const normalized =
      normalizeStatus(status);

    switch (normalized) {
      case "BOOKED":
        return (
          <CheckCircle2 className="h-3.5 w-3.5" />
        );

      case "PAYMENT_PENDING":
        return (
          <Clock3 className="h-3.5 w-3.5" />
        );

      case "CANCELLED":
        return (
          <Ban className="h-3.5 w-3.5" />
        );

      case "EXPIRED":
        return (
          <CircleAlert className="h-3.5 w-3.5" />
        );

      default:
        return (
          <Calendar className="h-3.5 w-3.5" />
        );
    }
  }

  function getPaymentStatusIcon(
    status?: string | null
  ) {
    const normalized =
      normalizeStatus(status);

    switch (normalized) {
      case "SUCCESS":
        return (
          <CheckCircle2 className="h-3.5 w-3.5" />
        );

      case "PENDING":
        return (
          <Clock3 className="h-3.5 w-3.5" />
        );

      case "FAILED":
        return (
          <CircleAlert className="h-3.5 w-3.5" />
        );

      case "REFUNDED":
        return (
          <CreditCard className="h-3.5 w-3.5" />
        );

      default:
        return (
          <CreditCard className="h-3.5 w-3.5" />
        );
    }
  }

  /* =======================================================
     STATUS CLASSES
  ====================================================== */

  function getBookingStatusClasses(
    status?: string | null
  ): string {
    const normalized =
      normalizeStatus(status);

    switch (normalized) {
      case "BOOKED":
        return `
          border-green-200
          bg-green-50
          text-green-700
        `;

      case "PAYMENT_PENDING":
        return `
          border-amber-200
          bg-amber-50
          text-amber-700
        `;

      case "CANCELLED":
        return `
          border-stone-200
          bg-stone-50
          text-stone-600
        `;

      default:
        return `
          border-warm-stone/30
          bg-warm-stone/10
          text-muted-foreground
        `;
    }
  }

  function getPaymentStatusClasses(
    status?: string | null
  ): string {
    const normalized =
      normalizeStatus(status);

    switch (normalized) {
      case "SUCCESS":
        return `
          border-green-200
          bg-green-50
          text-green-700
        `;

      case "PENDING":
        return `
          border-amber-200
          bg-amber-50
          text-amber-700
        `;

      case "FAILED":
        return `
          border-red-200
          bg-red-50
          text-red-600
        `;

      case "REFUNDED":
        return `
          border-blue-200
          bg-blue-50
          text-blue-700
        `;

      default:
        return `
          border-warm-stone/30
          bg-warm-stone/10
          text-muted-foreground
        `;
    }
  }

  /* =======================================================
     FORMATTERS
  ====================================================== */

  function formatDate(
    date: string
  ): string {
    const localDate =
      createLocalDate(date);

    if (!localDate) {
      return date;
    }

    return localDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatTime(
    time?: string | null
  ): string {
    if (!time) {
      return "";
    }

    return time.slice(
      0,
      5
    );
  }

  function formatPrice(
    amount:
      | number
      | string
      | null
      | undefined
  ): string {
    return Number(
      amount ?? 0
    ).toLocaleString(
      "en-IN"
    );
  }

  /* =======================================================
     REVIEW
  ====================================================== */

  function canReview(
    booking: BookingHistory
  ): boolean {
    /*
     * Expired bookings are hidden and therefore
     * can never be reviewed from this page.
     */

    if (
      isHiddenBooking(
        booking
      )
    ) {
      return false;
    }

    return (
      getBookingCategory(
        booking
      ) === "PAST" &&
      normalizeStatus(
        booking.bookingStatus
      ) === "BOOKED" &&
      normalizeStatus(
        booking.paymentStatus
      ) === "SUCCESS"
    );
  }

  /* =======================================================
     EMPTY STATE
  ====================================================== */

  function getEmptyMessage() {
    switch (filter) {
      case "UPCOMING":
        return {
          title:
            "No Upcoming Bookings",
          description:
            "You don't have any upcoming stays at the moment.",
        };

      case "PENDING":
        return {
          title:
            "No Pending Payments",
          description:
            "You don't have any bookings waiting for payment.",
        };

      case "PAST":
        return {
          title:
            "No Past Bookings",
          description:
            "Your previous stays will appear here.",
        };

      case "CANCELLED":
        return {
          title:
            "No Cancelled Bookings",
          description:
            "You don't have any cancelled bookings.",
        };
    }
  }

  /* =======================================================
     RENDER
  ====================================================== */

  return (
    <MainLayout>

      <div className="container max-w-7xl py-10">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="mb-10">

          <p className="text-xs font-medium uppercase tracking-[0.22em] text-bronze">
            Your stays
          </p>

          <h1 className="mt-2 font-serif text-4xl font-bold text-espresso">
            My Bookings
          </h1>

          <p className="mt-2 text-muted-foreground">
            View, manage and track all your hotel bookings.
          </p>

        </div>


        {/* =================================================
            FILTERS
        ================================================== */}

        <div className="mb-8 flex flex-wrap gap-3">

          <FilterButton
            active={
              filter ===
              "UPCOMING"
            }
            onClick={() =>
              setFilter(
                "UPCOMING"
              )
            }
            label="Upcoming"
            count={
              bookingCounts.UPCOMING
            }
          />

          <FilterButton
            active={
              filter ===
              "PENDING"
            }
            onClick={() =>
              setFilter(
                "PENDING"
              )
            }
            label="Pending"
            count={
              bookingCounts.PENDING
            }
          />

          <FilterButton
            active={
              filter ===
              "PAST"
            }
            onClick={() =>
              setFilter(
                "PAST"
              )
            }
            label="Past"
            count={
              bookingCounts.PAST
            }
          />

          <FilterButton
            active={
              filter ===
              "CANCELLED"
            }
            onClick={() =>
              setFilter(
                "CANCELLED"
              )
            }
            label="Cancelled"
            count={
              bookingCounts.CANCELLED
            }
          />

        </div>


        {/* =================================================
            LOADING
        ================================================== */}

        {loading && (

          <div className="space-y-6">

            {[1, 2].map(
              (item) => (

                <div
                  key={item}
                  className="
                    overflow-hidden
                    rounded-3xl
                    border
                    border-warm-stone/20
                    bg-white
                    shadow-warm
                  "
                >

                  <div className="flex flex-col md:flex-row">

                    <div
                      className="
                        h-72
                        w-full
                        animate-pulse
                        bg-warm-stone/10
                        md:w-72
                      "
                    />

                    <div className="flex-1 space-y-6 p-8">

                      <div className="h-8 w-2/3 animate-pulse rounded bg-warm-stone/10" />

                      <div className="h-4 w-1/4 animate-pulse rounded bg-warm-stone/10" />

                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                        {[1, 2, 3, 4].map(
                          (column) => (

                            <div
                              key={
                                column
                              }
                              className="space-y-2"
                            >

                              <div className="h-4 w-20 animate-pulse rounded bg-warm-stone/10" />

                              <div className="h-5 w-28 animate-pulse rounded bg-warm-stone/10" />

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}


        {/* =================================================
            EMPTY
        ================================================== */}

        {!loading &&
          filteredBookings.length ===
            0 && (

            <div
              className="
                rounded-3xl
                border
                border-dashed
                border-warm-stone/30
                bg-white
                p-16
                text-center
                shadow-warm
              "
            >

              <Calendar
                className="
                  mx-auto
                  h-16
                  w-16
                  text-muted-foreground
                "
              />

              <h2 className="mt-6 font-serif text-2xl font-semibold text-espresso">
                {
                  getEmptyMessage()
                    ?.title
                }
              </h2>

              <p className="mt-2 text-muted-foreground">
                {
                  getEmptyMessage()
                    ?.description
                }
              </p>

              <button
                type="button"
                onClick={() =>
                  setLocation("/")
                }
                className="
                  mt-8
                  rounded-xl
                  bg-bronze
                  px-8
                  py-3
                  font-medium
                  text-white
                  transition
                  hover:bg-bronze-dark
                "
              >
                Explore Hotels
              </button>

            </div>

          )}


        {/* =================================================
            BOOKINGS
        ================================================== */}

        {!loading &&
          filteredBookings.length >
            0 && (

            <div className="space-y-6">

              {filteredBookings.map(
                (
                  booking,
                  index
                ) => {

                  const bookingStatus =
                    normalizeStatus(
                      booking.bookingStatus
                    );

                  const paymentStatus =
                    normalizeStatus(
                      booking.paymentStatus
                    );

                  /*
                   * Defensive guard.
                   *
                   * Even if an expired booking somehow
                   * reaches this render section, don't
                   * render it.
                   */

                  if (
                    isHiddenBooking(
                      booking
                    )
                  ) {
                    return null;
                  }

                  const category =
                    getBookingCategory(
                      booking
                    );

                  const paymentPending =
                    paymentStatus ===
                      "PENDING" ||
                    bookingStatus ===
                      "PAYMENT_PENDING";

                  const paymentSuccess =
                    paymentStatus ===
                    "SUCCESS";

                  const cancellationAllowed =
                    canCancelBooking(
                      booking
                    );

                  const reviewAvailable =
                    canReview(
                      booking
                    );

                  return (

                    <motion.div
                      key={
                        booking.bookingId
                      }
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          index *
                          0.05,
                      }}
                      className="
                        overflow-hidden
                        rounded-3xl
                        border
                        border-warm-stone/20
                        bg-white
                        shadow-warm
                      "
                    >

                      <div className="flex flex-col md:flex-row">

                        {/* =================================================
                            IMAGE
                        ================================================== */}

                        <div
                          className="
                            relative
                            h-72
                            w-full
                            shrink-0
                            md:h-auto
                            md:w-72
                          "
                        >

                          {booking.hotelImage ? (

                            <img
                              src={
                                booking.hotelImage
                              }
                              alt={
                                booking.hotelName
                              }
                              className="
                                h-full
                                w-full
                                object-cover
                              "
                            />

                          ) : (

                            <div
                              className="
                                flex
                                h-full
                                min-h-72
                                items-center
                                justify-center
                                bg-cream
                              "
                            >

                              <HotelPlaceholder />

                            </div>

                          )}

                        </div>


                        {/* =================================================
                            CONTENT
                        ================================================== */}

                        <div className="flex-1 p-6 md:p-8">

                          {/* =================================================
                              HOTEL HEADER
                          ================================================== */}

                          <div
                            className="
                              flex
                              flex-col
                              gap-5
                              md:flex-row
                              md:items-start
                              md:justify-between
                            "
                          >

                            <div>

                              <h2
                                className="
                                  font-serif
                                  text-2xl
                                  font-bold
                                  text-espresso
                                "
                              >
                                {
                                  booking.hotelName
                                }
                              </h2>

                              <div
                                className="
                                  mt-2
                                  flex
                                  items-center
                                  gap-2
                                  text-muted-foreground
                                "
                              >

                                <MapPin className="h-4 w-4" />

                                <span>
                                  {
                                    booking.city
                                  }
                                </span>

                              </div>

                            </div>


                            {/* =================================================
                                STATUS

                                PAYMENT PENDING HAS PRIORITY.

                                BOOKED + PENDING
                                → PAYMENT PENDING ONLY

                                EXPIRED
                                → never rendered
                            ================================================== */}

                            <div
                              className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                                md:flex-col
                                md:items-stretch
                              "
                            >

                              {paymentPending ? (

                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-1.5
                                    rounded-full
                                    border
                                    border-amber-200
                                    bg-amber-50
                                    px-4
                                    py-2
                                    text-[11px]
                                    font-semibold
                                    tracking-wide
                                    text-amber-700
                                  "
                                >

                                  <Clock3 className="h-3.5 w-3.5" />

                                  PAYMENT PENDING

                                </span>

                              ) : bookingStatus ===
                                "CANCELLED" ? (

                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-1.5
                                    rounded-full
                                    border
                                    border-stone-200
                                    bg-stone-50
                                    px-4
                                    py-2
                                    text-[11px]
                                    font-semibold
                                    tracking-wide
                                    text-stone-600
                                  "
                                >

                                  <Ban className="h-3.5 w-3.5" />

                                  CANCELLED

                                </span>

                              ) : (

                                <span
                                  className={`
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-1.5
                                    rounded-full
                                    border
                                    px-4
                                    py-2
                                    text-[11px]
                                    font-semibold
                                    tracking-wide
                                    ${getBookingStatusClasses(
                                      booking.bookingStatus
                                    )}
                                  `}
                                >

                                  {getBookingStatusIcon(
                                    booking.bookingStatus
                                  )}

                                  {getBookingStatusLabel(
                                    booking.bookingStatus
                                  )}

                                </span>

                              )}


                              {/* =================================================
                                  PAYMENT BADGE

                                  Only paid/failed/refunded statuses are shown.

                                  Pending is already represented by the
                                  primary PAYMENT PENDING badge.
                              ================================================== */}

                              {!paymentPending &&
                                bookingStatus !==
                                  "CANCELLED" &&
                                booking.paymentStatus && (

                                  <span
                                    className={`
                                      inline-flex
                                      items-center
                                      justify-center
                                      gap-1.5
                                      rounded-full
                                      border
                                      px-4
                                      py-2
                                      text-[11px]
                                      font-semibold
                                      tracking-wide
                                      ${getPaymentStatusClasses(
                                        booking.paymentStatus
                                      )}
                                    `}
                                  >

                                    {getPaymentStatusIcon(
                                      booking.paymentStatus
                                    )}

                                    {getPaymentStatusLabel(
                                      booking.paymentStatus
                                    )}

                                  </span>

                                )}

                            </div>

                          </div>


                          {/* =================================================
                              DIVIDER
                          ================================================== */}

                          <div className="my-6 h-px bg-warm-stone/20" />


                          {/* =================================================
                              BOOKING DETAILS
                          ================================================== */}

                          <div
                            className="
                              grid
                              gap-6
                              md:grid-cols-2
                              lg:grid-cols-4
                            "
                          >

                            {/* CHECK IN */}

                            <div>

                              <p className="text-sm text-muted-foreground">
                                Check In
                              </p>

                              <p className="mt-1 font-semibold text-espresso">

                                {
                                  formatDate(
                                    booking.checkInDate
                                  )
                                }

                                {booking.bookingMode ===
                                  "HOURLY" &&
                                  booking.checkInTime && (

                                    <span className="ml-2 text-bronze">
                                      {
                                        formatTime(
                                          booking.checkInTime
                                        )
                                      }
                                    </span>

                                  )}

                              </p>

                            </div>


                            {/* CHECK OUT */}

                            <div>

                              <p className="text-sm text-muted-foreground">
                                Check Out
                              </p>

                              <p className="mt-1 font-semibold text-espresso">

                                {
                                  formatDate(
                                    booking.checkOutDate
                                  )
                                }

                                {booking.bookingMode ===
                                  "HOURLY" &&
                                  booking.checkOutTime && (

                                    <span className="ml-2 text-bronze">
                                      {
                                        formatTime(
                                          booking.checkOutTime
                                        )
                                      }
                                    </span>

                                  )}

                              </p>

                            </div>


                            {/* ROOM TYPE */}

                            <div>

                              <p className="text-sm text-muted-foreground">
                                Room Type
                              </p>

                              <div className="mt-1 flex items-center gap-2">

                                <p className="font-semibold text-espresso">
                                  {
                                    booking.roomType
                                  }
                                </p>

                                {booking.bookingMode && (

                                  <span
                                    className="
                                      rounded-full
                                      bg-bronze/10
                                      px-2
                                      py-1
                                      text-xs
                                      font-semibold
                                      text-bronze
                                    "
                                  >
                                    {
                                      booking.bookingMode
                                    }
                                  </span>

                                )}

                              </div>

                            </div>


                            {/* GUESTS */}

                            <div>

                              <p className="text-sm text-muted-foreground">
                                Guests
                              </p>

                              <div className="mt-1 flex items-center gap-2">

                                <User className="h-4 w-4 text-bronze" />

                                <span className="font-semibold text-espresso">

                                  {booking.adultCount}{" "}
                                  Adult
                                  {booking.adultCount >
                                  1
                                    ? "s"
                                    : ""}

                                  {booking.childCount >
                                    0 && (
                                    <>
                                      {" • "}
                                      {
                                        booking.childCount
                                      }{" "}
                                      Child
                                      {booking.childCount >
                                      1
                                        ? "ren"
                                        : ""}
                                    </>
                                  )}

                                </span>

                              </div>

                            </div>

                          </div>


                          {/* =================================================
                              DIVIDER
                          ================================================== */}

                          <div className="my-6 h-px bg-warm-stone/20" />


                          {/* =================================================
                              BOTTOM
                          ================================================== */}

                          <div
                            className="
                              flex
                              flex-col
                              gap-6
                              lg:flex-row
                              lg:items-end
                              lg:justify-between
                            "
                          >

                            {/* =================================================
                                PAYMENT INFORMATION
                            ================================================== */}

                            <div>

                              {/* PAYMENT PENDING */}

                              {paymentPending ? (

                                <div
                                  className="
                                    flex
                                    items-start
                                    gap-3
                                  "
                                >

                                  <div
                                    className="
                                      mt-1
                                      flex
                                      h-9
                                      w-9
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-xl
                                      bg-amber-50
                                    "
                                  >

                                    <CreditCard
                                      className="
                                        h-4
                                        w-4
                                        text-amber-600
                                      "
                                    />

                                  </div>

                                  <div>

                                    <p className="text-sm font-semibold text-amber-700">
                                      Payment Pending
                                    </p>

                                    <div className="mt-1 flex items-baseline gap-2">

                                      <h3 className="font-serif text-3xl font-bold text-bronze">
                                        ₹
                                        {formatPrice(
                                          booking.amount
                                        )}
                                      </h3>

                                      <span className="text-sm text-muted-foreground">
                                        to be paid
                                      </span>

                                    </div>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                      Complete your payment to confirm the reservation.
                                    </p>

                                  </div>

                                </div>

                              ) : paymentSuccess ? (

                                /* PAID */

                                <div>

                                  <div className="flex items-center gap-2">

                                    <CreditCard className="h-4 w-4 text-green-600" />

                                    <p className="text-sm text-muted-foreground">
                                      Total Paid
                                    </p>

                                  </div>

                                  <h3 className="mt-1 font-serif text-3xl font-bold text-bronze">
                                    ₹
                                    {formatPrice(
                                      booking.amount
                                    )}
                                  </h3>

                                </div>

                              ) : (

                                /* OTHER NON-EXPIRED PAYMENT */

                                <div>

                                  <p className="text-sm text-muted-foreground">
                                    Booking Amount
                                  </p>

                                  <h3 className="mt-1 font-serif text-3xl font-bold text-bronze">
                                    ₹
                                    {formatPrice(
                                      booking.amount
                                    )}
                                  </h3>

                                </div>

                              )}

                            </div>


                            {/* =================================================
                                ACTIONS
                            ================================================== */}

                            <div
                              className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                              "
                            >

                              {/* =================================================
                                  VIEW DETAILS
                              ================================================== */}

                              <button
                                type="button"
                                onClick={() =>
                                  setLocation(
                                    `/my-bookings/${booking.bookingId}`
                                  )
                                }
                                className="
                                  inline-flex
                                  items-center
                                  justify-center
                                  gap-2
                                  rounded-xl
                                  border
                                  border-bronze/60
                                  bg-white
                                  px-5
                                  py-3
                                  text-sm
                                  font-medium
                                  text-bronze
                                  transition-all
                                  hover:border-bronze
                                  hover:bg-bronze/5
                                  active:scale-[0.98]
                                "
                              >

                                <Eye className="h-4 w-4" />

                                View Details

                              </button>


                              {/* =================================================
                                  CONTINUE PAYMENT
                              ================================================== */}

                              {category ===
                                "PENDING" &&
                                paymentPending && (

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setLocation(
                                        `/booking/${booking.bookingId}`
                                      )
                                    }
                                    className="
                                      inline-flex
                                      items-center
                                      justify-center
                                      gap-2
                                      rounded-xl
                                      bg-bronze
                                      px-5
                                      py-3
                                      text-sm
                                      font-semibold
                                      text-white
                                      shadow-sm
                                      transition-all
                                      hover:bg-bronze-dark
                                      hover:shadow-md
                                      active:scale-[0.98]
                                    "
                                  >

                                    <CreditCard className="h-4 w-4" />

                                    Continue Payment

                                  </button>

                                )}


                              {/* =================================================
                                  WRITE REVIEW
                              ================================================== */}

                              {reviewAvailable &&
                                !booking.reviewId && (

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setLocation(
                                        `/my-bookings/${booking.bookingId}/review`
                                      )
                                    }
                                    className="
                                      inline-flex
                                      items-center
                                      justify-center
                                      gap-2
                                      rounded-xl
                                      bg-bronze
                                      px-5
                                      py-3
                                      text-sm
                                      font-medium
                                      text-white
                                      shadow-sm
                                      transition-all
                                      hover:bg-bronze-dark
                                      hover:shadow-md
                                      active:scale-[0.98]
                                    "
                                  >

                                    <Star className="h-4 w-4" />

                                    Write Review

                                  </button>

                                )}


                              {/* =================================================
                                  EDIT REVIEW
                              ================================================== */}

                              {reviewAvailable &&
                                booking.reviewId && (

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setLocation(
                                        `/my-bookings/review/${booking.reviewId}/edit`
                                      )
                                    }
                                    className="
                                      inline-flex
                                      items-center
                                      justify-center
                                      gap-2
                                      rounded-xl
                                      border
                                      border-bronze/60
                                      bg-white
                                      px-5
                                      py-3
                                      text-sm
                                      font-medium
                                      text-bronze
                                      transition-all
                                      hover:border-bronze
                                      hover:bg-bronze/5
                                    "
                                  >

                                    <Star className="h-4 w-4" />

                                    Edit Review

                                  </button>

                                )}


                              {/* =================================================
                                  CANCEL
                              ================================================== */}

                              {cancellationAllowed && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    openCancelConfirmation(
                                      booking.bookingId
                                    )
                                  }
                                  disabled={
                                    cancelLoading ===
                                    booking.bookingId
                                  }
                                  className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-warm-stone/30
                                    bg-white
                                    px-4
                                    py-3
                                    text-sm
                                    font-medium
                                    text-muted-foreground
                                    transition-all
                                    hover:border-red-200
                                    hover:bg-red-50/60
                                    hover:text-red-600
                                    active:scale-[0.98]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                  "
                                >

                                  {cancelLoading ===
                                  booking.bookingId ? (

                                    <Loader2
                                      className="
                                        h-4
                                        w-4
                                        animate-spin
                                      "
                                    />

                                  ) : (

                                    <XCircle className="h-4 w-4" />

                                  )}

                                  Cancel

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


      {/* =====================================================
          CANCEL CONFIRMATION MODAL
      ====================================================== */}

      <AnimatePresence>

        {selectedCancelBooking && (

          <div
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/40
              px-4
              backdrop-blur-[2px]
            "
            onMouseDown={(
              event
            ) => {

              if (
                event.target ===
                  event.currentTarget &&
                cancelLoading === null
              ) {
                closeCancelConfirmation();
              }

            }}
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 12,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 12,
              }}
              transition={{
                duration: 0.18,
              }}
              className="
                w-full
                max-w-md
                overflow-hidden
                rounded-2xl
                border
                border-warm-stone/20
                bg-white
                shadow-2xl
              "
            >

              {/* HEADER */}

              <div className="px-6 pt-6">

                <div className="flex items-start gap-4">

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-stone-100
                    "
                  >

                    <AlertTriangle
                      className="
                        h-5
                        w-5
                        text-stone-600
                      "
                    />

                  </div>

                  <div>

                    <h2 className="font-serif text-xl font-semibold text-espresso">
                      Cancel this booking?
                    </h2>

                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">

                      You are about to cancel your
                      reservation at{" "}

                      <span className="font-medium text-espresso">
                        {
                          selectedCancelBooking.hotelName
                        }
                      </span>
                      .

                    </p>

                  </div>

                </div>

              </div>


              {/* BOOKING SUMMARY */}

              <div
                className="
                  mx-6
                  mt-6
                  rounded-xl
                  border
                  border-warm-stone/20
                  bg-cream/40
                  p-4
                "
              >

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Check In
                    </p>

                    <p className="mt-1 text-sm font-semibold text-espresso">
                      {
                        formatDate(
                          selectedCancelBooking.checkInDate
                        )
                      }
                    </p>

                  </div>

                  <div>

                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Check Out
                    </p>

                    <p className="mt-1 text-sm font-semibold text-espresso">
                      {
                        formatDate(
                          selectedCancelBooking.checkOutDate
                        )
                      }
                    </p>

                  </div>

                  <div>

                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Room
                    </p>

                    <p className="mt-1 text-sm font-semibold text-espresso">
                      {
                        selectedCancelBooking.roomType
                      }
                    </p>

                  </div>

                  <div>

                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Amount
                    </p>

                    <p className="mt-1 text-sm font-semibold text-espresso">
                      ₹
                      {formatPrice(
                        selectedCancelBooking.amount
                      )}
                    </p>

                  </div>

                </div>

              </div>


              {/* NOTE */}

              <div
                className="
                  mx-6
                  mt-5
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  bg-stone-50
                  p-4
                "
              >

                <ShieldCheck
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-stone-500
                  "
                />

                <p className="text-xs leading-5 text-muted-foreground">
                  This action will cancel the reservation.
                  Please review the booking details before
                  continuing.
                </p>

              </div>


              {/* ACTIONS */}

              <div
                className="
                  flex
                  items-center
                  justify-end
                  gap-3
                  px-6
                  py-6
                "
              >

                <button
                  type="button"
                  disabled={
                    cancelLoading !==
                    null
                  }
                  onClick={
                    closeCancelConfirmation
                  }
                  className="
                    rounded-xl
                    border
                    border-warm-stone/30
                    px-5
                    py-2.5
                    text-sm
                    font-medium
                    text-espresso
                    transition
                    hover:bg-cream
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Keep Booking
                </button>

                <button
                  type="button"
                  disabled={
                    cancelLoading !==
                    null
                  }
                  onClick={() =>
                    cancelBooking(
                      selectedCancelBooking.bookingId
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-stone-300
                    bg-stone-100
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-stone-700
                    transition
                    hover:border-red-200
                    hover:bg-red-50
                    hover:text-red-600
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {cancelLoading !==
                  null ? (

                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cancelling...
                    </>

                  ) : (

                    <>
                      <XCircle className="h-4 w-4" />
                      Cancel Booking
                    </>

                  )}

                </button>

              </div>

            </motion.div>

          </div>

        )}

      </AnimatePresence>

    </MainLayout>
  );
}


/* =========================================================
   FILTER BUTTON
========================================================= */

function FilterButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        items-center
        gap-2
        rounded-full
        px-5
        py-2.5
        text-sm
        font-medium
        transition-all
        ${
          active
            ? "bg-bronze text-white shadow-sm"
            : "border border-warm-stone/30 bg-white text-espresso hover:border-bronze hover:text-bronze"
        }
      `}
    >

      {label}

      <span
        className={`
          flex
          h-5
          min-w-5
          items-center
          justify-center
          rounded-full
          px-1.5
          text-[11px]
          font-semibold
          ${
            active
              ? "bg-white/20 text-white"
              : "bg-cream text-muted-foreground"
          }
        `}
      >
        {count}
      </span>

    </button>
  );
}


/* =========================================================
   HOTEL PLACEHOLDER
========================================================= */

function HotelPlaceholder() {
  return (
    <div className="text-center">

      <div
        className="
          mx-auto
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-bronze/10
        "
      >

        <Hotel className="h-7 w-7 text-bronze" />

      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Hotel image unavailable
      </p>

    </div>
  );
}