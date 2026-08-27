  import api from "./axios";


  export type BookingMode =
    | "DAILY"
    | "HOURLY";


  /* =========================================================
    BOOKING REQUEST
    ========================================================= */

  export interface BookingRequest {

    hotelId: number;

    roomType: string;

    checkInDate: string;

    checkOutDate: string;

    adultCount: number;

    childCount: number;

    bookingMode: BookingMode;

    quoteId?: string;

    checkInTime?: string;

    checkOutTime?: string;
  }


  /* =========================================================
    BOOKING HISTORY
    ========================================================= */

  export interface BookingHistory {

    bookingId: number;

    hotelId: number;

    hotelName: string;

    hotelImage?: string;

    city: string;

    roomType: string;

    bookingMode: BookingMode;

    checkInDate: string;

    checkOutDate: string;

    checkInTime?: string | null;

    checkOutTime?: string | null;

    adultCount: number;

    childCount: number;

    bookingStatus: string;

    paymentStatus: string | null;

    amount: number | null;

    reviewId?: number | null;

    /*
    * Actual amount refunded after cancellation.
    *
    * Backend should return this if your booking-history
    * endpoint includes payment/refund information.
    */
    refundedAmount?: number | null;

    refundStatus?: string | null;
  }


  /* =========================================================
    PRICE QUOTE
    ========================================================= */

  export interface PriceQuote {

    quoteId: string;

    hotelId: number;

    roomId: number;

    finalPrice: number;

    checkInDate: string;

    checkOutDate: string;

    checkInTime: string | null;

    checkOutTime: string | null;

    roomType: string;

    bookingMode: BookingMode;
  }


  /* =========================================================
    BOOKING
    ========================================================= */

  export interface Booking {

    id: number;

    roomsCount: number;

    checkInDate: string;

    checkOutDate: string;

    createdAt: string;

    updatedAt: string;

    bookingStatus: string;

    guests: unknown[];

    totalPrice: number;
  }


  /* =========================================================
    BOOKING DETAILS
    ========================================================= */

  export interface BookingGuest {

    id: number;

    name: string;

    gender: "MALE" | "FEMALE" | "Others";

    age: number;
  }


  export interface BookingDetails {

    bookingId: number;

    hotelName: string;

    city: string;

    roomType: string;

    bookingMode: BookingMode;

    checkInDate: string;

    checkOutDate: string;

    checkInTime: string | null;

    checkOutTime: string | null;

    adultCount: number;

    childCount: number;

    amount: number;

    totalPrice?: number;

    bookingStatus: string;

    paymentStatus: string;

    guests: BookingGuest[];

    /*
    * Actual refund information for cancelled bookings.
    */
    refundedAmount?: number | null;

    refundStatus?: string | null;
  }


  /* =========================================================
    CANCELLATION PREVIEW
    ========================================================= */

  export interface CancellationPreview {

    bookingId: number;

    amountPaid: number;

    refundPercentage: number;

    refundAmount: number;

    cancellationFee: number;
  }


  /* =========================================================
    CANCELLATION RESPONSE
    ========================================================= */

  export interface BookingCancelResponse {

    bookingId: number;

    bookingStatus: string;

    checkInDate: string;

    checkOutDate: string;

    refundStatus: string;

    refundAmount: number;

    message: string;
  }


  /* =========================================================
    API
    ========================================================= */

  export const bookingsApi = {


    /* ============================
      DAILY QUOTE
      ============================ */

    createDailyQuote: (
      data: BookingRequest
    ) =>
      api.post<PriceQuote>(
        "/guest/bookings/daily-quote",
        data
      ),


    /* ============================
      HOURLY QUOTE
      ============================ */

    createHourlyQuote: (
      data: BookingRequest
    ) =>
      api.post<PriceQuote>(
        "/guest/bookings/hourly-quote",
        data
      ),


    /* ============================
      INITIALIZE BOOKING
      ============================ */

    init: (
      data: BookingRequest
    ) =>
      api.post<Booking>(
        "/guest/bookings/init",
        data
      ),


    /* ============================
      GET ALL BOOKINGS
      ============================ */

    getMyBookings: () =>
      api.get<BookingHistory[]>(
        "/guest/bookings"
      ),


    /* ============================
      GET BOOKING DETAILS
      ============================ */

    getBookingDetails: (
      bookingId: number
    ) =>
      api.get<BookingDetails>(
        `/guest/bookings/${bookingId}`
      ),


    /* ============================
      ADD GUEST DETAILS
      ============================ */

    addGuests: (
      bookingId: number,
      guests: {
        name: string;
        age: number;
        gender: "MALE" | "FEMALE" | "Others";
      }[]
    ) =>
      api.post(
        `/guest/bookings/${bookingId}/addGuests`,
        guests
      ),


    /* ============================
      UPDATE GUEST
      ============================ */

    updateGuest: (
      bookingId: number,
      guestId: number,
      guest: {
        name: string;
        age: number;
        gender: "MALE" | "FEMALE" | "Others";
      }
    ) =>
      api.put(
        `/guest/bookings/${bookingId}/guests/${guestId}`,
        guest
      ),


    /* ============================
      DELETE GUEST
      ============================ */

    deleteGuest: (
      bookingId: number,
      guestId: number
    ) =>
      api.delete(
        `/guest/bookings/${bookingId}/delete/${guestId}`
      ),


    /* ============================
      CANCELLATION PREVIEW
      ============================ */

    getCancellationPreview: (
      bookingId: number
    ) =>
      api.get<CancellationPreview>(
        `/guest/bookings/${bookingId}/cancellation-preview`
      ),


    /* ============================
      CANCEL BOOKING
      ============================ */

    cancelBooking: (
      bookingId: number
    ) =>
      api.post<BookingCancelResponse>(
        `/guest/bookings/${bookingId}/cancel`
      ),

  };