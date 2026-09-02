import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Hotel,
  RefreshCw,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

import { ownerHotelsApi } from "@/api/ownerHotels";

import {
  ownerBookingsApi,
  type OwnerBooking,
} from "@/api/ownerBookings";

/* =========================================================
   TYPES
========================================================= */

interface HotelOption {
  id: number;
  name: string;
  city: string;
}

type RevenuePeriod =
  | "ALL"
  | "7D"
  | "30D"
  | "3M"
  | "6M"
  | "1Y";

interface HotelBookings {
  hotelId: number;
  hotelName: string;
  city: string;
  bookings: OwnerBooking[];
}

interface TrendPoint {
  key: string;
  label: string;
  revenue: number;
  bookings: number;
}

interface RoomAnalytics {
  roomType: string;
  revenue: number;
  bookings: number;
  averageValue: number;
}

interface HotelRevenueAnalytics {
  hotelId: number;
  hotelName: string;
  city: string;
  revenue: number;
  bookings: number;
  averageValue: number;
}

interface BreakdownItem {
  label: string;
  count: number;
  percentage: number;
}

/* =========================================================
   HELPERS
========================================================= */

function normalizeStatus(
  value?: string | null
): string {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function formatStatus(
  value?: string | null
): string {
  if (!value) {
    return "Unknown";
  }

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (letter) => letter.toUpperCase()
    );
}

function formatRoomType(
  value?: string
): string {
  if (!value) {
    return "Unknown";
  }

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (letter) => letter.toUpperCase()
    );
}

function toNumber(
  value:
    | number
    | string
    | null
    | undefined
): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function formatCurrency(
  value: number
): string {
  return `₹${Math.round(
    value
  ).toLocaleString("en-IN")}`;
}

function parseDate(
  value?: string
): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}

function startOfDay(
  date: Date
): Date {
  const result = new Date(date);

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
}

function getPeriodStart(
  period: RevenuePeriod
): Date | null {
  if (period === "ALL") {
    return null;
  }

  const date = new Date();

  switch (period) {
    case "7D":
      date.setDate(
        date.getDate() - 7
      );
      break;

    case "30D":
      date.setDate(
        date.getDate() - 30
      );
      break;

    case "3M":
      date.setMonth(
        date.getMonth() - 3
      );
      break;

    case "6M":
      date.setMonth(
        date.getMonth() - 6
      );
      break;

    case "1Y":
      date.setFullYear(
        date.getFullYear() - 1
      );
      break;
  }

  return startOfDay(date);
}

function isPaid(
  booking: OwnerBooking
): boolean {
  const paymentStatus =
    normalizeStatus(
      booking.paymentStatus
    );

  return (
    paymentStatus === "SUCCESS" ||
    paymentStatus === "PAID"
  );
}

function isPaymentPending(
  booking: OwnerBooking
): boolean {
  const paymentStatus =
    normalizeStatus(
      booking.paymentStatus
    );

  const bookingStatus =
    normalizeStatus(
      booking.bookingStatus
    );

  return (
    paymentStatus === "PENDING" ||
    bookingStatus === "PAYMENT_PENDING"
  );
}

function getBookingRevenue(
  booking: OwnerBooking
): number {
  if (!isPaid(booking)) {
    return 0;
  }

  return toNumber(
    booking.amount
  );
}

function getPendingAmount(
  booking: OwnerBooking
): number {
  if (!isPaymentPending(booking)) {
    return 0;
  }

  return toNumber(
    booking.amount
  );
}

function getBucketKey(
  date: Date,
  period: RevenuePeriod
): string {
  if (
    period === "3M" ||
    period === "6M" ||
    period === "1Y" ||
    period === "ALL"
  ) {
    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
  }

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function formatTrendLabel(
  date: Date,
  period: RevenuePeriod
): string {
  if (
    period === "3M" ||
    period === "6M" ||
    period === "1Y" ||
    period === "ALL"
  ) {
    return date.toLocaleDateString(
      "en-IN",
      {
        month: "short",
        year: "numeric",
      }
    );
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
    }
  );
}

