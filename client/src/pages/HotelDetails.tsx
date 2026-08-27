import { useEffect, useState } from "react";
import { useLocation, useRoute, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

import {
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowLeft,
  X,
  MessageSquare,
  Clock,
} from "lucide-react";

import MainLayout from "@/layouts/MainLayout";
import { HotelCardSkeleton } from "@/components/Skeleton";
import { toast } from "sonner";

import { hotelsApi } from "@/api";

import {
  bookingsApi,
  type BookingRequest,
  type PriceQuote,
} from "@/api/bookings";
import { useAuth } from "@/contexts/AuthContext";

import { mapHotelInfo } from "@/mappers/hotelInfoMapper";
import { mapRooms } from "@/mappers/roomMapper";

import {
  reviewsApi,
  type ReviewResponse,
} from "@/api/reviews";
import { StringifyOptions } from "node:querystring";

/* =========================================================
   TYPES
   ========================================================= */

type BookingMode = "DAILY" | "HOURLY";

interface Hotel {
  id?: string | number;
  [key: string]: unknown;
}

interface Room {
  type: string;
  capacity?: number;
  price?: number | string;
  image?: string;
  [key: string]: unknown;
}



/* =========================================================
   COMPONENT
   ========================================================= */

export default function HotelDetails() {
  const [, params] = useRoute<{ hotelId: string }>(
    "/hotel/:hotelId"
  );

  const [, setLocation] = useLocation();

  const search = useSearch();

  const searchParams =
    new URLSearchParams(search);

  const { isAuthenticated } = useAuth();

  /* =======================================================
     HOTEL
     ======================================================= */

  const [hotel, setHotel] =
    useState<any>(null);

  const [rooms, setRooms] =
    useState<Room[]>([]);

  const [loading, setLoading] =
    useState(true);

  /* =======================================================
     GALLERY
     ======================================================= */

  const [currentImage, setCurrentImage] =
    useState(0);

  const [galleryOpen, setGalleryOpen] =
    useState(false);

  /* =======================================================
     BOOKING
     ======================================================= */

  const [bookingMode, setBookingMode] =
    useState<BookingMode>(
      searchParams.get("bookingMode") === "HOURLY"
        ? "HOURLY"
        : "DAILY"
    );

  const [checkInDate, setCheckInDate] =
    useState(
      searchParams.get("checkInDate") || ""
    );

  const [checkOutDate, setCheckOutDate] =
    useState(
      searchParams.get("checkOutDate") || ""
    );

  const [checkInTime, setCheckInTime] =
    useState(
      searchParams.get("checkInTime") || ""
    );

  const [checkOutTime, setCheckOutTime] =
    useState(
      searchParams.get("checkOutTime") || ""
    );

  const [adults, setAdults] =
    useState(
      Number(searchParams.get("adults")) || 2
    );

  const [children, setChildren] =
    useState(
      Number(searchParams.get("children")) || 0
    );

  /* =======================================================
     PRICE QUOTE
     ======================================================= */

  const [quote, setQuote] =
    useState<PriceQuote | null>(null);

  const [quoteLoading, setQuoteLoading] =
    useState(false);

  const [selectedRoomType, setSelectedRoomType] =
    useState<string | null>(null);

  /* =======================================================
     REVIEWS
     ======================================================= */

  const [reviews, setReviews] =
    useState<ReviewResponse[]>([]);

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  const [reviewPage, setReviewPage] =
    useState(0);

  const [totalReviewPages, setTotalReviewPages] =
    useState(0);

  /* =======================================================
     DATE
     ======================================================= */

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  /* =======================================================
     FETCH HOTEL
     ======================================================= */

  useEffect(() => {
    const fetchHotel = async () => {
      if (!params?.hotelId) {
        return;
      }

      try {
        setLoading(true);

        const { data } =
          await hotelsApi.getHotelInfo(
            Number(params.hotelId)
          );

        setHotel(
          mapHotelInfo(data)
        );

        setRooms(
          mapRooms(data.rooms)
        );
      } catch (error) {
        console.error(
          "Failed to load hotel",
          error
        );

        toast.error(
          "Failed to load hotel"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [params?.hotelId]);

  /* =======================================================
     REVIEWS
     ======================================================= */

  useEffect(() => {
    if (!params?.hotelId) {
      return;
    }

    loadReviews();
  }, [
    params?.hotelId,
    reviewPage,
  ]);

  async function loadReviews() {
    if (!params?.hotelId) {
      return;
    }

    try {
      setReviewsLoading(true);

      const { data } =
        await reviewsApi.getHotelReviews(
          Number(params.hotelId),
          reviewPage,
          10
        );

      setReviews(
        data.content
      );

      setTotalReviewPages(
        data.totalPages
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        "Unable to load reviews."
      );
    } finally {
      setReviewsLoading(false);
    }
  }

  /* =======================================================
     CLEAR QUOTE
     ======================================================= */

  const clearQuote = () => {
    setQuote(null);
    setSelectedRoomType(null);
  };

  /* =======================================================
     BOOKING MODE
     ======================================================= */

  const handleBookingModeChange = (
    mode: BookingMode
  ) => {
    setBookingMode(mode);

    clearQuote();

    if (mode === "DAILY") {
      setCheckInTime("");
      setCheckOutTime("");
    }

    if (
      mode === "HOURLY" &&
      checkInDate
    ) {
      setCheckOutDate(
        checkInDate
      );
    }
  };

  /* =======================================================
     CHECK-IN DATE
     ======================================================= */

  const handleCheckInDateChange = (
    value: string
  ) => {
    setCheckInDate(value);

    clearQuote();

    if (bookingMode === "HOURLY") {
      setCheckOutDate(value);
      return;
    }

    if (
      checkOutDate &&
      value >= checkOutDate
    ) {
      setCheckOutDate("");
    }
  };

  /* =======================================================
     CHECK-OUT DATE
     ======================================================= */

  const handleCheckOutDateChange = (
    value: string
  ) => {
    clearQuote();

    if (bookingMode === "HOURLY") {
      setCheckOutDate(
        checkInDate
      );
      return;
    }

    setCheckOutDate(value);
  };

  /* =======================================================
     HOURLY DURATION VALIDATION
     ======================================================= */

  const validateHourlyDuration = (): boolean => {
    if (
      !checkInTime ||
      !checkOutTime
    ) {
      toast.error(
        "Please select check-in and check-out time"
      );

      return false;
    }

    if (
      checkInDate !== checkOutDate
    ) {
      toast.error(
        "Hourly booking must be on the same date"
      );

      return false;
    }

    const [
      checkInHour,
      checkInMinute,
    ] =
      checkInTime
        .split(":")
        .map(Number);

    const [
      checkOutHour,
      checkOutMinute,
    ] =
      checkOutTime
        .split(":")
        .map(Number);

    const startMinutes =
      checkInHour * 60 +
      checkInMinute;

    const endMinutes =
      checkOutHour * 60 +
      checkOutMinute;

    const duration =
      endMinutes - startMinutes;

    if (duration <= 0) {
      toast.error(
        "Check-out time must be after check-in time"
      );

      return false;
    }

    if (duration < 60) {
      toast.error(
        "Hourly booking must be at least one hour"
      );

      return false;
    }

    if (duration % 60 !== 0) {
      toast.error(
        "Hourly booking duration must be in whole hours"
      );

      return false;
    }

    return true;
  };

  /* =======================================================
     GET PRICE QUOTE
     ======================================================= */

    const handleGetQuote = async (room: Room) => {

  // -------------------------------------------------------
  // AUTH
  // -------------------------------------------------------

  if (!isAuthenticated) {
    toast.error("Please login to continue");
    setLocation("/login");
    return;
  }

  // -------------------------------------------------------
  // DATE VALIDATION
  // -------------------------------------------------------

  if (!checkInDate || !checkOutDate) {
    toast.error(
      "Please select check-in and check-out dates"
    );
    return;
  }

  // -------------------------------------------------------
  // DAILY VALIDATION
  // -------------------------------------------------------

  if (bookingMode === "DAILY") {

    if (checkOutDate <= checkInDate) {
      toast.error(
        "Check-out date must be after check-in date"
      );
      return;
    }
  }

  // -------------------------------------------------------
  // HOURLY VALIDATION
  // -------------------------------------------------------

  if (bookingMode === "HOURLY") {

    if (!validateHourlyDuration()) {
      return;
    }
  }

  // -------------------------------------------------------
  // CREATE QUOTE
  // -------------------------------------------------------

  try {

    setQuoteLoading(true);
    setQuote(null);
    setSelectedRoomType(room.type);

    // IMPORTANT:
    // request MUST be declared before using it
    const request: BookingRequest = {
      hotelId: Number(hotel.id),

      roomType: room.type,

      checkInDate: checkInDate,

      checkOutDate: checkOutDate,

      adultCount: adults,

      childCount: children,

      bookingMode: bookingMode,
    };

    // -----------------------------------------------------
    // HOURLY TIME
    // -----------------------------------------------------

    if (bookingMode === "HOURLY") {

      request.checkInTime = checkInTime;

      request.checkOutTime = checkOutTime;
    }

    console.log(
      "QUOTE REQUEST:",
      request
    );

    // -----------------------------------------------------
    // SEPARATE BACKEND APIs
    // -----------------------------------------------------

    const response =
      bookingMode === "DAILY"
        ? await bookingsApi.createDailyQuote(request)
        : await bookingsApi.createHourlyQuote(request);

    const data = response.data;

    console.log(
      "QUOTE RESPONSE:",
      data
    );

    setQuote(data);

  } catch (error: any) {

    console.error(
      "Quote creation failed:",
      error
    );

    setQuote(null);

    toast.error(
      error?.response?.data?.message ||
      "Unable to calculate price"
    );

  } finally {

    setQuoteLoading(false);

  }
};

  /* =======================================================
     INITIALIZE BOOKING
     ======================================================= */

  const handleBooking = async (
    room: Room
  ) => {

    if (!quote) {
      toast.error(
        "Please check the price first"
      );

      return;
    }

    if (
      quote.roomType !==
      room.type
    ) {
      toast.error(
        "Please check the price for this room type"
      );

      return;
    }

    try {

      const request: BookingRequest = {

        hotelId:
          Number(hotel.id),

        quoteId:
          quote.quoteId,

        roomType:
          room.type,

        checkInDate,

        checkOutDate,

        adultCount:
          adults,

        childCount:
          children,

        bookingMode,
      };

      /* ---------------------------------------------
         TIME ONLY FOR HOURLY
         --------------------------------------------- */

      if (
        bookingMode === "HOURLY"
      ) {

        request.checkInTime =
          checkInTime;

        request.checkOutTime =
          checkOutTime;
      }

      const { data } =
        await bookingsApi.init(request);

      console.log("INIT BOOKING RESPONSE:", data);
      console.log("BOOKING ID:", data.id);

      setLocation(`/booking/${data.id}`);

    } catch (error: any) {

      console.error(
        "Failed to initiate booking:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
        "Failed to initiate booking"
      );
    }
  };

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {

    return (
      <MainLayout>

        <div className="container py-20">

          <HotelCardSkeleton />

        </div>

      </MainLayout>
    );
  }

  /* =======================================================
     HOTEL NOT FOUND
     ======================================================= */

  if (!hotel) {

    return (
      <MainLayout>

        <div className="
          container
          py-20
          text-center
        ">

          <h1 className="
            font-serif
            text-3xl
            text-espresso
            mb-4
          ">
            Hotel Not Found
          </h1>

          <button
            onClick={() =>
              setLocation("/")
            }
            className="
              text-bronze
              hover:text-bronze-dark
              font-medium
            "
          >
            Go back home
          </button>

        </div>

      </MainLayout>
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <MainLayout>

      {/* ===================================================
          BACK
          =================================================== */}

      <div className="
        container
        pt-6
      ">

        <button
          onClick={() =>
            setLocation(
              `/search${search || ""}`
            )
          }
          className="
            flex
            items-center
            gap-2
            text-muted-foreground
            hover:text-espresso
            transition-colors
          "
        >

          <ArrowLeft className="
            w-4
            h-4
          " />

          <span className="
            text-sm
            font-medium
          ">
            Back to results
          </span>

        </button>

      </div>

      {/* ===================================================
          GALLERY
          =================================================== */}

      <section className="
        container
        mt-4
      ">

        <div className="
          grid
          grid-cols-1
          md:grid-cols-4
          gap-2
          rounded-2xl
          overflow-hidden
        ">

          <div
            className="
              md:col-span-2
              md:row-span-2
              relative
              cursor-pointer
              group
            "
            onClick={() =>
              setGalleryOpen(true)
            }
          >

            <img
              src={
                hotel.images[
                currentImage
                ]
              }
              alt={hotel.name}
              className="
                w-full
                h-64
                md:h-full
                object-cover
                group-hover:scale-105
                transition-transform
                duration-500
              "
            />

          </div>

          {hotel.images
            .slice(1, 3)
            .map(
              (
                img: string,
                i: number
              ) => (

                <div
                  key={i}
                  className="
                    relative
                    cursor-pointer
                    group
                  "
                  onClick={() => {
                    setCurrentImage(
                      i + 1
                    );

                    setGalleryOpen(
                      true
                    );
                  }}
                >

                  <img
                    src={img}
                    alt={`${hotel.name}-${i}`}
                    className="
                      w-full
                      h-40
                      md:h-48
                      object-cover
                      group-hover:scale-105
                      transition-transform
                      duration-500
                    "
                  />

                </div>

              )
            )}

        </div>

      </section>

      {/* ===================================================
          MAIN CONTENT
          =================================================== */}

      <section className="
        container
        mt-8
        pb-16
      ">

        <div className="
          grid
          grid-cols-1
          lg:grid-cols-3
          gap-8
        ">

          {/* =================================================
              LEFT
              ================================================= */}

          <div className="
            lg:col-span-2
            space-y-8
          ">

            {/* HOTEL HEADER */}

            <div>

              <div className="
                flex
                items-start
                justify-between
                gap-4
              ">

                <div>

                  <h1 className="
                    font-serif
                    text-3xl
                    md:text-4xl
                    font-bold
                    text-espresso
                  ">
                    {hotel.name}
                  </h1>

                  <div className="
                    flex
                    items-center
                    gap-2
                    mt-2
                  ">

                    <MapPin className="
                      w-4
                      h-4
                      text-bronze
                    " />

                    <span className="
                      text-sm
                      text-muted-foreground
                    ">
                      {hotel.location.address}
                    </span>

                  </div>

                </div>

                <div className="
                  flex
                  items-center
                  gap-1
                  bg-cream
                  px-3
                  py-1.5
                  rounded-full
                  shrink-0
                ">

                  <Star className="
                    w-4
                    h-4
                    fill-bronze
                    text-bronze
                  " />

                  <span className="
                    font-semibold
                    text-espresso
                  ">
                    {hotel.rating.toFixed(1)}
                  </span>

                  <span className="
                    text-xs
                    text-muted-foreground
                    ml-1
                  ">
                    ({hotel.reviewCount} reviews)
                  </span>

                </div>

              </div>

            </div>

            {/* DESCRIPTION */}

            <div>

              <p className="
                text-espresso/80
                leading-relaxed
              ">
                {hotel.description}
              </p>

            </div>

            {/* AMENITIES */}

            <div>

              <h2 className="
                font-serif
                text-xl
                font-semibold
                text-espresso
                mb-4
              ">
                Amenities
              </h2>

              <div className="
                grid
                grid-cols-2
                md:grid-cols-4
                gap-3
              ">

                {hotel.amenities.map(
                  (
                    amenity: string
                  ) => (

                    <div
                      key={amenity}
                      className="
                        flex
                        items-center
                        gap-2
                        bg-cream
                        rounded-xl
                        px-4
                        py-3
                      "
                    >

                      <Check className="
                        w-4
                        h-4
                        text-bronze
                        shrink-0
                      " />

                      <span className="
                        text-sm
                        text-espresso
                      ">
                        {amenity}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* =================================================
                ROOM TYPES
                ================================================= */}

            <div>

              <h2 className="
                font-serif
                text-xl
                font-semibold
                text-espresso
                mb-4
              ">
                Available Room Types
              </h2>

              {rooms.length === 0 ? (

                <div className="
                  bg-white
                  rounded-xl
                  p-8
                  text-center
                  shadow-warm
                ">

                  <p className="
                    text-muted-foreground
                  ">
                    No rooms available.
                  </p>

                </div>

              ) : (

                <div className="
                  space-y-4
                ">

                  {rooms.map(
                    (
                      room,
                      index
                    ) => {

                      const isSelected =
                        selectedRoomType ===
                        room.type;

                      const isQuoted =
                        isSelected &&
                        quote &&
                        quote.roomType ===
                        room.type;

                      return (

                        <motion.div
                          key={room.type}
                          initial={{
                            opacity: 0,
                            y: 10,
                          }}
                          whileInView={{
                            opacity: 1,
                            y: 0,
                          }}
                          viewport={{
                            once: true,
                          }}
                          transition={{
                            delay:
                              index * 0.1,
                          }}
                          className={`
                            bg-white
                            rounded-xl
                            overflow-hidden
                            shadow-warm
                            border
                            ${isSelected
                              ? "border-bronze"
                              : "border-warm-stone/20"
                            }
                          `}
                        >

                          <div className="
                            flex
                            flex-col
                            md:flex-row
                          ">

                            {/* IMAGE */}

                            <img
                              src={
                                room.image ||
                                hotel.images[0]
                              }
                              alt={room.type}
                              className="
                                w-full
                                md:w-64
                                h-48
                                object-cover
                              "
                            />

                            {/* DETAILS */}

                            <div className="
                              flex-1
                              p-5
                            ">

                              <div className="
                                flex
                                items-start
                                justify-between
                                gap-4
                              ">

                                <div>

                                  <h3 className="
                                    font-serif
                                    text-xl
                                    font-semibold
                                    text-espresso
                                  ">
                                    {room.type}
                                  </h3>

                                  <p className="
                                    text-sm
                                    text-muted-foreground
                                    mt-2
                                  ">
                                    Up to{" "}
                                    {room.capacity}{" "}
                                    guests
                                  </p>

                                </div>

                                <div className="
                                  text-right
                                  shrink-0
                                ">

                                  {!isQuoted ? (

                                    <>
                                      <p className="
                                        text-sm
                                        text-muted-foreground
                                      ">
                                        Starting from
                                      </p>

                                      <p className="
                                        text-2xl
                                        font-bold
                                        text-espresso
                                      ">
                                        ₹
                                        {Number(
                                          room.price
                                        ).toLocaleString()}
                                      </p>
                                    </>

                                  ) : (

                                    <>
                                      <p className="
                                        text-sm
                                        text-muted-foreground
                                      ">
                                        Final price
                                      </p>

                                      <p className="
                                        text-2xl
                                        font-bold
                                        text-bronze
                                      ">
                                        ₹
                                        {Number(
                                          quote?.finalPrice
                                        ).toLocaleString()}
                                      </p>
                                    </>

                                  )}

                                </div>

                              </div>

                              {/* QUOTE */}

                              {isQuoted && (

                                <div className="
                                  mt-4
                                  rounded-xl
                                  bg-cream
                                  p-4
                                ">

                                  <div className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                  ">

                                    <div>

                                      <p className="
                                        text-xs
                                        text-muted-foreground
                                      ">
                                        Dynamic price
                                      </p>

                                      <p className="
                                        font-semibold
                                        text-espresso
                                      ">
                                        ₹
                                        {Number(
                                          quote?.finalPrice
                                        ).toLocaleString()}
                                      </p>

                                    </div>

                                    <span className="
                                      rounded-full
                                      bg-bronze/10
                                      px-3
                                      py-1
                                      text-xs
                                      font-medium
                                      text-bronze
                                    ">
                                      Quote created
                                    </span>

                                  </div>

                                </div>

                              )}

                              {/* ACTION */}

                              <div className="
                                mt-5
                                flex
                                flex-col
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                                gap-3
                              ">

                                <p className="
                                  text-xs
                                  text-muted-foreground
                                ">
                                  Price depends on
                                  your selected
                                  dates, time and
                                  booking mode.
                                </p>

                                {!isQuoted ? (

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleGetQuote(
                                        room
                                      )
                                    }
                                    disabled={
                                      quoteLoading
                                    }
                                    className="
                                      shrink-0
                                      bg-bronze
                                      hover:bg-bronze-dark
                                      disabled:opacity-50
                                      disabled:cursor-not-allowed
                                      text-white
                                      font-medium
                                      px-6
                                      py-2.5
                                      rounded-xl
                                      transition-all
                                      text-sm
                                    "
                                  >
                                    {quoteLoading &&
                                      isSelected
                                      ? "Calculating..."
                                      : "Check Price"}
                                  </button>

                                ) : (

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleBooking(
                                        room
                                      )
                                    }
                                    className="
                                      shrink-0
                                      bg-bronze
                                      hover:bg-bronze-dark
                                      text-white
                                      font-semibold
                                      px-6
                                      py-2.5
                                      rounded-xl
                                      transition-all
                                      text-sm
                                    "
                                  >
                                    Reserve Room
                                  </button>

                                )}

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

            {/* =================================================
                REVIEWS
                ================================================= */}

            <div>

              <h2 className="
                font-serif
                text-xl
                font-semibold
                text-espresso
                mb-4
              ">
                Guest Reviews
              </h2>

              {reviewsLoading ? (

                <div className="
                  bg-white
                  rounded-xl
                  p-8
                  text-center
                  shadow-warm
                ">
                  Loading reviews...
                </div>

              ) : reviews.length === 0 ? (

                <div className="
                  bg-white
                  rounded-xl
                  p-8
                  text-center
                  shadow-warm
                ">

                  <MessageSquare className="
                    w-8
                    h-8
                    text-muted-foreground
                    mx-auto
                    mb-2
                  " />

                  <p className="
                    text-muted-foreground
                  ">
                    No reviews yet.
                  </p>

                </div>

              ) : (

                <div className="
                  space-y-4
                ">

                  {reviews.map(
                    (review) => (

                      <div
                        key={
                          review.reviewId
                        }
                        className="
                          bg-white
                          rounded-xl
                          p-6
                          shadow-warm
                          border
                          border-warm-stone/20
                        "
                      >

                        <div className="
                          flex
                          items-start
                          gap-4
                        ">

                          <div className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-bronze/10
                          ">

                            <span className="
                              text-sm
                              font-semibold
                              text-bronze
                            ">
                              {review.guestName
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "G"}
                            </span>

                          </div>

                          <div className="
                            flex-1
                          ">

                            <div className="
                              flex
                              flex-col
                              gap-2
                              sm:flex-row
                              sm:items-center
                              sm:justify-between
                            ">

                              <p className="
                                font-semibold
                                text-espresso
                              ">
                                {
                                  review.guestName ||
                                  "Guest"
                                }
                              </p>

                              <div className="
                                flex
                                items-center
                                gap-1
                              ">

                                {Array.from({
                                  length: 5,
                                }).map(
                                  (_, i) => (

                                    <Star
                                      key={i}
                                      className={`
                                        w-4
                                        h-4
                                        ${i <
                                          review.rating
                                          ? "fill-bronze text-bronze"
                                          : "text-warm-stone/40"
                                        }
                                      `}
                                    />

                                  )
                                )}

                              </div>

                            </div>

                            <p className="
                              mt-1
                              text-xs
                              text-muted-foreground
                            ">
                              {new Date(
                                review.createdAt
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>

                            <p className="
                              mt-3
                              leading-relaxed
                              text-muted-foreground
                            ">
                              {review.comment}
                            </p>

                          </div>

                        </div>

                      </div>

                    )
                  )}

                  {totalReviewPages > 1 && (

                    <div className="
                      mt-6
                      flex
                      items-center
                      justify-center
                      gap-4
                    ">

                      <button
                        disabled={
                          reviewPage === 0
                        }
                        onClick={() =>
                          setReviewPage(
                            (prev) =>
                              prev - 1
                          )
                        }
                        className="
                          flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-warm-stone/30
                          px-4
                          py-2
                          text-sm
                          disabled:opacity-40
                        "
                      >

                        <ChevronLeft className="
                          h-4
                          w-4
                        " />

                        Previous

                      </button>

                      <span className="
                        text-sm
                        text-muted-foreground
                      ">
                        Page{" "}
                        {reviewPage + 1}{" "}
                        of{" "}
                        {totalReviewPages}
                      </span>

                      <button
                        disabled={
                          reviewPage >=
                          totalReviewPages - 1
                        }
                        onClick={() =>
                          setReviewPage(
                            (prev) =>
                              prev + 1
                          )
                        }
                        className="
                          flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-warm-stone/30
                          px-4
                          py-2
                          text-sm
                          disabled:opacity-40
                        "
                      >

                        Next

                        <ChevronRight className="
                          h-4
                          w-4
                        " />

                      </button>

                    </div>

                  )}

                </div>

              )}

            </div>

          </div>

          {/* =================================================
              BOOKING SIDEBAR
              ================================================= */}

          <div>

            <div className="
              sticky
              top-24
              bg-white
              rounded-2xl
              shadow-warm
              border
              border-warm-stone/20
              p-6
            ">

              {/* BOOKING MODE */}

              <div className="
                mb-6
              ">

                <p className="
                  text-sm
                  text-muted-foreground
                  mb-2
                ">
                  Booking Type
                </p>

                <div className="
                  flex
                  rounded-xl
                  bg-cream
                  p-1
                ">

                  <button
                    type="button"
                    onClick={() =>
                      handleBookingModeChange(
                        "DAILY"
                      )
                    }
                    className={`
                      flex-1
                      rounded-lg
                      py-2
                      text-sm
                      font-medium
                      ${bookingMode ===
                        "DAILY"
                        ? "bg-bronze text-white"
                        : "text-espresso"
                      }
                    `}
                  >
                    Daily
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleBookingModeChange(
                        "HOURLY"
                      )
                    }
                    className={`
                      flex-1
                      rounded-lg
                      py-2
                      text-sm
                      font-medium
                      ${bookingMode ===
                        "HOURLY"
                        ? "bg-bronze text-white"
                        : "text-espresso"
                      }
                    `}
                  >
                    Hourly
                  </button>

                </div>

              </div>

              {/* =================================================
                  DATES / TIMES
                  ================================================= */}

              <div className="
                space-y-4
              ">

                {/* CHECK IN DATE */}

                <div>

                  <label className="
                    text-sm
                    font-medium
                    text-espresso
                    mb-1
                    block
                  ">
                    Check In
                  </label>

                  <input
                    type="date"
                    value={checkInDate}
                    min={today}
                    onChange={(e) =>
                      handleCheckInDateChange(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-warm-stone/30
                      bg-cream
                      px-4
                      py-3
                      focus:outline-none
                      focus:ring-2
                      focus:ring-bronze/20
                    "
                  />

                </div>

                {/* HOURLY CHECK-IN TIME */}

                {bookingMode ===
                  "HOURLY" && (

                    <div>

                      <label className="
                        text-sm
                        font-medium
                        text-espresso
                        mb-1
                        block
                      ">
                        Check In Time
                      </label>

                      <div className="
                        relative
                      ">

                        <Clock
                          className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            w-4
                            h-4
                            text-bronze
                          "
                        />

                        <input
                          type="time"
                          value={
                            checkInTime
                          }
                          onChange={(e) => {

                            setCheckInTime(
                              e.target.value
                            );

                            clearQuote();
                          }}
                          className="
                            w-full
                            rounded-xl
                            border
                            border-warm-stone/30
                            bg-cream
                            px-4
                            py-3
                            pl-11
                            focus:outline-none
                            focus:ring-2
                            focus:ring-bronze/20
                          "
                        />

                      </div>

                    </div>

                  )}

                {/* CHECK OUT DATE */}

                <div>

                  <label className="
                    text-sm
                    font-medium
                    text-espresso
                    mb-1
                    block
                  ">
                    Check Out
                  </label>

                  <input
                    type="date"
                    value={checkOutDate}
                    min={
                      checkInDate ||
                      today
                    }
                    max={
                      bookingMode ===
                        "HOURLY"
                        ? checkInDate
                        : undefined
                    }
                    onChange={(e) =>
                      handleCheckOutDateChange(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-warm-stone/30
                      bg-cream
                      px-4
                      py-3
                      focus:outline-none
                      focus:ring-2
                      focus:ring-bronze/20
                    "
                  />

                </div>

                {/* HOURLY CHECK-OUT TIME */}

                {bookingMode ===
                  "HOURLY" && (

                    <div>

                      <label className="
                        text-sm
                        font-medium
                        text-espresso
                        mb-1
                        block
                      ">
                        Check Out Time
                      </label>

                      <div className="
                        relative
                      ">

                        <Clock
                          className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            w-4
                            h-4
                            text-bronze
                          "
                        />

                        <input
                          type="time"
                          value={
                            checkOutTime
                          }
                          onChange={(e) => {

                            setCheckOutTime(
                              e.target.value
                            );

                            clearQuote();
                          }}
                          className="
                            w-full
                            rounded-xl
                            border
                            border-warm-stone/30
                            bg-cream
                            px-4
                            py-3
                            pl-11
                            focus:outline-none
                            focus:ring-2
                            focus:ring-bronze/20
                          "
                        />

                      </div>

                    </div>

                  )}

                {/* =================================================
                    GUESTS
                    ================================================= */}

                <div className="
                  grid
                  grid-cols-2
                  gap-4
                ">

                  {/* ADULTS */}

                  <div>

                    <label className="
                      text-sm
                      font-medium
                      text-espresso
                      mb-1
                      block
                    ">
                      Adults
                    </label>

                    <input
                      type="number"
                      min={1}
                      value={adults}
                      onChange={(e) => {

                        setAdults(
                          Math.max(
                            1,
                            Number(
                              e.target.value
                            )
                          )
                        );

                        clearQuote();
                      }}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-warm-stone/30
                        bg-cream
                        px-4
                        py-3
                      "
                    />

                  </div>

                  {/* CHILDREN */}

                  <div>

                    <label className="
                      text-sm
                      font-medium
                      text-espresso
                      mb-1
                      block
                    ">
                      Children
                    </label>

                    <input
                      type="number"
                      min={0}
                      value={children}
                      onChange={(e) => {

                        setChildren(
                          Math.max(
                            0,
                            Number(
                              e.target.value
                            )
                          )
                        );

                        clearQuote();
                      }}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-warm-stone/30
                        bg-cream
                        px-4
                        py-3
                      "
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  CURRENT QUOTE
                  ================================================= */}

              {quote && (

                <div className="
                  mt-6
                  rounded-xl
                  bg-cream
                  p-4
                ">

                  <p className="
                    text-xs
                    text-muted-foreground
                  ">
                    Selected room
                  </p>

                  <p className="
                    font-semibold
                    text-espresso
                  ">
                    {quote.roomType}
                  </p>

                  <div className="
                    mt-3
                    flex
                    items-center
                    justify-between
                  ">

                    <span className="
                      text-sm
                      text-muted-foreground
                    ">
                      Final price
                    </span>

                    <span className="
                      text-xl
                      font-bold
                      text-bronze
                    ">
                      ₹
                      {Number(
                        quote.finalPrice
                      ).toLocaleString()}
                    </span>

                  </div>

                </div>

              )}

              <p className="
                mt-5
                text-xs
                leading-relaxed
                text-muted-foreground
              ">
                Select a room type above
                to calculate the final
                dynamic price.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          GALLERY MODAL
          ===================================================== */}

      <AnimatePresence>

        {galleryOpen && (

          <motion.div
            className="
              fixed
              inset-0
              z-50
              bg-black/90
              flex
              items-center
              justify-center
            "
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
          >

            {/* CLOSE */}

            <button
              onClick={() =>
                setGalleryOpen(false)
              }
              className="
                absolute
                top-6
                right-6
                text-white
              "
            >

              <X className="
                w-8
                h-8
              " />

            </button>

            {/* PREVIOUS */}

            <button
              onClick={() =>
                setCurrentImage(
                  (prev) =>
                    prev === 0
                      ? hotel.images.length - 1
                      : prev - 1
                )
              }
              className="
                absolute
                left-6
                text-white
              "
            >

              <ChevronLeft className="
                w-10
                h-10
              " />

            </button>

            {/* IMAGE */}

            <img
              src={
                hotel.images[
                currentImage
                ]
              }
              alt={hotel.name}
              className="
                max-h-[85vh]
                max-w-[90vw]
                rounded-xl
              "
            />

            {/* NEXT */}

            <button
              onClick={() =>
                setCurrentImage(
                  (prev) =>
                    prev ===
                      hotel.images.length - 1
                      ? 0
                      : prev + 1
                )
              }
              className="
                absolute
                right-6
                text-white
              "
            >

              <ChevronRight className="
                w-10
                h-10
              " />

            </button>

          </motion.div>

        )}

      </AnimatePresence>

    </MainLayout>
  );
}