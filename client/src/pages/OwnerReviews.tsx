import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Hotel,
  MessageSquare,
  RefreshCw,
  Star,
} from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

import { ownerHotelsApi } from "@/api/ownerHotels";
import {
  ownerReviewsApi,
  type OwnerReview,
} from "@/api/ownerReviews";

interface HotelOption {
  id: number;
  name: string;
  city: string;
}

const PAGE_SIZE = 10;

export default function OwnerReviews() {
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(
    null
  );

  const [reviews, setReviews] = useState<OwnerReview[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [loadingHotels, setLoadingHotels] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHotels();
  }, []);

  useEffect(() => {
    if (!selectedHotelId) {
      setReviews([]);
      setTotalElements(0);
      setTotalPages(0);
      return;
    }

    loadReviews(selectedHotelId, currentPage);
  }, [selectedHotelId, currentPage]);

  async function loadHotels() {
    try {
      setLoadingHotels(true);
      setError(null);

      const response = await ownerHotelsApi.getMyHotels();

      const mappedHotels: HotelOption[] = response.data.map(
        (hotel) => ({
          id: hotel.id,
          name: hotel.name,
          city: hotel.city,
        })
      );

      setHotels(mappedHotels);

      if (
        mappedHotels.length > 0 &&
        selectedHotelId === null
      ) {
        setSelectedHotelId(mappedHotels[0].id);
      }
    } catch (err) {
      console.error(
        "Failed to load owner hotels:",
        err
      );

      setError(
        "Unable to load your properties."
      );
    } finally {
      setLoadingHotels(false);
    }
  }

  async function loadReviews(
    hotelId: number,
    page: number
  ) {
    try {
      setLoadingReviews(true);
      setError(null);

      const response =
        await ownerReviewsApi.getHotelReviews(
          hotelId,
          page,
          PAGE_SIZE
        );

      setReviews(response.data.content);
      setTotalElements(
        response.data.totalElements
      );
      setTotalPages(
        response.data.totalPages
      );
    } catch (err) {
      console.error(
        "Failed to load hotel reviews:",
        err
      );

      setReviews([]);
      setTotalElements(0);
      setTotalPages(0);

      setError(
        "Unable to load reviews."
      );
    } finally {
      setLoadingReviews(false);
    }
  }

  async function refresh() {
    if (!selectedHotelId) {
      await loadHotels();
      return;
    }

    await loadReviews(
      selectedHotelId,
      currentPage
    );
  }

  function handleHotelChange(
    hotelId: number
  ) {
    setSelectedHotelId(hotelId);
    setCurrentPage(0);
  }

  const selectedHotel = useMemo(
    () =>
      hotels.find(
        (hotel) =>
          hotel.id === selectedHotelId
      ),
    [hotels, selectedHotelId]
  );

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return null;
    }

    const total = reviews.reduce(
      (sum, review) =>
        sum + Number(review.rating),
      0
    );

    return total / reviews.length;
  }, [reviews]);

  return (
    <ProtectedRoute requiredRole="ROLE_OWNER">
      <DashboardLayout role="owner">
        <div className="space-y-8">

          {/* Header */}
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#bd762d]">
                Guest feedback
              </p>

              <h1 className="mt-1 font-serif text-3xl font-bold text-espresso">
                Reviews
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                See what guests are saying about your
                property and monitor their experience.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Hotel selector */}
              <div className="relative">
                <Hotel className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#bd762d]" />

                <select
                  value={selectedHotelId ?? ""}
                  onChange={(event) =>
                    handleHotelChange(
                      Number(event.target.value)
                    )
                  }
                  disabled={
                    loadingHotels ||
                    hotels.length === 0
                  }
                  className="h-11 min-w-[240px] appearance-none rounded-lg border border-warm-stone/30 bg-white pl-10 pr-10 text-sm text-espresso outline-none transition focus:border-[#bd762d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingHotels && (
                    <option value="">
                      Loading properties...
                    </option>
                  )}

                  {!loadingHotels &&
                    hotels.length === 0 && (
                      <option value="">
                        No properties
                      </option>
                    )}

                  {!loadingHotels &&
                    hotels.map((hotel) => (
                      <option
                        key={hotel.id}
                        value={hotel.id}
                      >
                        {hotel.name} — {hotel.city}
                      </option>
                    ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>

              <button
                type="button"
                onClick={refresh}
                disabled={
                  loadingHotels ||
                  loadingReviews
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-warm-stone/30 bg-white px-4 text-sm font-medium text-espresso transition hover:bg-warm-stone/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loadingHotels ||
                    loadingReviews
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>
            </div>
          </div>

          {/* Selected property */}
          {selectedHotel && (
            <div className="flex items-center justify-between rounded-xl border border-warm-stone/20 bg-white px-5 py-4 shadow-warm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#bd762d]/10">
                  <Hotel className="h-5 w-5 text-[#bd762d]" />
                </div>

                <div>
                  <p className="font-medium text-espresso">
                    {selectedHotel.name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {selectedHotel.city}
                  </p>
                </div>
              </div>

              {!loadingReviews &&
                totalElements > 0 && (
                  <div className="hidden text-right sm:block">
                    <p className="text-xs text-muted-foreground">
                      Total reviews
                    </p>

                    <p className="font-serif text-xl font-bold text-espresso">
                      {totalElements.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
                  <MessageSquare className="h-4 w-4 text-red-600" />
                </div>

                <div>
                  <p className="font-medium text-red-800">
                    Something went wrong
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {!loadingReviews &&
            !error &&
            selectedHotelId &&
            reviews.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <SummaryCard
                  icon={MessageSquare}
                  label="Reviews"
                  value={totalElements.toLocaleString(
                    "en-IN"
                  )}
                />

                <SummaryCard
                  icon={Star}
                  label="Average on this page"
                  value={
                    averageRating !== null
                      ? averageRating.toFixed(1)
                      : "—"
                  }
                  suffix={
                    averageRating !== null
                      ? "/ 5"
                      : undefined
                  }
                />
              </div>
            )}

          {/* Reviews */}
          <section className="rounded-xl border border-warm-stone/20 bg-white shadow-warm">

            <div className="border-b border-warm-stone/20 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#bd762d]">
                    Guest feedback
                  </p>

                  <h2 className="mt-1 font-serif text-xl font-semibold text-espresso">
                    Guest reviews
                  </h2>
                </div>

                {totalElements > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {totalElements.toLocaleString(
                      "en-IN"
                    )}{" "}
                    review
                    {totalElements === 1
                      ? ""
                      : "s"}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {loadingReviews ? (
                <ReviewsLoading />
              ) : reviews.length > 0 ? (
                <div className="divide-y divide-warm-stone/20">
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review.reviewId}
                      review={review}
                    />
                  ))}
                </div>
              ) : (
                <EmptyReviews />
              )}
            </div>

            {/* Pagination */}
            {!loadingReviews &&
              !error &&
              totalPages > 1 && (
                <div className="flex flex-col gap-4 border-t border-warm-stone/20 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page{" "}
                    <span className="font-medium text-espresso">
                      {currentPage + 1}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-espresso">
                      {totalPages}
                    </span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={
                        currentPage === 0 ||
                        loadingReviews
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.max(
                              page - 1,
                              0
                            )
                        )
                      }
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-warm-stone/30 bg-white px-3 text-sm font-medium text-espresso transition hover:bg-warm-stone/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        Previous
                      </span>
                    </button>

                    <div className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-[#bd762d]/10 px-3 text-sm font-semibold text-[#bd762d]">
                      {currentPage + 1}
                    </div>

                    <button
                      type="button"
                      disabled={
                        currentPage >=
                          totalPages - 1 ||
                        loadingReviews
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.min(
                              page + 1,
                              totalPages - 1
                            )
                        )
                      }
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-warm-stone/30 bg-white px-3 text-sm font-medium text-espresso transition hover:bg-warm-stone/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="hidden sm:inline">
                        Next
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
          </section>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: typeof MessageSquare;
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-warm-stone/20 bg-white p-5 shadow-warm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#bd762d]/10">
        <Icon className="h-5 w-5 text-[#bd762d]" />
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-serif text-2xl font-bold text-espresso">
        {value}
        {suffix && (
          <span className="ml-1 text-base font-medium text-muted-foreground">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}

function ReviewCard({
  review,
}: {
  review: OwnerReview;
}) {
  return (
    <article className="py-6 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

        <div className="flex min-w-0 gap-4">
          {/* Avatar */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#faf8f3] font-serif text-lg font-semibold text-[#bd762d]">
            {getInitials(review.guestName)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              <h3 className="truncate font-medium text-espresso">
                {review.guestName}
              </h3>

              <span className="hidden text-warm-stone/60 sm:inline">
                •
              </span>

              <time
                dateTime={review.createdAt}
                className="text-xs text-muted-foreground"
              >
                {formatReviewDate(
                  review.createdAt
                )}
              </time>
            </div>

            <div className="mt-2">
              <RatingStars
                rating={Number(review.rating)}
              />
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              {review.comment}
            </p>
          </div>
        </div>

        <div className="shrink-0 self-start rounded-full bg-[#faf8f3] px-3 py-1.5">
          <span className="font-medium text-espresso">
            {Number(review.rating).toFixed(1)}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">
            / 5
          </span>
        </div>
      </div>
    </article>
  );
}

function RatingStars({
  rating,
}: {
  rating: number;
}) {
  const normalizedRating = Math.max(
    0,
    Math.min(5, rating)
  );

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${normalizedRating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= normalizedRating
              ? "fill-[#bd762d] text-[#bd762d]"
              : "text-warm-stone/40"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewsLoading() {
  return (
    <div className="divide-y divide-warm-stone/20">
      {Array.from({ length: 5 }).map(
        (_, index) => (
          <div
            key={index}
            className="flex gap-4 py-6 first:pt-0"
          >
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-warm-stone/20" />

            <div className="flex-1 space-y-3">
              <div className="h-4 w-40 animate-pulse rounded bg-warm-stone/20" />

              <div className="h-4 w-28 animate-pulse rounded bg-warm-stone/20" />

              <div className="space-y-2 pt-2">
                <div className="h-3 w-full animate-pulse rounded bg-warm-stone/20" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-warm-stone/20" />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function EmptyReviews() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#bd762d]/10">
        <MessageSquare className="h-6 w-6 text-[#bd762d]" />
      </div>

      <h3 className="mt-5 font-serif text-xl font-semibold text-espresso">
        No reviews yet
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Guest reviews for this property will appear
        here once guests share their experience.
      </p>
    </div>
  );
}

function getInitials(
  name: string
) {
  if (!name) {
    return "?";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function formatReviewDate(
  value: string
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}