import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "wouter";

import { motion } from "framer-motion";

import {
  ArrowRight,
  BedDouble,
  Building2,
  CalendarCheck,
  ChevronRight,
  CircleDollarSign,
  Hotel,
  Plus,
  RefreshCcw,
  TrendingUp,
} from "lucide-react";

import { toast } from "sonner";

import DashboardLayout from "@/layouts/DashboardLayout";

import {
  ownerDashboardApi,
  type OwnerDashboardResponse,
  type OwnerHotelDashboard,
  type OwnerBooking,
} from "@/api/ownerDashboard";

/* =========================================================
   HELPERS
   ========================================================= */

function formatCurrency(value: number) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(
    Number.isFinite(value)
      ? value
      : 0
  );
}

function formatDate(date?: string) {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function getBookingStatusClass(
  status?: string
) {
  switch (status) {
    case "CONFIRMED":
    case "BOOKED":
      return "bg-sage/10 text-sage";

    case "CANCELLED":
      return "bg-red-50 text-red-600";

    case "PENDING":
      return "bg-amber-50 text-amber-700";

    case "COMPLETED":
      return "bg-blue-50 text-blue-600";

    default:
      return "bg-warm-stone/10 text-espresso/70";
  }
}

function getPaymentStatusClass(
  status?: string
) {
  switch (status) {
    case "SUCCESS":
    case "PAID":
      return "text-sage";

    case "FAILED":
      return "text-red-500";

    case "PENDING":
      return "text-amber-600";

    case "REFUNDED":
    case "CANCELLED":
      return "text-red-500";

    default:
      return "text-muted-foreground";
  }
}

function getAmount(amount?: number) {
  const value = Number(amount);

  return Number.isFinite(value)
    ? value
    : 0;
}

/* =========================================================
   DASHBOARD CONTENT
   ========================================================= */

function OwnerDashboardContent() {
  const [
    dashboard,
    setDashboard,
  ] =
    useState<OwnerDashboardResponse | null>(
      null
    );

  const [
    hotelBookings,
    setHotelBookings,
  ] =
    useState<
      Record<number, OwnerBooking[]>
    >({});

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    bookingsLoading,
    setBookingsLoading,
  ] =
    useState(false);

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  const loadDashboard = async (
    showRefreshState = false
  ) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response =
        await ownerDashboardApi.getDashboard();

      const dashboardData =
        response.data;

      setDashboard(
        dashboardData
      );

      /*
       * Load actual bookings for every
       * owner property.
       *
       * Revenue is calculated from
       * successful payments.
       */
      await loadHotelBookings(
        dashboardData.hotels
      );

    } catch (error: any) {
      console.error(
        "Failed to load owner dashboard:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to load your dashboard."
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =======================================================
     LOAD HOTEL BOOKINGS
  ======================================================= */

  const loadHotelBookings =
    async (
      hotels: OwnerHotelDashboard[]
    ) => {
      if (hotels.length === 0) {
        setHotelBookings({});
        return;
      }

      try {
        setBookingsLoading(true);

        const results =
          await Promise.all(
            hotels.map(
              async (hotel) => {
                const response =
                  await ownerDashboardApi.getHotelBookings(
                    hotel.hotelId
                  );

                return {
                  hotelId:
                    hotel.hotelId,

                  bookings:
                    response.data,
                };
              }
            )
          );

        const bookingMap:
          Record<
            number,
            OwnerBooking[]
          > = {};

        results.forEach(
          ({
            hotelId,
            bookings,
          }) => {
            bookingMap[
              hotelId
            ] = bookings;
          }
        );

        setHotelBookings(
          bookingMap
        );

      } catch (error) {
        console.error(
          "Failed to load owner hotel bookings:",
          error
        );

        /*
         * Do not fabricate revenue
         * if booking data fails.
         */
        setHotelBookings({});

      } finally {
        setBookingsLoading(false);
      }
    };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =======================================================
     ALL BOOKINGS
  ======================================================= */

  const allBookings =
    useMemo(
      () => {
        return Object.values(
          hotelBookings
        ).flat();
      },
      [
        hotelBookings,
      ]
    );

  /* =======================================================
     SUCCESSFUL PAYMENTS
  ======================================================= */

  const successfulBookings =
    useMemo(
      () => {
        return allBookings.filter(
          (booking) =>
            booking.paymentStatus ===
            "SUCCESS"
        );
      },
      [
        allBookings,
      ]
    );

  /* =======================================================
     TOTAL REVENUE
  ======================================================= */

  const totalRevenue =
    useMemo(
      () => {
        return successfulBookings.reduce(
          (
            total,
            booking
          ) => {
            return (
              total +
              getAmount(
                booking.amount
              )
            );
          },
          0
        );
      },
      [
        successfulBookings,
      ]
    );

  /* =======================================================
     PROPERTY REVENUE
  ======================================================= */

  const propertyRevenue =
    useMemo(
      () => {
        const revenueMap:
          Record<
            number,
            number
          > = {};

        Object.entries(
          hotelBookings
        ).forEach(
          ([
            hotelId,
            bookings,
          ]) => {
            revenueMap[
              Number(hotelId)
            ] =
              bookings
                .filter(
                  (booking) =>
                    booking.paymentStatus ===
                    "SUCCESS"
                )
                .reduce(
                  (
                    total,
                    booking
                  ) =>
                    total +
                    getAmount(
                      booking.amount
                    ),
                  0
                );
          }
        );

        return revenueMap;
      },
      [
        hotelBookings,
      ]
    );

  /* =======================================================
     PROPERTY BOOKING COUNT
  ======================================================= */

  const propertyBookingCount =
    useMemo(
      () => {
        const bookingMap:
          Record<
            number,
            number
          > = {};

        Object.entries(
          hotelBookings
        ).forEach(
          ([
            hotelId,
            bookings,
          ]) => {
            bookingMap[
              Number(hotelId)
            ] =
              bookings.length;
          }
        );

        return bookingMap;
      },
      [
        hotelBookings,
      ]
    );

  /* =======================================================
     RECENT BOOKINGS
  ======================================================= */

  const recentBookings =
    useMemo(
      () => {
        return [
          ...allBookings,
        ]
          .sort(
            (
              first,
              second
            ) => {
              const firstDate =
                first.checkInDate
                  ? new Date(
                      first.checkInDate
                    ).getTime()
                  : 0;

              const secondDate =
                second.checkInDate
                  ? new Date(
                      second.checkInDate
                    ).getTime()
                  : 0;

              return (
                secondDate -
                firstDate
              );
            }
          )
          .slice(
            0,
            5
          );
      },
      [
        allBookings,
      ]
    );

  /* =======================================================
     ACTIVE BOOKINGS
  ======================================================= */

  const activeBookingCount =
    useMemo(
      () => {
        return allBookings.filter(
          (booking) => {
            return (
              booking.bookingStatus ===
                "BOOKED" ||
              booking.bookingStatus ===
                "CONFIRMED"
            );
          }
        ).length;
      },
      [
        allBookings,
      ]
    );

  /* =======================================================
     DISPLAY HOTELS
  ======================================================= */

  const displayHotels =
    useMemo(
      () => {
        if (!dashboard) {
          return [];
        }

        return dashboard.hotels.map(
          (hotel) => ({
            ...hotel,

            revenue:
              propertyRevenue[
                hotel.hotelId
              ] ?? 0,

            activeBookings:
              propertyBookingCount[
                hotel.hotelId
              ] ??
              hotel.activeBookings,
          })
        );
      },
      [
        dashboard,
        propertyRevenue,
        propertyBookingCount,
      ]
    );

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <DashboardSkeleton />
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (!dashboard) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">

        <div className="w-14 h-14 mx-auto rounded-full bg-bronze/10 flex items-center justify-center">
          <Hotel className="w-6 h-6 text-bronze" />
        </div>

        <h1 className="mt-6 font-serif text-3xl font-semibold text-espresso">
          Unable to load dashboard
        </h1>

        <p className="mt-3 text-muted-foreground">
          Something went wrong while loading your owner dashboard.
        </p>

        <button
          type="button"
          onClick={() =>
            loadDashboard()
          }
          className="mt-7 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-bronze text-white text-sm font-semibold hover:bg-bronze-dark transition-colors"
        >
          Try again

          <RefreshCcw className="w-4 h-4" />
        </button>

      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div>

      {/* =================================================
          PAGE HEADER
      ================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
        }}
        className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
      >

        <div>

          <p className="text-xs uppercase tracking-[0.2em] text-bronze font-semibold">
            Owner dashboard
          </p>

          <h1 className="mt-3 font-serif text-4xl md:text-5xl font-semibold text-espresso">
            Good to see you.
          </h1>

          <p className="mt-3 text-muted-foreground text-base md:text-lg">
            Here's how your properties are performing.
          </p>

        </div>

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={() =>
              loadDashboard(true)
            }
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-warm-stone/30 bg-white text-sm font-medium text-espresso hover:bg-cream transition-colors disabled:opacity-60"
          >

            <RefreshCcw
              className={`w-4 h-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh

          </button>

          <Link
            href="/owner/hotels/new"
          >
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bronze hover:bg-bronze-dark text-white text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />

              Add property
            </button>
          </Link>

        </div>

      </motion.div>

      {/* =================================================
          STATS
      ================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          delay: 0.08,
        }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-9"
      >

        <StatCard
          icon={Building2}
          label="Total properties"
          value={
            dashboard.totalHotels
          }
          detail={`${dashboard.activeHotels} active`}
        />

        <StatCard
          icon={BedDouble}
          label="Total rooms"
          value={
            dashboard.totalRooms
          }
          detail="Across all properties"
        />

        <StatCard
          icon={CalendarCheck}
          label="Active bookings"
          value={
            bookingsLoading
              ? "—"
              : activeBookingCount
          }
          detail="Currently confirmed"
        />

        <StatCard
          icon={CircleDollarSign}
          label="Total revenue"
          value={
            bookingsLoading
              ? "—"
              : formatCurrency(
                  totalRevenue
                )
          }
          detail="From successful payments"
          currency
        />

      </motion.div>

      {/* =================================================
          MAIN GRID
      ================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_1fr] gap-6 mt-6">

        {/* =================================================
            PROPERTIES
        ================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
            delay: 0.14,
          }}
          className="bg-white border border-warm-stone/20 rounded-2xl overflow-hidden"
        >

          <div className="px-6 md:px-7 py-5 border-b border-warm-stone/20 flex items-center justify-between">

            <div>

              <h2 className="font-serif text-xl font-semibold text-espresso">
                Your properties
              </h2>

              <p className="text-xs text-muted-foreground mt-1">
                Performance across your properties
              </p>

            </div>

            <Link
              href="/owner/hotels"
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-medium text-bronze hover:text-bronze-dark transition-colors"
              >
                View all

                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

          </div>

          {displayHotels.length === 0 ? (
            <EmptyProperties />
          ) : (
            <div className="divide-y divide-warm-stone/15">

              {displayHotels.map(
                (
                  hotel,
                  index
                ) => (
                  <PropertyRow
                    key={
                      hotel.hotelId
                    }
                    hotel={
                      hotel
                    }
                    index={
                      index
                    }
                  />
                )
              )}

            </div>
          )}

        </motion.section>

        {/* =================================================
            REVENUE OVERVIEW
        ================================================== */}

        <RevenueOverview
          hotels={
            displayHotels
          }
          totalRevenue={
            totalRevenue
          }
          loading={
            bookingsLoading
          }
        />

      </div>

      {/* =================================================
          RECENT BOOKINGS
      ================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          delay: 0.2,
        }}
        className="mt-6 bg-white border border-warm-stone/20 rounded-2xl overflow-hidden"
      >

        <div className="px-6 md:px-7 py-5 border-b border-warm-stone/20 flex items-center justify-between">

          <div>

            <h2 className="font-serif text-xl font-semibold text-espresso">
              Recent bookings
            </h2>

            <p className="text-xs text-muted-foreground mt-1">
              Latest booking activity across your properties
            </p>

          </div>

          <Link
            href="/owner/bookings"
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-medium text-bronze hover:text-bronze-dark transition-colors"
            >
              View bookings

              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>

        </div>

        {bookingsLoading ? (
          <BookingsSkeleton />
        ) : recentBookings.length === 0 ? (
          <div className="px-6 py-14 text-center">

            <CalendarCheck className="w-7 h-7 text-warm-stone mx-auto" />

            <p className="mt-3 text-sm font-medium text-espresso">
              No bookings yet
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Booking activity will appear here.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[760px]">

              <thead>

                <tr className="bg-cream/40 border-b border-warm-stone/15">

                  <th className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">
                    Guest
                  </th>

                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">
                    Stay
                  </th>

                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">
                    Status
                  </th>

                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">
                    Payment
                  </th>

                  <th className="text-right px-6 py-3 text-[10px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">
                    Amount
                  </th>

                </tr>

              </thead>

              <tbody>

                {recentBookings.map(
                  (booking) => (
                    <tr
                      key={
                        booking.bookingId
                      }
                      className="border-b border-warm-stone/10 last:border-0 hover:bg-cream/30 transition-colors"
                    >

                      <td className="px-6 py-4">

                        <p className="text-sm font-medium text-espresso">
                          {
                            booking.guestName ||
                            "Guest"
                          }
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          Booking #
                          {
                            booking.bookingId
                          }
                        </p>

                      </td>

                      <td className="px-4 py-4">

                        <p className="text-sm text-espresso">
                          {formatDate(
                            booking.checkInDate
                          )}
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          to{" "}
                          {formatDate(
                            booking.checkOutDate
                          )}
                        </p>

                      </td>

                      <td className="px-4 py-4">

                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${getBookingStatusClass(
                            booking.bookingStatus
                          )}`}
                        >
                          {
                            booking.bookingStatus ||
                            "UNKNOWN"
                          }
                        </span>

                      </td>

                      <td className="px-4 py-4">

                        <span
                          className={`text-xs font-medium ${getPaymentStatusClass(
                            booking.paymentStatus
                          )}`}
                        >
                          {
                            booking.paymentStatus ||
                            "—"
                          }
                        </span>

                      </td>

                      <td className="px-6 py-4 text-right">

                        <span className="text-sm font-semibold text-espresso">
                          {formatCurrency(
                            getAmount(
                              booking.amount
                            )
                          )}
                        </span>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </motion.section>

    </div>
  );
}

/* =========================================================
   STAT CARD
   ========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  currency,
}: {
  icon: typeof Building2;
  label: string;
  value: number | string;
  detail: string;
  currency?: boolean;
}) {
  return (
    <div className="bg-white border border-warm-stone/20 rounded-2xl p-5 md:p-6">

      <div className="flex items-start justify-between">

        <div className="w-10 h-10 rounded-xl bg-bronze/10 flex items-center justify-center">

          <Icon className="w-5 h-5 text-bronze" />

        </div>

        <TrendingUp className="w-4 h-4 text-sage" />

      </div>

      <p className="mt-5 text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
        {label}
      </p>

      <p
        className={`mt-2 font-serif font-semibold text-espresso ${
          currency
            ? "text-2xl md:text-3xl"
            : "text-3xl"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {detail}
      </p>

    </div>
  );
}

/* =========================================================
   PROPERTY ROW
   ========================================================= */

function PropertyRow({
  hotel,
}: {
  hotel: OwnerHotelDashboard;
  index: number;
}) {
  return (
    <Link
      href={`/owner/hotels/${hotel.hotelId}`}
    >
      <div className="px-6 md:px-7 py-5 hover:bg-cream/30 transition-colors cursor-pointer">

        <div className="flex items-center gap-4">

          <div className="w-11 h-11 rounded-xl bg-cream flex items-center justify-center shrink-0">

            <Building2 className="w-5 h-5 text-bronze" />

          </div>

          <div className="flex-1 min-w-0">

            <div className="flex items-center gap-2">

              <h3 className="text-sm font-semibold text-espresso truncate">
                {
                  hotel.hotelName
                }
              </h3>

              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hotel.active
                    ? "bg-sage"
                    : "bg-warm-stone"
                }`}
              />

            </div>

            <p className="text-xs text-muted-foreground mt-1">
              {hotel.city}
            </p>

          </div>

          <div className="hidden sm:block text-right">

            <p className="text-sm font-semibold text-espresso">
              {
                hotel.totalRooms
              }
            </p>

            <p className="text-[11px] text-muted-foreground mt-1">
              rooms
            </p>

          </div>

          <div className="hidden md:block text-right min-w-[80px]">

            <p className="text-sm font-semibold text-espresso">
              {
                hotel.activeBookings
              }
            </p>

            <p className="text-[11px] text-muted-foreground mt-1">
              bookings
            </p>

          </div>

          <div className="text-right min-w-[110px]">

            <p className="text-sm font-semibold text-espresso">
              {formatCurrency(
                hotel.revenue
              )}
            </p>

            <p className="text-[11px] text-muted-foreground mt-1">
              revenue
            </p>

          </div>

          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />

        </div>

      </div>
    </Link>
  );
}

/* =========================================================
   REVENUE OVERVIEW
   ========================================================= */

function RevenueOverview({
  hotels,
  totalRevenue,
  loading,
}: {
  hotels: OwnerHotelDashboard[];
  totalRevenue: number;
  loading: boolean;
}) {
  const rankedHotels =
    useMemo(
      () => {
        return [
          ...hotels,
        ]
          .sort(
            (a, b) =>
              b.revenue -
              a.revenue
          )
          .slice(
            0,
            5
          );
      },
      [
        hotels,
      ]
    );

  const highestRevenue =
    rankedHotels[0]
      ?.revenue ||
    0;

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 14,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        delay: 0.18,
      }}
      className="bg-white border border-warm-stone/20 rounded-2xl overflow-hidden"
    >

      <div className="px-6 md:px-7 py-5 border-b border-warm-stone/20">

        <h2 className="font-serif text-xl font-semibold text-espresso">
          Revenue overview
        </h2>

        <p className="text-xs text-muted-foreground mt-1">
          Revenue contribution by property
        </p>

      </div>

      <div className="p-6 md:p-7">

        <div className="flex items-end justify-between gap-4">

          <div>

            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
              Total revenue
            </p>

            <p className="mt-2 font-serif text-3xl font-semibold text-espresso">
              {loading
                ? "—"
                : formatCurrency(
                    totalRevenue
                  )}
            </p>

          </div>

          <CircleDollarSign className="w-7 h-7 text-bronze" />

        </div>

        {loading ? (
          <RevenueLoading />
        ) : rankedHotels.length === 0 ? (
          <div className="mt-10 py-6 text-center">

            <p className="text-sm text-muted-foreground">
              Revenue data will appear here once you receive paid bookings.
            </p>

          </div>
        ) : (
          <div className="mt-8 space-y-5">

            {rankedHotels.map(
              (hotel) => {

                const percentage =
                  highestRevenue > 0
                    ? (
                        hotel.revenue /
                        highestRevenue
                      ) *
                      100
                    : 0;

                return (
                  <div
                    key={
                      hotel.hotelId
                    }
                  >

                    <div className="flex items-center justify-between gap-4">

                      <p className="text-sm font-medium text-espresso truncate">
                        {
                          hotel.hotelName
                        }
                      </p>

                      <p className="text-sm font-semibold text-espresso shrink-0">
                        {formatCurrency(
                          hotel.revenue
                        )}
                      </p>

                    </div>

                    <div className="mt-2 h-1.5 rounded-full bg-cream overflow-hidden">

                      <motion.div
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${percentage}%`,
                        }}
                        transition={{
                          duration: 0.7,
                          delay: 0.25,
                        }}
                        className="h-full rounded-full bg-bronze"
                      />

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

    </motion.section>
  );
}

