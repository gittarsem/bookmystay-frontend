import { useEffect, useMemo, useRef, useState } from "react";
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
  Users,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
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

/* =========================================================
   TYPES
   ========================================================= */

type BookingMode = "DAILY" | "HOURLY";

interface PendingQuote {
  hotelId: number;
  roomType: RoomType;
  bookingMode: BookingMode;
  checkInDate: string;
  checkOutDate: string;
  checkInTime: string;
  checkOutTime: string;
  adults: number;
  children: number;
}

type RoomType =
  | "STANDARD"
  | "DOUBLE"
  | "DELUXE"
  | "SUITE"
  | "FAMILY";

interface Room {
  id: number;
  type: RoomType;
  capacity: number;
  image?: string;
}

interface RoomTypePricing {
  roomType: RoomType;
  hourlyPrice: number | string;
  dailyPrice: number | string;
  capacity: number;
  totalRooms: number;
}

interface HourlyAdjustment {
  originalCheckIn: string;
  originalCheckOut: string;
  adjustedCheckOut: string;
  originalDurationMinutes: number;
  adjustedDurationMinutes: number;
  remainingMinutes: number;
  direction: "EARLIER" | "LATER";
}

/* =========================================================
   HARD-CODED ROOM TYPE IMAGES
   DO NOT CHANGE
   ========================================================= */

const ROOM_TYPE_IMAGES: Record<RoomType, string> = {
  STANDARD:
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85",

  DOUBLE:
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85",

  DELUXE:
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85",

  SUITE:
    "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=85",

  FAMILY:
    "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=85",
};

/* =========================================================
   ROOM TYPE LABELS
   ========================================================= */

const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  STANDARD: "Standard Room",
  DOUBLE: "Double Room",
  DELUXE: "Deluxe Room",
  SUITE: "Suite",
  FAMILY: "Family Room",
};

/* =========================================================
   HELPERS
   ========================================================= */

function formatRoomType(type: string): string {
  return (
    ROOM_TYPE_LABELS[type as RoomType] ||
    type
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  );
}

function formatPrice(
  value: number | string | null | undefined
): string | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return numericValue.toLocaleString("en-IN");
}

