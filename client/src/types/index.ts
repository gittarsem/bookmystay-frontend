export type UserRole =
  | "ROLE_GUEST"
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

export type RoomType =
  | "STANDARD"
  | "DOUBLE"
  | "DELUXE"
  | "SUITE"
  | "FAMILY";

export interface Room {
  id: number;
  capacity: number;
  roomType: RoomType;
}

export interface RoomTypePricing {
  id: number;
  roomType: RoomType;
  hourlyPrice: number;
  dailyPrice: number;
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
  id: number;
  name: string;
  city: string;
  hotelContactInfo: {
    address: string;
    phoneNumber: string;
    email: string;
  };
  imageUrl: string | null;
  numberOfRooms: number;
  active: boolean;
}

export interface Guest {
  id: number;
  name: string;
  age: number;
  gender: "MALE" | "FEMALE" | "Others";
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

export type BookingMode =
  | "DAILY"
  | "HOURLY";

export interface BookingGuest {
  id: number;
  name: string;
  gender: string;
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
  bookingStatus: string;
  paymentStatus: string;
  guests: BookingGuest[];
}