/* =========================================================
   REVENUE LOADING
   ========================================================= */

function RevenueLoading() {
  return (
    <div className="mt-8 space-y-5">

      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="animate-pulse"
          >

            <div className="flex justify-between">

              <div className="h-4 w-32 rounded bg-warm-stone/20" />

              <div className="h-4 w-20 rounded bg-warm-stone/20" />

            </div>

            <div className="mt-2 h-1.5 rounded-full bg-warm-stone/20" />

          </div>
        )
      )}

    </div>
  );
}

/* =========================================================
   BOOKINGS SKELETON
   ========================================================= */

function BookingsSkeleton() {
  return (
    <div className="divide-y divide-warm-stone/10">

      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="grid grid-cols-5 gap-4 px-6 py-5 animate-pulse"
          >

            <div className="h-4 rounded bg-warm-stone/20" />

            <div className="h-4 rounded bg-warm-stone/20" />

            <div className="h-4 rounded bg-warm-stone/20" />

            <div className="h-4 rounded bg-warm-stone/20" />

            <div className="h-4 rounded bg-warm-stone/20" />

          </div>
        )
      )}

    </div>
  );
}

/* =========================================================
   EMPTY PROPERTIES
   ========================================================= */

function EmptyProperties() {
  return (
    <div className="px-6 py-14 text-center">

      <div className="w-12 h-12 mx-auto rounded-xl bg-cream flex items-center justify-center">

        <Building2 className="w-5 h-5 text-bronze" />

      </div>

      <h3 className="mt-4 text-sm font-semibold text-espresso">
        No properties yet
      </h3>

      <p className="mt-1 text-xs text-muted-foreground">
        Add your first property to start managing bookings and revenue.
      </p>

      <Link
        href="/owner/hotels/new"
      >
        <button
          type="button"
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bronze hover:bg-bronze-dark text-white text-sm font-semibold transition-colors"
        >

          <Plus className="w-4 h-4" />

          Add property

        </button>
      </Link>

    </div>
  );
}

/* =========================================================
   DASHBOARD SKELETON
   ========================================================= */

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">

      <div className="h-3 w-32 bg-warm-stone/20 rounded" />

      <div className="mt-4 h-12 w-72 bg-warm-stone/20 rounded" />

      <div className="mt-4 h-5 w-96 max-w-full bg-warm-stone/20 rounded" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-9">

        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="h-40 bg-white border border-warm-stone/20 rounded-2xl"
            />
          )
        )}

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_1fr] gap-6 mt-6">

        <div className="h-96 bg-white border border-warm-stone/20 rounded-2xl" />

        <div className="h-96 bg-white border border-warm-stone/20 rounded-2xl" />

      </div>

      <div className="mt-6 h-72 bg-white border border-warm-stone/20 rounded-2xl" />

    </div>
  );
}

/* =========================================================
   OWNER DASHBOARD
   ========================================================= */

export default function OwnerDashboard() {
  return (
    <DashboardLayout role="owner">
      <OwnerDashboardContent />
    </DashboardLayout>
  );
}