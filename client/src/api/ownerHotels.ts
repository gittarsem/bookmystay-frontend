import api from "./axios";

export type HotelAmenity =
  | "FREE_WIFI"
  | "FREE_PARKING"
  | "SWIMMING_POOL"
  | "GYM"
  | "SPA"
  | "RESTAURANT"
  | "BAR"
  | "ROOM_SERVICE"
  | "BREAKFAST_INCLUDED"
  | "AIR_CONDITIONING"
  | "ELEVATOR"
  | "LAUNDRY_SERVICE"
  | "FAMILY_ROOMS"
  | "AIRPORT_SHUTTLE"
  | "POWER_BACKUP"
  | "PET_FRIENDLY"
  | "BUSINESS_CENTER"
  | "CONFERENCE_ROOM"
  | "CCTV_SECURITY"
  | "EV_CHARGING";

export interface HotelContactInfo {
  address: string;
  phoneNumber: string;
  email: string;
}

export interface OwnerHotelRequest {
  name: string;
  city: string;
  hotelContactInfo: HotelContactInfo;
  description: string;
  amenities: HotelAmenity[];
}

export interface OwnerHotelResponse {
  id: number;
  name: string;
  city: string;
  hotelContactInfo: HotelContactInfo;
  imageUrl: string | null;
  numberOfRooms: number;
  active: boolean;
}

export interface OwnerHotelInfo {
  hotels: OwnerHotelResponse;
  description: string;
  images: string[];
  amenities: HotelAmenity[];
}

export const ownerHotelsApi = {
  getMyHotels() {
    return api.get<OwnerHotelResponse[]>(
      "/owner/hotel"
    );
  },

  getById(hotelId: number) {
    return api.get<OwnerHotelResponse>(
      `/owner/hotel/${hotelId}`
    );
  },

  getInfo(hotelId: number) {
    return api.get<OwnerHotelInfo>(
      `/hotels/${hotelId}/info`
    );
  },

  create(
    data: OwnerHotelRequest,
    images: File[]
  ) {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("city", data.city);
    formData.append(
      "description",
      data.description
    );

    formData.append(
      "hotelContactInfo.address",
      data.hotelContactInfo.address
    );

    formData.append(
      "hotelContactInfo.phoneNumber",
      data.hotelContactInfo.phoneNumber
    );

    formData.append(
      "hotelContactInfo.email",
      data.hotelContactInfo.email
    );

    data.amenities.forEach((amenity) => {
      formData.append("amenities", amenity);
    });

    images.forEach((image) => {
      formData.append("img", image);
    });

    return api.post<OwnerHotelResponse>(
      "/owner/hotel",
      formData
    );
  },

  update(
    id: number,
    data: OwnerHotelRequest
  ) {
    return api.put<OwnerHotelResponse>(
      `/owner/hotel/${id}`,
      data
    );
  },

  delete(id: number) {
    return api.delete<string>(
      `/owner/hotel/${id}`
    );
  },

  activate(id: number) {
    return api.patch<string>(
      `/owner/hotel/${id}/activate`
    );
  },
};