function formatDate(
  value?: string
): string {
  const date = parseDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function getPeriodLabel(
  period: RevenuePeriod
): string {
  switch (period) {
    case "7D":
      return "Last 7 days";

    case "30D":
      return "Last 30 days";

    case "3M":
      return "Last 3 months";

    case "6M":
      return "Last 6 months";

    case "1Y":
      return "Last year";

    default:
      return "All time";
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function OwnerRevenue() {
  const [
    hotels,
    setHotels,
  ] = useState<HotelOption[]>([]);

  /*
   * null means ALL PROPERTIES.
   */
  const [
    selectedHotelId,
    setSelectedHotelId,
  ] = useState<number | null>(
    null
  );

  const [
    hotelBookings,
    setHotelBookings,
  ] = useState<HotelBookings[]>([]);

  const [
    period,
    setPeriod,
  ] = useState<RevenuePeriod>(
    "ALL"
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  /* =======================================================
     LOAD REVENUE
  ====================================================== */

  const loadRevenue =
    async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await ownerHotelsApi.getMyHotels();

        const mappedHotels =
          response.data.map(
            (hotel) => ({
              id: hotel.id,
              name: hotel.name,
              city: hotel.city,
            })
          );

        setHotels(mappedHotels);

        /*
         * Fetch bookings for every owner property.
         *
         * Existing API only.
         * No mock data.
         */

        const results =
          await Promise.all(
            mappedHotels.map(
              async (hotel) => {
                try {
                  const bookingsResponse =
                    await ownerBookingsApi.getHotelBookings(
                      hotel.id
                    );

                  return {
                    hotelId:
                      hotel.id,
                    hotelName:
                      hotel.name,
                    city:
                      hotel.city,
                    bookings:
                      bookingsResponse.data,
                  };
                } catch (error) {
                  console.error(
                    `Failed to load bookings for hotel ${hotel.id}:`,
                    error
                  );

                  return {
                    hotelId:
                      hotel.id,
                    hotelName:
                      hotel.name,
                    city:
                      hotel.city,
                    bookings: [],
                  };
                }
              }
            )
          );

        setHotelBookings(results);
      } catch (error) {
        console.error(
          "Failed to load revenue:",
          error
        );

        setError(
          "Unable to load revenue analytics."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =======================================================
     INITIAL LOAD
  ====================================================== */

  useEffect(() => {
    loadRevenue();
  }, []);

  /* =======================================================
     SELECTED BOOKINGS
  ====================================================== */

  const selectedBookings =
    useMemo(() => {
      if (
        selectedHotelId ===
        null
      ) {
        return hotelBookings.flatMap(
          (item) =>
            item.bookings
        );
      }

      return (
        hotelBookings.find(
          (item) =>
            item.hotelId ===
            selectedHotelId
        )?.bookings ?? []
      );
    }, [
      hotelBookings,
      selectedHotelId,
    ]);

  /* =======================================================
     PERIOD FILTER
  ====================================================== */

  const periodBookings =
    useMemo(() => {
      const start =
        getPeriodStart(period);

      if (!start) {
        return selectedBookings;
      }

      return selectedBookings.filter(
        (booking) => {
          const date =
            parseDate(
              booking.checkInDate
            );

          if (!date) {
            return false;
          }

          return (
            startOfDay(date) >=
            start
          );
        }
      );
    }, [
      selectedBookings,
      period,
    ]);

  /* =======================================================
     PAID BOOKINGS
  ====================================================== */

  const paidBookings =
    useMemo(
      () =>
        periodBookings.filter(
          isPaid
        ),
      [periodBookings]
    );

  /* =======================================================
     TOTAL REVENUE
  ====================================================== */

  const totalRevenue =
    useMemo(
      () =>
        paidBookings.reduce(
          (
            total,
            booking
          ) =>
            total +
            getBookingRevenue(
              booking
            ),
          0
        ),
      [paidBookings]
    );

  /* =======================================================
     AVERAGE BOOKING VALUE
  ====================================================== */

  const averageBookingValue =
    paidBookings.length ===
    0
      ? 0
      : totalRevenue /
        paidBookings.length;

  /* =======================================================
     PENDING PAYMENTS
  ====================================================== */

  const pendingBookings =
    useMemo(
      () =>
        periodBookings.filter(
          isPaymentPending
        ),
      [periodBookings]
    );

  const pendingAmount =
    useMemo(
      () =>
        pendingBookings.reduce(
          (
            total,
            booking
          ) =>
            total +
            getPendingAmount(
              booking
            ),
          0
        ),
      [pendingBookings]
    );

  /* =======================================================
     BOOKING STATUS
  ====================================================== */

  const bookingStatusBreakdown =
    useMemo(() => {
      const map =
        new Map<
          string,
          number
        >();

      periodBookings.forEach(
        (booking) => {
          const status =
            normalizeStatus(
              booking.bookingStatus
            );

          const normalized =
            status || "UNKNOWN";

          map.set(
            normalized,
            (map.get(
              normalized
            ) || 0) + 1
          );
        }
      );

      return Array.from(
        map.entries()
      )
        .map(
          ([
            status,
            count,
          ]) => ({
            label:
              formatStatus(
                status
              ),
            count,
            percentage:
              periodBookings.length ===
              0
                ? 0
                : (count /
                    periodBookings.length) *
                  100,
          })
        )
        .sort(
          (a, b) =>
            b.count -
            a.count
        );
    }, [
      periodBookings,
    ]);

  /* =======================================================
     PAYMENT STATUS
  ====================================================== */

  const paymentStatusBreakdown =
    useMemo(() => {
      const map =
        new Map<
          string,
          number
        >();

      periodBookings.forEach(
        (booking) => {
          let status =
            normalizeStatus(
              booking.paymentStatus
            );

          /*
           * A booking can exist before a payment entity
           * is created.
           *
           * Existing backend booking state therefore
           * identifies it as pending.
           */

          if (
            !status &&
            normalizeStatus(
              booking.bookingStatus
            ) ===
              "PAYMENT_PENDING"
          ) {
            status =
              "PENDING";
          }

          if (!status) {
            status =
              "UNKNOWN";
          }

          map.set(
            status,
            (map.get(
              status
            ) || 0) + 1
          );
        }
      );

      return Array.from(
        map.entries()
      )
        .map(
          ([
            status,
            count,
          ]) => ({
            label:
              formatStatus(
                status
              ),
            count,
            percentage:
              periodBookings.length ===
              0
                ? 0
                : (count /
                    periodBookings.length) *
                  100,
          })
        )
        .sort(
          (a, b) =>
            b.count -
            a.count
        );
    }, [
      periodBookings,
    ]);

  /* =======================================================
     PAYMENT AMOUNT BREAKDOWN
  ====================================================== */

  const paymentAmountBreakdown =
    useMemo(() => {
      const paidAmount =
        paidBookings.reduce(
          (
            total,
            booking
          ) =>
            total +
            getBookingRevenue(
              booking
            ),
          0
        );

      const pending =
        pendingBookings.reduce(
          (
            total,
            booking
          ) =>
            total +
            getPendingAmount(
              booking
            ),
          0
        );

      return [
        {
          label: "Paid",
          amount: paidAmount,
          count:
            paidBookings.length,
        },
        {
          label: "Pending",
          amount: pending,
          count:
            pendingBookings.length,
        },
      ];
    }, [
      paidBookings,
      pendingBookings,
    ]);

  /* =======================================================
     ROOM ANALYTICS
  ====================================================== */

  const roomAnalytics =
    useMemo(() => {
      const map =
        new Map<
          string,
          {
            revenue: number;
            bookings: number;
          }
        >();

      paidBookings.forEach(
        (booking) => {
          const room =
            booking.roomType ||
            "UNKNOWN";

          const current =
            map.get(room) || {
              revenue: 0,
              bookings: 0,
            };

          current.revenue +=
            getBookingRevenue(
              booking
            );

          current.bookings +=
            1;

          map.set(
            room,
            current
          );
        }
      );

      return Array.from(
        map.entries()
      )
        .map(
          ([
            roomType,
            value,
          ]) => ({
            roomType,
            revenue:
              value.revenue,
            bookings:
              value.bookings,
            averageValue:
              value.bookings ===
              0
                ? 0
                : value.revenue /
                  value.bookings,
          })
        )
        .sort(
          (a, b) =>
            b.revenue -
            a.revenue
        );
    }, [
      paidBookings,
    ]);

  /* =======================================================
     HOTEL REVENUE
  ====================================================== */

  const hotelRevenue =
    useMemo<HotelRevenueAnalytics[]>(
      () => {
        if (
          selectedHotelId !==
          null
        ) {
          return [];
        }

        return hotelBookings
          .map((hotel) => {
            const bookings =
              hotel.bookings.filter(
                (booking) => {
                  const start =
                    getPeriodStart(
                      period
                    );

                  if (!start) {
                    return true;
                  }

                  const date =
                    parseDate(
                      booking.checkInDate
                    );

                  if (!date) {
                    return false;
                  }

                  return (
                    startOfDay(
                      date
                    ) >= start
                  );
                }
              );

            const paid =
              bookings.filter(
                isPaid
              );

            const revenue =
              paid.reduce(
                (
                  total,
                  booking
                ) =>
                  total +
                  getBookingRevenue(
                    booking
                  ),
                0
              );

            return {
              hotelId:
                hotel.hotelId,
              hotelName:
                hotel.hotelName,
              city:
                hotel.city,
              revenue,
              bookings:
                paid.length,
              averageValue:
                paid.length ===
                0
                  ? 0
                  : revenue /
                    paid.length,
            };
          })
          .filter(
            (hotel) =>
              hotel.revenue >
                0 ||
              hotel.bookings >
                0
          )
          .sort(
            (a, b) =>
              b.revenue -
              a.revenue
          );
      },
      [
        hotelBookings,
        selectedHotelId,
        period,
      ]
    );

  /* =======================================================
     REVENUE TREND
  ====================================================== */

  const revenueTrend =
    useMemo<TrendPoint[]>(
      () => {
        const map =
          new Map<
            string,
            TrendPoint
          >();

        paidBookings.forEach(
          (booking) => {
            const date =
              parseDate(
                booking.checkInDate
              );

            if (!date) {
              return;
            }

            const key =
              getBucketKey(
                date,
                period
              );

            const existing =
              map.get(key);

            if (existing) {
              existing.revenue +=
                getBookingRevenue(
                  booking
                );

              existing.bookings +=
                1;

              return;
            }

            map.set(
              key,
              {
                key,
                label:
                  formatTrendLabel(
                    date,
                    period
                  ),
                revenue:
                  getBookingRevenue(
                    booking
                  ),
                bookings: 1,
              }
            );
          }
        );

        return Array.from(
          map.values()
        ).sort(
          (a, b) =>
            a.key.localeCompare(
              b.key
            )
        );
      },
      [
        paidBookings,
        period,
      ]
    );

  /* =======================================================
     RECENT PAID BOOKINGS
  ====================================================== */

  const recentPaidBookings =
    useMemo(
      () =>
        [...paidBookings]
          .sort(
            (a, b) => {
              const first =
                parseDate(
                  a.checkInDate
                )?.getTime() ||
                0;

              const second =
                parseDate(
                  b.checkInDate
                )?.getTime() ||
                0;

              return (
                second -
                first
              );
            }
          )
          .slice(0, 8),
      [paidBookings]
    );

  /* =======================================================
     SELECTED HOTEL
  ====================================================== */

  const selectedHotel =
    hotels.find(
      (hotel) =>
        hotel.id ===
        selectedHotelId
    );

  const pageTitle =
    selectedHotelId ===
    null
      ? "All Properties"
      : selectedHotel?.name ||
        "Property Revenue";

  /* =======================================================
     REFRESH
  ====================================================== */

  const handleRefresh =
    async () => {
      await loadRevenue();
    };

  /* =======================================================
     RENDER
  ====================================================== */

  return (
    <ProtectedRoute requiredRole="ROLE_OWNER">
      <DashboardLayout role="owner">

        <div className="space-y-7">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#bd762d]">
                Financial performance
              </p>

              <h1 className="mt-1 font-serif text-3xl font-bold text-espresso">
                Revenue
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Understand your paid revenue,
                bookings and payment activity
                across your properties.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              {/* PROPERTY SELECTOR */}

              <div className="relative">

                <Hotel className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#bd762d]" />

                <select
                  value={
                    selectedHotelId ??
                    ""
                  }
                  onChange={(
                    event
                  ) => {
                    const value =
                      event.target
                        .value;

                    setSelectedHotelId(
                      value
                        ? Number(
                            value
                          )
                        : null
                    );
                  }}
                  disabled={
                    loading
                  }
                  className="h-11 min-w-[280px] appearance-none rounded-lg border border-warm-stone/30 bg-white pl-10 pr-10 text-sm text-espresso outline-none transition focus:border-[#bd762d] focus:ring-2 focus:ring-[#bd762d]/10"
                >
                  <option value="">
                    All Properties
                  </option>

                  {hotels.map(
                    (hotel) => (
                      <option
                        key={
                          hotel.id
                        }
                        value={
                          hotel.id
                        }
                      >
                        {
                          hotel.name
                        }{" "}
                        —{" "}
                        {
                          hotel.city
                        }
                      </option>
                    )
                  )}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              </div>

              {/* REFRESH */}

              <button
                type="button"
                onClick={
                  handleRefresh
                }
                disabled={
                  loading
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-warm-stone/30 bg-white px-4 text-sm font-medium text-espresso transition hover:bg-warm-stone/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>
            </div>
          </div>

          {/* =================================================
              PERIOD SELECTOR
          ================================================= */}

          <section className="rounded-xl border border-warm-stone/20 bg-white p-5 shadow-warm">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#bd762d]">
                  Analytics period
                </p>

                <h2 className="mt-1 font-serif text-xl font-semibold text-espresso">
                  {pageTitle}
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Showing{" "}
                  {getPeriodLabel(
                    period
                  ).toLowerCase()}{" "}
                  of booking activity.
                </p>
              </div>

              <div className="flex flex-wrap rounded-lg border border-warm-stone/20 bg-[#faf8f3] p-1">

                {(
                  [
                    [
                      "ALL",
                      "All time",
                    ],
                    [
                      "7D",
                      "7 days",
                    ],
                    [
                      "30D",
                      "30 days",
                    ],
                    [
                      "3M",
                      "3 months",
                    ],
                    [
                      "6M",
                      "6 months",
                    ],
                    [
                      "1Y",
                      "1 year",
                    ],
                  ] as const
                ).map(
                  ([
                    value,
                    label,
                  ]) => (
                    <button
                      key={
                        value
                      }
                      type="button"
                      onClick={() =>
                        setPeriod(
                          value
                        )
                      }
                      className={`rounded-md px-3 py-2 text-xs font-medium transition ${
                        period ===
                        value
                          ? "bg-white text-[#bd762d] shadow-sm"
                          : "text-muted-foreground hover:text-espresso"
                      }`}
                    >
                      {label}
                    </button>
                  )
                )}

              </div>
            </div>
          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">

              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />

                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>

            </div>
          )}

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <MetricCard
              icon={Wallet}
              eyebrow="Earned"
              title="Total revenue"
              value={formatCurrency(
                totalRevenue
              )}
              description="Revenue from successfully paid bookings."
              loading={
                loading
              }
            />

            <MetricCard
              icon={
                CheckCircle2
              }
              eyebrow="Successful"
              title="Paid bookings"
              value={paidBookings.length.toLocaleString(
                "en-IN"
              )}
              description="Bookings that have contributed to revenue."
              loading={
                loading
              }
            />

            <MetricCard
              icon={
                TrendingUp
              }
              eyebrow="Per booking"
              title="Average booking value"
              value={formatCurrency(
                averageBookingValue
              )}
              description="Average revenue generated per paid booking."
              loading={
                loading
              }
            />

            <MetricCard
              icon={Clock3}
              eyebrow="Awaiting payment"
              title="Pending payments"
              value={formatCurrency(
                pendingAmount
              )}
              description={`${pendingBookings.length.toLocaleString(
                "en-IN"
              )} booking${
                pendingBookings.length ===
                1
                  ? ""
                  : "s"
              } awaiting payment.`}
              loading={
                loading
              }
            />

          </div>

          {/* =================================================
              REVENUE TREND
          ================================================= */}

          <section className="rounded-xl border border-warm-stone/20 bg-white shadow-warm">

            <div className="border-b border-warm-stone/20 p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#bd762d]">
                    Revenue overview
                  </p>

                  <h2 className="mt-1 font-serif text-xl font-semibold text-espresso">
                    Revenue trend
                  </h2>

                  <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                    This chart shows how much revenue
                    was generated from successfully
                    paid bookings during the selected
                    period.
                  </p>
                </div>

                <div className="rounded-lg bg-[#faf3e9] px-4 py-3 text-right">

                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Period revenue
                  </p>

                  <p className="mt-1 font-serif text-xl font-bold text-[#bd762d]">
                    {formatCurrency(
                      totalRevenue
                    )}
                  </p>

                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {paidBookings.length}{" "}
                    paid booking
                    {paidBookings.length ===
                    1
                      ? ""
                      : "s"}
                  </p>

                </div>

              </div>
            </div>

            <div className="p-6">

              {loading ? (
                <ChartLoading />
              ) : revenueTrend.length ===
                0 ? (
                <EmptyState
                  title="No paid revenue yet"
                  description="There are no successfully paid bookings in the selected period."
                />
              ) : (
                <RevenueChart
                  data={
                    revenueTrend
                  }
                  period={
                    period
                  }
                />
              )}

            </div>
          </section>

          {/* =================================================
              ALL PROPERTY REVENUE
          ================================================= */}

          {selectedHotelId ===
            null && (
            <section className="rounded-xl border border-warm-stone/20 bg-white shadow-warm">

              <div className="border-b border-warm-stone/20 p-6">

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#bd762d]">
                      Property comparison
                    </p>

                    <h2 className="mt-1 font-serif text-xl font-semibold text-espresso">
                      Revenue by hotel
                    </h2>

                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                      Compare paid revenue generated
                      by each of your properties.
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#bd762d]/10">
                    <Hotel className="h-5 w-5 text-[#bd762d]" />
                  </div>

                </div>
              </div>

              <div className="p-6">

                {loading ? (
                  <RevenueLoading />
                ) : hotelRevenue.length ===
                  0 ? (
                  <EmptyState
                    title="No property revenue"
                    description="There is no paid revenue to compare across your properties for this period."
                  />
                ) : (
                  <HotelRevenueChart
                    data={
                      hotelRevenue
                    }
                    totalRevenue={
                      totalRevenue
                    }
                  />
                )}

              </div>
            </section>
          )}

          {/* =================================================
              TWO COLUMN ANALYTICS
          ================================================= */}

          <div className="grid gap-6 xl:grid-cols-2">

            {/* ROOM REVENUE */}

            <section className="rounded-xl border border-warm-stone/20 bg-white shadow-warm">

              <div className="border-b border-warm-stone/20 p-6">

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#bd762d]">
                      Room performance
                    </p>

                    <h2 className="mt-1 font-serif text-xl font-semibold text-espresso">
                      Revenue by room type
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Which room types generate the
                      most paid revenue.
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#bd762d]/10">
                    <Hotel className="h-5 w-5 text-[#bd762d]" />
                  </div>

                </div>

              </div>

              <div className="p-6">

                {loading ? (
                  <RevenueLoading />
                ) : roomAnalytics.length ===
                  0 ? (
                  <EmptyState
                    title="No room revenue"
                    description="There are no paid room bookings in this period."
                  />
                ) : (
                  <RoomRevenueChart
                    data={
                      roomAnalytics
                    }
                    totalRevenue={
                      totalRevenue
                    }
                  />
                )}

              </div>
            </section>

            {/* BOOKING STATUS */}

            <BreakdownCard
              title="Booking status"
              eyebrow="Booking performance"
              description="Understand how bookings are distributed across their current backend status."
              icon={Hotel}
              items={
                bookingStatusBreakdown
              }
              loading={
                loading
              }
            />

          </div>

          {/* =================================================
              PAYMENT ANALYTICS
          ================================================= */}

          <div className="grid gap-6 xl:grid-cols-2">

            <PaymentPerformanceCard
              data={
                paymentAmountBreakdown
              }
              loading={
                loading
              }
              totalRevenue={
                totalRevenue
              }
              pendingAmount={
                pendingAmount
              }
            />

            <BreakdownCard
              title="Payment status"
              eyebrow="Payment performance"
              description="Distribution of payment states for bookings in the selected period."
              icon={
                CreditCard
              }
              items={
                paymentStatusBreakdown
              }
              loading={
                loading
              }
            />

          </div>

          {/* =================================================
              TRANSACTIONS
          ================================================= */}

          <section className="rounded-xl border border-warm-stone/20 bg-white shadow-warm">

            <div className="border-b border-warm-stone/20 p-6">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#bd762d]">
                    Transactions
                  </p>

                  <h2 className="mt-1 font-serif text-xl font-semibold text-espresso">
                    Recent paid bookings
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    The latest successfully paid bookings
                    contributing to revenue.
                  </p>
                </div>

                <div className="rounded-lg bg-[#faf8f3] px-3 py-2 text-xs text-muted-foreground">
                  Showing latest{" "}
                  {Math.min(
                    recentPaidBookings.length,
                    8
                  )}{" "}
                  transactions
                </div>

              </div>

            </div>

            {loading ? (
              <TableLoading />
            ) : recentPaidBookings.length ===
              0 ? (
              <EmptyState
                title="No paid bookings"
                description="Successfully paid bookings will appear here once revenue is generated."
              />
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[850px]">

                  <thead>
                    <tr className="border-b border-warm-stone/20 bg-[#faf8f3]">

                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Booking
                      </th>

                      {selectedHotelId ===
                        null && (
                        <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Property
                        </th>
                      )}

                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Guest
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Room
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Stay
                      </th>

                      <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Revenue
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-warm-stone/20">

                    {recentPaidBookings.map(
                      (
                        booking
                      ) => {

                        const hotel =
                          hotelBookings.find(
                            (
                              item
                            ) =>
                              item.bookings.some(
                                (
                                  candidate
                                ) =>
                                  candidate.bookingId ===
                                  booking.bookingId
                              )
                          );

                        return (
                          <tr
                            key={
                              booking.bookingId
                            }
                            className="transition hover:bg-[#faf8f3]"
                          >

                            <td className="px-6 py-5">

                              <p className="font-medium text-espresso">
                                #
                                {
                                  booking.bookingId
                                }
                              </p>

                              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-green-700">
                                <CheckCircle2 className="h-3 w-3" />
                                Paid
                              </span>

                            </td>

                            {selectedHotelId ===
                              null && (
                              <td className="px-6 py-5">

                                <p className="max-w-[190px] truncate text-sm font-medium text-espresso">
                                  {
                                    hotel?.hotelName ||
                                    "Property"
                                  }
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                  {
                                    hotel?.city ||
                                    ""
                                  }
                                </p>

                              </td>
                            )}

                            <td className="px-6 py-5">

                              <p className="font-medium text-espresso">
                                {
                                  booking.guestName ||
                                  "Guest"
                                }
                              </p>

                            </td>

                            <td className="px-6 py-5">

                              <p className="text-sm text-espresso">
                                {formatRoomType(
                                  booking.roomType
                                )}
                              </p>

                            </td>

                            <td className="px-6 py-5">

                              <p className="text-sm text-espresso">
                                {formatDate(
                                  booking.checkInDate
                                )}
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                to{" "}
                                {formatDate(
                                  booking.checkOutDate
                                )}
                              </p>

                            </td>

                            <td className="px-6 py-5 text-right">

                              <p className="font-semibold text-espresso">
                                {formatCurrency(
                                  getBookingRevenue(
                                    booking
                                  )
                                )}
                              </p>

                              <p className="mt-1 text-[11px] text-green-600">
                                Successfully paid
                              </p>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>
                </table>

              </div>
            )}

          </section>

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  icon: Icon,
  eyebrow,
  title,
  value,
  description,
  loading,
}: {
  icon: typeof Wallet;
  eyebrow: string;
  title: string;
  value: string;
  description: string;
  loading: boolean;
}) {
  return (
    <div className="group rounded-xl border border-warm-stone/20 bg-white p-5 shadow-warm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#bd762d]">
            {eyebrow}
          </p>

          <p className="mt-2 text-sm font-medium text-muted-foreground">
            {title}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#bd762d]/10 transition group-hover:bg-[#bd762d]/15">
          <Icon className="h-5 w-5 text-[#bd762d]" />
        </div>

      </div>

      {loading ? (
        <div className="mt-4 h-9 w-32 animate-pulse rounded bg-warm-stone/20" />
      ) : (
        <p className="mt-3 font-serif text-2xl font-bold text-espresso">
          {value}
        </p>
      )}

      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   REVENUE BY HOTEL
========================================================= */

function HotelRevenueChart({
  data,
  totalRevenue,
}: {
  data: HotelRevenueAnalytics[];
  totalRevenue: number;
}) {
  const maxRevenue =
    Math.max(
      ...data.map(
        (item) =>
          item.revenue
      ),
      1
    );

  return (
    <div className="space-y-6">

      {data.map(
        (item) => {
          const percentage =
            totalRevenue === 0
              ? 0
              : (item.revenue /
                  totalRevenue) *
                100;

          const barWidth =
            (item.revenue /
              maxRevenue) *
            100;

          return (
            <div
              key={
                item.hotelId
              }
            >

              <div className="flex items-start justify-between gap-5">

                <div className="min-w-0">

                  <div className="flex items-center gap-2">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#faf3e9]">
                      <Hotel className="h-4 w-4 text-[#bd762d]" />
                    </div>

                    <div className="min-w-0">

                      <p className="truncate font-medium text-espresso">
                        {
                          item.hotelName
                        }
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {
                          item.city
                        }{" "}
                        ·{" "}
                        {
                          item.bookings
                        }{" "}
                        paid booking
                        {item.bookings ===
                        1
                          ? ""
                          : "s"}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="shrink-0 text-right">

                  <p className="font-semibold text-espresso">
                    {formatCurrency(
                      item.revenue
                    )}
                  </p>

                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {percentage.toFixed(
                      1
                    )}
                    % of total
                  </p>

                </div>

              </div>

              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-warm-stone/15">

                <div
                  className="h-full rounded-full bg-[#bd762d] transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      barWidth,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>
          );
        }
      )}

    </div>
  );
}

/* =========================================================
   ROOM REVENUE
========================================================= */

function RoomRevenueChart({
  data,
  totalRevenue,
}: {
  data: RoomAnalytics[];
  totalRevenue: number;
}) {
  const maxRevenue =
    Math.max(
      ...data.map(
        (item) =>
          item.revenue
      ),
      1
    );

  return (
    <div className="space-y-6">

      {data.map(
        (item) => {
          const percentage =
            totalRevenue === 0
              ? 0
              : (item.revenue /
                  totalRevenue) *
                100;

          const barWidth =
            (item.revenue /
              maxRevenue) *
            100;

          return (
            <div
              key={
                item.roomType
              }
            >

              <div className="flex items-start justify-between gap-4">

                <div>
                  <p className="font-medium text-espresso">
                    {formatRoomType(
                      item.roomType
                    )}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {
                      item.bookings
                    }{" "}
                    paid booking
                    {item.bookings ===
                    1
                      ? ""
                      : "s"}{" "}
                    ·{" "}
                    {formatCurrency(
                      item.averageValue
                    )}{" "}
                    average
                  </p>
                </div>

                <div className="text-right">

                  <p className="font-semibold text-espresso">
                    {formatCurrency(
                      item.revenue
                    )}
                  </p>

                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {percentage.toFixed(
                      1
                    )}
                    %
                  </p>

                </div>

              </div>

              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-warm-stone/15">

                <div
                  className="h-full rounded-full bg-[#bd762d] transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      barWidth,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>
          );
        }
      )}

    </div>
  );
}

/* =========================================================
   BREAKDOWN CARD
========================================================= */

function BreakdownCard({
  title,
  eyebrow,
  description,
  icon: Icon,
  items,
  loading,
}: {
  title: string;
  eyebrow: string;
  description: string;
  icon: typeof Hotel;
  items: BreakdownItem[];
  loading: boolean;
}) {
  return (
    <section className="rounded-xl border border-warm-stone/20 bg-white shadow-warm">

      <div className="border-b border-warm-stone/20 p-6">

        <div className="flex items-start justify-between gap-4">

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#bd762d]">
              {eyebrow}
            </p>

            <h2 className="mt-1 font-serif text-xl font-semibold text-espresso">
              {title}
            </h2>

            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#bd762d]/10">
            <Icon className="h-5 w-5 text-[#bd762d]" />
          </div>

        </div>

      </div>

      <div className="p-6">

        {loading ? (
          <RevenueLoading />
        ) : items.length ===
          0 ? (
          <EmptyState
            title="No status data"
            description="There is no booking activity to analyse for this period."
          />
        ) : (
          <div className="space-y-5">

            {items.map(
              (item) => (
                <div
                  key={
                    item.label
                  }
                >

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-3">

                      <StatusIcon
                        label={
                          item.label
                        }
                      />

                      <div className="min-w-0">

                        <p className="font-medium text-espresso">
                          {
                            item.label
                          }
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {
                            item.count
                          }{" "}
                          booking
                          {item.count ===
                          1
                            ? ""
                            : "s"}
                        </p>

                      </div>

                    </div>

                    <p className="shrink-0 font-semibold text-espresso">
                      {item.percentage.toFixed(
                        1
                      )}
                      %
                    </p>

                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-warm-stone/15">

                    <div
                      className="h-full rounded-full bg-[#bd762d] transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          Math.max(
                            item.percentage,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>
    </section>
  );
}

/* =========================================================
   PAYMENT PERFORMANCE
========================================================= */

function PaymentPerformanceCard({
  data,
  loading,
  totalRevenue,
  pendingAmount,
}: {
  data: {
    label: string;
    amount: number;
    count: number;
  }[];
  loading: boolean;
  totalRevenue: number;
  pendingAmount: number;
}) {
  const totalTracked =
    totalRevenue +
    pendingAmount;

  return (
    <section className="rounded-xl border border-warm-stone/20 bg-white shadow-warm">

      <div className="border-b border-warm-stone/20 p-6">

        <div className="flex items-start justify-between gap-4">

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#bd762d]">
              Cash flow
            </p>

            <h2 className="mt-1 font-serif text-xl font-semibold text-espresso">
              Payment performance
            </h2>

            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Compare money already paid with
              payments still awaiting completion.
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#bd762d]/10">
            <CreditCard className="h-5 w-5 text-[#bd762d]" />
          </div>

        </div>

      </div>

      <div className="p-6">

        {loading ? (
          <RevenueLoading />
        ) : (
          <div className="space-y-7">

            {data.map(
              (item) => {
                const percentage =
                  totalTracked ===
                  0
                    ? 0
                    : (item.amount /
                        totalTracked) *
                      100;

                return (
                  <div
                    key={
                      item.label
                    }
                  >

                    <div className="flex items-end justify-between gap-4">

                      <div>

                        <div className="flex items-center gap-2">

                          <div
                            className={`h-2.5 w-2.5 rounded-full ${
                              item.label ===
                              "Paid"
                                ? "bg-green-500"
                                : "bg-[#bd762d]"
                            }`}
                          />

                          <p className="font-medium text-espresso">
                            {
                              item.label
                            }
                          </p>

                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {
                            item.count
                          }{" "}
                          booking
                          {item.count ===
                          1
                            ? ""
                            : "s"}
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="font-semibold text-espresso">
                          {formatCurrency(
                            item.amount
                          )}
                        </p>

                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {percentage.toFixed(
                            1
                          )}
                          %
                        </p>

                      </div>

                    </div>

                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-warm-stone/15">

                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          item.label ===
                          "Paid"
                            ? "bg-green-500"
                            : "bg-[#bd762d]"
                        }`}
                        style={{
                          width: `${Math.min(
                            percentage,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              }
            )}

            <div className="rounded-lg bg-[#faf8f3] p-4">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Tracked payment value
                  </p>

                  <p className="mt-1 font-serif text-lg font-semibold text-espresso">
                    {formatCurrency(
                      totalTracked
                    )}
                  </p>
                </div>

                <Wallet className="h-5 w-5 text-[#bd762d]" />

              </div>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                This compares successful revenue
                with pending payment value. It does
                not include payments without an amount
                supplied by the backend.
              </p>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}

/* =========================================================
   STATUS ICON
========================================================= */

function StatusIcon({
  label,
}: {
  label: string;
}) {
  const normalized =
    normalizeStatus(label);

  const Icon =
    normalized ===
    "SUCCESS"
      ? CheckCircle2
      : normalized ===
        "PAID"
      ? CheckCircle2
      : normalized ===
        "PENDING"
      ? Clock3
      : normalized ===
        "CANCELLED"
      ? XCircle
      : normalized ===
        "EXPIRED"
      ? AlertCircle
      : BarChart3;

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#faf3e9]">
      <Icon className="h-4 w-4 text-[#bd762d]" />
    </div>
  );
}

/* =========================================================
   REVENUE CHART
========================================================= */

function RevenueChart({
  data,
  period,
}: {
  data: TrendPoint[];
  period: RevenuePeriod;
}) {
  const width = 1000;
  const height = 360;

  const left = 75;
  const right = 30;
  const top = 35;
  const bottom = 65;

  const chartWidth =
    width -
    left -
    right;

  const chartHeight =
    height -
    top -
    bottom;

  const maxRevenue =
    Math.max(
      ...data.map(
        (item) =>
          item.revenue
      ),
      0
    );

  /*
   * Give the chart some breathing room above
   * the highest point.
   */
  const chartMax =
    maxRevenue === 0
      ? 100
      : Math.ceil(
          maxRevenue * 1.2
        );

  const points =
    data.map(
      (
        item,
        index
      ) => {
        const x =
          data.length ===
          1
            ? left +
              chartWidth /
                2
            : left +
              (index /
                (data.length -
                  1)) *
                chartWidth;

        const y =
          top +
          chartHeight -
          (item.revenue /
            chartMax) *
            chartHeight;

        return {
          ...item,
          x,
          y,
        };
      }
    );

  const path =
    points.length ===
    1
      ? `M ${points[0].x} ${points[0].y}`
      : points
          .map(
            (
              point,
              index
            ) =>
              `${
                index ===
                0
                  ? "M"
                  : "L"
              } ${point.x} ${point.y}`
          )
          .join(" ");

  const areaPath =
    points.length > 1
      ? `${path} L ${
          points[
            points.length -
              1
          ].x
        } ${
          top +
          chartHeight
        } L ${
          points[0].x
        } ${
          top +
          chartHeight
        } Z`
      : "";

  const labelIndexes =
    data.length <= 6
      ? data.map(
          (_, index) =>
            index
        )
      : data.map(
          (_, index) => {
            if (
              index ===
              0
            ) {
              return index;
            }

            if (
              index ===
              data.length -
                1
            ) {
              return index;
            }

            const step =
              Math.ceil(
                data.length /
                  5
              );

            return index %
              step ===
              0
              ? index
              : -1;
          }
        ).filter(
          (index) =>
            index >= 0
        );

  const gridRatios = [
    0,
    0.25,
    0.5,
    0.75,
    1,
  ];

  return (
    <div>

      {/* CHART EXPLANATION */}

      <div className="mb-5 rounded-lg border border-warm-stone/15 bg-[#faf8f3] p-4">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-medium text-espresso">
              What this means
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Each point represents revenue from
              successfully paid bookings for that
              reporting period. Hover over a point
              to see the exact revenue and booking
              count.
            </p>
          </div>

          <div className="shrink-0 text-left sm:text-right">

            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              View
            </p>

            <p className="mt-1 text-sm font-medium text-espresso">
              {getPeriodLabel(
                period
              )}
            </p>

          </div>

        </div>

      </div>

      {/* CHART */}

      <div className="w-full overflow-x-auto">

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto min-w-[700px] w-full"
          role="img"
          aria-label="Revenue trend chart"
        >

          {/* GRID */}

          {gridRatios.map(
            (ratio) => {
              const y =
                top +
                chartHeight -
                ratio *
                  chartHeight;

              return (
                <g
                  key={
                    ratio
                  }
                >

                  <line
                    x1={
                      left
                    }
                    y1={
                      y
                    }
                    x2={
                      width -
                      right
                    }
                    y2={
                      y
                    }
                    stroke="currentColor"
                    className="text-warm-stone/20"
                    strokeDasharray="4 7"
                  />

                  <text
                    x={
                      left -
                      12
                    }
                    y={
                      y +
                      4
                    }
                    textAnchor="end"
                    className="fill-muted-foreground text-[11px]"
                  >
                    {formatCurrency(
                      chartMax *
                        ratio
                    )}
                  </text>

                </g>
              );
            }
          )}

          {/* AREA */}

          {areaPath && (
            <path
              d={
                areaPath
              }
              className="fill-[#bd762d]/10"
            />
          )}

          {/* LINE */}

          <path
            d={
              path
            }
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#bd762d]"
          />

          {/* POINTS */}

          {points.map(
            (
              point
            ) => (
              <g
                key={
                  point.key
                }
              >

                <circle
                  cx={
                    point.x
                  }
                  cy={
                    point.y
                  }
                  r="9"
                  className="fill-[#bd762d]/10"
                />

                <circle
                  cx={
                    point.x
                  }
                  cy={
                    point.y
                  }
                  r="5"
                  className="fill-white stroke-[#bd762d]"
                  strokeWidth="3"
                >
                  <title>
                    {
                      point.label
                    }{" "}
                    —{" "}
                    {formatCurrency(
                      point.revenue
                    )}{" "}
                    ·{" "}
                    {
                      point.bookings
                    }{" "}
                    booking
                    {point.bookings ===
                    1
                      ? ""
                      : "s"}
                  </title>
                </circle>

              </g>
            )
          )}

          {/* X LABELS */}

          {labelIndexes.map(
            (index) => {
              const point =
                points[
                  index
                ];

              if (!point) {
                return null;
              }

              return (
                <text
                  key={
                    `label-${point.key}`
                  }
                  x={
                    point.x
                  }
                  y={
                    height -
                    22
                  }
                  textAnchor="middle"
                  className="fill-muted-foreground text-[11px]"
                >
                  {
                    point.label
                  }
                </text>
              );
            }
          )}

        </svg>

      </div>

      {/* SINGLE POINT EXPLANATION */}

      {data.length ===
        1 && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-[#bd762d]/20 bg-[#faf3e9] p-4">

          <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-[#bd762d]" />

          <div>
            <p className="text-sm font-medium text-espresso">
              Limited revenue activity
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Only one reporting point exists
              for this period. The chart will become
              more informative as additional paid
              bookings are recorded.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function RevenueLoading() {
  return (
    <div className="space-y-5">

      {[1, 2, 3].map(
        (item) => (
          <div
            key={
              item
            }
            className="animate-pulse"
          >

            <div className="flex justify-between">

              <div className="h-4 w-32 rounded bg-warm-stone/20" />

              <div className="h-4 w-20 rounded bg-warm-stone/20" />

            </div>

            <div className="mt-3 h-2.5 rounded-full bg-warm-stone/20" />

          </div>
        )
      )}

    </div>
  );
}

function ChartLoading() {
  return (
    <div className="space-y-5">

      <div className="h-12 animate-pulse rounded-lg bg-warm-stone/10" />

      <div className="h-[330px] animate-pulse rounded-lg bg-warm-stone/10" />

    </div>
  );
}

function TableLoading() {
  return (
    <div className="space-y-4 p-6">

      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={
              item
            }
            className="h-12 animate-pulse rounded-lg bg-warm-stone/10"
          />
        )
      )}

    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  title = "No analytics available",
  description = "There is no booking activity for the selected property and period.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[190px] flex-col items-center justify-center px-4 text-center">

      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#bd762d]/10">
        <BarChart3 className="h-6 w-6 text-[#bd762d]" />
      </div>

      <h3 className="mt-4 font-serif text-lg font-semibold text-espresso">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-sm leading-5 text-muted-foreground">
        {description}
      </p>

    </div>
  );
}