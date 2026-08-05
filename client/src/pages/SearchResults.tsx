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

  // Search Params
  const keyword = params.get("keyword");
  const city = params.get("city");

  const checkIn = params.get("checkIn") || "Select date";
  const checkOut = params.get("checkOut") || "Select date";
  const adults = params.get("adults") || "2";

  // Filters
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [localMinPrice, setLocalMinPrice] = useState(
    Number(params.get("minPrice")) || 0
  );

  const [localMaxPrice, setLocalMaxPrice] = useState(
    Number(params.get("maxPrice")) || 200000
  );

  const [localRating, setLocalRating] = useState(
    Number(params.get("ratings")) || 0
  );

  const [sortBy, setSortBy] = useState(
    params.get("sort") || "rating"
  );

  // Pagination
  const [page, setPage] = useState(0);

  // Data
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [totalHotels, setTotalHotels] = useState(0);

  const [loading, setLoading] = useState(true);

  // Whenever filters change, go back to page 0
  useEffect(() => {
    setPage(0);
  }, [
    search,
    localMinPrice,
    localMaxPrice,
    localRating,
    sortBy,
  ]);

  // Fetch Hotels
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);

        const response = await hotelsApi.search({
          keyword: keyword || undefined,
          city: city || undefined,

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
        });

        setHotels(
          mapHotels(response.data.hotels)
        );

        setTotalHotels(
          response.data.total
        );

      } catch (error) {
        console.error("Failed to load hotels", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [
    keyword,
    city,
    page,
    localMinPrice,
    localMaxPrice,
    localRating,
    sortBy,
  ]);

  const cityParam = city || "All Destinations";

  return (
    <MainLayout>

      {/* Search Summary Bar */}

      <div className="bg-white border-b border-warm-stone/30 py-4">
        <div className="container">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>

              <h1 className="font-serif text-2xl font-bold text-espresso">
                {cityParam === "All Destinations"
                  ? "All Properties"
                  : cityParam}
              </h1>

              <p className="text-sm text-muted-foreground mt-1">
                {checkIn !== "Select date" &&
                  `${checkIn} → ${checkOut} • `}

                {adults} guest
                {adults !== "1" ? "s" : ""}

                {" • "}

                {totalHotels} properties found

              </p>

            </div>

            <div className="flex items-center gap-3">

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="px-4 py-2 bg-cream rounded-xl border border-warm-stone/30 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-bronze/20"
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
                  setFiltersOpen(!filtersOpen)
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  filtersOpen
                    ? "bg-bronze text-white border-bronze"
                    : "bg-white border-warm-stone/30 text-espresso hover:border-bronze/40"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />

                <span className="text-sm font-medium">
                  Filters
                </span>

              </button>

            </div>

          </div>
                    {/* Filter Panel */}
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.25 }}
              className="mt-4 pt-4 border-t border-warm-stone/30"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Price Range */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2 block">
                    Price Range (₹)
                  </label>

                  <div className="flex items-center gap-3">

                    <input
                      type="number"
                      min={0}
                      value={localMinPrice}
                      onChange={(e) =>
                        setLocalMinPrice(Number(e.target.value))
                      }
                      placeholder="Minimum"
                      className="w-full px-3 py-2 bg-cream rounded-lg border border-warm-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-bronze/20"
                    />

                    <span className="text-muted-foreground">—</span>

                    <input
                      type="number"
                      min={0}
                      value={localMaxPrice}
                      onChange={(e) =>
                        setLocalMaxPrice(Number(e.target.value))
                      }
                      placeholder="Maximum"
                      className="w-full px-3 py-2 bg-cream rounded-lg border border-warm-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-bronze/20"
                    />

                  </div>

                </div>

                {/* Rating */}

                <div>

                  <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2 block">
                    Minimum Rating
                  </label>

                  <div className="flex flex-wrap gap-2">

                    {[0, 3, 4, 4.5].map((rating) => (

                      <button
                        key={rating}
                        onClick={() => setLocalRating(rating)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          localRating === rating
                            ? "bg-bronze text-white"
                            : "bg-cream text-espresso border border-warm-stone/30 hover:border-bronze/40"
                        }`}
                      >
                        {rating === 0 ? "All" : `${rating}+`}
                      </button>

                    ))}

                  </div>

                </div>

                {/* Reset Filters */}

                <div className="flex items-end">

                  <button
                    onClick={() => {
                      setLocalMinPrice(0);
                      setLocalMaxPrice(200000);
                      setLocalRating(0);
                      setSortBy("rating");
                    }}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-bronze transition-colors"
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
              {/* Results Grid */}
      <section className="py-10">
        <div className="container">

          {loading ? (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <HotelCardSkeleton key={index} />
              ))}
            </div>

          ) : hotels.length === 0 ? (

            <div className="text-center py-20">

              <h2 className="font-serif text-3xl font-semibold text-espresso">
                No Properties Found
              </h2>

              <p className="text-muted-foreground mt-3">
                Try changing your filters or search destination.
              </p>

            </div>

          ) : (

            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {hotels.map((hotel, index) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    index={index}
                  />
                ))}

              </div>

              {/* Pagination */}

              {totalHotels > 20 && (

                <div className="flex justify-center items-center gap-4 mt-12">

                  <button
                    disabled={page === 0}
                    onClick={() =>
                      setPage((prev) => Math.max(prev - 1, 0))
                    }
                    className="px-5 py-2 rounded-xl border border-warm-stone/30 bg-white text-espresso disabled:opacity-40 disabled:cursor-not-allowed hover:border-bronze transition-colors"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-muted-foreground">
                    Page {page + 1}
                  </span>

                  <button
                    disabled={(page + 1) * 20 >= totalHotels}
                    onClick={() =>
                      setPage((prev) => prev + 1)
                    }
                    className="px-5 py-2 rounded-xl border border-warm-stone/30 bg-white text-espresso disabled:opacity-40 disabled:cursor-not-allowed hover:border-bronze transition-colors"
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