import type {
    BookingDetails,
    BookingCancelDTO,
} from "@/types";
import api from "./axios";

export const bookingsApi = {
  init(data: any) {
    return api.post("/guest/bookings/init", data);
  },

  getBookingDetails(id: number) {
    return api.get(`/guest/bookings/${id}`);
  },

  addGuests(id: number, guests: any[]) {
    return api.post(`/guest/bookings/${id}/addGuests`, guests);
  },

  getMyBookings() {
    return api.get("/guest/bookings");
  },

  cancelBooking: (bookingId: number) =>
    api.post<BookingCancelDTO>(
        `/guest/bookings/${bookingId}/cancel`
    ),

  updateGuest: (bookingId: number, guestId: number, guest: {
    name: string;
    age: number;
    gender: "MALE" | "FEMALE" | "Others";
  }) =>
    api.put(
      `/guest/bookings/${bookingId}/guests/${guestId}`,
      guest
    ),

  deleteGuest: (bookingId: number, guestId: number) =>
    api.delete(
      `/guest/bookings/${bookingId}/delete/${guestId}`
    ),
};