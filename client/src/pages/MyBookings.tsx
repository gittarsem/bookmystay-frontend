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
import type {
  BookingHistory,
  CancellationPreview,
} from "@/api/bookings";


/* =========================================================
   BOOKING CATEGORY
========================================================= */

type BookingCategory =
  | "UPCOMING"
  | "PAST"
  | "CANCELLED"
  | "EXPIRED";


export default function MyBookings() {

  const [, setLocation] =
    useLocation();


  const [bookings, setBookings] =
    useState<BookingHistory[]>([]);


  const [loading, setLoading] =
    useState(true);


  const [category, setCategory] =
    useState<BookingCategory>(
      "UPCOMING"
    );


  const [cancelLoading, setCancelLoading] =
    useState<number | null>(null);


  const [previewLoading, setPreviewLoading] =
    useState<number | null>(null);


  const [cancellationPreview, setCancellationPreview] =
    useState<CancellationPreview | null>(
      null
    );


  /* =========================================================
     LOAD BOOKINGS
  ========================================================== */

  useEffect(() => {

    loadBookings();

  }, []);


  async function loadBookings() {

    try {

      setLoading(true);

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


  /* =========================================================
     CHECK-IN DATETIME
  ========================================================== */

  function getCheckInDateTime(
    booking: BookingHistory
  ): Date {

    if (
      booking.bookingMode === "HOURLY" &&
      booking.checkInTime
    ) {

      return new Date(
        `${booking.checkInDate}T${booking.checkInTime}`
      );

    }

    /*
     * Daily booking:
     * check-in starts at midnight
     * on the check-in date.
     */

    return new Date(
      `${booking.checkInDate}T00:00:00`
    );
  }


  /* =========================================================
     CHECK-OUT DATETIME
  ========================================================== */

  function getCheckOutDateTime(
    booking: BookingHistory
  ): Date {

    if (
      booking.bookingMode === "HOURLY" &&
      booking.checkOutTime
    ) {

      return new Date(
        `${booking.checkOutDate}T${booking.checkOutTime}`
      );

    }

    /*
     * Daily booking:
     * checkout date starts at midnight.
     *
     * This is enough for categorization because
     * a daily booking whose checkout date has
     * arrived is considered past.
     */

    return new Date(
      `${booking.checkOutDate}T00:00:00`
    );
  }


  /* =========================================================
     CHECK-IN STARTED
  ========================================================== */

  function hasCheckInStarted(
    booking: BookingHistory
  ): boolean {

    const now =
      new Date();

    const checkIn =
      getCheckInDateTime(
        booking
      );

    return now >= checkIn;
  }


  /* =========================================================
     CHECK-OUT PASSED
  ========================================================== */

  function hasCheckOutPassed(
    booking: BookingHistory
  ): boolean {

    const now =
      new Date();

    const checkOut =
      getCheckOutDateTime(
        booking
      );

    return now >= checkOut;
  }


  /* =========================================================
     UPCOMING
  ========================================================== */

  function isUpcoming(
    booking: BookingHistory
  ): boolean {

    /*
     * Cancelled bookings never appear
     * under Upcoming.
     */

    if (
      booking.bookingStatus ===
      "CANCELLED"
    ) {
      return false;
    }


    /*
     * Completed bookings belong
     * to Past.
     */

    if (
      booking.bookingStatus ===
      "COMPLETED"
    ) {
      return false;
    }


    /*
     * Payment pending bookings can
     * remain in their payment flow.
     */

    if (
      booking.bookingStatus ===
      "PAYMENT_PENDING"
    ) {

      return true;

    }


    return (
      booking.bookingStatus ===
        "BOOKED" &&
      !hasCheckInStarted(
        booking
      )
    );
  }


  /* =========================================================
     EXPIRED
  ========================================================== */

  function isExpired(
    booking: BookingHistory
  ): boolean {

    /*
     * Cancelled is its own category.
     */

    if (
      booking.bookingStatus ===
      "CANCELLED"
    ) {
      return false;
    }


    /*
     * Completed is Past.
     */

    if (
      booking.bookingStatus ===
      "COMPLETED"
    ) {
      return false;
    }


    /*
     * EXPIRED means:
     *
     * check-in has started
     * BUT checkout has not passed yet.
     *
     * Example:
     *
     * Check-in  = 3:43 PM
     * Check-out = 5:43 PM
     *
     * 4:00 PM => EXPIRED
     */

    return (
      booking.bookingStatus ===
        "BOOKED" &&
      hasCheckInStarted(
        booking
      ) &&
      !hasCheckOutPassed(
        booking
      )
    );
  }


  /* =========================================================
     PAST
  ========================================================== */

  function isPast(
    booking: BookingHistory
  ): boolean {

    /*
     * Cancelled bookings belong
     * exclusively to Cancelled.
     */

    if (
      booking.bookingStatus ===
      "CANCELLED"
    ) {
      return false;
    }


    /*
     * If backend has already marked
     * the booking COMPLETED, it is Past.
     */

    if (
      booking.bookingStatus ===
      "COMPLETED"
    ) {
      return true;
    }


    /*
     * IMPORTANT:
     *
     * Do NOT depend only on bookingStatus.
     *
     * If backend still says BOOKED but
     * checkout datetime has passed,
     * the booking is still Past in UI.
     */

    return hasCheckOutPassed(
      booking
    );
  }


  /* =========================================================
     CATEGORY FILTER
  ========================================================== */

  const filteredBookings =
    useMemo(() => {

      return bookings.filter(
        (booking) => {

          switch (category) {

            case "UPCOMING":

              return isUpcoming(
                booking
              );


            case "PAST":

              return isPast(
                booking
              );


            case "CANCELLED":

              return (
                booking.bookingStatus ===
                "CANCELLED"
              );


            case "EXPIRED":

              return isExpired(
                booking
              );


            default:

              return false;
          }

        }
      );

    }, [
      bookings,
      category,
    ]);


  /* =========================================================
     CANCELLATION PREVIEW
  ========================================================== */

  async function showCancellationPreview(
    bookingId: number
  ) {

    try {

      setPreviewLoading(
        bookingId
      );


      const { data } =
        await bookingsApi.getCancellationPreview(
          bookingId
        );


      setCancellationPreview(
        data
      );

    } catch (err: any) {

      toast.error(
        err?.response?.data?.message ??
        "Unable to calculate refund amount."
      );

    } finally {

      setPreviewLoading(
        null
      );

    }
  }


  /* =========================================================
     CONFIRM CANCELLATION
  ========================================================== */

  async function confirmCancellation() {

    if (
      !cancellationPreview
    ) {
      return;
    }


    const bookingId =
      cancellationPreview.bookingId;


    try {

      setCancelLoading(
        bookingId
      );


      const { data } =
        await bookingsApi.cancelBooking(
          bookingId
        );


      toast.success(
        data.message ??
        "Booking cancelled successfully."
      );


      setCancellationPreview(
        null
      );


      await loadBookings();


    } catch (err: any) {

      toast.error(
        err?.response?.data?.message ??
        "Unable to cancel booking."
      );

    } finally {

      setCancelLoading(
        null
      );

    }
  }


  /* =========================================================
     FORMAT DATE
  ========================================================== */

  const formatDate = (
    date: string
  ) =>
    new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );


  /* =========================================================
     FORMAT TIME
  ========================================================== */

  const formatTime = (
    time?: string | null
  ) => {

    if (!time) {
      return "";
    }


    const [
      hours,
      minutes,
    ] =
      time
        .split(":")
        .map(Number);


    const date =
      new Date();


    date.setHours(
      hours,
      minutes,
      0,
      0
    );


    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );
  };


  /* =========================================================
     FORMAT PRICE
  ========================================================== */

  const formatPrice = (
    amount:
      number |
      null |
      undefined
  ) =>
    Number(
      amount ?? 0
    ).toLocaleString(
      "en-IN"
    );


  /* =========================================================
     STATUS CLASSES
  ========================================================== */

  const statusClasses:
    Record<string, string> = {

    BOOKED:
      "bg-green-100 text-green-700",

    PAYMENT_PENDING:
      "bg-yellow-100 text-yellow-700",

    CANCELLED:
      "bg-red-100 text-red-700",

    COMPLETED:
      "bg-blue-100 text-blue-700",

    EXPIRED:
      "bg-gray-200 text-gray-700",

  };


  /* =========================================================
     PAYMENT CLASSES
  ========================================================== */

  const paymentClasses:
    Record<string, string> = {

    SUCCESS:
      "bg-green-100 text-green-700",

    PENDING:
      "bg-yellow-100 text-yellow-700",

    FAILED:
      "bg-red-100 text-red-700",

    EXPIRED:
      "bg-gray-200 text-gray-700",

    REFUNDED:
      "bg-blue-100 text-blue-700",

  };


  /* =========================================================
     RENDER
  ========================================================== */

  return (

    <MainLayout>

      <div className="container max-w-7xl py-10">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-10">

          <h1
            className="
              font-serif
              text-4xl
              font-bold
              text-espresso
            "
          >
            My Bookings
          </h1>


          <p
            className="
              mt-2
              text-muted-foreground
            "
          >
            View, manage and track all your hotel bookings.
          </p>

        </div>


        {/* =====================================================
            CATEGORY TABS
        ====================================================== */}

        <div
          className="
            mb-8
            flex
            flex-wrap
            gap-3
          "
        >

          {[
            {
              value:
                "UPCOMING" as BookingCategory,
              label:
                "Upcoming",
            },
            {
              value:
                "PAST" as BookingCategory,
              label:
                "Past",
            },
            {
              value:
                "CANCELLED" as BookingCategory,
              label:
                "Cancelled",
            },
            {
              value:
                "EXPIRED" as BookingCategory,
              label:
                "Expired",
            },
          ].map(
            (item) => (

              <button
                key={
                  item.value
                }
                onClick={() =>
                  setCategory(
                    item.value
                  )
                }
                className={`
                  rounded-full
                  px-7
                  py-3
                  text-base
                  font-medium
                  transition
                  ${
                    category ===
                    item.value
                      ? "bg-bronze text-white"
                      : "border border-warm-stone/30 bg-white text-espresso hover:border-bronze"
                  }
                `}
              >

                {item.label}

              </button>

            )
          )}

        </div>


        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading && (

          <div
            className="
              flex
              h-72
              items-center
              justify-center
            "
          >

            <Loader2
              className="
                h-10
                w-10
                animate-spin
                text-bronze
              "
            />

          </div>

        )}


        {/* =====================================================
            EMPTY STATE
        ====================================================== */}

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


              <h2
                className="
                  mt-6
                  font-serif
                  text-2xl
                  font-semibold
                  text-espresso
                "
              >

                {category ===
                  "UPCOMING"
                  ? "No Upcoming Bookings"
                  : category ===
                      "PAST"
                    ? "No Past Bookings"
                    : category ===
                        "CANCELLED"
                      ? "No Cancelled Bookings"
                      : "No Expired Bookings"}

              </h2>


              <p
                className="
                  mt-2
                  text-muted-foreground
                "
              >

                {category ===
                  "UPCOMING"
                  ? "You don't have any upcoming stays."
                  : category ===
                      "PAST"
                    ? "You don't have any completed stays yet."
                    : category ===
                        "CANCELLED"
                      ? "You don't have any cancelled bookings."
                      : "You don't have any expired bookings."}

              </p>


              <button
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


        {/* =====================================================
            BOOKINGS
        ====================================================== */}

        {!loading &&
          filteredBookings.length >
            0 && (

            <div className="space-y-6">

              {filteredBookings.map(
                (
                  booking,
                  index
                ) => {

                  const isHourly =
                    booking.bookingMode ===
                    "HOURLY";


                  const checkInStarted =
                    hasCheckInStarted(
                      booking
                    );


                  const checkOutPassed =
                    hasCheckOutPassed(
                      booking
                    );


                  const displayStatus =
                    booking.bookingStatus ===
                      "CANCELLED"
                      ? "CANCELLED"
                      : isPast(
                          booking
                        )
                        ? "COMPLETED"
                        : isExpired(
                            booking
                          )
                          ? "EXPIRED"
                          : booking.bookingStatus;


                  /*
                   * Cancellation is allowed only
                   * before check-in.
                   */

                  const canCancel =
                    booking.bookingStatus ===
                      "BOOKED" &&
                    !checkInStarted;


                  /*
                   * Review is allowed only after
                   * checkout has passed.
                   *
                   * For hourly bookings this
                   * includes checkout time.
                   */

                  const canReview =
                    (
                      booking.bookingStatus ===
                        "BOOKED" ||
                      booking.bookingStatus ===
                        "COMPLETED"
                    ) &&
                    checkOutPassed;


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
                          index * 0.05,
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

                      <div
                        className="
                          flex
                          flex-col
                          md:flex-row
                        "
                      >

                        {/* =================================================
                            IMAGE
                        ================================================== */}

                        <img
                          src={
                            booking.hotelImage ||
                            "/placeholder-hotel.jpg"
                          }
                          alt={
                            booking.hotelName
                          }
                          className="
                            h-72
                            w-full
                            object-cover
                            md:h-auto
                            md:w-72
                          "
                        />


                        {/* =================================================
                            CONTENT
                        ================================================== */}

                        <div
                          className="
                            flex-1
                            p-8
                          "
                        >

                          {/* =================================================
                              HEADER
                          ================================================== */}

                          <div
                            className="
                              flex
                              flex-col
                              gap-4
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

                                <MapPin
                                  className="h-4 w-4"
                                />

                                <span>
                                  {
                                    booking.city
                                  }
                                </span>

                              </div>

                            </div>


                            {/* STATUS */}

                            <div
                              className="
                                flex
                                flex-col
                                gap-2
                              "
                            >

                              <span
                                className={`
                                  rounded-full
                                  px-4
                                  py-2
                                  text-center
                                  text-sm
                                  font-semibold
                                  ${
                                    statusClasses[
                                      displayStatus
                                    ] ??
                                    "bg-gray-100 text-gray-700"
                                  }
                                `}
                              >

                                {
                                  displayStatus
                                    ?.replace(
                                      "_",
                                      " "
                                    )
                                }

                              </span>


                              {booking.paymentStatus && (

                                <span
                                  className={`
                                    rounded-full
                                    px-4
                                    py-2
                                    text-center
                                    text-sm
                                    font-semibold
                                    ${
                                      paymentClasses[
                                        booking.paymentStatus
                                      ] ??
                                      "bg-gray-100 text-gray-700"
                                    }
                                  `}
                                >

                                  {
                                    booking.paymentStatus
                                  }

                                </span>

                              )}

                            </div>

                          </div>


                          <div
                            className="
                              my-6
                              h-px
                              bg-warm-stone/20
                            "
                          />


                          {/* =================================================
                              BOOKING INFO
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

                              <p
                                className="
                                  text-sm
                                  text-muted-foreground
                                "
                              >
                                Check In
                              </p>


                              <p
                                className="
                                  mt-1
                                  font-semibold
                                  text-espresso
                                "
                              >

                                {
                                  formatDate(
                                    booking.checkInDate
                                  )
                                }


                                {isHourly &&
                                  booking.checkInTime && (

                                  <span
                                    className="
                                      ml-2
                                      text-bronze
                                    "
                                  >

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

                              <p
                                className="
                                  text-sm
                                  text-muted-foreground
                                "
                              >
                                Check Out
                              </p>


                              <p
                                className="
                                  mt-1
                                  font-semibold
                                  text-espresso
                                "
                              >

                                {
                                  formatDate(
                                    booking.checkOutDate
                                  )
                                }


                                {isHourly &&
                                  booking.checkOutTime && (

                                  <span
                                    className="
                                      ml-2
                                      text-bronze
                                    "
                                  >

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

                              <p
                                className="
                                  text-sm
                                  text-muted-foreground
                                "
                              >
                                Room Type
                              </p>


                              <div
                                className="
                                  mt-1
                                  flex
                                  items-center
                                  gap-2
                                "
                              >

                                <p
                                  className="
                                    font-semibold
                                    text-espresso
                                  "
                                >
                                  {
                                    booking.roomType
                                  }
                                </p>


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

                              </div>

                            </div>


                            {/* GUESTS */}

                            <div>

                              <p
                                className="
                                  text-sm
                                  text-muted-foreground
                                "
                              >
                                Guests
                              </p>


                              <div
                                className="
                                  mt-1
                                  flex
                                  items-center
                                  gap-2
                                "
                              >

                                <User
                                  className="
                                    h-4
                                    w-4
                                    text-bronze
                                  "
                                />


                                <span
                                  className="
                                    font-semibold
                                    text-espresso
                                  "
                                >

                                  {
                                    booking.adultCount
                                  }

                                  {" "}

                                  Adult
                                  {
                                    booking.adultCount >
                                    1
                                      ? "s"
                                      : ""
                                  }


                                  {booking.childCount >
                                    0 && (

                                    <>
                                      {" • "}

                                      {
                                        booking.childCount
                                      }

                                      {" "}

                                      Child
                                      {
                                        booking.childCount >
                                        1
                                          ? "ren"
                                          : ""
                                      }

                                    </>

                                  )}

                                </span>

                              </div>

                            </div>

                          </div>


                          <div
                            className="
                              my-6
                              h-px
                              bg-warm-stone/20
                            "
                          />


                          {/* =================================================
                              BOTTOM
                          ================================================== */}

                          <div
                            className="
                              flex
                              flex-col
                              gap-5
                              lg:flex-row
                              lg:items-center
                              lg:justify-between
                            "
                          >

                            {/* TOTAL */}

                            <div>

                              <p
                                className="
                                  text-sm
                                  text-muted-foreground
                                "
                              >
                                Total Paid
                              </p>


                              <h3
                                className="
                                  mt-1
                                  text-3xl
                                  font-bold
                                  text-bronze
                                "
                              >

                                ₹
                                {
                                  formatPrice(
                                    booking.amount
                                  )
                                }

                              </h3>


                              {/* REFUNDED AMOUNT */}

                              {booking.bookingStatus ===
                                  "CANCELLED" &&
                                booking.refundedAmount !=
                                  null && (

                                <p
                                  className="
                                    mt-2
                                    text-sm
                                    font-semibold
                                    text-green-600
                                  "
                                >

                                  Refunded: ₹
                                  {
                                    formatPrice(
                                      booking.refundedAmount
                                    )
                                  }

                                </p>

                              )}

                            </div>


                            {/* ACTIONS */}

                            <div
                              className="
                                flex
                                flex-wrap
                                gap-3
                              "
                            >

                              {/* VIEW DETAILS */}

                              <button
                                onClick={() =>
                                  setLocation(
                                    `/my-bookings/${booking.bookingId}`
                                  )
                                }
                                className="
                                  flex
                                  items-center
                                  gap-2
                                  rounded-xl
                                  border
                                  border-bronze
                                  px-5
                                  py-3
                                  font-medium
                                  text-bronze
                                  transition
                                  hover:bg-bronze
                                  hover:text-white
                                "
                              >

                                <Eye
                                  className="
                                    h-4
                                    w-4
                                  "
                                />

                                View Details

                              </button>


                              {/* WRITE REVIEW */}

                              {canReview &&
                                !booking.reviewId && (

                                <button
                                  onClick={() =>
                                    setLocation(
                                      `/my-bookings/${booking.bookingId}/review`
                                    )
                                  }
                                  className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-bronze
                                    px-5
                                    py-3
                                    font-medium
                                    text-white
                                    transition
                                    hover:bg-bronze-dark
                                  "
                                >

                                  <Star
                                    className="
                                      h-4
                                      w-4
                                    "
                                  />

                                  Write Review

                                </button>

                              )}


                              {/* EDIT REVIEW */}

                              {canReview &&
                                booking.reviewId && (

                                <button
                                  onClick={() =>
                                    setLocation(
                                      `/my-bookings/review/${booking.reviewId}/edit`
                                    )
                                  }
                                  className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-bronze
                                    px-5
                                    py-3
                                    font-medium
                                    text-bronze
                                    transition
                                    hover:bg-bronze
                                    hover:text-white
                                  "
                                >

                                  <Star
                                    className="
                                      h-4
                                      w-4
                                    "
                                  />

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
                                  className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-yellow-500
                                    px-5
                                    py-3
                                    font-medium
                                    text-white
                                    transition
                                    hover:bg-yellow-600
                                  "
                                >

                                  <CreditCard
                                    className="
                                      h-4
                                      w-4
                                    "
                                  />

                                  Continue Payment

                                </button>

                              )}


                              {/* CANCEL */}

                              {canCancel && (

                                <button
                                  onClick={() =>
                                    showCancellationPreview(
                                      booking.bookingId
                                    )
                                  }
                                  disabled={
                                    previewLoading ===
                                    booking.bookingId
                                  }
                                  className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-red-600
                                    px-5
                                    py-3
                                    font-medium
                                    text-white
                                    transition
                                    hover:bg-red-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                  "
                                >

                                  {previewLoading ===
                                    booking.bookingId ? (

                                    <Loader2
                                      className="
                                        h-4
                                        w-4
                                        animate-spin
                                      "
                                    />

                                  ) : (

                                    <XCircle
                                      className="
                                        h-4
                                        w-4
                                      "
                                    />

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


      {/* =========================================================
          CANCELLATION PREVIEW MODAL
      ========================================================== */}

      {cancellationPreview && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            px-4
          "
        >

          <div
            className="
              w-full
              max-w-lg
              rounded-3xl
              bg-white
              p-7
              shadow-2xl
            "
          >

            {/* HEADER */}

            <div
              className="
                flex
                items-start
                justify-between
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
                  Cancel Booking
                </h2>


                <p
                  className="
                    mt-1
                    text-sm
                    text-muted-foreground
                  "
                >
                  Review your refund before cancelling.
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setCancellationPreview(
                    null
                  )
                }
                className="
                  rounded-full
                  p-2
                  text-xl
                  text-muted-foreground
                  hover:bg-cream
                "
              >
                ×
              </button>

            </div>


            {/* AMOUNT PAID */}

            <div
              className="
                mt-6
                flex
                items-center
                justify-between
                rounded-xl
                bg-cream/50
                p-4
              "
            >

              <span
                className="
                  text-muted-foreground
                "
              >
                Amount Paid
              </span>


              <span
                className="
                  font-semibold
                  text-espresso
                "
              >
                ₹
                {
                  formatPrice(
                    cancellationPreview.amountPaid
                  )
                }
              </span>

            </div>


            {/* REFUND PERCENTAGE */}

            <div
              className="
                mt-3
                flex
                items-center
                justify-between
                rounded-xl
                bg-cream/50
                p-4
              "
            >

              <span
                className="
                  text-muted-foreground
                "
              >
                Refund Percentage
              </span>


              <span
                className="
                  font-semibold
                  text-espresso
                "
              >
                {
                  cancellationPreview.refundPercentage
                }%
              </span>

            </div>


            {/* CANCELLATION FEE */}

            <div
              className="
                mt-3
                flex
                items-center
                justify-between
                rounded-xl
                bg-cream/50
                p-4
              "
            >

              <span
                className="
                  text-muted-foreground
                "
              >
                Cancellation Fee
              </span>


              <span
                className="
                  font-semibold
                  text-espresso
                "
              >
                ₹
                {
                  formatPrice(
                    cancellationPreview.cancellationFee
                  )
                }
              </span>

            </div>


            {/* REFUND AMOUNT */}

            <div
              className="
                mt-3
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-green-200
                bg-green-50
                p-4
              "
            >

              <span
                className="
                  font-semibold
                  text-green-800
                "
              >
                Refund Amount
              </span>


              <span
                className="
                  text-xl
                  font-bold
                  text-green-700
                "
              >
                ₹
                {
                  formatPrice(
                    cancellationPreview.refundAmount
                  )
                }
              </span>

            </div>


            {/* ZERO REFUND */}

            {Number(
              cancellationPreview.refundAmount
            ) === 0 && (

              <div
                className="
                  mt-5
                  rounded-xl
                  border
                  border-amber-200
                  bg-amber-50
                  p-4
                "
              >

                <p
                  className="
                    text-sm
                    font-medium
                    text-amber-800
                  "
                >
                  No monetary refund is available
                  for this cancellation. You can
                  still cancel the booking.
                </p>

              </div>

            )}


            {/* ACTIONS */}

            <div
              className="
                mt-7
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:justify-end
              "
            >

              <button
                type="button"
                onClick={() =>
                  setCancellationPreview(
                    null
                  )
                }
                disabled={
                  cancelLoading !== null
                }
                className="
                  rounded-xl
                  border
                  border-warm-stone/30
                  px-6
                  py-3
                  font-semibold
                  text-espresso
                  transition
                  hover:bg-cream
                "
              >
                Keep Booking
              </button>


              <button
                type="button"
                onClick={
                  confirmCancellation
                }
                disabled={
                  cancelLoading ===
                  cancellationPreview.bookingId
                }
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-red-600
                  px-6
                  py-3
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                {cancelLoading ===
                  cancellationPreview.bookingId && (

                  <Loader2
                    className="
                      h-4
                      w-4
                      animate-spin
                    "
                  />

                )}

                Confirm Cancellation

              </button>

            </div>

          </div>

        </div>

      )}

    </MainLayout>
  );
}