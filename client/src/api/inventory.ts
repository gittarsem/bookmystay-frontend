import api from "./axios";

export interface Inventory {
  id: number;
  date: string;
  bookCount: number;
  reservedCount: number;
  totalCount: number;
  surgeFactor: number;
  price: number;
  closed: boolean;
  created_at: string;
}

export interface InventoryUpdateRequest {
  startDate: string;
  endDate: string;
  surgeFactor: number;
  closed: boolean;
}

export const ownerInventoryApi = {
  getByRoom(roomId: number) {
    return api.get<Inventory[]>(
      `/owner/inventory/room/${roomId}`
    );
  },

  update(
    roomId: number,
    data: InventoryUpdateRequest
  ) {
    return api.patch<string>(
      `/owner/inventory/room/${roomId}`,
      data
    );
  },
};