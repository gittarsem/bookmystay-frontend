import api from "./axios";

export interface RevenuePoint {
  date: string;
  revenue: number;
  bookings: number;
}

export interface OwnerRevenue {
  totalRevenue: number;
  periodRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  revenueTrend: RevenuePoint[];
}

export const ownerRevenueApi = {
  get(
    hotelId: number,
    startDate: string,
    endDate: string
  ) {
    return api.get<OwnerRevenue>(
      `/owner/hotels/${hotelId}/revenue`,
      {
        params: {
          startDate,
          endDate,
        },
      }
    );
  },
};