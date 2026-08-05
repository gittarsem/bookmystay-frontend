import { paymentsApi } from "@/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export async function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

interface OpenRazorpayParams {
  bookingId: number;
}

export async function openRazorpay({
  bookingId,
}: OpenRazorpayParams): Promise<any> {
  const loaded = await loadRazorpayScript();

  if (!loaded) {
    throw new Error("Failed to load Razorpay SDK.");
  }

  const { data: order } = await paymentsApi.createOrder(bookingId);

  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: order.keyId,

      amount: order.amount * 100,

      currency: order.currency,

      order_id: order.orderId,

      name: "BookMyStay",

      description: "Hotel Booking Payment",

      theme: {
        color: "#8B5E3C",
      },

      handler: async function (response: any) {
        try {
          const { data } = await paymentsApi.verify({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });

          resolve(data);
        } catch (err) {
          reject(err);
        }
      },

      modal: {
        ondismiss() {
          reject(new Error("Payment cancelled"));
        },
      },
    });

    razorpay.on("payment.failed", function (response: any) {
      reject(response.error);
    });

    razorpay.open();
  });
}