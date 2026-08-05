export type UserRole =
  | "ROLE_USER"
  | "ROLE_OWNER"
  | "ROLE_ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
  created_at?: string;
}

export interface Location {
  city: string;
  state: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;

  location: Location;

  images: string[];

  amenities: string[];

  rating: number;

  reviewCount: number;

  priceRange: PriceRange;

  isActive: boolean;

  createdAt: string;
}

export interface Room {
  id: string;
  hotelId: string;

  type: string;

  description: string;

  images: string[];

  price: number;

  capacity: number;

  amenities: string[];

  isAvailable: boolean;

  createdAt: string;
}

export interface Review {
  id: string;

  hotelId: string;

  guestId: string;

  guestName: string;

  rating: number;

  comment: string;

  createdAt: string;
}

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export interface Booking {
  id: string;

  hotelId: string;

  roomId: string;

  guestId: string;

  hotel: Hotel;

  room: Room;

  checkIn: string;

  checkOut: string;

  adults: number;

  children: number;

  totalAmount: number;

  status: BookingStatus;

  paymentStatus: PaymentStatus;

  createdAt: string;
}

export interface OwnerHotel {
  id: string;

  name: string;

  city: string;

  rating: number;

  totalRooms: number;

  activeBookings: number;

  monthlyRevenue: number;

  status: "ACTIVE" | "INACTIVE";
}

export interface Guest {
  id: number;
  name: string;
  age: number;
  gender: "MALE" | "FEMALE" | "Others";
}

export interface BookingDetails {
  bookingId: number;

  hotelName: string;
  city: string;

  roomType: string;

  checkInDate: string;
  checkOutDate: string;

  adultCount: number;
  childCount: number;

  bookingStatus: string;
  paymentStatus: string;

  amount: number;

  guests: Guest[];
}

export interface BookingHistory {

  bookingId: number;

  hotelId: number;

  hotelName: string;

  hotelImage: string;

  city: string;

  roomType: string;

  checkInDate: string;

  checkOutDate: string;

  adultCount: number;

  childCount: number;

  bookingStatus: string;

  paymentStatus: string;

  amount: number;

  reviewId: number | null;

}

export interface BookingCancelDTO {
    bookingId: number;
    bookingStatus: string;
    checkInDate: string;
    checkOutDate: string;
    refundStatus: string;
    refundAmount: number;
    message: string;
}

export interface Review {
    reviewId: number;
    guestName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface CreateReviewRequest {
    bookingId: number;
    ratings: number;
    comment: string;
}

export interface UpdateReviewRequest {
    ratings: number;
    comment: string;
}

export interface ReviewResponse {
    reviewId: number;
    guestName: string;
    rating: number;
    comment: string;
    createdAt: string;
}