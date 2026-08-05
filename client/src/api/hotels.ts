import api from "./axios";

export interface HotelSearchParams {
  keyword?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  ratings?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  size?: number;
}

export const hotelsApi = {
  search(params: HotelSearchParams) {
    return api.get("/hotels/search", {
      params,
    });
  },

  getAll() {
    return api.get("/hotels");
  },

  getHotelInfo(hotelId: number) {
    return api.get(`/hotels/${hotelId}/info`);
  },
};