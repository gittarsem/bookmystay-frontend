import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

import { toast } from "sonner";

import MainLayout from "@/layouts/MainLayout";
import { bookingsApi, paymentsApi } from "@/api";
import { openRazorpay } from "@/utils/openRazorPay";


/* =========================================================
   TYPES
========================================================= */

type BookingMode = "DAILY" | "HOURLY";


interface BookingDetails {

  bookingId: number;

  hotelName: string;

  city: string;

  roomType: string;

  bookingMode: BookingMode;

  checkInDate: string;

  checkOutDate: string;

  checkInTime?: string | null;

  checkOutTime?: string | null;

  adultCount: number;

  childCount: number;

  amount: number;

  bookingStatus: string;

  paymentStatus: string;

  guests: unknown[];
}


/* =========================================================
   COMPONENT
========================================================= */

export default function Booking() {

  const [, params] =
    useRoute<{ bookingId: string }>(
      "/booking/:bookingId"
    );

  const [, setLocation] = useLocation();


  /* =======================================================
     STATE
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  const [booking, setBooking] =
    useState<BookingDetails | null>(null);

  const [expiresAt, setExpiresAt] =
    useState<Date | null>(null);

  const [timeLeft, setTimeLeft] =
    useState("");

  const [refundExpanded, setRefundExpanded] =
    useState(false);

  const [paymentLoading, setPaymentLoading] =
    useState(false);


  /* =======================================================
     BOOKING EXPIRY TIMER
  ======================================================= */

  useEffect(() => {

    if (!expiresAt) {
      return;
    }

    const interval = setInterval(() => {

      const diff =
        expiresAt.getTime() - Date.now();

      if (diff <= 0) {

        clearInterval(interval);

        setTimeLeft("00:00");

        setLocation(
          `/booking-failed/${params?.bookingId}`
        );

        return;
      }

      const minutes =
        Math.floor(diff / 60000);

      const seconds =
        Math.floor(
          (diff % 60000) / 1000
        );

      setTimeLeft(
        `${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")}`
      );

    }, 1000);

    return () =>
      clearInterval(interval);

  }, [
    expiresAt,
    params?.bookingId,
    setLocation,
  ]);


  /* =======================================================
     FETCH BOOKING
  ======================================================= */

  useEffect(() => {

    console.log(
      "Booking page mounted. bookingId:",
      params?.bookingId
    );

    if (!params?.bookingId) {

      console.error(
        "Booking ID is missing"
      );

      setLoading(false);

      return;
    }

    fetchBooking(
      params.bookingId
    );

  }, [params?.bookingId]);


  async function fetchBooking(
    bookingId: string
  ) {

    try {

      setLoading(true);

      console.log(
        "Fetching booking:",
        bookingId
      );

      const { data } =
        await bookingsApi.getBookingDetails(
          Number(bookingId)
        );

      console.log(
        "BOOKING DETAILS RESPONSE:",
        data
      );

      setBooking(data);

    } catch (err: any) {

      console.error(
        "BOOKING FETCH ERROR:",
        err
      );

      console.error(
        "STATUS:",
        err?.response?.status
      );

      console.error(
        "RESPONSE:",
        err?.response?.data
      );

      toast.error(
        err?.response?.data?.message ||
        "Failed to load booking."
      );

      setBooking(null);

    } finally {

      setLoading(false);

    }

  }


  /* =======================================================
     CONTINUE TO PAYMENT
  ======================================================= */

  async function continueToPayment() {

    if (!booking) {
      return;
    }

    try {

      setPaymentLoading(true);

      const { data } =
        await paymentsApi.createOrder(
          booking.bookingId
        );

      setExpiresAt(
        new Date(data.expiresAt)
      );

      await openRazorpay({
        bookingId: booking.bookingId,
        order: data,
        setLocation,
      });

    } catch (err: any) {

      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to continue to payment."
      );

    } finally {

      setPaymentLoading(false);

    }

  }


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <MainLayout>

        <div
          className="
            container
            py-20
            text-center
          "
        >

          <p
            className="
              text-muted-foreground
            "
          >
            Loading booking...
          </p>

        </div>

      </MainLayout>

    );

  }


  /* =======================================================
     BOOKING NOT FOUND
  ======================================================= */

  if (!booking) {

    return (

      <MainLayout>

        <div
          className="
            container
            py-20
            text-center
          "
        >

          <h1
            className="
              mb-4
              font-serif
              text-3xl
              font-bold
              text-espresso
            "
          >
            Booking Not Found
          </h1>

          <button
            onClick={() =>
              setLocation("/")
            }
            className="
              font-medium
              text-bronze
              transition
              hover:text-bronze-dark
            "
          >
            Go Back
          </button>

        </div>

      </MainLayout>

    );

  }


  /* =======================================================
     CALCULATIONS
  ======================================================= */

  const nights = Math.max(
    1,
    Math.ceil(
      (
        new Date(
          booking.checkOutDate
        ).getTime() -
        new Date(
          booking.checkInDate
        ).getTime()
      ) /
        (1000 * 60 * 60 * 24)
    )
  );


  /*
   * Calculate hourly duration.
   *
   * Example:
   *
   * 16:00 -> 18:00 = 2 Hours
   *
   * 10:00 -> 14:00 = 4 Hours
   */

  const calculateHours = (
    checkIn: string,
    checkOut: string
  ) => {

    const [
      inHour,
      inMinute,
    ] =
      checkIn
        .split(":")
        .map(Number);

    const [
      outHour,
      outMinute,
    ] =
      checkOut
        .split(":")
        .map(Number);

    const startMinutes =
      inHour * 60 +
      inMinute;

    const endMinutes =
      outHour * 60 +
      outMinute;

    /*
     * Normally hourly bookings
     * are on the same day.
     *
     * Handle midnight crossing
     * safely as well.
     */

    let duration =
      endMinutes -
      startMinutes;

    if (duration < 0) {
      duration += 24 * 60;
    }

    return duration / 60;
  };


  const hourlyDuration =
    booking.bookingMode === "HOURLY" &&
    booking.checkInTime &&
    booking.checkOutTime
      ? calculateHours(
          booking.checkInTime,
          booking.checkOutTime
        )
      : 0;


  const total =
    Number(booking.amount) || 0;


  /*
   * Current frontend calculation.
   *
   * 85% room charge
   * 15% taxes
   */

  const subtotal =
    Math.round(
      total * 0.85
    );


  const taxes =
    total - subtotal;


  /* =======================================================
     REFUND POLICY
  ======================================================= */

  const calculateRefundPercentage = (
    checkInDate: string
  ) => {

    const today = new Date();

    const checkIn =
      new Date(checkInDate);

    /*
     * Compare dates only,
     * similar to LocalDate.
     */

    today.setHours(
      0,
      0,
      0,
      0
    );

    checkIn.setHours(
      0,
      0,
      0,
      0
    );

    const diffMs =
      checkIn.getTime() -
      today.getTime();

    const days =
      Math.floor(
        diffMs /
          (1000 * 60 * 60 * 24)
      );


    if (days >= 7) {
      return 100;
    }

    if (days >= 3) {
      return 75;
    }

    if (days >= 1) {
      return 50;
    }

    return 0;

  };


  const refundPercentage =
    calculateRefundPercentage(
      booking.checkInDate
    );


  const estimatedRefund =
    Math.round(
      total *
        (refundPercentage / 100)
    );


  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = (
    date: string
  ) => {

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );

  };


  /* =======================================================
     FORMAT TIME
  ======================================================= */

  const formatTime = (
    time: string
  ) => {

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


  /* =======================================================
     FORMAT CURRENCY
  ======================================================= */

  const formatCurrency = (
    amount: number
  ) => {

    return amount.toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    );

  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <MainLayout>

      <div
        className="
          container
          py-8
          md:py-10
        "
      >

        {/* =================================================
            BACK
        ================================================= */}

        <button
          onClick={() =>
            setLocation("/")
          }
          className="
            mb-8
            flex
            items-center
            gap-2
            text-muted-foreground
            transition-colors
            hover:text-espresso
          "
        >

          <ArrowLeft
            className="h-4 w-4"
          />

          <span>
            Back
          </span>

        </button>


        {/* =================================================
            HEADER
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
          className="mb-8"
        >

          <h1
            className="
              font-serif
              text-3xl
              font-bold
              text-espresso
              md:text-4xl
            "
          >
            Booking
          </h1>

          <p
            className="
              mt-2
              text-muted-foreground
            "
          >
            Review your reservation before
            continuing to payment.
          </p>

        </motion.div>


        {/* =================================================
            PAYMENT TIMER
        ================================================= */}

        {expiresAt && (

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              mb-8
              rounded-2xl
              border
              border-orange-300
              bg-orange-50
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <span
                className="
                  text-lg
                "
              >
                🔒
              </span>

              <p
                className="
                  font-semibold
                  text-orange-700
                "
              >
                Room Reserved
              </p>

            </div>


            <div
              className="
                mt-4
                text-center
              "
            >

              <p
                className="
                  text-sm
                  text-muted-foreground
                "
              >
                Complete payment within
              </p>

              <h2
                className="
                  mt-2
                  text-5xl
                  font-bold
                  text-orange-600
                "
              >
                {timeLeft}
              </h2>

              <p
                className="
                  mt-3
                  text-sm
                  text-orange-700
                "
              >
                Your reservation will be
                released automatically after
                the timer expires.
              </p>

            </div>

          </motion.div>

        )}


        {/* =================================================
            MAIN TWO COLUMN LAYOUT
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            gap-8
            lg:grid-cols-5
          "
        >


          {/* =================================================
              LEFT — BOOKING INFORMATION
          ================================================= */}

          <div
            className="
              lg:col-span-3
            "
          >

            <motion.div
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.4,
              }}
            >


              {/* =========================================
                  BOOKING INFORMATION
              ========================================== */}

              <div
                className="
                  rounded-2xl
                  border
                  border-warm-stone/20
                  bg-white
                  p-6
                  shadow-warm
                  md:p-7
                "
              >

                <div className="mb-6">

                  <h2
                    className="
                      font-serif
                      text-2xl
                      font-semibold
                      text-espresso
                    "
                  >
                    Booking Information
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-muted-foreground
                    "
                  >
                    Details of your reservation.
                  </p>

                </div>


                <div
                  className="
                    space-y-5
                  "
                >

                  {/* Hotel */}

                  <div>

                    <p
                      className="
                        text-xs
                        font-medium
                        uppercase
                        tracking-widest
                        text-muted-foreground
                      "
                    >
                      Hotel
                    </p>

                    <p
                      className="
                        mt-1
                        font-semibold
                        text-espresso
                      "
                    >
                      {booking.hotelName}
                    </p>

                  </div>


                  {/* Location */}

                  <div>

                    <p
                      className="
                        text-xs
                        font-medium
                        uppercase
                        tracking-widest
                        text-muted-foreground
                      "
                    >
                      Location
                    </p>

                    <p
                      className="
                        mt-1
                        text-espresso
                      "
                    >
                      {booking.city}
                    </p>

                  </div>


                  {/* Room */}

                  <div>

                    <p
                      className="
                        text-xs
                        font-medium
                        uppercase
                        tracking-widest
                        text-muted-foreground
                      "
                    >
                      Room Type
                    </p>

                    <p
                      className="
                        mt-1
                        font-medium
                        text-espresso
                      "
                    >
                      {booking.roomType}
                    </p>

                  </div>


                  {/* Booking Mode */}

                  <div>

                    <p
                      className="
                        text-xs
                        font-medium
                        uppercase
                        tracking-widest
                        text-muted-foreground
                      "
                    >
                      Booking Mode
                    </p>

                    <p
                      className="
                        mt-1
                        font-medium
                        text-espresso
                      "
                    >
                      {booking.bookingMode === "HOURLY"
                        ? "Hourly"
                        : "Daily"}
                    </p>

                  </div>


                  {/* =================================================
                      DATES
                  ================================================= */}

                  <div
                    className="
                      grid
                      grid-cols-1
                      gap-4
                      sm:grid-cols-2
                    "
                  >

                    {/* Check In */}

                    <div
                      className="
                        rounded-xl
                        bg-cream/50
                        p-4
                      "
                    >

                      <p
                        className="
                          text-xs
                          font-medium
                          uppercase
                          tracking-widest
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
                        {formatDate(
                          booking.checkInDate
                        )}
                      </p>


                      {/* =================================================
                          ONLY SHOW TIME FOR HOURLY
                      ================================================= */}

                      {booking.bookingMode === "HOURLY" &&
                        booking.checkInTime && (

                          <p
                            className="
                              mt-1
                              text-sm
                              font-medium
                              text-muted-foreground
                            "
                          >
                            {formatTime(
                              booking.checkInTime
                            )}
                          </p>

                        )}

                    </div>


                    {/* Check Out */}

                    <div
                      className="
                        rounded-xl
                        bg-cream/50
                        p-4
                      "
                    >

                      <p
                        className="
                          text-xs
                          font-medium
                          uppercase
                          tracking-widest
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
                        {formatDate(
                          booking.checkOutDate
                        )}
                      </p>


                      {/* =================================================
                          ONLY SHOW TIME FOR HOURLY
                      ================================================= */}

                      {booking.bookingMode === "HOURLY" &&
                        booking.checkOutTime && (

                          <p
                            className="
                              mt-1
                              text-sm
                              font-medium
                              text-muted-foreground
                            "
                          >
                            {formatTime(
                              booking.checkOutTime
                            )}
                          </p>

                        )}

                    </div>

                  </div>


                  {/* =================================================
                      GUESTS + DURATION
                  ================================================= */}

                  <div
                    className="
                      grid
                      grid-cols-1
                      gap-4
                      sm:grid-cols-2
                    "
                  >

                    {/* Guests */}

                    <div
                      className="
                        rounded-xl
                        border
                        border-warm-stone/20
                        p-4
                      "
                    >

                      <p
                        className="
                          text-xs
                          font-medium
                          uppercase
                          tracking-widest
                          text-muted-foreground
                        "
                      >
                        Guests
                      </p>

                      <p
                        className="
                          mt-1
                          font-semibold
                          text-espresso
                        "
                      >

                        {booking.adultCount} Adult
                        {booking.adultCount !== 1
                          ? "s"
                          : ""}

                        {" · "}

                        {booking.childCount} Child
                        {booking.childCount !== 1
                          ? "ren"
                          : ""}

                      </p>

                    </div>


                    {/* =================================================
                        DURATION
                    ================================================= */}

                    <div
                      className="
                        rounded-xl
                        border
                        border-warm-stone/20
                        p-4
                      "
                    >

                      <p
                        className="
                          text-xs
                          font-medium
                          uppercase
                          tracking-widest
                          text-muted-foreground
                        "
                      >
                        Stay Duration
                      </p>


                      <p
                        className="
                          mt-1
                          font-semibold
                          text-espresso
                        "
                      >

                        {booking.bookingMode === "HOURLY"
                          ? `${hourlyDuration} ${
                              hourlyDuration === 1
                                ? "Hour"
                                : "Hours"
                            }`
                          : `${nights} ${
                              nights === 1
                                ? "Night"
                                : "Nights"
                            }`
                        }

                      </p>

                    </div>

                  </div>

                </div>

              </div>


              {/* =========================================
                  WHAT HAPPENS NEXT
              ========================================== */}

              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-warm-stone/20
                  bg-white
                  p-6
                  shadow-warm
                  md:p-7
                "
              >

                <h2
                  className="
                    font-serif
                    text-2xl
                    font-semibold
                    text-espresso
                  "
                >
                  What Happens Next
                </h2>


                <div
                  className="
                    mt-6
                    space-y-5
                  "
                >

                  {/* Step 1 */}

                  <div
                    className="
                      flex
                      gap-4
                    "
                  >

                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-bronze/10
                        text-sm
                        font-bold
                        text-bronze
                      "
                    >
                      01
                    </div>

                    <div>

                      <h3
                        className="
                          font-semibold
                          text-espresso
                        "
                      >
                        Complete payment
                      </h3>

                      <p
                        className="
                          mt-1
                          text-sm
                          leading-relaxed
                          text-muted-foreground
                        "
                      >
                        Complete your payment
                        securely through Razorpay
                        to confirm the reservation.
                      </p>

                    </div>

                  </div>


                  {/* Step 2 */}

                  <div
                    className="
                      flex
                      gap-4
                    "
                  >

                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-bronze/10
                        text-sm
                        font-bold
                        text-bronze
                      "
                    >
                      02
                    </div>

                    <div>

                      <h3
                        className="
                          font-semibold
                          text-espresso
                        "
                      >
                        Booking confirmed
                      </h3>

                      <p
                        className="
                          mt-1
                          text-sm
                          leading-relaxed
                          text-muted-foreground
                        "
                      >
                        After successful payment,
                        your booking will be confirmed
                        and your room reservation secured.
                      </p>

                    </div>

                  </div>


                  {/* Step 3 */}

                  <div
                    className="
                      flex
                      gap-4
                    "
                  >

                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-bronze/10
                        text-sm
                        font-bold
                        text-bronze
                      "
                    >
                      03
                    </div>

                    <div>

                      <h3
                        className="
                          font-semibold
                          text-espresso
                        "
                      >
                        Manage your booking
                      </h3>

                      <p
                        className="
                          mt-1
                          text-sm
                          leading-relaxed
                          text-muted-foreground
                        "
                      >
                        After payment, manage your
                        reservation and add individual
                        guest details from My Bookings.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </motion.div>

          </div>


          {/* =================================================
              RIGHT — PAYMENT
          ================================================= */}

          <div
            className="
              lg:col-span-2
            "
          >

            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.4,
              }}
              className="
                sticky
                top-24
              "
            >


              {/* =========================================
                  PAYMENT SUMMARY
              ========================================== */}

              <div
                className="
                  rounded-2xl
                  border
                  border-warm-stone/20
                  bg-white
                  p-6
                  shadow-warm
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <h2
                    className="
                      font-serif
                      text-2xl
                      font-semibold
                      text-espresso
                    "
                  >
                    Payment Summary
                  </h2>

                  <CreditCard
                    className="
                      h-6
                      w-6
                      text-bronze
                    "
                  />

                </div>


                <div
                  className="
                    mt-6
                    space-y-4
                  "
                >

                  {/* Subtotal */}

                  <div
                    className="
                      flex
                      justify-between
                      gap-4
                    "
                  >

                    <span
                      className="
                        text-muted-foreground
                      "
                    >
                      Room Charges
                    </span>

                    <span
                      className="
                        font-medium
                        text-espresso
                      "
                    >
                      ₹
                      {formatCurrency(
                        subtotal
                      )}
                    </span>

                  </div>


                  {/* Taxes */}

                  <div
                    className="
                      flex
                      justify-between
                      gap-4
                    "
                  >

                    <span
                      className="
                        text-muted-foreground
                      "
                    >
                      Taxes
                    </span>

                    <span
                      className="
                        font-medium
                        text-espresso
                      "
                    >
                      ₹
                      {formatCurrency(
                        taxes
                      )}
                    </span>

                  </div>


                  <hr
                    className="
                      border-warm-stone/20
                    "
                  />


                  {/* Total */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >

                    <span
                      className="
                        text-lg
                        font-semibold
                        text-espresso
                      "
                    >
                      Total
                    </span>

                    <span
                      className="
                        text-2xl
                        font-bold
                        text-bronze
                      "
                    >
                      ₹
                      {formatCurrency(
                        total
                      )}
                    </span>

                  </div>

                </div>


                {/* =================================================
                    PAYMENT BUTTON
                ================================================= */}

                <button
                  onClick={
                    continueToPayment
                  }
                  disabled={
                    paymentLoading
                  }
                  className="
                    mt-7
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-bronze
                    py-3.5
                    font-semibold
                    text-white
                    transition
                    hover:bg-bronze-dark
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {paymentLoading ? (

                    <>

                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-white/30
                          border-t-white
                        "
                      />

                      Processing...

                    </>

                  ) : (

                    <>

                      <CreditCard
                        className="
                          h-4
                          w-4
                        "
                      />

                      Continue to Payment

                    </>

                  )}

                </button>


                <div
                  className="
                    mt-4
                    flex
                    items-center
                    justify-center
                    gap-2
                    text-xs
                    text-muted-foreground
                  "
                >

                  <ShieldCheck
                    className="
                      h-4
                      w-4
                      text-green-600
                    "
                  />

                  Secure payments powered
                  by Razorpay.

                </div>

              </div>


              {/* =========================================
                  REFUND POLICY
              ========================================== */}

              <div
                className="
                  mt-5
                  overflow-hidden
                  rounded-2xl
                  border
                  border-warm-stone/20
                  bg-white
                  shadow-warm
                "
              >

                {/* Policy Header */}

                <button
                  type="button"
                  onClick={() =>
                    setRefundExpanded(
                      !refundExpanded
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-4
                    p-5
                    text-left
                    transition
                    hover:bg-cream/40
                  "
                >

                  <div>

                    <h3
                      className="
                        font-semibold
                        text-espresso
                      "
                    >
                      Cancellation & Refund Policy
                    </h3>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-muted-foreground
                      "
                    >

                      {refundPercentage}% refund
                      applicable based on
                      your check-in date.

                    </p>

                  </div>


                  {refundExpanded ? (

                    <ChevronUp
                      className="
                        h-5
                        w-5
                        shrink-0
                        text-muted-foreground
                      "
                    />

                  ) : (

                    <ChevronDown
                      className="
                        h-5
                        w-5
                        shrink-0
                        text-muted-foreground
                      "
                    />

                  )}

                </button>


                {/* Expanded Policy */}

                {refundExpanded && (

                  <div
                    className="
                      border-t
                      border-warm-stone/20
                      bg-cream/30
                      p-5
                    "
                  >

                    {/* Current policy */}

                    <div
                      className="
                        rounded-xl
                        border
                        border-bronze/20
                        bg-white
                        p-4
                      "
                    >

                      <div
                        className="
                          flex
                          items-start
                          gap-3
                        "
                      >

                        <CheckCircle2
                          className="
                            mt-0.5
                            h-5
                            w-5
                            shrink-0
                            text-bronze
                          "
                        />

                        <div>

                          <p
                            className="
                              font-semibold
                              text-espresso
                            "
                          >
                            Current applicable refund
                          </p>

                          <p
                            className="
                              mt-1
                              text-2xl
                              font-bold
                              text-bronze
                            "
                          >
                            {refundPercentage}%
                          </p>

                          <p
                            className="
                              mt-1
                              text-sm
                              text-muted-foreground
                            "
                          >
                            Estimated refund:
                            {" "}
                            ₹
                            {formatCurrency(
                              estimatedRefund
                            )}
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* Policy Rules */}

                    <div
                      className="
                        mt-5
                        space-y-3
                      "
                    >

                      <p
                        className="
                          text-sm
                          font-semibold
                          text-espresso
                        "
                      >
                        Refund rules
                      </p>


                      {/* 7+ days */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          rounded-lg
                          bg-white
                          px-4
                          py-3
                          text-sm
                        "
                      >

                        <span
                          className="
                            text-muted-foreground
                          "
                        >
                          7+ days before check-in
                        </span>

                        <span
                          className="
                            font-semibold
                            text-green-600
                          "
                        >
                          100%
                        </span>

                      </div>


                      {/* 3-6 days */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          rounded-lg
                          bg-white
                          px-4
                          py-3
                          text-sm
                        "
                      >

                        <span
                          className="
                            text-muted-foreground
                          "
                        >
                          3–6 days before check-in
                        </span>

                        <span
                          className="
                            font-semibold
                            text-espresso
                          "
                        >
                          75%
                        </span>

                      </div>


                      {/* 1-2 days */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          rounded-lg
                          bg-white
                          px-4
                          py-3
                          text-sm
                        "
                      >

                        <span
                          className="
                            text-muted-foreground
                          "
                        >
                          1–2 days before check-in
                        </span>

                        <span
                          className="
                            font-semibold
                            text-espresso
                          "
                        >
                          50%
                        </span>

                      </div>


                      {/* Same day */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          rounded-lg
                          bg-white
                          px-4
                          py-3
                          text-sm
                        "
                      >

                        <span
                          className="
                            text-muted-foreground
                          "
                        >
                          Same day / past check-in
                        </span>

                        <span
                          className="
                            font-semibold
                            text-red-600
                          "
                        >
                          0%
                        </span>

                      </div>

                    </div>


                    <p
                      className="
                        mt-4
                        text-xs
                        leading-relaxed
                        text-muted-foreground
                      "
                    >
                      Refund eligibility is determined
                      according to the cancellation policy
                      applicable to your booking.
                    </p>

                  </div>

                )}

              </div>

            </motion.div>

          </div>

        </div>

      </div>

    </MainLayout>

  );

}