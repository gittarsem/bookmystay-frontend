import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { generateBookingReceipt } from "@/utils/generateBookingReceipt";

import {
    Loader2,
    ArrowLeft,
    MapPin,
    Calendar,
    Users,
    Receipt,
    User,
    CreditCard,
    XCircle,
} from "lucide-react";

import { motion } from "framer-motion";

import MainLayout from "@/layouts/MainLayout";
import { bookingsApi } from "@/api/bookings";

import type { BookingDetails } from "@/types";


export default function BookingDetails() {

    const [, setLocation] = useLocation();

    const [, params] = useRoute<{
        bookingId: string;
    }>("/my-bookings/:bookingId");


    const [booking, setBooking] =
        useState<BookingDetails | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [cancelLoading, setCancelLoading] =
        useState(false);

    const [cancelResult, setCancelResult] = useState<{
        refundStatus: string;
        refundAmount: number;
        message: string;
    } | null>(null);


    // =====================================================
    // LOAD BOOKING
    // =====================================================

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

        } catch (err: any) {

            toast.error(
                err?.response?.data?.message ??
                "Unable to load booking."
            );

        } finally {

            setLoading(false);

        }

    }


    // =====================================================
    // CANCEL BOOKING
    // =====================================================

    async function cancelBooking() {

        if (
            !window.confirm(
                "Are you sure you want to cancel this booking?"
            )
        ) {
            return;
        }


        try {

            setCancelLoading(true);

            const { data } =
                await bookingsApi.cancelBooking(
                    Number(params?.bookingId)
                );


            setCancelResult({
                refundStatus: data.refundStatus,
                refundAmount: Number(
                    data.refundAmount ?? 0
                ),
                message: data.message,
            });


            toast.success(data.message);


            setBooking((previous) =>
                previous
                    ? {
                        ...previous,
                        bookingStatus: "CANCELLED",
                    }
                    : previous
            );


        } catch (err: any) {

            toast.error(
                err?.response?.data?.message ??
                "Unable to cancel booking."
            );

        } finally {

            setCancelLoading(false);

        }

    }


    // =====================================================
    // FORMATTERS
    // =====================================================

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );


    const formatPrice = (amount: number) =>
        Number(amount ?? 0).toLocaleString(
            "en-IN"
        );


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <MainLayout>

                <div
                    className="
                        flex
                        h-[70vh]
                        items-center
                        justify-center
                    "
                >

                    <Loader2
                        className="
                            h-10
                            w-10
                            animate-spin
                            text-bronze
                        "
                    />

                </div>

            </MainLayout>

        );

    }


    // =====================================================
    // NOT FOUND
    // =====================================================

    if (!booking) {

        return (

            <MainLayout>

                <div
                    className="
                        container
                        py-20
                        text-center
                    "
                >
                    Booking not found.
                </div>

            </MainLayout>

        );

    }


    // =====================================================
    // UI
    // =====================================================

    return (

        <MainLayout>

            <div
                className="
                    container
                    max-w-6xl
                    py-10
                "
            >

                {/* =================================================
                    BACK BUTTON
                ================================================= */}

                <button
                    onClick={() =>
                        setLocation("/my-bookings")
                    }
                    className="
                        mb-8
                        flex
                        items-center
                        gap-2
                        text-muted-foreground
                        transition-all
                        hover:text-espresso
                    "
                >

                    <ArrowLeft
                        className="h-4 w-4"
                    />

                    <span className="font-medium">
                        Back to My Bookings
                    </span>

                </button>


                {/* =================================================
                    MAIN CARD
                ================================================= */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.4,
                    }}
                    className="
                        overflow-hidden
                        rounded-3xl
                        border
                        border-warm-stone/20
                        bg-white
                        shadow-warm
                    "
                >

                    <div className="p-6 md:p-8">


                        {/* =================================================
                            HEADER
                        ================================================= */}

                        <div
                            className="
                                flex
                                flex-col
                                gap-5
                                lg:flex-row
                                lg:items-start
                                lg:justify-between
                            "
                        >

                            <div>

                                <h1
                                    className="
                                        font-serif
                                        text-3xl
                                        font-bold
                                        text-espresso
                                        md:text-4xl
                                    "
                                >
                                    {booking.hotelName}
                                </h1>


                                <div
                                    className="
                                        mt-3
                                        flex
                                        items-center
                                        gap-2
                                        text-muted-foreground
                                    "
                                >

                                    <MapPin
                                        className="
                                            h-4
                                            w-4
                                            text-bronze
                                        "
                                    />

                                    <span>
                                        {booking.city}
                                    </span>

                                </div>

                            </div>


                            {/* STATUS */}

                            <div
                                className="
                                    flex
                                    flex-wrap
                                    gap-2
                                "
                            >

                                <span
                                    className={`
                                        rounded-full
                                        px-4
                                        py-2
                                        text-center
                                        text-xs
                                        font-semibold
                                        ${
                                            booking.bookingStatus ===
                                            "BOOKED"
                                                ? "border border-bronze/20 bg-bronze/10 text-bronze"
                                                : booking.bookingStatus ===
                                                    "PAYMENT_PENDING"
                                                    ? "border border-amber-200 bg-amber-50 text-amber-700"
                                                    : booking.bookingStatus ===
                                                        "CANCELLED"
                                                        ? "border border-red-200 bg-red-50 text-red-600"
                                                        : "border border-warm-stone/20 bg-warm-stone/10 text-muted-foreground"
                                        }
                                    `}
                                >
                                    {booking.bookingStatus.replace(
                                        "_",
                                        " "
                                    )}
                                </span>


                                <span
                                    className={`
                                        rounded-full
                                        px-4
                                        py-2
                                        text-center
                                        text-xs
                                        font-semibold
                                        ${
                                            booking.paymentStatus ===
                                            "SUCCESS"
                                                ? "border border-bronze/20 bg-bronze/10 text-bronze"
                                                : booking.paymentStatus ===
                                                    "PENDING"
                                                    ? "border border-amber-200 bg-amber-50 text-amber-700"
                                                    : booking.paymentStatus ===
                                                        "FAILED"
                                                        ? "border border-red-200 bg-red-50 text-red-600"
                                                        : "border border-warm-stone/20 bg-warm-stone/10 text-muted-foreground"
                                        }
                                    `}
                                >
                                    {booking.paymentStatus}
                                </span>

                            </div>

                        </div>


                        {/* =================================================
                            DIVIDER
                        ================================================= */}

                        <div
                            className="
                                my-8
                                h-px
                                bg-warm-stone/20
                            "
                        />


                        {/* =================================================
                            BOOKING DETAILS
                        ================================================= */}

                        <div>

                            <h2
                                className="
                                    mb-6
                                    font-serif
                                    text-2xl
                                    font-semibold
                                    text-espresso
                                "
                            >
                                Booking Details
                            </h2>


                            <div
                                className="
                                    grid
                                    gap-5
                                    sm:grid-cols-2
                                    lg:grid-cols-4
                                "
                            >

                                {/* Booking ID */}

                                <div>

                                    <p
                                        className="
                                            text-sm
                                            text-muted-foreground
                                        "
                                    >
                                        Booking ID
                                    </p>

                                    <p
                                        className="
                                            mt-1
                                            font-semibold
                                            text-espresso
                                        "
                                    >
                                        #{booking.bookingId}
                                    </p>

                                </div>


                                {/* Room Type */}

                                <div>

                                    <p
                                        className="
                                            text-sm
                                            text-muted-foreground
                                        "
                                    >
                                        Room Type
                                    </p>

                                    <p
                                        className="
                                            mt-1
                                            font-semibold
                                            text-espresso
                                        "
                                    >
                                        {booking.roomType}
                                    </p>

                                </div>


                                {/* Check In */}

                                <div>

                                    <p
                                        className="
                                            text-sm
                                            text-muted-foreground
                                        "
                                    >
                                        Check In
                                    </p>

                                    <div
                                        className="
                                            mt-1
                                            flex
                                            items-center
                                            gap-2
                                        "
                                    >

                                        <Calendar
                                            className="
                                                h-4
                                                w-4
                                                text-bronze
                                            "
                                        />

                                        <span
                                            className="
                                                font-semibold
                                                text-espresso
                                            "
                                        >
                                            {formatDate(
                                                booking.checkInDate
                                            )}
                                        </span>

                                    </div>

                                </div>


                                {/* Check Out */}

                                <div>

                                    <p
                                        className="
                                            text-sm
                                            text-muted-foreground
                                        "
                                    >
                                        Check Out
                                    </p>

                                    <div
                                        className="
                                            mt-1
                                            flex
                                            items-center
                                            gap-2
                                        "
                                    >

                                        <Calendar
                                            className="
                                                h-4
                                                w-4
                                                text-bronze
                                            "
                                        />

                                        <span
                                            className="
                                                font-semibold
                                                text-espresso
                                            "
                                        >
                                            {formatDate(
                                                booking.checkOutDate
                                            )}
                                        </span>

                                    </div>

                                </div>


                                {/* Adults */}

                                <div>

                                    <p
                                        className="
                                            text-sm
                                            text-muted-foreground
                                        "
                                    >
                                        Adults
                                    </p>

                                    <div
                                        className="
                                            mt-1
                                            flex
                                            items-center
                                            gap-2
                                        "
                                    >

                                        <Users
                                            className="
                                                h-4
                                                w-4
                                                text-bronze
                                            "
                                        />

                                        <span
                                            className="
                                                font-semibold
                                                text-espresso
                                            "
                                        >
                                            {booking.adultCount}
                                        </span>

                                    </div>

                                </div>


                                {/* Children */}

                                <div>

                                    <p
                                        className="
                                            text-sm
                                            text-muted-foreground
                                        "
                                    >
                                        Children
                                    </p>

                                    <div
                                        className="
                                            mt-1
                                            flex
                                            items-center
                                            gap-2
                                        "
                                    >

                                        <Users
                                            className="
                                                h-4
                                                w-4
                                                text-bronze
                                            "
                                        />

                                        <span
                                            className="
                                                font-semibold
                                                text-espresso
                                            "
                                        >
                                            {booking.childCount}
                                        </span>

                                    </div>

                                </div>


                                {/* Amount */}

                                <div>

                                    <p
                                        className="
                                            text-sm
                                            text-muted-foreground
                                        "
                                    >
                                        Amount Paid
                                    </p>

                                    <p
                                        className="
                                            mt-1
                                            text-2xl
                                            font-bold
                                            text-bronze
                                        "
                                    >
                                        ₹
                                        {formatPrice(
                                            Number(
                                                booking.amount
                                            )
                                        )}
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            DIVIDER
                        ================================================= */}

                        <div
                            className="
                                my-8
                                h-px
                                bg-warm-stone/20
                            "
                        />


                        {/* =================================================
                            GUEST DETAILS
                        ================================================= */}

                        <div>

                            <div className="mb-5">

                                <h2
                                    className="
                                        font-serif
                                        text-2xl
                                        font-semibold
                                        text-espresso
                                    "
                                >
                                    Guest Details
                                </h2>

                                <p
                                    className="
                                        mt-1
                                        text-sm
                                        text-muted-foreground
                                    "
                                >
                                    Guests staying at the property
                                </p>

                            </div>


                            {booking.guests &&
                            booking.guests.length > 0 ? (

                                <div
                                    className="
                                        space-y-3
                                    "
                                >

                                    {booking.guests.map(
                                        (guest) => (

                                            <div
                                                key={guest.id}
                                                className="
                                                    flex
                                                    items-center
                                                    rounded-2xl
                                                    border
                                                    border-warm-stone/20
                                                    bg-cream/30
                                                    px-5
                                                    py-4
                                                    transition-all
                                                    hover:bg-cream/50
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-4
                                                    "
                                                >

                                                    {/* Icon */}

                                                    <div
                                                        className="
                                                            flex
                                                            h-11
                                                            w-11
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-full
                                                            bg-bronze/10
                                                        "
                                                    >

                                                        <User
                                                            className="
                                                                h-5
                                                                w-5
                                                                text-bronze
                                                            "
                                                        />

                                                    </div>


                                                    {/* Details */}

                                                    <div>

                                                        <h3
                                                            className="
                                                                font-semibold
                                                                text-espresso
                                                            "
                                                        >
                                                            {guest.name}
                                                        </h3>

                                                        <p
                                                            className="
                                                                mt-1
                                                                text-sm
                                                                text-muted-foreground
                                                            "
                                                        >
                                                            {guest.gender}
                                                            {" • "}
                                                            {guest.age}
                                                            {" Years"}
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            ) : (

                                <div
                                    className="
                                        rounded-2xl
                                        border
                                        border-dashed
                                        border-warm-stone/30
                                        bg-cream/20
                                        p-8
                                        text-center
                                    "
                                >

                                    <div
                                        className="
                                            mx-auto
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-bronze/10
                                        "
                                    >

                                        <User
                                            className="
                                                h-6
                                                w-6
                                                text-bronze
                                            "
                                        />

                                    </div>


                                    <h3
                                        className="
                                            mt-4
                                            font-semibold
                                            text-espresso
                                        "
                                    >
                                        No Guest Details Added
                                    </h3>


                                    <p
                                        className="
                                            mx-auto
                                            mt-2
                                            max-w-md
                                            text-sm
                                            text-muted-foreground
                                        "
                                    >
                                        Add guest information before
                                        check-in for a faster arrival
                                        experience.
                                    </p>

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            REFUND RESULT
                        ================================================= */}

                        {cancelResult && (

                            <div
                                className="
                                    mt-8
                                    rounded-2xl
                                    border
                                    border-bronze/20
                                    bg-bronze/5
                                    p-6
                                "
                            >

                                <div>

                                    <h2
                                        className="
                                            font-serif
                                            text-xl
                                            font-semibold
                                            text-espresso
                                        "
                                    >
                                        Booking Cancelled
                                    </h2>

                                    <p
                                        className="
                                            mt-2
                                            text-sm
                                            text-muted-foreground
                                        "
                                    >
                                        {cancelResult.message}
                                    </p>

                                </div>


                                <div
                                    className="
                                        mt-5
                                        grid
                                        gap-4
                                        sm:grid-cols-2
                                    "
                                >

                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-warm-stone/15
                                            bg-white
                                            p-4
                                        "
                                    >

                                        <p
                                            className="
                                                text-sm
                                                text-muted-foreground
                                            "
                                        >
                                            Refund Status
                                        </p>

                                        <p
                                            className="
                                                mt-1
                                                font-semibold
                                                text-bronze
                                            "
                                        >
                                            {cancelResult.refundStatus}
                                        </p>

                                    </div>


                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-warm-stone/15
                                            bg-white
                                            p-4
                                        "
                                    >

                                        <p
                                            className="
                                                text-sm
                                                text-muted-foreground
                                            "
                                        >
                                            Refund Amount
                                        </p>

                                        <p
                                            className="
                                                mt-1
                                                text-lg
                                                font-bold
                                                text-espresso
                                            "
                                        >
                                            ₹
                                            {cancelResult.refundAmount.toLocaleString(
                                                "en-IN"
                                            )}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        )}


                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div
                            className="
                                mt-8
                                flex
                                flex-col
                                gap-3
                                border-t
                                border-warm-stone/20
                                pt-6
                                sm:flex-row
                                sm:flex-wrap
                                sm:items-center
                                sm:justify-end
                            "
                        >

                            {/* ADD / EDIT GUESTS */}

                            {booking.bookingStatus === "BOOKED" && (

                                <button
                                    onClick={() =>
                                        setLocation(
                                            `/my-bookings/${booking.bookingId}/guests`
                                        )
                                    }
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-bronze
                                        px-6
                                        py-3
                                        font-medium
                                        text-white
                                        shadow-sm
                                        transition-all
                                        hover:bg-bronze-dark
                                        hover:shadow-md
                                        active:scale-[0.98]
                                    "
                                >

                                    <User
                                        className="h-4 w-4"
                                    />

                                    {booking.guests &&
                                    booking.guests.length > 0
                                        ? "Edit Guests"
                                        : "Add Guests"}

                                </button>

                            )}


                            {/* DOWNLOAD RECEIPT */}

                            {booking.bookingStatus === "BOOKED" && (

                                <button
                                    onClick={() =>
                                        generateBookingReceipt(
                                            booking
                                        )
                                    }
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        border
                                        border-bronze/40
                                        bg-white
                                        px-6
                                        py-3
                                        font-medium
                                        text-bronze
                                        transition-all
                                        hover:border-bronze
                                        hover:bg-bronze/5
                                        active:scale-[0.98]
                                    "
                                >

                                    <Receipt
                                        className="h-4 w-4"
                                    />

                                    Download Receipt

                                </button>

                            )}


                            {/* CONTINUE PAYMENT */}

                            {booking.bookingStatus ===
                                "PAYMENT_PENDING" && (

                                <button
                                    onClick={() =>
                                        setLocation(
                                            `/booking/${booking.bookingId}`
                                        )
                                    }
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-bronze
                                        px-6
                                        py-3
                                        font-medium
                                        text-white
                                        shadow-sm
                                        transition-all
                                        hover:bg-bronze-dark
                                        hover:shadow-md
                                        active:scale-[0.98]
                                    "
                                >

                                    <CreditCard
                                        className="h-4 w-4"
                                    />

                                    Continue Payment

                                </button>

                            )}


                            {/* CANCEL BOOKING */}

                            {(booking.bookingStatus ===
                                "BOOKED" ||
                                booking.bookingStatus ===
                                "PAYMENT_PENDING") && (

                                <button
                                    onClick={
                                        cancelBooking
                                    }
                                    disabled={
                                        cancelLoading
                                    }
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        border
                                        border-red-200
                                        bg-white
                                        px-6
                                        py-3
                                        font-medium
                                        text-red-600
                                        transition-all
                                        hover:border-red-300
                                        hover:bg-red-50
                                        active:scale-[0.98]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >

                                    {cancelLoading ? (

                                        <Loader2
                                            className="
                                                h-4
                                                w-4
                                                animate-spin
                                            "
                                        />

                                    ) : (

                                        <XCircle
                                            className="
                                                h-4
                                                w-4
                                            "
                                        />

                                    )}

                                    Cancel Booking

                                </button>

                            )}

                        </div>

                    </div>

                </motion.div>

            </div>

        </MainLayout>

    );
}