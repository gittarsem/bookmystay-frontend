import api from "./axios";

export const paymentsApi = {
  createOrder(bookingId: number) {
    return api.post("/api/payments/create-order", {
      bookingId,
    });
  },

  verify(data: {
    orderId: string;
    paymentId: string;
    signature: string;
  }) {
    return api.post("/api/payments/verify", data);
  },
};