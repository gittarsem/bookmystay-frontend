import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import {
    XCircle,
    Home,
    RotateCcw,
    Ban,
    Receipt,
} from "lucide-react";

import MainLayout from "@/layouts/MainLayout";
import { bookingsApi } from "@/api/bookings";
import { paymentsApi } from "@/api/payments";
import type { BookingDetails } from "@/types";
import { openRazorpay } from "@/utils/openRazorPay";
import { toast } from "sonner";

export default function BookingFailed() {
    const [, setLocation] = useLocation();

    const [, params] = useRoute<{
        bookingId: string;
    }>("/booking-failed/:bookingId");

    const [booking, setBooking] = useState<BookingDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [retryLoading, setRetryLoading] = useState(false);

    useEffect(() => {
        loadBooking();
    }, []);

    async function loadBooking() {
        try {
            const { data } = await bookingsApi.getBookingDetails(
                Number(params?.bookingId)
            );

            setBooking(data);
        } finally {
            setLoading(false);
        }
    }

    async function retryPayment() {
        try {
            setRetryLoading(true);

            const { data } = await paymentsApi.createOrder(
                Number(params?.bookingId)
            );

            await openRazorpay({
                bookingId: Number(params?.bookingId),
                order: data,
                setLocation,
            });

        } catch (e) {
            toast.error("Unable to start payment. Please try again.");
        } finally {
            setRetryLoading(false);
        }
    }

    async function cancelBooking() {
        try {
            await bookingsApi.cancelBooking(
                Number(params?.bookingId)
            );

            setLocation("/my-bookings");

        } catch (e) {
            toast.error("Unable to cancel booking. Please try again.");
        }
    }

    if (loading) {
        return (
            <MainLayout>
                <div className="container py-20 text-center">
                    Loading...
                </div>
            </MainLayout>
        );
    }
    if (!booking) {
    return (
        <MainLayout>
            <div className="container py-20 text-center">
                Booking not found.
            </div>
        </MainLayout>
    );
}

    return (
        <MainLayout>

            <div className="container max-w-3xl py-20">

                <motion.div
                    initial={{ opacity: 0, scale: .9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-3xl bg-white shadow-warm p-10 text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                    >
                        <XCircle className="mx-auto h-24 w-24 text-red-500" />
                    </motion.div>

                    <h1 className="mt-6 font-serif text-4xl font-bold text-espresso">
                        Payment Failed
                    </h1>

                    <p className="mt-3 text-muted-foreground">
                        Your payment could not be completed.
                        Your booking has not been confirmed yet.
                    </p>

                    <div className="mt-10 rounded-2xl border border-red-100 bg-red-50 p-6">

                        <div className="flex items-center gap-2 text-lg font-semibold text-espresso">
                            <Receipt className="h-5 w-5 text-red-500" />
                            Booking Summary
                        </div>

                        <div className="mt-6 space-y-5">

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Booking ID
                                </span>

                                <span className="font-semibold">
                                    #{booking.bookingId}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Hotel
                                </span>

                                <span className="font-semibold">
                                    {booking.hotelName}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Room
                                </span>

                                <span>
                                    {booking.roomType}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Check In
                                </span>

                                <span>
                                    {new Date(booking.checkInDate).toLocaleDateString("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
})}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Check Out
                                </span>

                                <span>
                                    {new Date(booking.checkOutDate).toLocaleDateString("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
})}
                                </span>
                            </div>

                            <hr />

                            <div className="flex justify-between text-xl font-bold">

                                <span>
                                    Amount
                                </span>

                                <span className="text-red-600">
                                    ₹{Number(booking.amount ?? 0).toLocaleString()}
                                </span>

                            </div>

                        </div>

                    </div>

                    <div className="mt-8 rounded-xl border border-yellow-300 bg-yellow-50 p-4">

                        <p className="font-medium text-yellow-800">
                            Your room is temporarily reserved.
                        </p>

                        <p className="mt-2 text-sm text-yellow-700">
                            Retry the payment within the reservation window to
                            confirm your booking. If the timer expires,
                            the reservation will be released automatically.
                        </p>

                    </div>
                    <div className="mt-10 flex flex-col gap-4 sm:flex-row">

                        <button
                            onClick={retryPayment}
                            disabled={retryLoading}
                            className="flex-1 rounded-xl bg-bronze py-3 text-white font-semibold transition hover:bg-bronze-dark disabled:opacity-50"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <RotateCcw className="h-5 w-5" />

                                {retryLoading
                                    ? "Preparing Payment..."
                                    : "Retry Payment"}
                            </span>
                        </button>

                        <button
                            onClick={cancelBooking}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500 py-3 font-semibold text-red-600 transition hover:bg-red-500 hover:text-white"
                        >
                            <Ban className="h-5 w-5" />
                            Cancel Booking
                        </button>

                    </div>

                    <button
                        onClick={() => setLocation("/")}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-bronze py-3 font-semibold text-bronze transition hover:bg-bronze hover:text-white"
                    >
                        <Home className="h-5 w-5" />
                        Back to Home
                    </button>

                </motion.div>

            </div>

        </MainLayout>
    );
}