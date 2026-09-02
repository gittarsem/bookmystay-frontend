import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BedDouble,
  Building2,
  Calendar,
  ChevronDown,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

import {
  ownerHotelsApi,
  type OwnerHotelResponse,
} from "@/api/ownerHotels";

import {
  ownerBookingsApi,
  type OwnerBooking,
  type OwnerBookingDetails,
  type OwnerBookingStatus,
} from "@/api/ownerBookings";

const BOOKING_STATUSES: OwnerBookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "EXPIRED",
];

export default function OwnerBookings() {
  const [hotels, setHotels] = useState<
    OwnerHotelResponse[]
  >([]);

  const [selectedHotelId, setSelectedHotelId] =
    useState<number | null>(null);

  const [bookings, setBookings] = useState<
    OwnerBooking[]
  >([]);

  const [selectedStatus, setSelectedStatus] =
    useState<OwnerBookingStatus | "ALL">("ALL");

  const [selectedBooking, setSelectedBooking] =
    useState<OwnerBookingDetails | null>(null);

  const [loadingHotels, setLoadingHotels] =
    useState(true);

  const [loadingBookings, setLoadingBookings] =
    useState(false);

  const [loadingDetails, setLoadingDetails] =
    useState(false);

  useEffect(() => {
    loadHotels();
  }, []);

  useEffect(() => {
    if (selectedHotelId !== null) {
      loadBookings(
        selectedHotelId,
        selectedStatus
      );
    }
  }, [selectedHotelId, selectedStatus]);

  async function loadHotels() {
    try {
      setLoadingHotels(true);

      const response =
        await ownerHotelsApi.getMyHotels();

      setHotels(response.data);

      if (
        response.data.length > 0 &&
        selectedHotelId === null
      ) {
        setSelectedHotelId(
          response.data[0].id
        );
      }
    } catch (error) {
      console.error(
        "Failed to load owner hotels:",
        error
      );

      toast.error(
        "Unable to load your properties."
      );
    } finally {
      setLoadingHotels(false);
    }
  }

  async function loadBookings(
    hotelId: number,
    status: OwnerBookingStatus | "ALL"
  ) {
    try {
      setLoadingBookings(true);

      const response =
        await ownerBookingsApi.getHotelBookings(
          hotelId,
          status === "ALL"
            ? undefined
            : status
        );

      setBookings(response.data);
    } catch (error) {
      console.error(
        "Failed to load hotel bookings:",
        error
      );

      setBookings([]);

      toast.error(
        "Unable to load bookings."
      );
    } finally {
      setLoadingBookings(false);
    }
  }

  async function handleViewBooking(
    bookingId: number
  ) {
    if (selectedHotelId === null) {
      return;
    }

    try {
      setLoadingDetails(true);

      const response =
        await ownerBookingsApi.getHotelBooking(
          selectedHotelId,
          bookingId
        );

      setSelectedBooking(
        response.data
      );
    } catch (error) {
      console.error(
        "Failed to load booking details:",
        error
      );

      toast.error(
        "Unable to load booking details."
      );
    } finally {
      setLoadingDetails(false);
    }
  }

  function closeDetails() {
    setSelectedBooking(null);
  }

  function formatDate(
    date: string
  ) {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatAmount(
    amount: number
  ) {
    return amount.toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    );
  }

  function getStatusClass(
    status: OwnerBookingStatus
  ) {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-50 text-green-700";

      case "PENDING":
        return "bg-yellow-50 text-yellow-700";

      case "CANCELLED":
      case "EXPIRED":
        return "bg-red-50 text-red-700";

      default:
        return "bg-warm-stone/10 text-muted-foreground";
    }
  }

  const selectedHotel =
    hotels.find(
      (hotel) =>
        hotel.id === selectedHotelId
    );

  return (
    <ProtectedRoute requiredRole="ROLE_OWNER">
      <DashboardLayout role="owner">
        <div className="space-y-8">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
              Reservation Management
            </p>

            <h1 className="mt-2 font-serif text-3xl font-bold text-espresso">
              Bookings
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              View and manage reservations for your properties.
            </p>
          </div>

          <div className="rounded-xl border border-warm-stone/20 bg-white p-6 shadow-warm">
            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Property
                </label>

                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-copper" />

                  <select
                    value={
                      selectedHotelId ?? ""
                    }
                    onChange={(event) =>
                      setSelectedHotelId(
                        Number(
                          event.target.value
                        )
                      )
                    }
                    disabled={
                      loadingHotels ||
                      hotels.length === 0
                    }
                    className="w-full appearance-none rounded-lg border border-warm-stone/30 bg-white py-3 pl-11 pr-10 text-sm text-espresso outline-none transition focus:border-copper"
                  >
                    {loadingHotels ? (
                      <option value="">
                        Loading properties...
                      </option>
                    ) : hotels.length === 0 ? (
                      <option value="">
                        No properties found
                      </option>
                    ) : (
                      hotels.map(
                        (hotel) => (
                          <option
                            key={hotel.id}
                            value={hotel.id}
                          >
                            {hotel.name} —{" "}
                            {hotel.city}
                          </option>
                        )
                      )
                    )}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Booking status
                </label>

                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(event) =>
                      setSelectedStatus(
                        event.target
                          .value as
                          | OwnerBookingStatus
                          | "ALL"
                      )
                    }
                    className="w-full appearance-none rounded-lg border border-warm-stone/30 bg-white px-4 py-3 pr-10 text-sm text-espresso outline-none transition focus:border-copper"
                  >
                    <option value="ALL">
                      All bookings
                    </option>

                    {BOOKING_STATUSES.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>

            {selectedHotel && (
              <div className="mt-5 flex flex-wrap gap-3 border-t border-warm-stone/20 pt-5">

                <div className="inline-flex items-center gap-2 rounded-full bg-warm-stone/10 px-3 py-2 text-xs text-espresso">
                  <Building2 className="h-3.5 w-3.5 text-copper" />
                  {selectedHotel.name}
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-warm-stone/10 px-3 py-2 text-xs text-espresso">
                  <MapPin className="h-3.5 w-3.5 text-copper" />
                  {selectedHotel.city}
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-warm-stone/10 px-3 py-2 text-xs text-espresso">
                  <Calendar className="h-3.5 w-3.5 text-copper" />
                  {bookings.length} bookings
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">

            {loadingBookings ? (
              <div className="flex min-h-64 items-center justify-center rounded-xl border border-warm-stone/20 bg-white shadow-warm">
                <Loader2 className="h-6 w-6 animate-spin text-copper" />
              </div>
            ) : selectedHotelId === null ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-warm-stone/20 bg-white px-6 text-center shadow-warm">
                <Building2 className="mb-4 h-8 w-8 text-copper" />

                <h3 className="font-serif text-lg font-semibold text-espresso">
                  Select a property
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Select a property to view its bookings.
                </p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-warm-stone/20 bg-white px-6 text-center shadow-warm">
                <Calendar className="mb-4 h-8 w-8 text-copper" />

                <h3 className="font-serif text-lg font-semibold text-espresso">
                  No bookings found
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  There are no bookings matching the selected filter.
                </p>
              </div>
            ) : (
              bookings.map(
                (booking, index) => (
                  <motion.div
                    key={booking.bookingId}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        index * 0.04,
                    }}
                    className="rounded-xl border border-warm-stone/20 bg-white p-6 shadow-warm"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                      <div className="min-w-0">

                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            #{booking.bookingId}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                              booking.bookingStatus
                            )}`}
                          >
                            {booking.bookingStatus}
                          </span>

                          <span className="rounded-full bg-warm-stone/10 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            {booking.paymentStatus}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg font-semibold text-espresso">
                          {booking.guestName}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">

                          <span className="inline-flex items-center gap-1.5">
                            <BedDouble className="h-4 w-4" />
                            {booking.roomType}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {formatDate(
                              booking.checkInDate
                            )}
                            {" → "}
                            {formatDate(
                              booking.checkOutDate
                            )}
                          </span>

                        </div>
                      </div>

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                        <div className="text-left sm:text-right">
                          <p className="text-xs text-muted-foreground">
                            Booking amount
                          </p>

                          <p className="text-xl font-bold text-espresso">
                            ₹
                            {formatAmount(
                              booking.amount
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleViewBooking(
                              booking.bookingId
                            )
                          }
                          disabled={
                            loadingDetails
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-warm-stone/30 px-4 py-2.5 text-sm font-medium text-espresso transition hover:bg-warm-stone/10 disabled:opacity-60"
                        >
                          {loadingDetails ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}

                          View
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              )
            )}
          </div>

        </div>

        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

              <div className="flex items-start justify-between border-b border-warm-stone/20 px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-copper">
                    Booking details
                  </p>

                  <h2 className="mt-1 font-serif text-2xl font-bold text-espresso">
                    #{selectedBooking.bookingId}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeDetails}
                  className="rounded-lg p-2 text-muted-foreground transition hover:bg-warm-stone/10 hover:text-espresso"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-6">

                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Guest
                  </p>

                  <h3 className="mt-1 font-serif text-xl font-semibold text-espresso">
                    {selectedBooking.guestName}
                  </h3>

                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedBooking.email}
                    </p>

                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedBooking.phone}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="rounded-lg bg-warm-stone/10 p-4">
                    <p className="text-xs text-muted-foreground">
                      Hotel
                    </p>

                    <p className="mt-1 font-medium text-espresso">
                      {selectedBooking.hotelName}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {selectedBooking.city}
                    </p>
                  </div>

                  <div className="rounded-lg bg-warm-stone/10 p-4">
                    <p className="text-xs text-muted-foreground">
                      Room
                    </p>

                    <p className="mt-1 flex items-center gap-1 font-medium text-espresso">
                      <BedDouble className="h-4 w-4 text-copper" />
                      {selectedBooking.roomType}
                    </p>
                  </div>

                  <div className="rounded-lg bg-warm-stone/10 p-4">
                    <p className="text-xs text-muted-foreground">
                      Stay
                    </p>

                    <p className="mt-1 font-medium text-espresso">
                      {formatDate(
                        selectedBooking.checkInDate
                      )}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      to{" "}
                      {formatDate(
                        selectedBooking.checkOutDate
                      )}
                    </p>
                  </div>

                  <div className="rounded-lg bg-warm-stone/10 p-4">
                    <p className="text-xs text-muted-foreground">
                      Guests
                    </p>

                    <p className="mt-1 flex items-center gap-1 font-medium text-espresso">
                      <Users className="h-4 w-4 text-copper" />
                      {selectedBooking.adultCount} adults
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {selectedBooking.childCount} children
                    </p>
                  </div>

                </div>

                <div className="flex items-center justify-between border-t border-warm-stone/20 pt-5">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment
                    </p>

                    <p className="font-medium text-espresso">
                      {selectedBooking.paymentStatus}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Total amount
                    </p>

                    <p className="text-2xl font-bold text-espresso">
                      ₹
                      {formatAmount(
                        selectedBooking.amount
                      )}
                    </p>
                  </div>
                </div>

                {selectedBooking.guests &&
                  selectedBooking.guests.length >
                    0 && (
                    <div>
                      <h3 className="mb-3 font-serif text-lg font-semibold text-espresso">
                        Guest details
                      </h3>

                      <div className="overflow-hidden rounded-lg border border-warm-stone/20">
                        <div className="divide-y divide-warm-stone/20">
                          {selectedBooking.guests.map(
                            (
                              guest: {
                                id: number;
                                name: string;
                                gender: string;
                                age: number;
                              }
                            ) => (
                              <div
                                key={guest.id}
                                className="flex items-center justify-between px-4 py-3"
                              >
                                <div>
                                  <p className="font-medium text-espresso">
                                    {guest.name}
                                  </p>

                                  <p className="text-sm text-muted-foreground">
                                    {guest.gender}
                                  </p>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                  {guest.age} years
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}

              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}