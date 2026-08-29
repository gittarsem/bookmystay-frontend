import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";

import MainLayout from "@/layouts/MainLayout";
import HotelCard from "@/components/HotelCard";
import { HotelCardSkeleton } from "@/components/Skeleton";

import { hotelsApi } from "@/api";
import { mapHotels } from "@/mappers/hotelMapper";

import type { Hotel } from "@/types";

export default function SearchResults() {
  const search = useSearch();
  const params = new URLSearchParams(search);

  // =========================================================
  // SEARCH PARAMETERS
  // =========================================================

  const keyword = params.get("keyword");
  const city = params.get("city");

  const checkInDate =
    params.get("checkInDate");

  const checkOutDate =
    params.get("checkOutDate");

  const checkInTime =
    params.get("checkInTime");

  const checkOutTime =
    params.get("checkOutTime");

  const adults =
    params.get("adults") || "2";

  const children =
    params.get("children") || "0";

  /*
   * Booking mode is only relevant when the user has
   * actually selected dates.
   *
   * If no dates are provided, this is a normal
   * hotel discovery/search request.
   */
  const hasDates =
    Boolean(checkInDate && checkOutDate);

  const bookingMode =
    hasDates &&
    params.get("bookingMode") === "HOURLY"
      ? "HOURLY"
      : hasDates
        ? "DAILY"
        : null;

  // =========================================================
  // FILTERS
  // =========================================================

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const [localMinPrice, setLocalMinPrice] =
    useState(
      Number(params.get("minPrice")) || 0
    );

  const [localMaxPrice, setLocalMaxPrice] =
    useState(
      Number(params.get("maxPrice")) || 200000
    );

  const [localRating, setLocalRating] =
    useState(
      Number(params.get("ratings")) || 0
    );

  const [sortBy, setSortBy] =
    useState(
      params.get("sort") || "rating"
    );

  // =========================================================
  // PAGINATION
  // =========================================================

  const [page, setPage] =
    useState(0);

  // =========================================================
  // DATA
  // =========================================================

  const [hotels, setHotels] =
    useState<Hotel[]>([]);

  const [totalHotels, setTotalHotels] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  // =========================================================
  // RESET PAGE WHEN FILTERS CHANGE
  // =========================================================

  useEffect(() => {
    setPage(0);
  }, [
    search,
    localMinPrice,
    localMaxPrice,
    localRating,
    sortBy,
  ]);

  // =========================================================
  // FETCH HOTELS
  // =========================================================

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);

        /*
         * Base search request.
         *
         * Dates are OPTIONAL here.
         */
        const searchRequest: any = {
          keyword:
            keyword || undefined,

          city:
            city || undefined,

          minPrice:
            localMinPrice > 0
              ? localMinPrice
              : undefined,

          maxPrice:
            localMaxPrice < 200000
              ? localMaxPrice
              : undefined,

          ratings:
            localRating > 0
              ? localRating
              : undefined,

          sortField:
            sortBy === "price"
              ? "price"
              : "ratings",

          sortOrder:
            sortBy === "price"
              ? "asc"
              : "desc",

          page,
          size: 20,
        };

        /*
         * ONLY add availability information when
         * both dates are present.
         *
         * This is the important part.
         */
        if (hasDates) {
          searchRequest.bookingMode =
            bookingMode;

          searchRequest.checkInDate =
            checkInDate;

          searchRequest.checkOutDate =
            checkOutDate;

          /*
           * Time is relevant ONLY for hourly bookings.
           */
          if (bookingMode === "HOURLY") {
            searchRequest.checkInTime =
              checkInTime || undefined;

            searchRequest.checkOutTime =
              checkOutTime || undefined;
          }
        }

        const response =
          await hotelsApi.search(
            searchRequest
          );

        setHotels(
          mapHotels(
            response.data.hotels
          )
        );

        setTotalHotels(
          response.data.total
        );

      } catch (error) {

        console.error(
          "Failed to load hotels",
          error
        );

        setHotels([]);
        setTotalHotels(0);

      } finally {
        setLoading(false);
      }
    };

    fetchHotels();

  }, [
    keyword,
    city,
    hasDates,
    bookingMode,
    checkInDate,
    checkInTime,
    checkOutDate,
    checkOutTime,
    page,
    localMinPrice,
    localMaxPrice,
    localRating,
    sortBy,
  ]);

  // =========================================================
  // DISPLAY DATE/TIME
  // =========================================================

  const formatDate = (
    date: string | null
  ) => {
    if (!date) {
      return null;
    }

    const parsed =
      new Date(`${date}T00:00:00`);

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (
    time: string | null
  ) => {
    if (!time) {
      return null;
    }

    const [hour, minute] =
      time.split(":");

    const date =
      new Date();

    date.setHours(
      Number(hour),
      Number(minute)
    );

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  const formattedCheckIn =
    formatDate(checkInDate);

  const formattedCheckOut =
    formatDate(checkOutDate);

  /*
   * Time is displayed ONLY for hourly bookings.
   */
  const formattedCheckInTime =
    bookingMode === "HOURLY"
      ? formatTime(checkInTime)
      : null;

  const formattedCheckOutTime =
    bookingMode === "HOURLY"
      ? formatTime(checkOutTime)
      : null;

  const cityParam =
    city || "All Destinations";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <MainLayout>

      {/* =====================================================
          SEARCH SUMMARY
          ===================================================== */}

      <div className="bg-white border-b border-warm-stone/30 py-4">

        <div className="container">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>

              <h1 className="font-serif text-2xl font-bold text-espresso">

                {cityParam ===
                  "All Destinations"
                  ? "All Properties"
                  : cityParam}

              </h1>

              <p className="text-sm text-muted-foreground mt-1">

                {/* =========================
                    DATE / TIME
                    ========================= */}

                {formattedCheckIn &&
                  formattedCheckOut && (
                    <>
                      {formattedCheckIn}

                      {bookingMode ===
                        "HOURLY" &&
                        formattedCheckInTime && (
                          <>
                            {" "}
                            {formattedCheckInTime}
                          </>
                        )}

                      {" → "}

                      {formattedCheckOut}

                      {bookingMode ===
                        "HOURLY" &&
                        formattedCheckOutTime && (
                          <>
                            {" "}
                            {formattedCheckOutTime}
                          </>
                        )}

                      {" • "}
                    </>
                  )}

                {/* =========================
                    BOOKING MODE
                    ========================= */}

                {bookingMode === null
                  ? "Select dates for availability"
                  : bookingMode === "HOURLY"
                    ? "Hourly"
                    : "Daily"}

                {" • "}

                {adults} adult
                {adults !== "1"
                  ? "s"
                  : ""}

                {Number(children) > 0 && (
                  <>
                    {" • "}
                    {children} child
                    {children !== "1"
                      ? "ren"
                      : ""}
                  </>
                )}

                {" • "}

                {totalHotels} properties found

              </p>

            </div>

            {/* =================================================
                SORT + FILTER
                ================================================= */}

            <div className="flex items-center gap-3">

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
                  )
                }
                className="
                  px-4
                  py-2
                  bg-cream
                  rounded-xl
                  border
                  border-warm-stone/30
                  text-sm
                  text-espresso
                  focus:outline-none
                  focus:ring-2
                  focus:ring-bronze/20
                "
              >

                <option value="rating">
                  Sort by Rating
                </option>

                <option value="price">
                  Sort by Price (Low to High)
                </option>

              </select>

              <button
                onClick={() =>
                  setFiltersOpen(
                    !filtersOpen
                  )
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  filtersOpen
                    ? "bg-bronze text-white border-bronze"
                    : "bg-white border-warm-stone/30 text-espresso hover:border-bronze/40"
                }`}
              >

                <SlidersHorizontal
                  className="w-4 h-4"
                />

                <span className="text-sm font-medium">
                  Filters
                </span>

              </button>

            </div>

          </div>

          {/* =================================================
              FILTER PANEL
              ================================================= */}

          {filtersOpen && (

            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              transition={{
                duration: 0.25,
              }}
              className="
                mt-4
                pt-4
                border-t
                border-warm-stone/30
              "
            >

              <div className="
                grid
                grid-cols-1
                md:grid-cols-3
                gap-6
              ">

                {/* PRICE */}

                <div>

                  <label className="
                    text-xs
                    uppercase
                    tracking-widest
                    text-muted-foreground
                    font-medium
                    mb-2
                    block
                  ">
                    Price Range (₹)
                  </label>

                  <div className="
                    flex
                    items-center
                    gap-3
                  ">

                    <input
                      type="number"
                      min={0}
                      value={
                        localMinPrice
                      }
                      onChange={(e) =>
                        setLocalMinPrice(
                          Number(
                            e.target.value
                          )
                        )
                      }
                      placeholder="Minimum"
                      className="
                        w-full
                        px-3
                        py-2
                        bg-cream
                        rounded-lg
                        border
                        border-warm-stone/30
                        text-sm
                        focus:outline-none
                        focus:ring-2
                        focus:ring-bronze/20
                      "
                    />

                    <span className="
                      text-muted-foreground
                    ">
                      —
                    </span>

                    <input
                      type="number"
                      min={0}
                      value={
                        localMaxPrice
                      }
                      onChange={(e) =>
                        setLocalMaxPrice(
                          Number(
                            e.target.value
                          )
                        )
                      }
                      placeholder="Maximum"
                      className="
                        w-full
                        px-3
                        py-2
                        bg-cream
                        rounded-lg
                        border
                        border-warm-stone/30
                        text-sm
                        focus:outline-none
                        focus:ring-2
                        focus:ring-bronze/20
                      "
                    />

                  </div>

                </div>

                {/* RATING */}

                <div>

                  <label className="
                    text-xs
                    uppercase
                    tracking-widest
                    text-muted-foreground
                    font-medium
                    mb-2
                    block
                  ">
                    Minimum Rating
                  </label>

                  <div className="
                    flex
                    flex-wrap
                    gap-2
                  ">

                    {[0, 3, 4, 4.5].map(
                      (rating) => (

                        <button
                          key={rating}
                          type="button"
                          onClick={() =>
                            setLocalRating(
                              rating
                            )
                          }
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            localRating ===
                            rating
                              ? "bg-bronze text-white"
                              : "bg-cream text-espresso border border-warm-stone/30 hover:border-bronze/40"
                          }`}
                        >

                          {rating === 0
                            ? "All"
                            : `${rating}+`}

                        </button>

                      )
                    )}

                  </div>

                </div>

                {/* RESET */}

                <div className="
                  flex
                  items-end
                ">

                  <button
                    type="button"
                    onClick={() => {
                      setLocalMinPrice(0);
                      setLocalMaxPrice(
                        200000
                      );
                      setLocalRating(0);
                      setSortBy("rating");
                    }}
                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      text-muted-foreground
                      hover:text-bronze
                      transition-colors
                    "
                  >

                    <X className="w-4 h-4" />

                    Reset all filters

                  </button>

                </div>

              </div>

            </motion.div>

          )}

        </div>

      </div>

      {/* =====================================================
          RESULTS
          ===================================================== */}

      <section className="py-10">

        <div className="container">

          {loading ? (

            <div className="
              grid
              grid-cols-1
              md:grid-cols-2
              lg:grid-cols-3
              gap-6
            ">

              {Array.from({
                length: 6,
              }).map((_, index) => (

                <HotelCardSkeleton
                  key={index}
                />

              ))}

            </div>

          ) : hotels.length === 0 ? (

            <div className="
              text-center
              py-20
            ">

              <h2 className="
                font-serif
                text-3xl
                font-semibold
                text-espresso
              ">
                No Properties Found
              </h2>

              <p className="
                text-muted-foreground
                mt-3
              ">

                {hasDates
                  ? "No hotels are available for your selected dates and time."
                  : "No properties match your search criteria."}

              </p>

            </div>

          ) : (

            <>

              <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-3
                gap-6
              ">

                {hotels.map(
                  (hotel, index) => (

                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      index={index}
                    />

                  )
                )}

              </div>

              {/* =================================================
                  PAGINATION
                  ================================================= */}

              {totalHotels > 20 && (

                <div className="
                  flex
                  justify-center
                  items-center
                  gap-4
                  mt-12
                ">

                  <button
                    disabled={
                      page === 0
                    }
                    onClick={() =>
                      setPage(
                        (prev) =>
                          Math.max(
                            prev - 1,
                            0
                          )
                      )
                    }
                    className="
                      px-5
                      py-2
                      rounded-xl
                      border
                      border-warm-stone/30
                      bg-white
                      text-espresso
                      disabled:opacity-40
                      disabled:cursor-not-allowed
                      hover:border-bronze
                      transition-colors
                    "
                  >
                    Previous
                  </button>

                  <span className="
                    text-sm
                    text-muted-foreground
                  ">
                    Page {page + 1}
                  </span>

                  <button
                    disabled={
                      (page + 1) * 20 >=
                      totalHotels
                    }
                    onClick={() =>
                      setPage(
                        (prev) =>
                          prev + 1
                      )
                    }
                    className="
                      px-5
                      py-2
                      rounded-xl
                      border
                      border-warm-stone/30
                      bg-white
                      text-espresso
                      disabled:opacity-40
                      disabled:cursor-not-allowed
                      hover:border-bronze
                      transition-colors
                    "
                  >
                    Next
                  </button>

                </div>

              )}

            </>

          )}

        </div>

      </section>

    </MainLayout>
  );
}