function getMinutesFromTime(time: string): number {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

function formatTimeValue(totalMinutes: number): string {
  const normalized =
    ((totalMinutes % 1440) + 1440) % 1440;

  const hours = Math.floor(
    normalized / 60
  );

  const minutes = normalized % 60;

  return `${String(hours).padStart(
    2,
    "0"
  )}:${String(minutes).padStart(2, "0")}`;
}

function formatDuration(
  minutes: number
): string {
  const hours = Math.floor(
    minutes / 60
  );

  const remainingMinutes =
    minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} minute${
      remainingMinutes === 1
        ? ""
        : "s"
    }`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    }`;
  }

  return `${hours} hour${
    hours === 1 ? "" : "s"
  } ${remainingMinutes} minute${
    remainingMinutes === 1
      ? ""
      : "s"
  }`;
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function HotelDetails() {
  const [, params] = useRoute<{
    hotelId: string;
  }>("/hotel/:hotelId");

  const [, setLocation] =
    useLocation();

  const search = useSearch();

  const searchParams =
    new URLSearchParams(search);

  const {
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  /* =======================================================
     HOTEL
     ======================================================= */

  const [hotel, setHotel] =
    useState<any>(null);

  const [rooms, setRooms] =
    useState<Room[]>([]);

  const [roomTypePricing, setRoomTypePricing] =
    useState<RoomTypePricing[]>([]);

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
      searchParams.get(
        "bookingMode"
      ) === "HOURLY"
        ? "HOURLY"
        : "DAILY"
    );

  const [checkInDate, setCheckInDate] =
    useState(
      searchParams.get(
        "checkInDate"
      ) || ""
    );

  const [checkOutDate, setCheckOutDate] =
    useState(
      searchParams.get(
        "checkOutDate"
      ) || ""
    );

  const [checkInTime, setCheckInTime] =
    useState(
      searchParams.get(
        "checkInTime"
      ) || ""
    );

  const [checkOutTime, setCheckOutTime] =
    useState(
      searchParams.get(
        "checkOutTime"
      ) || ""
    );

  const [adults, setAdults] =
    useState(
      Number(
        searchParams.get("adults")
      ) || 2
    );

  const [children, setChildren] =
    useState(
      Number(
        searchParams.get("children")
      ) || 0
    );

  /* =======================================================
     HOURLY ADJUSTMENT
     ======================================================= */

  const [hourlyAdjustment, setHourlyAdjustment] =
    useState<HourlyAdjustment | null>(
      null
    );

  /* =======================================================
     PRICE QUOTE
     ======================================================= */

  const [quote, setQuote] =
    useState<PriceQuote | null>(
      null
    );

  const [quoteLoading, setQuoteLoading] =
    useState(false);

  const [selectedRoomType, setSelectedRoomType] =
    useState<RoomType | null>(
      null
    );

  const pendingQuoteHandled = useRef(false);

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

        console.log(
          "FULL HOTEL RESPONSE:",
          data
        );

        console.log(
          "ROOMS:",
          data.rooms
        );

        console.log(
          "ROOM TYPES:",
          data.roomTypes
        );

        setHotel(
          mapHotelInfo(data)
        );

        setRooms(
          mapRooms(
            data.rooms
          ) as Room[]
        );

        setRoomTypePricing(
          (data.roomTypes ||
            []) as RoomTypePricing[]
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
        error?.response?.data
          ?.message ||
          "Unable to load reviews."
      );
    } finally {
      setReviewsLoading(false);
    }
  }

  /* =======================================================
     ROOM TYPE PRICING LOOKUP
     ======================================================= */

  const pricingByRoomType =
    useMemo(() => {
      return new Map(
        roomTypePricing.map(
          (pricing) => [
            pricing.roomType,
            pricing,
          ]
        )
      );
    }, [roomTypePricing]);

  /* =======================================================
     UNIQUE ROOM TYPES
     ======================================================= */

  const uniqueRoomTypes =
    useMemo(() => {
      const seen =
        new Set<RoomType>();

      return rooms.filter(
        (room) => {
          if (
            seen.has(room.type)
          ) {
            return false;
          }

          seen.add(room.type);

          return true;
        }
      );
    }, [rooms]);

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

    setHourlyAdjustment(null);

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

    setHourlyAdjustment(null);

    if (
      bookingMode === "HOURLY"
    ) {
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

    setHourlyAdjustment(null);

    if (
      bookingMode === "HOURLY"
    ) {
      setCheckOutDate(
        checkInDate
      );

      return;
    }

    setCheckOutDate(value);
  };

  /* =======================================================
     HOURLY ADJUSTMENT CALCULATION
     ======================================================= */

  const getHourlyAdjustment =
    (
      overrideCheckInTime = checkInTime,
      overrideCheckOutTime = checkOutTime,
      overrideCheckInDate = checkInDate,
      overrideCheckOutDate = checkOutDate
    ): HourlyAdjustment | null => {
      if (
        !overrideCheckInTime ||
        !overrideCheckOutTime
      ) {
        return null;
      }

      if (
        overrideCheckInDate !==
        overrideCheckOutDate
      ) {
        return null;
      }

      const startMinutes =
        getMinutesFromTime(
          overrideCheckInTime
        );

      const endMinutes =
        getMinutesFromTime(
          overrideCheckOutTime
        );

      let duration =
        endMinutes -
        startMinutes;

      /*
       * Same-day hourly bookings are
       * expected, so a negative duration
       * is invalid rather than being
       * treated as overnight.
       */
      if (duration <= 0) {
        return null;
      }

      if (duration < 60) {
        return null;
      }

      if (duration % 60 === 0) {
        return null;
      }

      const completeHours =
        Math.floor(
          duration / 60
        );

      const remainingMinutes =
        duration % 60;

      const previousWholeHour =
        completeHours * 60;

      const nextWholeHour =
        (completeHours + 1) * 60;

      const distanceToPrevious =
        duration -
        previousWholeHour;

      const distanceToNext =
        nextWholeHour -
        duration;

      let adjustedDuration: number;

      let direction:
        | "EARLIER"
        | "LATER";

      /*
       * Nearest complete hour wins.
       *
       * Example:
       * 2h 1m -> 2h
       * 2h 29m -> 2h
       * 2h 31m -> 3h
       *
       * On an exact tie, choose the
       * earlier checkout.
       */
      if (
        distanceToPrevious <=
        distanceToNext
      ) {
        adjustedDuration =
          previousWholeHour;

        direction = "EARLIER";
      } else {
        adjustedDuration =
          nextWholeHour;

        direction = "LATER";
      }

      /*
       * Never allow a zero-hour
       * adjustment.
       */
      if (
        adjustedDuration < 60
      ) {
        adjustedDuration = 60;
      }

      const adjustedCheckoutMinutes =
        startMinutes +
        adjustedDuration;

      /*
       * We only support same-day
       * hourly bookings.
       */
      if (
        adjustedCheckoutMinutes >=
        1440
      ) {
        return null;
      }

      return {
        originalCheckIn:
          overrideCheckInTime,

        originalCheckOut:
          overrideCheckOutTime,

        adjustedCheckOut:
          formatTimeValue(
            adjustedCheckoutMinutes
          ),

        originalDurationMinutes:
          duration,

        adjustedDurationMinutes:
          adjustedDuration,

        remainingMinutes,

        direction,
      };
    };

  /* =======================================================
     APPLY HOURLY ADJUSTMENT
     ======================================================= */

  const applyHourlyAdjustment =
    () => {
      if (!hourlyAdjustment) {
        return;
      }

      const adjustedTime =
        hourlyAdjustment.adjustedCheckOut;

      setCheckOutTime(
        adjustedTime
      );

      /*
       * The previous quote was
       * calculated using the old
       * checkout time, therefore it
       * MUST be invalidated.
       */
      clearQuote();

      setHourlyAdjustment(null);

      toast.success(
        `Check-out adjusted to ${adjustedTime}. Please check the price again.`
      );
    };

  /* =======================================================
     CANCEL HOURLY ADJUSTMENT
     ======================================================= */

  const cancelHourlyAdjustment =
    () => {
      setHourlyAdjustment(null);
    };


  /* =======================================================
     GET PRICE QUOTE
     ======================================================= */

  const handleGetQuote = async (
    room: Room,
    overrides?: Partial<PendingQuote>
  ) => {
    const currentBookingMode =
      overrides?.bookingMode ?? bookingMode;
    const currentCheckInDate =
      overrides?.checkInDate ?? checkInDate;
    const currentCheckOutDate =
      overrides?.checkOutDate ?? checkOutDate;
    const currentCheckInTime =
      overrides?.checkInTime ?? checkInTime;
    const currentCheckOutTime =
      overrides?.checkOutTime ?? checkOutTime;
    const currentAdults =
      overrides?.adults ?? adults;
    const currentChildren =
      overrides?.children ?? children;

    if (!isAuthenticated) {
      const returnTo =
        window.location.pathname +
        window.location.search;

      const pendingQuote: PendingQuote = {
        hotelId: Number(params?.hotelId),
        roomType: room.type,
        bookingMode: currentBookingMode,
        checkInDate: currentCheckInDate,
        checkOutDate: currentCheckOutDate,
        checkInTime: currentCheckInTime,
        checkOutTime: currentCheckOutTime,
        adults: currentAdults,
        children: currentChildren,
      };

      sessionStorage.setItem(
        "bookmystay_pending_quote",
        JSON.stringify(pendingQuote)
      );

      toast.info("Please login to continue");

      setLocation(
        `/login?returnTo=${encodeURIComponent(returnTo)}`
      );

      return;
    }

    if (
      !currentCheckInDate ||
      !currentCheckOutDate
    ) {
      toast.error(
        "Please select check-in and check-out dates"
      );

      return;
    }

    if (
      currentBookingMode === "DAILY"
    ) {
      if (
        currentCheckOutDate <=
        currentCheckInDate
      ) {
        toast.error(
          "Check-out date must be after check-in date"
        );

        return;
      }
    }

    /* =====================================================
       HOURLY VALIDATION + ADJUSTMENT
       ===================================================== */

    if (
      currentBookingMode === "HOURLY"
    ) {
      if (
        !currentCheckInTime ||
        !currentCheckOutTime
      ) {
        toast.error(
          "Please select check-in and check-out time"
        );

        return;
      }

      if (
        currentCheckInDate !==
        currentCheckOutDate
      ) {
        toast.error(
          "Hourly booking must be on the same date"
        );

        return;
      }

      const startMinutes =
        getMinutesFromTime(
          currentCheckInTime
        );

      const endMinutes =
        getMinutesFromTime(
          currentCheckOutTime
        );

      const duration =
        endMinutes -
        startMinutes;

      if (duration <= 0) {
        toast.error(
          "Check-out time must be after check-in time"
        );

        return;
      }

      if (duration < 60) {
        toast.error(
          "Hourly booking must be at least one hour"
        );

        return;
      }

      /*
       * IMPORTANT:
       *
       * Do not call the backend when
       * the duration contains minutes.
       *
       * First ask the user whether
       * the checkout time should be
       * adjusted.
       */
      if (
        duration % 60 !== 0
      ) {
        const adjustment =
          getHourlyAdjustment(
            currentCheckInTime,
            currentCheckOutTime,
            currentCheckInDate,
            currentCheckOutDate
          );

        if (adjustment) {
          setHourlyAdjustment(
            adjustment
          );

          return;
        }

        toast.error(
          "Hourly booking duration must be in whole hours"
        );

        return;
      }

      /*
       * The exact whole-hour duration
       * has already been validated above.
       */
    }

    try {
      setQuoteLoading(true);

      setQuote(null);

      setSelectedRoomType(
        room.type
      );

      const request: BookingRequest =
        {
          hotelId:
            Number(hotel.id),

          roomType:
            room.type,

          checkInDate:
            currentCheckInDate,

          checkOutDate:
            currentCheckOutDate,

          adultCount:
            currentAdults,

          childCount:
            currentChildren,

          bookingMode:
            currentBookingMode,
        };

      if (
        currentBookingMode ===
        "HOURLY"
      ) {
        request.checkInTime =
          currentCheckInTime;

        request.checkOutTime =
          currentCheckOutTime;
      }

      console.log(
        "QUOTE REQUEST:",
        request
      );

      const response =
        currentBookingMode ===
        "DAILY"
          ? await bookingsApi.createDailyQuote(
              request
            )
          : await bookingsApi.createHourlyQuote(
              request
            );

      const data =
        response.data;

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
        error?.response?.data
          ?.message ||
          "Unable to calculate price"
      );
    } finally {
      setQuoteLoading(false);
    }
  };

  /* =======================================================
     RESTORE PENDING QUOTE AFTER LOGIN
     ======================================================= */

  useEffect(() => {
    if (
      authLoading ||
      !isAuthenticated ||
      loading ||
      rooms.length === 0 ||
      pendingQuoteHandled.current
    ) {
      return;
    }

    const stored =
      sessionStorage.getItem(
        "bookmystay_pending_quote"
      );

    if (!stored) {
      return;
    }

    try {
      const parsed =
        JSON.parse(stored) as Partial<PendingQuote>;

      if (
        Number(parsed.hotelId) !==
        Number(params?.hotelId)
      ) {
        return;
      }

      const room = rooms.find(
        (item) =>
          item.type === parsed.roomType
      );

      if (!room) {
        sessionStorage.removeItem(
          "bookmystay_pending_quote"
        );

        toast.error(
          "The selected room type is no longer available."
        );

        return;
      }

      const pending: PendingQuote = {
        hotelId:
          Number(parsed.hotelId),

        roomType:
          parsed.roomType as RoomType,

        bookingMode:
          parsed.bookingMode ===
          "HOURLY"
            ? "HOURLY"
            : "DAILY",

        checkInDate:
          parsed.checkInDate || "",

        checkOutDate:
          parsed.checkOutDate || "",

        checkInTime:
          parsed.checkInTime || "",

        checkOutTime:
          parsed.checkOutTime || "",

        adults:
          Number(parsed.adults) || 2,

        children:
          Number(parsed.children) || 0,
      };

      pendingQuoteHandled.current =
        true;

      setBookingMode(
        pending.bookingMode
      );

      setCheckInDate(
        pending.checkInDate
      );

      setCheckOutDate(
        pending.checkOutDate
      );

      setCheckInTime(
        pending.checkInTime
      );

      setCheckOutTime(
        pending.checkOutTime
      );

      setAdults(
        pending.adults
      );

      setChildren(
        pending.children
      );

      sessionStorage.removeItem(
        "bookmystay_pending_quote"
      );

      void handleGetQuote(
        room,
        pending
      );
    } catch (error) {
      console.error(
        "Failed to restore pending quote:",
        error
      );

      sessionStorage.removeItem(
        "bookmystay_pending_quote"
      );
    }
  }, [
    authLoading,
    isAuthenticated,
    loading,
    rooms,
    params?.hotelId,
    handleGetQuote,
  ]);

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

    /*
     * Final hourly guard.
     *
     * This prevents an invalid
     * duration from reaching
     * bookingsApi.init() even if
     * something changes between
     * quote creation and booking.
     */
    if (
      bookingMode ===
      "HOURLY"
    ) {
      if (
        !checkInTime ||
        !checkOutTime
      ) {
        toast.error(
          "Please select check-in and check-out time"
        );

        return;
      }

      if (
        checkInDate !==
        checkOutDate
      ) {
        toast.error(
          "Hourly booking must be on the same date"
        );

        return;
      }

      const startMinutes =
        getMinutesFromTime(
          checkInTime
        );

      const endMinutes =
        getMinutesFromTime(
          checkOutTime
        );

      const duration =
        endMinutes -
        startMinutes;

      if (duration <= 0) {
        toast.error(
          "Check-out time must be after check-in time"
        );

        return;
      }

      if (duration < 60) {
        toast.error(
          "Hourly booking must be at least one hour"
        );

        return;
      }

      if (
        duration % 60 !== 0
      ) {
        toast.error(
          "Please use a whole-hour duration before reserving the room"
        );

        return;
      }
    }

    try {
      const request: BookingRequest =
        {
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

      if (
        bookingMode ===
        "HOURLY"
      ) {
        request.checkInTime =
          checkInTime;

        request.checkOutTime =
          checkOutTime;
      }

      console.log(
        "INIT BOOKING REQUEST:",
        request
      );

      const { data } =
        await bookingsApi.init(
          request
        );

      console.log(
        "INIT BOOKING RESPONSE:",
        data
      );

      console.log(
        "BOOKING ID:",
        data.id
      );

      setLocation(
        `/booking/${data.id}`
      );
    } catch (error: any) {
      console.error(
        "Failed to initiate booking:",
        error
      );

      toast.error(
        error?.response?.data
          ?.message ||
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
        <div className="container py-20 text-center">
          <h1
            className="
              mb-4
              font-serif
              text-3xl
              text-espresso
            "
          >
            Hotel Not Found
          </h1>

          <button
            onClick={() =>
              setLocation("/")
            }
            className="
              font-medium
              text-bronze
              hover:text-bronze-dark
            "
          >
            Go back home
          </button>
        </div>
      </MainLayout>
    );
  }

  /* =======================================================
     SAFE HOTEL IMAGES
     ======================================================= */

  const hotelImages =
    Array.isArray(
      hotel.images
    ) &&
    hotel.images.length > 0
      ? hotel.images
      : [];

  /*
   * Main gallery shows a maximum
   * of 5 images.
   *
   * Fullscreen gallery still
   * contains ALL hotel images.
   */
  const visibleGalleryImages =
    hotelImages.slice(0, 5);

  const remainingImageCount =
    Math.max(
      hotelImages.length - 5,
      0
    );

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <MainLayout>
      {/* ===================================================
          BACK
          =================================================== */}

      <div className="container pt-6">
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
            transition-colors
            hover:text-espresso
          "
        >
          <ArrowLeft className="h-4 w-4" />

          <span className="text-sm font-medium">
            Back to results
          </span>
        </button>
      </div>

      {/* ===================================================
          HOTEL GALLERY
          =================================================== */}

      {hotelImages.length >
        0 && (
        <section className="container mt-4">
          <div
            className="
              grid
              grid-cols-2
              gap-2
              overflow-hidden
              rounded-2xl
              md:grid-cols-4
              md:grid-rows-2
              md:h-[520px]
            "
          >
            {visibleGalleryImages.map(
              (
                image: string,
                index: number
              ) => {
                const isMain =
                  index === 0;

                const isLastVisible =
                  index ===
                  visibleGalleryImages.length -
                    1;

                const showRemaining =
                  isLastVisible &&
                  remainingImageCount >
                    0;

                return (
                  <div
                    key={`${image}-${index}`}
                    onClick={() => {
                      setCurrentImage(
                        index
                      );

                      setGalleryOpen(
                        true
                      );
                    }}
                    className={`
                      group
                      relative
                      cursor-pointer
                      overflow-hidden
                      bg-cream

                      ${
                        isMain
                          ? "col-span-2 row-span-2 h-[320px] md:h-auto"
                          : "col-span-1 h-[180px] md:h-auto"
                      }
                    `}
                  >
                    <img
                      src={image}
                      alt={`${hotel.name} - photo ${
                        index + 1
                      }`}
                      loading={
                        index === 0
                          ? "eager"
                          : "lazy"
                      }
                      className="
                        block
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-500
                        ease-out
                        group-hover:scale-[1.04]
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-0
                        bg-black/0
                        transition-colors
                        duration-300
                        group-hover:bg-black/10
                      "
                    />

                    {showRemaining && (
                      <div
                        className="
                          absolute
                          inset-0
                          flex
                          items-center
                          justify-center
                          bg-black/35
                          transition-colors
                          duration-300
                          group-hover:bg-black/45
                        "
                      >
                        <span
                          className="
                            rounded-full
                            bg-black/55
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-white
                            backdrop-blur-sm
                          "
                        >
                          +
                          {
                            remainingImageCount
                          }{" "}
                          {remainingImageCount ===
                          1
                            ? "photo"
                            : "photos"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </section>
      )}

      {/* ===================================================
          MAIN CONTENT
          =================================================== */}

      <section
        className="
          container
          mt-8
          pb-16
        "
      >
        <div
          className="
            grid
            grid-cols-1
            gap-8
            lg:grid-cols-3
          "
        >
          {/* =================================================
              LEFT
              ================================================= */}

          <div
            className="
              space-y-8
              lg:col-span-2
            "
          >
            {/* HOTEL HEADER */}

            <div>
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >
                <div>
                  <h1
                    className="
                      font-serif
                      text-3xl
                      font-bold
                      text-espresso
                      md:text-4xl
                    "
                  >
                    {hotel.name}
                  </h1>

                  <div
                    className="
                      mt-2
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <MapPin
                      className="
                        h-4
                        w-4
                        text-bronze
                      "
                    />

                    <span
                      className="
                        text-sm
                        text-muted-foreground
                      "
                    >
                      {hotel.location
                        ?.address ||
                        hotel.city}
                    </span>
                  </div>
                </div>

                <div
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-1
                    rounded-full
                    bg-cream
                    px-3
                    py-1.5
                  "
                >
                  <Star
                    className="
                      h-4
                      w-4
                      fill-bronze
                      text-bronze
                    "
                  />

                  <span
                    className="
                      font-semibold
                      text-espresso
                    "
                  >
                    {Number(
                      hotel.rating || 0
                    ).toFixed(1)}
                  </span>

                  <span
                    className="
                      ml-1
                      text-xs
                      text-muted-foreground
                    "
                  >
                    (
                    {hotel.reviewCount ||
                      0}{" "}
                    reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}

            <div>
              <p
                className="
                  leading-relaxed
                  text-espresso/80
                "
              >
                {hotel.description}
              </p>
            </div>

            {/* AMENITIES */}

            <div>
              <h2
                className="
                  mb-4
                  font-serif
                  text-xl
                  font-semibold
                  text-espresso
                "
              >
                Amenities
              </h2>

              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                  md:grid-cols-4
                "
              >
                {hotel.amenities?.map(
                  (
                    amenity: string
                  ) => (
                    <div
                      key={amenity}
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-cream
                        px-4
                        py-3
                      "
                    >
                      <Check
                        className="
                          h-4
                          w-4
                          shrink-0
                          text-bronze
                        "
                      />

                      <span
                        className="
                          text-sm
                          text-espresso
                        "
                      >
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
              <h2
                className="
                  mb-4
                  font-serif
                  text-xl
                  font-semibold
                  text-espresso
                "
              >
                Available Room Types
              </h2>

              {uniqueRoomTypes.length ===
              0 ? (
                <div
                  className="
                    rounded-xl
                    bg-white
                    p-8
                    text-center
                    shadow-warm
                  "
                >
                  <p className="text-muted-foreground">
                    No rooms available.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uniqueRoomTypes.map(
                    (
                      room,
                      index
                    ) => {
                      const pricing =
                        pricingByRoomType.get(
                          room.type
                        );

                      const isSelected =
                        selectedRoomType ===
                        room.type;

                      const isQuoted =
                        isSelected &&
                        quote &&
                        quote.roomType ===
                          room.type;

                      const dailyPrice =
                        formatPrice(
                          pricing?.dailyPrice
                        );

                      const hourlyPrice =
                        formatPrice(
                          pricing?.hourlyPrice
                        );

                      const roomImage =
                        ROOM_TYPE_IMAGES[
                          room.type
                        ];

                      const totalRooms =
                        pricing?.totalRooms ??
                        uniqueRoomTypes.filter(
                          (item) =>
                            item.type ===
                            room.type
                        ).length;

                      return (
                        <motion.div
                          key={
                            room.type
                          }
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
                              index *
                              0.1,
                          }}
                          className={`
                            overflow-hidden
                            rounded-xl
                            border
                            bg-white
                            shadow-warm

                            ${
                              isSelected
                                ? "border-bronze"
                                : "border-warm-stone/20"
                            }
                          `}
                        >
                          <div
                            className="
                              flex
                              flex-col
                              md:flex-row
                            "
                          >
                            {/* ROOM IMAGE */}

                            <div
                              className="
                                relative
                                h-52
                                w-full
                                shrink-0
                                overflow-hidden
                                md:h-auto
                                md:w-64
                              "
                            >
                              <img
                                src={
                                  roomImage
                                }
                                alt={formatRoomType(
                                  room.type
                                )}
                                className="
                                  h-full
                                  w-full
                                  object-cover
                                  transition-transform
                                  duration-500
                                  hover:scale-105
                                "
                              />
                            </div>

                            {/* DETAILS */}

                            <div
                              className="
                                flex-1
                                p-5
                              "
                            >
                              <div
                                className="
                                  flex
                                  items-start
                                  justify-between
                                  gap-4
                                "
                              >
                                <div>
                                  <h3
                                    className="
                                      font-serif
                                      text-xl
                                      font-semibold
                                      text-espresso
                                    "
                                  >
                                    {formatRoomType(
                                      room.type
                                    )}
                                  </h3>

                                  <div
                                    className="
                                      mt-3
                                      flex
                                      flex-wrap
                                      items-center
                                      gap-x-4
                                      gap-y-2
                                    "
                                  >
                                    <div
                                      className="
                                        flex
                                        items-center
                                        gap-1.5
                                        text-sm
                                        text-muted-foreground
                                      "
                                    >
                                      <Users
                                        className="
                                          h-4
                                          w-4
                                          text-bronze
                                        "
                                      />

                                      <span>
                                        Up to{" "}
                                        {pricing?.capacity ||
                                          room.capacity}{" "}
                                        guests
                                      </span>
                                    </div>

                                    {totalRooms >
                                      0 && (
                                      <span
                                        className="
                                          text-sm
                                          text-muted-foreground
                                        "
                                      >
                                        {
                                          totalRooms
                                        }{" "}
                                        {totalRooms ===
                                        1
                                          ? "room"
                                          : "rooms"}{" "}
                                        available
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* PRICE */}

                                <div
                                  className="
                                    shrink-0
                                    text-right
                                  "
                                >
                                  {!isQuoted ? (
                                    <>
                                      <p
                                        className="
                                          text-sm
                                          text-muted-foreground
                                        "
                                      >
                                        {bookingMode ===
                                        "HOURLY"
                                          ? "From"
                                          : "Starting from"}
                                      </p>

                                      {bookingMode ===
                                      "HOURLY" ? (
                                        hourlyPrice ? (
                                          <p
                                            className="
                                              text-2xl
                                              font-bold
                                              text-espresso
                                            "
                                          >
                                            ₹
                                            {
                                              hourlyPrice
                                            }

                                            <span
                                              className="
                                                ml-1
                                                text-xs
                                                font-normal
                                                text-muted-foreground
                                              "
                                            >
                                              / hour
                                            </span>
                                          </p>
                                        ) : (
                                          <p
                                            className="
                                              text-sm
                                              text-muted-foreground
                                            "
                                          >
                                            Price unavailable
                                          </p>
                                        )
                                      ) : dailyPrice ? (
                                        <p
                                          className="
                                            text-2xl
                                            font-bold
                                            text-espresso
                                          "
                                        >
                                          ₹
                                          {
                                            dailyPrice
                                          }

                                          <span
                                            className="
                                              ml-1
                                              text-xs
                                              font-normal
                                              text-muted-foreground
                                            "
                                          >
                                            / night
                                          </span>
                                        </p>
                                      ) : (
                                        <p
                                          className="
                                            text-sm
                                            text-muted-foreground
                                          "
                                        >
                                          Price unavailable
                                        </p>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <p
                                        className="
                                          text-sm
                                          text-muted-foreground
                                        "
                                      >
                                        Final price
                                      </p>

                                      <p
                                        className="
                                          text-2xl
                                          font-bold
                                          text-bronze
                                        "
                                      >
                                        ₹
                                        {formatPrice(
                                          quote?.finalPrice
                                        ) ||
                                          "—"}
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* STATIC PRICING INFO */}

                              {!isQuoted &&
                                pricing && (
                                  <div
                                    className="
                                      mt-4
                                      flex
                                      flex-wrap
                                      gap-3
                                    "
                                  >
                                    {dailyPrice && (
                                      <div
                                        className="
                                          rounded-lg
                                          bg-cream
                                          px-3
                                          py-2
                                        "
                                      >
                                        <p
                                          className="
                                            text-[11px]
                                            text-muted-foreground
                                          "
                                        >
                                          Daily
                                        </p>

                                        <p
                                          className="
                                            text-sm
                                            font-semibold
                                            text-espresso
                                          "
                                        >
                                          ₹
                                          {
                                            dailyPrice
                                          }
                                        </p>
                                      </div>
                                    )}

                                    {hourlyPrice && (
                                      <div
                                        className="
                                          rounded-lg
                                          bg-cream
                                          px-3
                                          py-2
                                        "
                                      >
                                        <p
                                          className="
                                            text-[11px]
                                            text-muted-foreground
                                          "
                                        >
                                          Hourly
                                        </p>

                                        <p
                                          className="
                                            text-sm
                                            font-semibold
                                            text-espresso
                                          "
                                        >
                                          ₹
                                          {
                                            hourlyPrice
                                          }
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                              {/* QUOTE DETAILS */}

                              {isQuoted && (
                                <div
                                  className="
                                    mt-4
                                    rounded-xl
                                    bg-cream
                                    p-4
                                  "
                                >
                                  <div
                                    className="
                                      flex
                                      items-center
                                      justify-between
                                      gap-4
                                    "
                                  >
                                    <div>
                                      <p
                                        className="
                                          text-xs
                                          text-muted-foreground
                                        "
                                      >
                                        Dynamic price
                                      </p>

                                      <p
                                        className="
                                          font-semibold
                                          text-espresso
                                        "
                                      >
                                        ₹
                                        {formatPrice(
                                          quote?.finalPrice
                                        ) ||
                                          "—"}
                                      </p>
                                    </div>

                                    <span
                                      className="
                                        rounded-full
                                        bg-bronze/10
                                        px-3
                                        py-1
                                        text-xs
                                        font-medium
                                        text-bronze
                                      "
                                    >
                                      Quote created
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* ACTION */}

                              <div
                                className="
                                  mt-5
                                  flex
                                  flex-col
                                  gap-3
                                  sm:flex-row
                                  sm:items-center
                                  sm:justify-between
                                "
                              >
                                <p
                                  className="
                                    text-xs
                                    text-muted-foreground
                                  "
                                >
                                  Final price depends on
                                  your selected dates,
                                  time and booking mode.
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
                                      rounded-xl
                                      bg-bronze
                                      px-6
                                      py-2.5
                                      text-sm
                                      font-medium
                                      text-white
                                      transition-all
                                      hover:bg-bronze-dark
                                      disabled:cursor-not-allowed
                                      disabled:opacity-50
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
                                      rounded-xl
                                      bg-bronze
                                      px-6
                                      py-2.5
                                      text-sm
                                      font-semibold
                                      text-white
                                      transition-all
                                      hover:bg-bronze-dark
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
              <h2
                className="
                  mb-4
                  font-serif
                  text-xl
                  font-semibold
                  text-espresso
                "
              >
                Guest Reviews
              </h2>

              {reviewsLoading ? (
                <div
                  className="
                    rounded-xl
                    bg-white
                    p-8
                    text-center
                    shadow-warm
                  "
                >
                  Loading reviews...
                </div>
              ) : reviews.length ===
                0 ? (
                <div
                  className="
                    rounded-xl
                    bg-white
                    p-8
                    text-center
                    shadow-warm
                  "
                >
                  <MessageSquare
                    className="
                      mx-auto
                      mb-2
                      h-8
                      w-8
                      text-muted-foreground
                    "
                  />

                  <p className="text-muted-foreground">
                    No reviews yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(
                    (review) => (
                      <div
                        key={
                          review.reviewId
                        }
                        className="
                          rounded-xl
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
                            items-start
                            gap-4
                          "
                        >
                          <div
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-bronze/10
                            "
                          >
                            <span
                              className="
                                text-sm
                                font-semibold
                                text-bronze
                              "
                            >
                              {review.guestName
                                ?.charAt(
                                  0
                                )
                                ?.toUpperCase() ||
                                "G"}
                            </span>
                          </div>

                          <div className="flex-1">
                            <div
                              className="
                                flex
                                flex-col
                                gap-2
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                              "
                            >
                              <p
                                className="
                                  font-semibold
                                  text-espresso
                                "
                              >
                                {review.guestName ||
                                  "Guest"}
                              </p>

                              <div
                                className="
                                  flex
                                  items-center
                                  gap-1
                                "
                              >
                                {Array.from(
                                  {
                                    length: 5,
                                  }
                                ).map(
                                  (
                                    _,
                                    i
                                  ) => (
                                    <Star
                                      key={
                                        i
                                      }
                                      className={`
                                        h-4
                                        w-4
                                        ${
                                          i <
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

                            <p
                              className="
                                mt-1
                                text-xs
                                text-muted-foreground
                              "
                            >
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

                            <p
                              className="
                                mt-3
                                leading-relaxed
                                text-muted-foreground
                              "
                            >
                              {
                                review.comment
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {/* PAGINATION */}

                  {totalReviewPages >
                    1 && (
                    <div
                      className="
                        mt-6
                        flex
                        items-center
                        justify-center
                        gap-4
                      "
                    >
                      <button
                        disabled={
                          reviewPage ===
                          0
                        }
                        onClick={() =>
                          setReviewPage(
                            (prev) =>
                              prev -
                              1
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
                        <ChevronLeft className="h-4 w-4" />

                        Previous
                      </button>

                      <span
                        className="
                          text-sm
                          text-muted-foreground
                        "
                      >
                        Page{" "}
                        {reviewPage +
                          1}{" "}
                        of{" "}
                        {
                          totalReviewPages
                        }
                      </span>

                      <button
                        disabled={
                          reviewPage >=
                          totalReviewPages -
                            1
                        }
                        onClick={() =>
                          setReviewPage(
                            (prev) =>
                              prev +
                              1
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

                        <ChevronRight className="h-4 w-4" />
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
            <div
              className="
                sticky
                top-24
                rounded-2xl
                border
                border-warm-stone/20
                bg-white
                p-6
                shadow-warm
              "
            >
              {/* BOOKING MODE */}

              <div className="mb-6">
                <p
                  className="
                    mb-2
                    text-sm
                    text-muted-foreground
                  "
                >
                  Booking Type
                </p>

                <div
                  className="
                    flex
                    rounded-xl
                    bg-cream
                    p-1
                  "
                >
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
                      ${
                        bookingMode ===
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
                      ${
                        bookingMode ===
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

              {/* DATES / TIMES */}

              <div className="space-y-4">
                {/* CHECK IN DATE */}

                <div>
                  <label
                    className="
                      mb-1
                      block
                      text-sm
                      font-medium
                      text-espresso
                    "
                  >
                    Check In
                  </label>

                  <input
                    type="date"
                    value={
                      checkInDate
                    }
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
                    <label
                      className="
                        mb-1
                        block
                        text-sm
                        font-medium
                        text-espresso
                      "
                    >
                      Check In Time
                    </label>

                    <div className="relative">
                      <Clock
                        className="
                          absolute
                          left-4
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-bronze
                        "
                      />

                      <input
                        type="time"
                        value={
                          checkInTime
                        }
                        onChange={(
                          e
                        ) => {
                          setCheckInTime(
                            e.target
                              .value
                          );

                          clearQuote();

                          setHourlyAdjustment(
                            null
                          );
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
                  <label
                    className="
                      mb-1
                      block
                      text-sm
                      font-medium
                      text-espresso
                    "
                  >
                    Check Out
                  </label>

                  <input
                    type="date"
                    value={
                      checkOutDate
                    }
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
                    <label
                      className="
                        mb-1
                        block
                        text-sm
                        font-medium
                        text-espresso
                      "
                    >
                      Check Out Time
                    </label>

                    <div className="relative">
                      <Clock
                        className="
                          absolute
                          left-4
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-bronze
                        "
                      />

                      <input
                        type="time"
                        value={
                          checkOutTime
                        }
                        onChange={(
                          e
                        ) => {
                          setCheckOutTime(
                            e.target
                              .value
                          );

                          clearQuote();

                          setHourlyAdjustment(
                            null
                          );
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

                    {/* LIVE HOURLY DURATION */}

                    {checkInTime &&
                      checkOutTime &&
                      checkInDate ===
                        checkOutDate && (
                        <div
                          className="
                            mt-2
                            flex
                            items-center
                            justify-between
                            rounded-lg
                            bg-cream
                            px-3
                            py-2
                          "
                        >
                          <span
                            className="
                              text-xs
                              text-muted-foreground
                            "
                          >
                            Duration
                          </span>

                          <span
                            className="
                              text-xs
                              font-semibold
                              text-espresso
                            "
                          >
                            {(() => {
                              const start =
                                getMinutesFromTime(
                                  checkInTime
                                );

                              const end =
                                getMinutesFromTime(
                                  checkOutTime
                                );

                              const duration =
                                end -
                                start;

                              if (
                                duration <=
                                0
                              ) {
                                return "Invalid time range";
                              }

                              return formatDuration(
                                duration
                              );
                            })()}
                          </span>
                        </div>
                      )}
                  </div>
                )}

                {/* GUESTS */}

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-4
                  "
                >
                  {/* ADULTS */}

                  <div>
                    <label
                      className="
                        mb-1
                        block
                        text-sm
                        font-medium
                        text-espresso
                      "
                    >
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
                              e.target
                                .value
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
                    <label
                      className="
                        mb-1
                        block
                        text-sm
                        font-medium
                        text-espresso
                      "
                    >
                      Children
                    </label>

                    <input
                      type="number"
                      min={0}
                      value={
                        children
                      }
                      onChange={(e) => {
                        setChildren(
                          Math.max(
                            0,
                            Number(
                              e.target
                                .value
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

              {/* CURRENT QUOTE */}

              {quote && (
                <div
                  className="
                    mt-6
                    rounded-xl
                    bg-cream
                    p-4
                  "
                >
                  <p
                    className="
                      text-xs
                      text-muted-foreground
                    "
                  >
                    Selected room
                  </p>

                  <p
                    className="
                      font-semibold
                      text-espresso
                    "
                  >
                    {formatRoomType(
                      quote.roomType
                    )}
                  </p>

                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <span
                      className="
                        text-sm
                        text-muted-foreground
                      "
                    >
                      Final price
                    </span>

                    <span
                      className="
                        text-xl
                        font-bold
                        text-bronze
                      "
                    >
                      ₹
                      {formatPrice(
                        quote.finalPrice
                      ) || "—"}
                    </span>
                  </div>
                </div>
              )}

              <p
                className="
                  mt-5
                  text-xs
                  leading-relaxed
                  text-muted-foreground
                "
              >
                Select a room type above
                to calculate the final
                dynamic price.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          HOURLY ADJUSTMENT CONFIRMATION
          ===================================================== */}

      <AnimatePresence>
        {hourlyAdjustment && (
          <motion.div
            className="
              fixed
              inset-0
              z-[60]
              flex
              items-center
              justify-center
              bg-black/50
              px-4
              backdrop-blur-sm
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
            onClick={
              cancelHourlyAdjustment
            }
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="hourly-adjustment-title"
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="
                w-full
                max-w-md
                overflow-hidden
                rounded-2xl
                bg-white
                shadow-2xl
              "
            >
              {/* HEADER */}

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                  border-b
                  border-warm-stone/20
                  p-6
                "
              >
                <div className="flex items-start gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-bronze/10
                    "
                  >
                    <AlertTriangle
                      className="
                        h-5
                        w-5
                        text-bronze
                      "
                    />
                  </div>

                  <div>
                    <h2
                      id="hourly-adjustment-title"
                      className="
                        font-serif
                        text-xl
                        font-semibold
                        text-espresso
                      "
                    >
                      Adjust hourly booking
                    </h2>

                    <p
                      className="
                        mt-1
                        text-sm
                        leading-relaxed
                        text-muted-foreground
                      "
                    >
                      Hourly bookings must use
                      complete hours.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    cancelHourlyAdjustment
                  }
                  className="
                    rounded-full
                    p-2
                    text-muted-foreground
                    transition-colors
                    hover:bg-cream
                    hover:text-espresso
                  "
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* CONTENT */}

              <div className="p-6">
                <div
                  className="
                    rounded-xl
                    bg-cream
                    p-4
                  "
                >
                  {/* ORIGINAL */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >
                    <div>
                      <p
                        className="
                          text-xs
                          text-muted-foreground
                        "
                      >
                        Current selection
                      </p>

                      <p
                        className="
                          mt-1
                          font-semibold
                          text-espresso
                        "
                      >
                        {
                          hourlyAdjustment.originalCheckIn
                        }{" "}
                        →{" "}
                        {
                          hourlyAdjustment.originalCheckOut
                        }
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className="
                          text-xs
                          text-muted-foreground
                        "
                      >
                        Duration
                      </p>

                      <p
                        className="
                          mt-1
                          font-semibold
                          text-espresso
                        "
                      >
                        {formatDuration(
                          hourlyAdjustment.originalDurationMinutes
                        )}
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      my-4
                      h-px
                      bg-warm-stone/20
                    "
                  />

                  {/* RECOMMENDED */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          bg-bronze/10
                        "
                      >
                        {hourlyAdjustment.direction ===
                        "EARLIER" ? (
                          <ArrowDown
                            className="
                              h-4
                              w-4
                              text-bronze
                            "
                          />
                        ) : (
                          <ArrowUp
                            className="
                              h-4
                              w-4
                              text-bronze
                            "
                          />
                        )}
                      </div>

                      <div>
                        <p
                          className="
                            text-xs
                            text-muted-foreground
                          "
                        >
                          Recommended checkout
                        </p>

                        <p
                          className="
                            mt-1
                            font-semibold
                            text-bronze
                          "
                        >
                          {
                            hourlyAdjustment.adjustedCheckOut
                          }
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className="
                          text-xs
                          text-muted-foreground
                        "
                      >
                        Duration
                      </p>

                      <p
                        className="
                          mt-1
                          font-semibold
                          text-espresso
                        "
                      >
                        {formatDuration(
                          hourlyAdjustment.adjustedDurationMinutes
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <p
                  className="
                    mt-4
                    text-sm
                    leading-relaxed
                    text-muted-foreground
                  "
                >
                  Your selected duration is{" "}
                  <span className="font-medium text-espresso">
                    {formatDuration(
                      hourlyAdjustment.originalDurationMinutes
                    )}
                  </span>
                  . The nearest valid whole-hour
                  duration is{" "}
                  <span className="font-medium text-espresso">
                    {formatDuration(
                      hourlyAdjustment.adjustedDurationMinutes
                    )}
                  </span>
                  .
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-relaxed
                    text-muted-foreground
                  "
                >
                  Your price quote will be
                  recalculated after the adjustment.
                </p>
              </div>

              {/* ACTIONS */}

              <div
                className="
                  flex
                  flex-col-reverse
                  gap-3
                  border-t
                  border-warm-stone/20
                  p-6
                  sm:flex-row
                  sm:justify-end
                "
              >
                <button
                  type="button"
                  onClick={
                    cancelHourlyAdjustment
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
                    transition-colors
                    hover:bg-cream
                  "
                >
                  Keep Editing
                </button>

                <button
                  type="button"
                  onClick={
                    applyHourlyAdjustment
                  }
                  className="
                    rounded-xl
                    bg-bronze
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition-colors
                    hover:bg-bronze-dark
                  "
                >
                  Use{" "}
                  {
                    hourlyAdjustment.adjustedCheckOut
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          FULLSCREEN GALLERY
          ALL HOTEL IMAGES
          ===================================================== */}

      <AnimatePresence>
        {galleryOpen &&
          hotelImages.length >
            0 && (
            <motion.div
              className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/90
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
                type="button"
                onClick={() =>
                  setGalleryOpen(
                    false
                  )
                }
                className="
                  absolute
                  right-5
                  top-5
                  z-20
                  rounded-full
                  bg-white/10
                  p-2
                  text-white
                  backdrop-blur-sm
                  transition-colors
                  hover:bg-white/20
                  md:right-6
                  md:top-6
                "
                aria-label="Close gallery"
              >
                <X
                  className="
                    h-7
                    w-7
                    md:h-8
                    md:w-8
                  "
                />
              </button>

              {/* IMAGE COUNTER */}

              <div
                className="
                  absolute
                  left-1/2
                  top-5
                  z-20
                  -translate-x-1/2
                  rounded-full
                  bg-black/50
                  px-4
                  py-2
                  text-sm
                  text-white
                  backdrop-blur-sm
                  md:top-6
                "
              >
                {currentImage +
                  1}{" "}
                /{" "}
                {hotelImages.length}
              </div>

              {/* PREVIOUS */}

              {hotelImages.length >
                1 && (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentImage(
                      (prev) =>
                        prev ===
                        0
                          ? hotelImages.length -
                            1
                          : prev -
                            1
                    )
                  }
                  className="
                    absolute
                    left-3
                    z-20
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    bg-white/10
                    text-white
                    backdrop-blur-sm
                    transition-colors
                    hover:bg-white/20
                    md:left-6
                    md:h-12
                    md:w-12
                  "
                  aria-label="Previous image"
                >
                  <ChevronLeft
                    className="
                      h-7
                      w-7
                    "
                  />
                </button>
              )}

              {/* IMAGE */}

              <div
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  px-16
                  py-20
                  md:px-24
                "
              >
                <AnimatePresence
                  mode="wait"
                >
                  <motion.img
                    key={
                      currentImage
                    }
                    src={
                      hotelImages[
                        currentImage
                      ]
                    }
                    alt={`${hotel.name} - photo ${
                      currentImage +
                      1
                    }`}
                    initial={{
                      opacity: 0,
                      scale: 0.98,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.98,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className="
                      max-h-full
                      max-w-full
                      rounded-xl
                      object-contain
                    "
                  />
                </AnimatePresence>
              </div>

              {/* NEXT */}

              {hotelImages.length >
                1 && (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentImage(
                      (prev) =>
                        prev ===
                        hotelImages.length -
                          1
                          ? 0
                          : prev + 1
                    )
                  }
                  className="
                    absolute
                    right-3
                    z-20
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    bg-white/10
                    text-white
                    backdrop-blur-sm
                    transition-colors
                    hover:bg-white/20
                    md:right-6
                    md:h-12
                    md:w-12
                  "
                  aria-label="Next image"
                >
                  <ChevronRight
                    className="
                      h-7
                      w-7
                    "
                  />
                </button>
              )}
            </motion.div>
          )}
      </AnimatePresence>
    </MainLayout>
  );
}