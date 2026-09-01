import api from "./axios";

export type RoomType =
  | "STANDARD"
  | "DOUBLE"
  | "DELUXE"
  | "SUITE"
  | "FAMILY";

export interface OwnerRoom {
  id: number;
  capacity: number;
  roomType: RoomType;
}

export interface OwnerRoomRequest {
  capacity: number;
  roomType: RoomType;
}

export const ownerRoomsApi = {
  getAll(hotelId: number) {
    return api.get<OwnerRoom[]>(
      `/owner/${hotelId}/rooms`
    );
  },

  get(
    hotelId: number,
    roomId: number
  ) {
    return api.get<OwnerRoom>(
      `/owner/${hotelId}/rooms/${roomId}`
    );
  },

  create(
    hotelId: number,
    data: OwnerRoomRequest
  ) {
    return api.post<OwnerRoom>(
      `/owner/${hotelId}/rooms`,
      data
    );
  },

  update(
    hotelId: number,
    roomId: number,
    data: OwnerRoomRequest
  ) {
    return api.put<OwnerRoom>(
      `/owner/${hotelId}/rooms/${roomId}`,
      data
    );
  },

  delete(
    hotelId: number,
    roomId: number
  ) {
    return api.delete<string>(
      `/owner/${hotelId}/rooms/${roomId}`
    );
  },
};