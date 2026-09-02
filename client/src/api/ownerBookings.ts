import api from "./axios";

/*
 * These values match the booking/payment states
 * returned by the backend.
 *
 * Keep this type open enough to avoid breaking the
 * frontend if another backend state is introduced.
 */

export type OwnerBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "BOOKED"
  | "PAYMENT_PENDING"
  | "CANCELLED"
  | "EXPIRED";

export type OwnerPaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type OwnerRoomType =
  | "STANDARD"
  | "DOUBLE"
  | "DELUXE"
  | "SUITE"
  | "FAMILY";

export interface OwnerBooking {
  bookingId: number;

  guestName: string;

  roomType: OwnerRoomType;

  checkInDate: string;

  checkOutDate: string;

  bookingStatus: OwnerBookingStatus;

  /*
   * Backend can return null when a payment entity
   * has not been created yet.
   */
  paymentStatus:
    | OwnerPaymentStatus
    | null;

  /*
   * Backend can return null when there is no payment
   * record yet.
   */
  amount:
    | number
    | null;
}

export interface OwnerBookingGuest {
  id: number;
  name: string;
  age: number;
  gender: string;
}

export interface OwnerBookingDetails {
  bookingId: number;

  guestName: string;

  email: string;

  phone: string;

  hotelName: string;

  city: string;

  roomType: OwnerRoomType;

  adultCount: number;

  childCount: number;

  checkInDate: string;

  checkOutDate: string;

  bookingStatus: OwnerBookingStatus;

  paymentStatus:
    | OwnerPaymentStatus
    | null;

  amount:
    | number
    | null;

  guests: OwnerBookingGuest[];
}

export const ownerBookingsApi = {
  getHotelBookings(
    hotelId: number,
    bookingStatus?: OwnerBookingStatus
  ) {
    return api.get<OwnerBooking[]>(
      `/owner/hotels/${hotelId}/bookings`,
      {
        params: bookingStatus
          ? {
              bookingStatus,
            }
          : undefined,
      }
    );
  },

  getHotelBooking(
    hotelId: number,
    bookingId: number
  ) {
    return api.get<OwnerBookingDetails>(
      `/owner/hotels/${hotelId}/bookings/${bookingId}`
    );
  },
};