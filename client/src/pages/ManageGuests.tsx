import { useEffect, useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";

import {
    ArrowLeft,
    Loader2,
    User,
    Users,
    Plus,
    Trash2,
    CheckCircle2,
} from "lucide-react";

import { toast } from "sonner";

import MainLayout from "@/layouts/MainLayout";
import { bookingsApi } from "@/api/bookings";
import type { BookingDetails } from "@/types";


type Gender =
    | "MALE"
    | "FEMALE"
    | "Others";


interface GuestForm {
    name: string;
    age: string;
    gender: Gender | "";
}


export default function ManageGuests() {

    const [, setLocation] =
        useLocation();

    const [, params] =
        useRoute<{
            bookingId: string;
        }>(
            "/my-bookings/:bookingId/guests"
        );


    const bookingId =
        Number(params?.bookingId);


    const [booking, setBooking] =
        useState<BookingDetails | null>(
            null
        );


    const [loading, setLoading] =
        useState(true);


    const [submitting, setSubmitting] =
        useState(false);


    const [guestForm, setGuestForm] =
        useState<GuestForm>({
            name: "",
            age: "",
            gender: "",
        });


    const [editingGuestId, setEditingGuestId] =
        useState<number | null>(null);


    const [editGuest, setEditGuest] =
        useState({
            name: "",
            age: "",
            gender:
                "" as
                    | "MALE"
                    | "FEMALE"
                    | "Others"
                    | "",
        });


    const [guestActionLoading, setGuestActionLoading] =
        useState(false);


    const [newGuests, setNewGuests] =
        useState<GuestForm[]>([]);


    // =====================================================
    // LOAD BOOKING
    // =====================================================

    useEffect(() => {

        if (bookingId) {
            loadBooking();
        }

    }, [bookingId]);


    async function loadBooking() {

        try {

            setLoading(true);

            const { data } =
                await bookingsApi.getBookingDetails(
                    bookingId
                );

            setBooking(data);

        } catch (err: any) {

            toast.error(
                err?.response?.data?.message ||
                "Unable to load booking."
            );

        } finally {

            setLoading(false);

        }

    }


    // =====================================================
    // EXISTING GUESTS
    // =====================================================

    const existingGuests =
        booking?.guests ?? [];


    // =====================================================
    // REQUIRED GUESTS
    // =====================================================

    const requiredGuests =
        useMemo(() => {

            if (!booking) {
                return 0;
            }

            return (
                Number(
                    booking.adultCount ?? 0
                ) +
                Number(
                    booking.childCount ?? 0
                )
            );

        }, [booking]);


    const totalGuests =
        existingGuests.length +
        newGuests.length;


    const remainingGuests =
        Math.max(
            requiredGuests -
                totalGuests,
            0
        );


    // =====================================================
    // CHECK-IN STARTED
    // =====================================================

    /*
     * For DAILY bookings:
     *
     * Guest modification stops when
     * the check-in date begins.
     *
     * For HOURLY bookings:
     *
     * Guest modification stops at the
     * exact check-in date + check-in time.
     */

    function hasCheckInStarted(): boolean {

        if (!booking) {
            return false;
        }

        const now =
            new Date();


        // =================================================
        // HOURLY BOOKING
        // =================================================

        if (
            booking.bookingMode ===
                "HOURLY" &&
            booking.checkInTime
        ) {

            const checkInDateTime =
                new Date(
                    `${booking.checkInDate}T${booking.checkInTime}`
                );

            return (
                now >=
                checkInDateTime
            );
        }


        // =================================================
        // DAILY BOOKING
        // =================================================

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );


        const checkInDate =
            new Date(
                `${booking.checkInDate}T00:00:00`
            );

        checkInDate.setHours(
            0,
            0,
            0,
            0
        );


        return (
            today >=
            checkInDate
        );
    }


    const checkInStarted =
        hasCheckInStarted();


    // =====================================================
    // ENSURE MODIFICATION IS ALLOWED
    // =====================================================

    function ensureGuestModificationAllowed(): boolean {

        if (checkInStarted) {

            toast.error(
                "Guest details cannot be modified after check-in has started."
            );

            return false;
        }

        return true;
    }


    // =====================================================
    // FORM CHANGE
    // =====================================================

    function handleFormChange(
        field: keyof GuestForm,
        value: string
    ) {

        setGuestForm(
            (previous) => ({
                ...previous,
                [field]: value,
            })
        );
    }


    // =====================================================
    // ADD GUEST TO TEMPORARY LIST
    // =====================================================

    function addGuestToList() {

        if (
            !ensureGuestModificationAllowed()
        ) {
            return;
        }


        const name =
            guestForm.name.trim();


        if (!name) {

            toast.error(
                "Please enter guest name."
            );

            return;
        }


        if (!guestForm.age) {

            toast.error(
                "Please enter guest age."
            );

            return;
        }


        const age =
            Number(
                guestForm.age
            );


        if (
            !Number.isInteger(age) ||
            age <= 0 ||
            age > 120
        ) {

            toast.error(
                "Please enter a valid age."
            );

            return;
        }


        if (!guestForm.gender) {

            toast.error(
                "Please select guest gender."
            );

            return;
        }


        if (remainingGuests <= 0) {

            toast.error(
                "All required guest details have already been added."
            );

            return;
        }


        setNewGuests(
            (previous) => [
                ...previous,
                {
                    name,
                    age: String(age),
                    gender:
                        guestForm.gender,
                },
            ]
        );


        setGuestForm({
            name: "",
            age: "",
            gender: "",
        });


        toast.success(
            "Guest added to the list."
        );
    }


    // =====================================================
    // REMOVE TEMPORARY GUEST
    // =====================================================

    function removeNewGuest(
        index: number
    ) {

        if (
            !ensureGuestModificationAllowed()
        ) {
            return;
        }


        setNewGuests(
            (previous) =>
                previous.filter(
                    (_, guestIndex) =>
                        guestIndex !==
                        index
                )
        );
    }


    // =====================================================
    // START EDITING GUEST
    // =====================================================

    function startEditingGuest(
        guest: {
            id: number;
            name: string;
            age: number;
            gender: string;
        }
    ) {

        if (
            !ensureGuestModificationAllowed()
        ) {
            return;
        }


        const normalizedGender =
            guest.gender === "MALE" ||
            guest.gender === "FEMALE" ||
            guest.gender === "Others"
                ? (
                    guest.gender as Gender
                )
                : "";


        setEditingGuestId(
            guest.id
        );


        setEditGuest({
            name: guest.name,
            age: String(
                guest.age
            ),
            gender:
                normalizedGender,
        });
    }


    // =====================================================
    // UPDATE GUEST
    // =====================================================

    async function updateGuest() {

        if (
            !ensureGuestModificationAllowed()
        ) {
            return;
        }


        if (!editingGuestId) {
            return;
        }


        if (
            !editGuest.name.trim() ||
            !editGuest.age ||
            !editGuest.gender
        ) {

            toast.error(
                "Please enter all guest details."
            );

            return;
        }


        const age =
            Number(
                editGuest.age
            );


        if (
            !Number.isInteger(age) ||
            age <= 0 ||
            age > 120
        ) {

            toast.error(
                "Please enter a valid age."
            );

            return;
        }


        try {

            setGuestActionLoading(
                true
            );


            await bookingsApi.updateGuest(
                bookingId,
                editingGuestId,
                {
                    name:
                        editGuest.name.trim(),
                    age,
                    gender:
                        editGuest.gender,
                }
            );


            toast.success(
                "Guest details updated successfully."
            );


            setEditingGuestId(
                null
            );


            await loadBooking();

        } catch (err: any) {

            toast.error(
                err?.response?.data?.message ||
                "Unable to update guest details."
            );

        } finally {

            setGuestActionLoading(
                false
            );

        }
    }


    // =====================================================
    // DELETE GUEST
    // =====================================================

    async function deleteGuest(
        guestId: number
    ) {

        if (
            !ensureGuestModificationAllowed()
        ) {
            return;
        }


        if (
            !window.confirm(
                "Are you sure you want to remove this guest?"
            )
        ) {
            return;
        }


        try {

            setGuestActionLoading(
                true
            );


            await bookingsApi.deleteGuest(
                bookingId,
                guestId
            );


            toast.success(
                "Guest removed successfully."
            );


            await loadBooking();

        } catch (err: any) {

            toast.error(
                err?.response?.data?.message ||
                "Unable to remove guest."
            );

        } finally {

            setGuestActionLoading(
                false
            );

        }
    }


    // =====================================================
    // SAVE NEW GUESTS
    // =====================================================

    async function saveGuests() {

        if (
            !ensureGuestModificationAllowed()
        ) {
            return;
        }


        if (
            newGuests.length === 0
        ) {

            toast.error(
                "Please add at least one guest."
            );

            return;
        }


        const availableGuestSlots =
            Math.max(
                requiredGuests -
                    existingGuests.length,
                0
            );


        if (
            newGuests.length >
            availableGuestSlots
        ) {

            toast.error(
                `You can add only ${availableGuestSlots} more guest${
                    availableGuestSlots === 1
                        ? ""
                        : "s"
                }.`
            );

            return;
        }


        try {

            setSubmitting(
                true
            );


            await bookingsApi.addGuests(
                bookingId,
                newGuests.map(
                    (guest) => ({
                        name:
                            guest.name.trim(),
                        age:
                            Number(
                                guest.age
                            ),
                        gender:
                            guest.gender as
                                | "MALE"
                                | "FEMALE"
                                | "Others",
                    })
                )
            );


            toast.success(
                "Guest details added successfully."
            );


            setNewGuests([]);


            await loadBooking();

        } catch (err: any) {

            toast.error(
                err?.response?.data?.message ||
                "Unable to add guest details."
            );

        } finally {

            setSubmitting(
                false
            );

        }
    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <MainLayout>

                <div className="flex min-h-[70vh] items-center justify-center">

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

                <div className="container max-w-3xl py-20 text-center">

                    <User
                        className="
                            mx-auto
                            h-14
                            w-14
                            text-muted-foreground
                        "
                    />

                    <h1
                        className="
                            mt-5
                            font-serif
                            text-3xl
                            font-bold
                            text-espresso
                        "
                    >
                        Booking Not Found
                    </h1>


                    <p className="mt-2 text-muted-foreground">

                        We couldn't find the booking
                        you're looking for.

                    </p>


                    <button
                        onClick={() =>
                            setLocation(
                                "/my-bookings"
                            )
                        }
                        className="
                            mt-7
                            rounded-xl
                            bg-bronze
                            px-6
                            py-3
                            font-semibold
                            text-white
                            transition
                            hover:bg-bronze-dark
                        "
                    >
                        Back to My Bookings
                    </button>

                </div>

            </MainLayout>

        );
    }


    // =====================================================
    // UI
    // =====================================================

    return (

        <MainLayout>

            <div className="container max-w-4xl py-10">

                {/* BACK */}

                <button
                    onClick={() =>
                        setLocation(
                            `/my-bookings/${booking.bookingId}`
                        )
                    }
                    className="
                        mb-8
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-bronze
                        px-4
                        py-2
                        font-medium
                        text-bronze
                        transition
                        hover:bg-bronze
                        hover:text-white
                    "
                >

                    <ArrowLeft
                        className="h-4 w-4"
                    />

                    Back to Booking Details

                </button>


                {/* MAIN CARD */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 15,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="
                        overflow-hidden
                        rounded-3xl
                        bg-white
                        shadow-warm
                    "
                >

                    {/* HEADER */}

                    <div
                        className="
                            bg-gradient-to-r
                            from-bronze/10
                            to-cream
                            p-8
                        "
                    >

                        <div className="flex items-start gap-4">

                            <div
                                className="
                                    flex
                                    h-14
                                    w-14
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-bronze/10
                                "
                            >

                                <Users
                                    className="
                                        h-7
                                        w-7
                                        text-bronze
                                    "
                                />

                            </div>


                            <div>

                                <h1
                                    className="
                                        font-serif
                                        text-3xl
                                        font-bold
                                        text-espresso
                                    "
                                >
                                    Manage Guests
                                </h1>


                                <p className="mt-1 text-muted-foreground">
                                    {booking.hotelName}
                                </p>


                                <p className="mt-1 text-sm text-muted-foreground">
                                    Booking #{booking.bookingId}
                                </p>


                                {/* BOOKING TIME */}

                                <p className="mt-2 text-sm font-medium text-bronze">

                                    {booking.bookingMode ===
                                        "HOURLY" &&
                                        booking.checkInTime
                                        ? `Check-in: ${booking.checkInDate} at ${booking.checkInTime.slice(0, 5)}`
                                        : `Check-in: ${booking.checkInDate}`}

                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="p-8">

                        {/* CHECK-IN WARNING */}

                        {checkInStarted && (

                            <div
                                className="
                                    mb-8
                                    rounded-2xl
                                    border
                                    border-amber-200
                                    bg-amber-50
                                    p-5
                                "
                            >

                                <div className="flex items-start gap-3">

                                    <div
                                        className="
                                            mt-0.5
                                            flex
                                            h-9
                                            w-9
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-amber-100
                                        "
                                    >

                                        <User
                                            className="
                                                h-5
                                                w-5
                                                text-amber-700
                                            "
                                        />

                                    </div>


                                    <div>

                                        <p className="font-semibold text-amber-800">
                                            Guest modification is no longer available
                                        </p>

                                        <p className="mt-1 text-sm text-amber-700">

                                            Check-in has already started for
                                            this booking. Guest details can
                                            no longer be added, edited, or
                                            removed.

                                        </p>

                                    </div>

                                </div>

                            </div>

                        )}


                        {/* GUEST COUNT */}

                        <div className="grid gap-4 sm:grid-cols-3">

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-warm-stone/20
                                    bg-cream/40
                                    p-5
                                "
                            >

                                <p className="text-sm text-muted-foreground">
                                    Required Guests
                                </p>

                                <p className="mt-1 text-2xl font-bold text-espresso">
                                    {requiredGuests}
                                </p>

                            </div>


                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-warm-stone/20
                                    bg-cream/40
                                    p-5
                                "
                            >

                                <p className="text-sm text-muted-foreground">
                                    Added Guests
                                </p>

                                <p className="mt-1 text-2xl font-bold text-espresso">
                                    {totalGuests}
                                </p>

                            </div>


                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-warm-stone/20
                                    bg-cream/40
                                    p-5
                                "
                            >

                                <p className="text-sm text-muted-foreground">
                                    Remaining
                                </p>

                                <p
                                    className={`
                                        mt-1
                                        text-2xl
                                        font-bold
                                        ${
                                            remainingGuests === 0
                                                ? "text-green-600"
                                                : "text-bronze"
                                        }
                                    `}
                                >
                                    {remainingGuests}
                                </p>

                            </div>

                        </div>


                        {/* EXISTING GUESTS */}

                        <div className="mt-10">

                            <div className="flex items-center justify-between">

                                <div>

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

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Guests already added to this booking.
                                    </p>

                                </div>


                                {existingGuests.length > 0 && (

                                    <CheckCircle2
                                        className="
                                            h-6
                                            w-6
                                            text-green-500
                                        "
                                    />

                                )}

                            </div>


                            {existingGuests.length > 0 ? (

                                <div className="mt-5 space-y-3">

                                    {existingGuests.map(
                                        (guest) => (

                                            <div
                                                key={guest.id}
                                                className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    rounded-2xl
                                                    border
                                                    border-warm-stone/20
                                                    bg-cream/40
                                                    p-5
                                                "
                                            >

                                                <div className="flex items-center gap-4">

                                                    <div
                                                        className="
                                                            flex
                                                            h-11
                                                            w-11
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


                                                    <div>

                                                        <p className="font-semibold text-espresso">
                                                            {guest.name}
                                                        </p>

                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {guest.gender}
                                                            {" • "}
                                                            {guest.age}
                                                            {" years"}
                                                        </p>

                                                    </div>

                                                </div>


                                                {/* ACTIONS */}

                                                {!checkInStarted && (

                                                    <div className="flex items-center gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                startEditingGuest(
                                                                    guest
                                                                )
                                                            }
                                                            disabled={
                                                                guestActionLoading
                                                            }
                                                            className="
                                                                rounded-lg
                                                                border
                                                                border-bronze
                                                                px-3
                                                                py-2
                                                                text-sm
                                                                font-medium
                                                                text-bronze
                                                                transition
                                                                hover:bg-bronze
                                                                hover:text-white
                                                                disabled:opacity-50
                                                            "
                                                        >
                                                            Edit
                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteGuest(
                                                                    guest.id
                                                                )
                                                            }
                                                            disabled={
                                                                guestActionLoading
                                                            }
                                                            className="
                                                                rounded-lg
                                                                border
                                                                border-red-500
                                                                px-3
                                                                py-2
                                                                text-sm
                                                                font-medium
                                                                text-red-600
                                                                transition
                                                                hover:bg-red-500
                                                                hover:text-white
                                                                disabled:opacity-50
                                                            "
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                )}

                                            </div>

                                        )
                                    )}

                                </div>

                            ) : (

                                <div
                                    className="
                                        mt-5
                                        rounded-2xl
                                        border
                                        border-dashed
                                        border-warm-stone/30
                                        p-8
                                        text-center
                                    "
                                >

                                    <User
                                        className="
                                            mx-auto
                                            h-10
                                            w-10
                                            text-muted-foreground
                                        "
                                    />

                                    <p className="mt-3 font-medium text-espresso">
                                        No guest details added yet
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Add the guests who will be staying at the hotel.
                                    </p>

                                </div>

                            )}

                        </div>


                        {/* EDIT GUEST */}

                        {!checkInStarted &&
                            editingGuestId !== null && (

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

                                <div className="mb-6">

                                    <h2
                                        className="
                                            font-serif
                                            text-xl
                                            font-semibold
                                            text-espresso
                                        "
                                    >
                                        Update Guest
                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Update the guest information below.
                                    </p>

                                </div>


                                <div className="grid gap-5 md:grid-cols-3">

                                    {/* NAME */}

                                    <div>

                                        <label className="mb-2 block text-sm font-medium text-espresso">
                                            Guest Name
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                editGuest.name
                                            }
                                            onChange={(e) =>
                                                setEditGuest(
                                                    (previous) => ({
                                                        ...previous,
                                                        name:
                                                            e.target.value,
                                                    })
                                                )
                                            }
                                            placeholder="Enter guest name"
                                            className="
                                                w-full
                                                rounded-xl
                                                border
                                                border-warm-stone/30
                                                bg-white
                                                px-4
                                                py-3
                                                outline-none
                                                transition
                                                focus:border-bronze
                                                focus:ring-2
                                                focus:ring-bronze/20
                                            "
                                        />

                                    </div>


                                    {/* AGE */}

                                    <div>

                                        <label className="mb-2 block text-sm font-medium text-espresso">
                                            Age
                                        </label>

                                        <input
                                            type="number"
                                            min="1"
                                            max="120"
                                            value={
                                                editGuest.age
                                            }
                                            onChange={(e) =>
                                                setEditGuest(
                                                    (previous) => ({
                                                        ...previous,
                                                        age:
                                                            e.target.value,
                                                    })
                                                )
                                            }
                                            placeholder="Enter age"
                                            className="
                                                w-full
                                                rounded-xl
                                                border
                                                border-warm-stone/30
                                                bg-white
                                                px-4
                                                py-3
                                                outline-none
                                                transition
                                                focus:border-bronze
                                                focus:ring-2
                                                focus:ring-bronze/20
                                            "
                                        />

                                    </div>


                                    {/* GENDER */}

                                    <div>

                                        <label className="mb-2 block text-sm font-medium text-espresso">
                                            Gender
                                        </label>

                                        <select
                                            value={
                                                editGuest.gender
                                            }
                                            onChange={(e) =>
                                                setEditGuest(
                                                    (previous) => ({
                                                        ...previous,
                                                        gender:
                                                            e.target.value as
                                                                | Gender
                                                                | "",
                                                    })
                                                )
                                            }
                                            className="
                                                w-full
                                                rounded-xl
                                                border
                                                border-warm-stone/30
                                                bg-white
                                                px-4
                                                py-3
                                                outline-none
                                                transition
                                                focus:border-bronze
                                                focus:ring-2
                                                focus:ring-bronze/20
                                            "
                                        >

                                            <option value="">
                                                Select gender
                                            </option>

                                            <option value="MALE">
                                                Male
                                            </option>

                                            <option value="FEMALE">
                                                Female
                                            </option>

                                            <option value="Others">
                                                Other
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                <div className="mt-5 flex gap-3">

                                    <button
                                        type="button"
                                        onClick={
                                            updateGuest
                                        }
                                        disabled={
                                            guestActionLoading
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            rounded-xl
                                            bg-bronze
                                            px-6
                                            py-3
                                            font-semibold
                                            text-white
                                            transition
                                            hover:bg-bronze-dark
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    >

                                        {guestActionLoading && (

                                            <Loader2
                                                className="
                                                    h-4
                                                    w-4
                                                    animate-spin
                                                "
                                            />

                                        )}

                                        Update Guest

                                    </button>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditingGuestId(
                                                null
                                            )
                                        }
                                        disabled={
                                            guestActionLoading
                                        }
                                        className="
                                            rounded-xl
                                            border
                                            border-warm-stone/30
                                            px-6
                                            py-3
                                            font-semibold
                                            text-espresso
                                            transition
                                            hover:bg-cream
                                            disabled:opacity-50
                                        "
                                    >
                                        Cancel
                                    </button>

                                </div>

                            </div>

                        )}


                        {/* NEW GUESTS */}

                        {!checkInStarted &&
                            newGuests.length > 0 && (

                            <div className="mt-10">

                                <h2
                                    className="
                                        font-serif
                                        text-2xl
                                        font-semibold
                                        text-espresso
                                    "
                                >
                                    Guests to Add
                                </h2>


                                <div className="mt-5 space-y-3">

                                    {newGuests.map(
                                        (
                                            guest,
                                            index
                                        ) => (

                                            <div
                                                key={`${guest.name}-${index}`}
                                                className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    rounded-2xl
                                                    border
                                                    border-bronze/20
                                                    bg-bronze/5
                                                    p-5
                                                "
                                            >

                                                <div className="flex items-center gap-4">

                                                    <div
                                                        className="
                                                            flex
                                                            h-11
                                                            w-11
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


                                                    <div>

                                                        <p className="font-semibold text-espresso">
                                                            {guest.name}
                                                        </p>

                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {guest.gender}
                                                            {" • "}
                                                            {guest.age}
                                                            {" years"}
                                                        </p>

                                                    </div>

                                                </div>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeNewGuest(
                                                            index
                                                        )
                                                    }
                                                    className="
                                                        rounded-lg
                                                        p-2
                                                        text-red-500
                                                        transition
                                                        hover:bg-red-50
                                                    "
                                                    title="Remove"
                                                >

                                                    <Trash2
                                                        className="h-5 w-5"
                                                    />

                                                </button>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        )}


                        {/* ADD GUEST FORM */}

                        {!checkInStarted &&
                            remainingGuests > 0 && (

                            <div
                                className="
                                    mt-10
                                    rounded-2xl
                                    border
                                    border-warm-stone/20
                                    bg-muted/20
                                    p-6
                                "
                            >

                                <div className="mb-6">

                                    <h2
                                        className="
                                            font-serif
                                            text-xl
                                            font-semibold
                                            text-espresso
                                        "
                                    >
                                        Add Guest
                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">

                                        You can add{" "}
                                        {remainingGuests}{" "}
                                        more guest
                                        {remainingGuests ===
                                        1
                                            ? ""
                                            : "s"}.

                                    </p>

                                </div>


                                <div className="grid gap-5 md:grid-cols-3">

                                    {/* NAME */}

                                    <div className="md:col-span-1">

                                        <label className="mb-2 block text-sm font-medium text-espresso">
                                            Guest Name
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                guestForm.name
                                            }
                                            onChange={(e) =>
                                                handleFormChange(
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter guest name"
                                            className="
                                                w-full
                                                rounded-xl
                                                border
                                                border-warm-stone/30
                                                bg-white
                                                px-4
                                                py-3
                                                outline-none
                                                transition
                                                focus:border-bronze
                                                focus:ring-2
                                                focus:ring-bronze/20
                                            "
                                        />

                                    </div>


                                    {/* AGE */}

                                    <div>

                                        <label className="mb-2 block text-sm font-medium text-espresso">
                                            Age
                                        </label>

                                        <input
                                            type="number"
                                            min="1"
                                            max="120"
                                            value={
                                                guestForm.age
                                            }
                                            onChange={(e) =>
                                                handleFormChange(
                                                    "age",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter age"
                                            className="
                                                w-full
                                                rounded-xl
                                                border
                                                border-warm-stone/30
                                                bg-white
                                                px-4
                                                py-3
                                                outline-none
                                                transition
                                                focus:border-bronze
                                                focus:ring-2
                                                focus:ring-bronze/20
                                            "
                                        />

                                    </div>


                                    {/* GENDER */}

                                    <div>

                                        <label className="mb-2 block text-sm font-medium text-espresso">
                                            Gender
                                        </label>

                                        <select
                                            value={
                                                guestForm.gender
                                            }
                                            onChange={(e) =>
                                                handleFormChange(
                                                    "gender",
                                                    e.target.value
                                                )
                                            }
                                            className="
                                                w-full
                                                rounded-xl
                                                border
                                                border-warm-stone/30
                                                bg-white
                                                px-4
                                                py-3
                                                outline-none
                                                transition
                                                focus:border-bronze
                                                focus:ring-2
                                                focus:ring-bronze/20
                                            "
                                        >

                                            <option value="">
                                                Select gender
                                            </option>

                                            <option value="MALE">
                                                Male
                                            </option>

                                            <option value="FEMALE">
                                                Female
                                            </option>

                                            <option value="Others">
                                                Other
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        addGuestToList
                                    }
                                    disabled={
                                        submitting ||
                                        guestActionLoading
                                    }
                                    className="
                                        mt-5
                                        flex
                                        items-center
                                        gap-2
                                        rounded-xl
                                        border
                                        border-bronze
                                        px-5
                                        py-3
                                        font-semibold
                                        text-bronze
                                        transition
                                        hover:bg-bronze
                                        hover:text-white
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >

                                    <Plus className="h-4 w-4" />

                                    Add Guest

                                </button>

                            </div>

                        )}


                        {/* ALL GUESTS ADDED */}

                        {!checkInStarted &&
                            remainingGuests === 0 && (

                            <div
                                className="
                                    mt-10
                                    rounded-2xl
                                    border
                                    border-green-200
                                    bg-green-50
                                    p-5
                                "
                            >

                                <div className="flex items-center gap-3">

                                    <CheckCircle2
                                        className="
                                            h-6
                                            w-6
                                            text-green-600
                                        "
                                    />

                                    <div>

                                        <p className="font-semibold text-green-800">
                                            All guest details have been added.
                                        </p>

                                        <p className="mt-1 text-sm text-green-700">
                                            No additional guest information is required.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        )}


                        {/* SAVE GUESTS */}

                        {!checkInStarted &&
                            newGuests.length > 0 && (

                            <div className="mt-8 flex justify-end">

                                <button
                                    type="button"
                                    onClick={
                                        saveGuests
                                    }
                                    disabled={
                                        submitting
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        rounded-xl
                                        bg-bronze
                                        px-7
                                        py-3
                                        font-semibold
                                        text-white
                                        shadow-sm
                                        transition
                                        hover:bg-bronze-dark
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >

                                    {submitting && (

                                        <Loader2
                                            className="
                                                h-4
                                                w-4
                                                animate-spin
                                            "
                                        />

                                    )}

                                    Save Guest Details

                                </button>

                            </div>

                        )}

                    </div>

                </motion.div>

            </div>

        </MainLayout>
    );
}