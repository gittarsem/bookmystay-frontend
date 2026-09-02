import api from "./axios";

/* =========================================================
   HOTEL SUMMARY
   ========================================================= */

export interface OwnerHotelDashboard {
  hotelId: number;
  hotelName: string;
  city: string;
  active: boolean;
  totalRooms: number;
  activeBookings: number;
  revenue: number;
}

/* =========================================================
   RECENT BOOKING
   ========================================================= */

export interface OwnerDashboardBooking {
  bookingId: number;
  guestName?: string;
  roomType?: string;
  checkInDate?: string;
  checkOutDate?: string;
  bookingStatus?: string;
  paymentStatus?: string;
  amount?: number;
}

/* =========================================================
   OWNER BOOKING
   ========================================================= */

export interface OwnerBooking {
  bookingId: number;
  guestName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  bookingStatus: string;
  paymentStatus: string;
  amount: number;
}

/* =========================================================
   DASHBOARD RESPONSE
   ========================================================= */

export interface OwnerDashboardResponse {
  totalHotels: number;
  activeHotels: number;
  totalRooms: number;
  activeBookings: number;
  totalRevenue: number;

  hotels: OwnerHotelDashboard[];

  recentBookings: OwnerDashboardBooking[];
}

/* =========================================================
   API
   ========================================================= */

export const ownerDashboardApi = {
  getDashboard() {
    return api.get<OwnerDashboardResponse>(
      "/owner/dashboard"
    );
  },

  getHotelBookings(hotelId: number) {
    return api.get<OwnerBooking[]>(
      `/owner/hotels/${hotelId}/bookings`
    );
  },
};