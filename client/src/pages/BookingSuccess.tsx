import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Home, Calendar, Receipt } from "lucide-react";

import type { BookingDetails } from "@/types";

import MainLayout from "@/layouts/MainLayout";
import { bookingsApi } from "@/api/bookings";
export default function BookingSuccess() {

    const [, setLocation] = useLocation();

    const [, params] = useRoute<{
        bookingId: string;
    }>("/booking-success/:bookingId");

    const [booking, setBooking] = useState<BookingDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBooking();
    }, []);

    async function loadBooking() {
        try {

            const { data } =
                await bookingsApi.getBookingDetails(
                    Number(params?.bookingId)
                );

            setBooking(data);

        } finally {
            setLoading(false);
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
                        <CheckCircle2
                            className="mx-auto h-24 w-24 text-green-500"

                        />
                    </motion.div>

                    <h1 className="mt-6 font-serif text-4xl font-bold text-espresso">
                        Payment Successful
                    </h1>

                    <p className="mt-3 text-muted-foreground">
                        Your booking has been confirmed successfully.
                    </p>

                    <div className="mt-10 rounded-2xl border border-warm-stone/20 bg-muted/20 p-6">

                        <div className="flex items-center gap-2 text-lg font-semibold text-espresso">
                            <Receipt className="h-5 w-5 text-bronze" />
                            Booking Information
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
                                    City
                                </span>

                                <span>
                                    {booking.city}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Room Type
                                </span>

                                <span>
                                    {booking.roomType}
                                </span>
                            </div>

                            <div className="flex justify-between items-start">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Stay
                                </span>

                                <div className="text-right">

                                    <div>
                                        {new Date(booking.checkInDate).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </div>

                                    <div className="text-muted-foreground text-sm">
                                        to
                                    </div>

                                    <div>
                                        <div>
                                            {new Date(booking.checkOutDate).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </div>
                                    </div>

                                </div>

                            </div>

                            <hr />

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Guests
                                </span>

                                <span>
                                    {booking.adultCount} Adults • {booking.childCount} Children
                                </span>
                            </div>


                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Payment Status
                                </span>

                                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                    {booking.paymentStatus === "COMPLETED"
                                        ? "Paid"
                                        : booking.paymentStatus}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Booking Status
                                </span>

                                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                    {booking.bookingStatus === "BOOKED"
                                        ? "Confirmed"
                                        : booking.bookingStatus}
                                </span>
                            </div>



                            <div className="flex justify-between text-xl font-bold">

                                <span>
                                    Amount Paid
                                </span>

                                <span className="text-green-600">
                                    ₹{Number(booking.amount ?? 0).toLocaleString()}
                                </span>

                            </div>

                        </div>

                    </div>
                    <div className="mt-8 rounded-2xl bg-green-50 border border-green-200 p-5">

                        <p className="font-medium text-green-700">
                            🎉 Your booking has been confirmed.
                        </p>

                        <p className="mt-2 text-sm text-green-600">
                            A confirmation email has been sent to your registered email
                            address. You can manage this booking anytime from
                            <span className="font-semibold"> My Bookings</span>.
                        </p>

                    </div>

                    <div className="mt-10 flex flex-col gap-4 sm:flex-row">

                        <button
                            onClick={() => setLocation("/my-bookings")}
                            className="flex-1 rounded-xl bg-bronze py-3 text-white font-semibold transition hover:bg-bronze-dark"
                        >
                            View My Bookings
                        </button>

                        <button
                            onClick={() => setLocation("/")}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-bronze py-3 font-semibold text-bronze transition hover:bg-bronze hover:text-white"
                        >
                            <Home className="h-5 w-5" />
                            Back to Home
                        </button>

                    </div>

                </motion.div>

            </div>

        </MainLayout>

    );

}