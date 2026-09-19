import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

import {
  Star,
  Shield,
  Heart,
  Globe,
  Headphones,
  Sparkles,
  ArrowRight,
  Quote,
} from "lucide-react";

import MainLayout from "@/layouts/MainLayout";
import SearchWidget from "@/components/SearchWidget";
import HotelCard from "@/components/HotelCard";

import { POPULAR_DESTINATIONS } from "@/lib/mockData";

import { hotelsApi } from "@/api";
import { reviewsApi } from "@/api/reviews";

import { mapHotels } from "@/mappers/hotelMapper";

import {
  useEffect,
  useState,
} from "react";

import type { Hotel } from "@/types";
import type { ReviewResponse } from "@/api/reviews";


/* =========================================================
   ANIMATION
   ========================================================= */

const fadeInUp = {

  initial: {
    opacity: 0,
    y: 30,
  },

  whileInView: {
    opacity: 1,
    y: 0,
  },

  viewport: {
    once: true,
  },

  transition: {
    duration: 0.6,
  },

};


/* =========================================================
   HERO BACKGROUND IMAGES
   ========================================================= */

const HERO_IMAGES = [

  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=2000&q=85",

  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=2000&q=85",

  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=2000&q=85",

  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=2000&q=85",

];


/* =========================================================
   TYPES
   ========================================================= */

interface DestinationHotelCount {

  [city: string]: number;

}


/* =========================================================
   COMPONENT
   ========================================================= */

