import api from "./axios";

export const hotelsApi = {
  search(params?: {
    keyword?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    ratings?: number;
    sortField?: string;
    sortOrder?: string;
    page?: number;
    size?: number;
  }) {
    return api.get("/hotels/search", {
      params,
    });
  },

  getHotelInfo(hotelId: number) {
    return api.get(`/hotels/${hotelId}/info`);
  },

  getRoomTypes(hotelId: number) {
    return api.get(`/hotels/${hotelId}/rooms`);
  },

  getAll() {
    return api.get("/hotels");
  },
};