import { paymentsApi } from "@/api/payments";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

interface OpenRazorpayProps {
  bookingId: number;
  order: RazorpayOrder;
  setLocation: (path: string) => void;
}

export async function openRazorpay({
  bookingId,
  order,
  setLocation,
}: OpenRazorpayProps) {

  const options = {
    key: order.keyId,

    amount: order.amount,

    currency: order.currency,

    order_id: order.orderId,

    name: "BookMyStay",

    description: "Hotel Booking Payment",

    handler: async (response: any) => {

      try {

        await paymentsApi.verify({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });

        setLocation(`/booking-success/${bookingId}`);

      } catch (e) {

        console.error(e);

        setLocation(`/booking-failed/${bookingId}`);
      }
    },

    modal: {

      ondismiss() {

        setLocation(`/booking-failed/${bookingId}`);

      },

    },

    theme: {

      color: "#C07A3B",

    },

  };

  const razorpay = new window.Razorpay(options);

  razorpay.open();
}