export default function Home() {


  /* =======================================================
     HERO BACKGROUND
     ======================================================= */

  const [heroImageIndex, setHeroImageIndex] =
    useState(0);


  /* =======================================================
     HOTELS
     ======================================================= */

  const [hotels, setHotels] =
    useState<Hotel[]>([]);

  const [loadingHotels, setLoadingHotels] =
    useState(true);


  /* =======================================================
     DESTINATION HOTEL COUNTS
     ======================================================= */

  const [hotelCounts, setHotelCounts] =
    useState<DestinationHotelCount>({});

  const [
    loadingDestinationCounts,
    setLoadingDestinationCounts,
  ] = useState(true);


  /* =======================================================
     REVIEWS
     ======================================================= */

  const [reviews, setReviews] =
    useState<ReviewResponse[]>([]);

  const [loadingReviews, setLoadingReviews] =
    useState(true);

  const [reviewStartIndex, setReviewStartIndex] =
    useState(0);

  const [reviewsPaused, setReviewsPaused] =
    useState(false);


  /* =======================================================
     HERO BACKGROUND ANIMATION
     ======================================================= */

  useEffect(() => {

    const interval =
      window.setInterval(() => {

        setHeroImageIndex(
          (current) =>
            (current + 1) %
            HERO_IMAGES.length
        );

      }, 6000);


    return () => {

      window.clearInterval(
        interval
      );

    };

  }, []);


  /* =======================================================
     FETCH FEATURED HOTELS
     ======================================================= */

  useEffect(() => {

    const fetchHotels = async () => {

      try {

        const response =
          await hotelsApi.search({
            page: 0,
            size: 6,
          });


        const mappedHotels =
          mapHotels(
            response.data.hotels
          );


        setHotels(
          mappedHotels
        );

      } catch (error) {

        console.error(
          "Failed to fetch hotels",
          error
        );

      } finally {

        setLoadingHotels(
          false
        );

      }

    };


    fetchHotels();

  }, []);


  /* =======================================================
     FETCH HOTEL COUNTS FOR DESTINATIONS
     ======================================================= */

  useEffect(() => {

    const fetchDestinationCounts =
      async () => {

        try {

          setLoadingDestinationCounts(
            true
          );


          const results =
            await Promise.all(

              POPULAR_DESTINATIONS.map(
                async (
                  destination
                ) => {

                  try {

                    const response =
                      await hotelsApi.search({
                        city:
                          destination.name,
                        page: 0,
                        size: 1,
                      });


                    return {

                      city:
                        destination.name,

                      count:
                        response.data.total ??
                        0,

                    };

                  } catch (error) {

                    console.error(
                      `Failed to fetch hotel count for ${destination.name}`,
                      error
                    );


                    return {

                      city:
                        destination.name,

                      count:
                        0,

                    };

                  }

                }
              )

            );


          const counts:
            DestinationHotelCount = {};


          results.forEach(
            (result) => {

              counts[
                result.city
              ] = result.count;

            }
          );


          setHotelCounts(
            counts
          );

        } catch (error) {

          console.error(
            "Failed to fetch destination hotel counts",
            error
          );

        } finally {

          setLoadingDestinationCounts(
            false
          );

        }

      };


    fetchDestinationCounts();

  }, []);


  /* =======================================================
     FETCH REAL REVIEWS
     ======================================================= */

  useEffect(() => {

    const fetchReviews =
      async () => {

        try {

          setLoadingReviews(
            true
          );


          if (
            hotels.length ===
            0
          ) {

            setReviews([]);

            return;

          }


          const responses =
            await Promise.all(

              hotels
                .slice(0, 6)
                .map(
                  async (
                    hotel
                  ) => {

                    try {

                      const response =
                        await reviewsApi.getHotelReviews(
                          Number(
                            hotel.id
                          ),
                          0,
                          5
                        );


                      return (
                        response.data
                          ?.content ??
                        []
                      );

                    } catch (
                      error
                    ) {

                      console.error(
                        `Failed to fetch reviews for hotel ${hotel.id}`,
                        error
                      );


                      return [];

                    }

                  }
                )

            );


          const allReviews =
            responses.flat();


          const uniqueReviews =
            Array.from(
              new Map(
                allReviews.map(
                  (review) => [
                    review.reviewId,
                    review,
                  ]
                )
              ).values()
            );

          setReviews(
            uniqueReviews.slice(
              0,
              18
            )
          );

          setReviewStartIndex(0);

        } catch (error) {

          console.error(
            "Failed to fetch reviews",
            error
          );


          setReviews([]);

        } finally {

          setLoadingReviews(
            false
          );

        }

      };


    fetchReviews();

  }, [hotels]);


  useEffect(() => {

    if (
      reviews.length <= 3 ||
      reviewsPaused
    ) {
      return;
    }

    const interval =
      window.setInterval(() => {

        setReviewStartIndex(
          (current) =>
            (current + 1) %
            reviews.length
        );

      }, 5500);

    return () => {

      window.clearInterval(
        interval
      );

    };

  }, [
    reviews.length,
    reviewsPaused,
  ]);


  return (

    <MainLayout>

      {/* ===================================================
          HERO
          =================================================== */}

      <section
        className="
          relative
          min-h-[860px]
          overflow-hidden
          lg:min-h-[900px]
        "
      >

        {/* =================================================
            ANIMATED BACKGROUND
        ================================================= */}

        <div
          className="
            absolute
            inset-0
            overflow-hidden
          "
        >

          <AnimatePresence
            mode="sync"
          >

            <motion.img
              key={
                HERO_IMAGES[
                  heroImageIndex
                ]
              }
              src={
                HERO_IMAGES[
                  heroImageIndex
                ]
              }
              alt="Luxury resort"
              initial={{
                opacity: 0,
                scale: 1.08,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 1.03,
              }}
              transition={{
                opacity: {
                  duration: 1.5,
                  ease: "easeInOut",
                },
                scale: {
                  duration: 7,
                  ease: "easeOut",
                },
              }}
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
              "
            />

          </AnimatePresence>

        </div>


        {/* =================================================
            DARK OVERLAY
        ================================================= */}

        <div
          className="
            absolute
            inset-0
            bg-black/40
          "
        />


        {/* =================================================
            GRADIENT OVERLAY
        ================================================= */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-black/50
            via-black/25
            to-black/70
          "
        />


        {/* =================================================
            HERO CONTENT
        ================================================= */}

        <div
          className="
            relative
            z-10
            mx-auto
            flex
            min-h-[860px]
            max-w-7xl
            flex-col
            items-center
            px-4
            pt-20
            lg:min-h-[900px]
            lg:pt-24
          "
        >

          {/* =================================================
              HERO TEXT
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
            }}
            className="
              w-full
              text-center
            "
          >

            <p
              className="
                mb-3
                text-sm
                font-medium
                uppercase
                tracking-[0.3em]
                text-white/80
              "
            >
              Curated Luxury Stays
            </p>


            <h1
              className="
                font-serif
                text-4xl
                font-bold
                leading-tight
                text-white
                md:text-6xl
                lg:text-7xl
              "
            >

              Your Next Extraordinary

              <br />

              <span
                className="
                  italic
                  text-bronze
                "
              >
                Stay Awaits
              </span>

            </h1>


            <p
              className="
                mx-auto
                mt-4
                max-w-lg
                text-lg
                leading-relaxed
                text-white/75
              "
            >
              Discover handpicked luxury accommodations
              around the world, where every detail has
              been curated for your comfort.
            </p>

          </motion.div>


          {/* =================================================
              SEARCH AREA

              Kept in normal layout flow instead of
              absolute positioning so it cannot overlap
              the hero heading.
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
              delay: 0.25,
            }}
            className="
              mt-14
              w-full
              max-w-6xl
              lg:mt-16
            "
          >

            <SearchWidget />

          </motion.div>

        </div>

      </section>


      {/* ===================================================
          FEATURED HOTELS
          =================================================== */}

      <section
        className="
          px-4
          py-20
        "
        id="featured"
      >

        <div className="container">

          <motion.div
            {...fadeInUp}
            className="
              mb-12
              text-center
            "
          >

            <p
              className="
                mb-2
                text-xs
                font-medium
                uppercase
                tracking-[0.25em]
                text-bronze
              "
            >
              Handpicked For You
            </p>


            <h2
              className="
                font-serif
                text-3xl
                font-bold
                text-espresso
                md:text-4xl
              "
            >
              Featured Stays
            </h2>


            <div
              className="
                mx-auto
                mt-4
                h-0.5
                w-16
                bg-bronze
              "
            />

          </motion.div>


          <div
            className="
              grid
              grid-cols-1
              gap-6
              md:grid-cols-2
              lg:grid-cols-3
            "
          >

            {loadingHotels ? (

              <div
                className="
                  col-span-full
                  flex
                  justify-center
                  py-12
                "
              >
                Loading hotels...
              </div>

            ) : hotels.length === 0 ? (

              <div
                className="
                  col-span-full
                  py-12
                  text-center
                  text-muted-foreground
                "
              >
                No hotels available.
              </div>

            ) : (

              hotels.map(
                (
                  hotel,
                  index
                ) => (

                  <HotelCard
                    key={
                      hotel.id
                    }
                    hotel={
                      hotel
                    }
                    index={
                      index
                    }
                  />

                )
              )

            )}

          </div>


          <motion.div
            {...fadeInUp}
            className="
              mt-10
              text-center
            "
          >

            <Link
              href="/search"
            >

              <button
                className="
                  group
                  inline-flex
                  items-center
                  gap-2
                  font-medium
                  text-bronze
                  transition-colors
                  hover:text-bronze-dark
                "
              >

                View All Properties

                <ArrowRight
                  className="
                    h-4
                    w-4
                    transition-transform
                    group-hover:translate-x-1
                  "
                />

              </button>

            </Link>

          </motion.div>

        </div>

      </section>


      {/* ===================================================
          POPULAR DESTINATIONS
          =================================================== */}

      <section
        className="
          bg-white
          py-20
        "
      >

        <div className="container">

          <motion.div
            {...fadeInUp}
            className="
              mb-12
              text-center
            "
          >

            <p
              className="
                mb-2
                text-xs
                font-medium
                uppercase
                tracking-[0.25em]
                text-bronze
              "
            >
              Explore India
            </p>


            <h2
              className="
                font-serif
                text-3xl
                font-bold
                text-espresso
                md:text-4xl
              "
            >
              Popular Destinations
            </h2>


            <div
              className="
                mx-auto
                mt-4
                h-0.5
                w-16
                bg-bronze
              "
            />

          </motion.div>


          <div
            className="
              grid
              grid-cols-2
              gap-4
              md:grid-cols-3
              lg:grid-cols-6
            "
          >

            {POPULAR_DESTINATIONS.map(
              (
                dest,
                index
              ) => {

                const hotelCount =
                  hotelCounts[
                    dest.name
                  ] ?? 0;


                return (

                  <motion.div
                    key={
                      dest.name
                    }
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.4,
                      delay:
                        index *
                        0.08,
                    }}
                  >

                    <Link
                      href={`/search?city=${encodeURIComponent(
                        dest.name
                      )}`}
                    >

                      <div
                        className="
                          group
                          relative
                          aspect-[3/4]
                          cursor-pointer
                          overflow-hidden
                          rounded-xl
                        "
                      >

                        <img
                          src={
                            dest.image
                          }
                          alt={
                            dest.name
                          }
                          className="
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-500
                            group-hover:scale-110
                          "
                        />


                        <div
                          className="
                            absolute
                            inset-0
                            bg-gradient-to-t
                            from-black/70
                            via-black/20
                            to-transparent
                          "
                        />


                        <div
                          className="
                            absolute
                            bottom-0
                            left-0
                            right-0
                            p-4
                          "
                        >

                          <h3
                            className="
                              font-serif
                              text-lg
                              font-semibold
                              text-white
                            "
                          >
                            {
                              dest.name
                            }
                          </h3>


                          <p
                            className="
                              mt-0.5
                              text-xs
                              text-white/70
                            "
                          >
                            {
                              dest.tagline
                            }
                          </p>


                          <p
                            className="
                              mt-1
                              text-xs
                              font-medium
                              text-bronze
                            "
                          >

                            {loadingDestinationCounts
                              ? "Loading..."
                              : `${hotelCount} ${
                                  hotelCount ===
                                  1
                                    ? "stay"
                                    : "stays"
                                }`}

                          </p>

                        </div>

                      </div>

                    </Link>

                  </motion.div>

                );

              }
            )}

          </div>

        </div>

      </section>


      {/* ===================================================
          WHY CHOOSE US
          =================================================== */}

      <section
        className="
          py-20
        "
        id="why-us"
      >

        <div className="container">

          <motion.div
            {...fadeInUp}
            className="
              mb-14
              text-center
            "
          >

            <p
              className="
                mb-2
                text-xs
                font-medium
                uppercase
                tracking-[0.25em]
                text-bronze
              "
            >
              The BookMyStay Difference
            </p>


            <h2
              className="
                font-serif
                text-3xl
                font-bold
                text-espresso
                md:text-4xl
              "
            >
              Why Travelers Choose Us
            </h2>


            <div
              className="
                mx-auto
                mt-4
                h-0.5
                w-16
                bg-bronze
              "
            />

          </motion.div>


          <div
            className="
              grid
              grid-cols-1
              gap-8
              md:grid-cols-2
              lg:grid-cols-4
            "
          >

            {[
              {
                icon:
                  Shield,
                title:
                  "Verified Luxury",
                desc:
                  "Every property is personally vetted to ensure it meets our exacting standards of quality and service.",
              },

              {
                icon:
                  Heart,
                title:
                  "Curated Experiences",
                desc:
                  "We don't just book rooms — we craft journeys with carefully selected stays that tell a story.",
              },

              {
                icon:
                  Globe,
                title:
                  "Global Coverage",
                desc:
                  "From Himalayan retreats to coastal paradises, discover exceptional stays across India and beyond.",
              },

              {
                icon:
                  Headphones,
                title:
                  "24/7 Concierge",
                desc:
                  "Our dedicated concierge team is available around the clock to ensure your stay is flawless.",
              },

            ].map(
              (
                item,
                index
              ) => {

                const Icon =
                  item.icon;


                return (

                  <motion.div
                    key={
                      item.title
                    }
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.5,
                      delay:
                        index *
                        0.1,
                    }}
                    className="
                      text-center
                    "
                  >

                    <div
                      className="
                        mx-auto
                        mb-4
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-bronze/10
                      "
                    >

                      <Icon
                        className="
                          h-6
                          w-6
                          text-bronze
                        "
                      />

                    </div>


                    <h3
                      className="
                        mb-2
                        font-serif
                        text-lg
                        font-semibold
                        text-espresso
                      "
                    >
                      {
                        item.title
                      }
                    </h3>


                    <p
                      className="
                        text-sm
                        leading-relaxed
                        text-muted-foreground
                      "
                    >
                      {
                        item.desc
                      }
                    </p>

                  </motion.div>

                );

              }
            )}

          </div>

        </div>

      </section>


      {/* ===================================================
          REAL TESTIMONIALS
          =================================================== */}

      <section
        className="
          bg-white
          py-20
        "
      >

        <div className="container">

          <motion.div
            {...fadeInUp}
            className="
              mb-14
              text-center
            "
          >

            <p
              className="
                mb-2
                text-xs
                font-medium
                uppercase
                tracking-[0.25em]
                text-bronze
              "
            >
              Guest Stories
            </p>


            <h2
              className="
                font-serif
                text-3xl
                font-bold
                text-espresso
                md:text-4xl
              "
            >
              What Our Guests Say
            </h2>


            <div
              className="
                mx-auto
                mt-4
                h-0.5
                w-16
                bg-bronze
              "
            />

          </motion.div>


          {loadingReviews ? (

            <div
              className="
                py-12
                text-center
                text-muted-foreground
              "
            >
              Loading guest reviews...
            </div>

          ) : reviews.length ===
            0 ? (

            <div
              className="
                py-12
                text-center
                text-muted-foreground
              "
            >
              No guest reviews yet.
            </div>

          ) : (

            <div
              className="relative"
              onMouseEnter={() =>
                setReviewsPaused(true)
              }
              onMouseLeave={() =>
                setReviewsPaused(false)
              }
            >

              <div
                className="
                  grid
                  grid-cols-1
                  gap-8
                  md:grid-cols-3
                "
              >

                {Array.from({
                  length:
                    Math.min(
                      3,
                      reviews.length
                    ),
                }).map(
                  (
                    _,
                    cardIndex
                  ) => {

                    const review =
                      reviews[
                        (
                          reviewStartIndex +
                          cardIndex
                        ) %
                        reviews.length
                      ];

                    const hotelName =
                      "hotelName" in review &&
                      typeof review.hotelName ===
                        "string" &&
                      review.hotelName.trim()
                        ? review.hotelName
                        : "hotelId" in review
                          ? hotels.find(
                              (hotel) =>
                                String(
                                  hotel.id
                                ) ===
                                String(
                                  review.hotelId
                                )
                            )?.name
                          : undefined;

                    const words =
                      review.comment
                        ?.trim()
                        .split(
                          /\s+/
                        ) ?? [];

                    return (

                      <AnimatePresence
                        key={
                          `review-card-${cardIndex}`
                        }
                        mode="wait"
                      >

                        <motion.div
                          key={
                            `${review.reviewId}-${cardIndex}`
                          }
                          initial={{
                            opacity: 0,
                            y: 18,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            y: -12,
                          }}
                          transition={{
                            duration: 0.45,
                            ease:
                              "easeOut",
                          }}
                          className="
                            relative
                            flex
                            min-h-[340px]
                            flex-col
                            rounded-2xl
                            bg-cream
                            p-8
                          "
                        >

                          <Quote
                            className="
                              absolute
                              right-6
                              top-6
                              h-8
                              w-8
                              text-bronze/20
                            "
                          />


                          <div
                            className="
                              mb-4
                              flex
                              gap-0.5
                            "
                          >

                            {Array.from({
                              length:
                                review.rating,
                            }).map(
                              (
                                _,
                                i
                              ) => (

                                <Star
                                  key={
                                    i
                                  }
                                  className="
                                    h-4
                                    w-4
                                    fill-bronze
                                    text-bronze
                                  "
                                />

                              )
                            )}

                          </div>


                          {hotelName && (

                            <p
                              className="
                                mb-3
                                pr-10
                                text-[11px]
                                font-semibold
                                uppercase
                                tracking-[0.14em]
                                text-bronze
                              "
                            >
                              {hotelName}
                            </p>

                          )}


                          <motion.p
                            className="
                              mb-7
                              leading-relaxed
                              italic
                              text-espresso/80
                            "
                          >

                            "{words.map(
                              (
                                word,
                                index
                              ) => (

                                <motion.span
                                  key={
                                    `${review.reviewId}-word-${index}`
                                  }
                                  initial={{
                                    opacity: 0,
                                    y: 4,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                  }}
                                  transition={{
                                    duration:
                                      0.16,
                                    delay:
                                      Math.min(
                                        index *
                                          0.012,
                                        0.28
                                      ),
                                  }}
                                  className="inline-block"
                                >
                                  {word}
                                  {index <
                                  words.length -
                                    1
                                    ? "\u00a0"
                                    : ""}
                                </motion.span>

                              )
                            )}

                          </motion.p>


                          <div
                            className="
                              mt-auto
                              flex
                              items-center
                              gap-3
                            "
                          >

                            <div
                              className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-bronze/10
                              "
                            >

                              <span
                                className="
                                  text-sm
                                  font-semibold
                                  text-bronze
                                "
                              >

                                {
                                  review.guestName
                                    ?.charAt(
                                      0
                                    )
                                    ?.toUpperCase() ||
                                  "G"
                                }

                              </span>

                            </div>


                            <div>

                              <p
                                className="
                                  text-sm
                                  font-semibold
                                  text-espresso
                                "
                              >
                                {
                                  review.guestName
                                }
                              </p>


                              <p
                                className="
                                  text-xs
                                  text-muted-foreground
                                "
                              >
                                Verified Guest
                              </p>

                            </div>

                          </div>

                        </motion.div>

                      </AnimatePresence>

                    );

                  }
                )}

              </div>


              {reviews.length > 3 && (

                <div
                  className="
                    mt-8
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >

                  {Array.from({
                    length:
                      Math.min(
                        reviews.length,
                        6
                      ),
                  }).map(
                    (
                      _,
                      index
                    ) => {

                      const active =
                        reviewStartIndex %
                          Math.min(
                            reviews.length,
                            6
                          ) ===
                        index;

                      return (

                        <button
                          key={
                            index
                          }
                          type="button"
                          onClick={() =>
                            setReviewStartIndex(
                              index
                            )
                          }
                          aria-label={
                            `Show guest reviews ${index + 1}`
                          }
                          className={`
                            h-1.5
                            rounded-full
                            transition-all
                            duration-300
                            ${
                              active
                                ? "w-7 bg-bronze"
                                : "w-1.5 bg-bronze/25 hover:bg-bronze/50"
                            }
                          `}
                        />

                      );

                    }
                  )}

                </div>

              )}

            </div>

          )}

        </div>

      </section>


      {/* ===================================================
          CTA
          =================================================== */}

      <section
        className="
          py-20
        "
      >

        <div className="container">

          <motion.div
            {...fadeInUp}
            className="
              relative
              overflow-hidden
              rounded-3xl
              bg-espresso
              px-8
              py-16
              text-center
            "
          >

            <div
              className="
                absolute
                inset-0
                opacity-20
              "
            >

              <img
                src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80"
                alt=""
                className="
                  h-full
                  w-full
                  object-cover
                "
              />

            </div>


            <div
              className="
                relative
                z-10
              "
            >

              <Sparkles
                className="
                  mx-auto
                  mb-4
                  h-8
                  w-8
                  text-bronze
                "
              />


              <h2
                className="
                  mb-4
                  font-serif
                  text-3xl
                  font-bold
                  text-white
                  md:text-4xl
                "
              >
                Begin Your Journey
              </h2>


              <p
                className="
                  mx-auto
                  mb-8
                  max-w-md
                  text-white/60
                "
              >
                Join thousands of discerning travelers
                who trust BookMyStay for their most
                memorable stays.
              </p>


              <Link
                href="/register"
              >

                <button
                  className="
                    rounded-full
                    bg-bronze
                    px-8
                    py-3
                    font-semibold
                    text-white
                    shadow-lg
                    transition-all
                    duration-200
                    hover:bg-bronze-dark
                    active:scale-[0.97]
                  "
                >
                  Create Free Account
                </button>

              </Link>

            </div>

          </motion.div>

        </div>

      </section>

    </MainLayout>

  );
}