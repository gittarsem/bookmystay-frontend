import api from "./axios";

export const ownerHotelsApi = {
  create(data: any) {
    return api.post("/owner/hotels", data);
  },

  activate(id: string) {
    return api.patch(`/owner/hotels/${id}/status`);
  },

  delete(id: string) {
    return api.delete(`/owner/hotels/${id}`);
  },
};