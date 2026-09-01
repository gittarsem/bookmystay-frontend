import api from "./axios";
import type {
  RoomType,
  RoomTypePricing,
} from "@/types";

export interface CreateRoomTypePricingRequest {
  roomType: RoomType;
  hourlyPrice: number;
  dailyPrice: number;
}

export interface UpdateRoomTypePricingRequest {
  hourlyPrice: number;
  dailyPrice: number;
}

export const ownerRoomTypePricingApi = {
  getAll(hotelId: number) {
    return api.get<RoomTypePricing[]>(
      `/owner/${hotelId}/room-types/pricing`
    );
  },

  get(
    hotelId: number,
    pricingId: number
  ) {
    return api.get<RoomTypePricing>(
      `/owner/${hotelId}/room-types/pricing/${pricingId}`
    );
  },

  create(
    hotelId: number,
    data: CreateRoomTypePricingRequest
  ) {
    return api.post<RoomTypePricing>(
      `/owner/${hotelId}/room-types/pricing`,
      data
    );
  },

  update(
    hotelId: number,
    pricingId: number,
    data: UpdateRoomTypePricingRequest
  ) {
    return api.put<RoomTypePricing>(
      `/owner/${hotelId}/room-types/pricing/${pricingId}`,
      data
    );
  },

  delete(
    hotelId: number,
    pricingId: number
  ) {
    return api.delete<string>(
      `/owner/${hotelId}/room-types/pricing/${pricingId}`
    );
  },
};