import { useState, useEffect } from "react";

import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowLeft,
  X,
  MessageSquare,
} from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { HotelCardSkeleton } from "@/components/Skeleton";
import { toast } from "sonner";
import { bookingsApi, hotelsApi } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { mapHotelInfo } from "@/mappers/hotelInfoMapper";
import { mapRooms } from "@/mappers/roomMapper";
import {
  reviewsApi,
  type ReviewResponse,
} from "@/api/reviews";

export default function HotelDetails() {
  const [, params] = useRoute<{ hotelId: string }>("/hotel/:hotelId");
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [currentImage, setCurrentImage] = useState(0);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [galleryOpen, setGalleryOpen] = useState(false);

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [reviewPage, setReviewPage] = useState(0);
  const [totalReviewPages, setTotalReviewPages] = useState(0);


  useEffect(() => {
    const fetchHotel = async () => {
      if (!params?.hotelId) return;

      try {
        setLoading(true);

        const { data } = await hotelsApi.getHotelInfo(
          Number(params.hotelId)
        );

        setHotel(mapHotelInfo(data));
        setRooms(mapRooms(data.rooms));
      } catch (error) {
        console.error(error);
        toast.error("Failed to load hotel");
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [params?.hotelId]);

  useEffect(() => {
    if (!params?.hotelId) {
      return;
    }

    loadReviews();
  }, [params?.hotelId, reviewPage]);


  if (loading) {
    return (
      <MainLayout>
        <div className="container py-20">
          <HotelCardSkeleton />
        </div>
      </MainLayout>
    );
  }

  if (!hotel) {
    return (
      <MainLayout>
        <div className="container py-20 text-center">
          <h1 className="font-serif text-3xl text-espresso mb-4">
            Hotel Not Found
          </h1>

          <button
            onClick={() => setLocation("/")}
            className="text-bronze hover:text-bronze-dark font-medium"
          >
            Go back home
          </button>
        </div>
      </MainLayout>
    );
  }

  const handleBooking = async (room: any) => {
    if (!isAuthenticated) {
      toast.error("Please login to book");
      setLocation("/login");
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    try {
      const { data } = await bookingsApi.init({
        hotelId: Number(hotel.id),
        roomType: room.type,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adultCount: adults,
        childCount: children,
      });

      setLocation(`/booking/${data.id}`);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to initiate booking"
      );
    }
  };

  async function loadReviews() {
    if (!params?.hotelId) {
      return;
    }

    try {
      setReviewsLoading(true);

      const { data } = await reviewsApi.getHotelReviews(
        Number(params.hotelId),
        reviewPage,
        10
      );

      setReviews(data.content);
      setTotalReviewPages(data.totalPages);

    } catch (err: any) {

      toast.error(
        err?.response?.data?.message ||
        "Unable to load reviews."
      );

    } finally {
      setReviewsLoading(false);
    }
  }

  return (
    <MainLayout>
      {/* Back Button */}
      <div className="container pt-6">
        <button
          onClick={() => setLocation("/search")}
          className="flex items-center gap-2 text-muted-foreground hover:text-espresso transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to results</span>
        </button>
      </div>

      {/* Image Gallery */}
      <section className="container mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden">
          <div
            className="md:col-span-2 md:row-span-2 relative cursor-pointer group"
            onClick={() => setGalleryOpen(true)}
          >
            <img
              src={hotel.images[currentImage]}
              alt={hotel.name}
              className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>

          {hotel.images.slice(1, 3).map((img: string, i: number) => (
            <div
              key={i}
              className="relative cursor-pointer group"
              onClick={() => {
                setCurrentImage(i + 1);
                setGalleryOpen(true);
              }}
            >
              <img
                src={img}
                alt={`${hotel.name}-${i}`}
                className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Hotel Info */}
      <section className="container mt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">

            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl md:text-4xl font-bold text-espresso">
                    {hotel.name}
                  </h1>

                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4 text-bronze" />

                    <span className="text-sm text-muted-foreground">
                      {hotel.location.address}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-cream px-3 py-1.5 rounded-full shrink-0">
                  <Star className="w-4 h-4 fill-bronze text-bronze" />

                  <span className="font-semibold text-espresso">
                    {hotel.rating.toFixed(1)}
                  </span>

                  <span className="text-xs text-muted-foreground ml-1">
                    ({hotel.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-espresso/80 leading-relaxed">
                {hotel.description}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="font-serif text-xl font-semibold text-espresso mb-4">
                Amenities
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {hotel.amenities.map((amenity: string) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 bg-cream rounded-xl px-4 py-3"
                  >
                    <Check className="w-4 h-4 text-bronze shrink-0" />

                    <span className="text-sm text-espresso">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Available Rooms */}
            <div>
              <h2 className="font-serif text-xl font-semibold text-espresso mb-4">
                Available Rooms
              </h2>

              {rooms.length > 0 ? (
                <div className="space-y-4">
                  {rooms.map((room: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl overflow-hidden shadow-warm border border-warm-stone/20"
                    >
                      <div className="flex flex-col md:flex-row">

                        <img
                          src={hotel.images[0]}
                          alt={room.type}
                          className="w-full md:w-64 h-48 object-cover"
                        />

                        <div className="flex-1 p-5">

                          <div className="flex items-start justify-between">

                            <div>

                              <h3 className="font-serif text-lg font-semibold text-espresso">
                                {room.type}
                              </h3>

                              <p className="text-sm text-muted-foreground mt-2">
                                Capacity : {room.capacity} Guests
                              </p>

                            </div>

                            <div className="text-right shrink-0 ml-4">

                              <p className="text-2xl font-bold text-espresso">
                                ₹{room.price.toLocaleString()}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                per night
                              </p>

                            </div>

                          </div>

                          <button
                            onClick={() => handleBooking(room)}
                            className="mt-5 bg-bronze hover:bg-bronze-dark text-white font-medium px-6 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.97] text-sm"
                          >
                            Reserve Room
                          </button>

                        </div>

                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 text-center shadow-warm">
                  <p className="text-muted-foreground">
                    No rooms available.
                  </p>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div>

              <h2 className="font-serif text-xl font-semibold text-espresso mb-4">
                Guest Reviews
              </h2>

              {reviewsLoading ? (

                <div className="bg-white rounded-xl p-8 text-center shadow-warm">
                  <p className="text-muted-foreground">
                    Loading reviews...
                  </p>
                </div>

              ) : reviews.length === 0 ? (

                <div className="bg-white rounded-xl p-8 text-center shadow-warm">

                  <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />

                  <p className="text-muted-foreground">
                    No reviews yet.
                  </p>

                  <p className="text-sm text-muted-foreground mt-1">
                    Be the first guest to share your experience.
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {reviews.map((review, index) => (

                    <motion.div
                      key={review.reviewId}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        delay: index * 0.05,
                      }}
                      className="bg-white rounded-xl p-6 shadow-warm border border-warm-stone/20"
                    >

                      <div className="flex items-start gap-4">

                        {/* Guest Avatar */}

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bronze/10">

                          <span className="text-sm font-semibold text-bronze">
                            {review.guestName
                              ?.charAt(0)
                              ?.toUpperCase() || "G"}
                          </span>

                        </div>

                        <div className="flex-1">

                          {/* Name + Rating */}

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                            <p className="font-semibold text-espresso">
                              {review.guestName || "Guest"}
                            </p>

                            <div className="flex items-center gap-1">

                              {Array.from({ length: 5 }).map(
                                (_, starIndex) => (

                                  <Star
                                    key={starIndex}
                                    className={`w-4 h-4 ${starIndex <
                                      review.rating
                                      ? "fill-bronze text-bronze"
                                      : "text-warm-stone/40"
                                      }`}
                                  />

                                )
                              )}

                            </div>

                          </div>

                          {/* Date */}

                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(
                              review.createdAt
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>

                          {/* Comment */}

                          <p className="mt-3 leading-relaxed text-muted-foreground">
                            {review.comment}
                          </p>

                        </div>

                      </div>

                    </motion.div>

                  ))}

                  {totalReviewPages > 1 && (

                    <div className="mt-6 flex items-center justify-center gap-4">

                      <button
                        disabled={reviewPage === 0}
                        onClick={() =>
                          setReviewPage((previous) => previous - 1)
                        }
                        className="flex items-center gap-2 rounded-xl border border-warm-stone/30 px-4 py-2 text-sm font-medium text-espresso transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>

                      <span className="text-sm text-muted-foreground">
                        Page {reviewPage + 1} of {totalReviewPages}
                      </span>

                      <button
                        disabled={
                          reviewPage >= totalReviewPages - 1
                        }
                        onClick={() =>
                          setReviewPage((previous) => previous + 1)
                        }
                        className="flex items-center gap-2 rounded-xl border border-warm-stone/30 px-4 py-2 text-sm font-medium text-espresso transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>

                    </div>

                  )}

                </div>



              )}

            </div>

          </div>


          {/* Booking Widget */}
          <div>

            <div className="sticky top-24 bg-white rounded-2xl shadow-warm border border-warm-stone/20 p-6">

              <div className="mb-6">

                <p className="text-sm text-muted-foreground">
                  Starting from
                </p>

                <h2 className="text-3xl font-bold text-espresso">
                  {hotel.priceRange.min > 0
                    ? `₹${hotel.priceRange.min.toLocaleString()}`
                    : "Price not available"}
                </h2>

                <p className="text-sm text-muted-foreground">
                  per night
                </p>

              </div>

              <div className="space-y-4">

                <div>

                  <label className="text-sm font-medium text-espresso mb-1 block">
                    Check In
                  </label>

                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full rounded-xl border border-warm-stone/30 bg-cream px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bronze/20"
                  />

                </div>

                <div>

                  <label className="text-sm font-medium text-espresso mb-1 block">
                    Check Out
                  </label>

                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full rounded-xl border border-warm-stone/30 bg-cream px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bronze/20"
                  />

                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="text-sm font-medium text-espresso mb-1 block">
                      Adults
                    </label>

                    <input
                      type="number"
                      min={1}
                      value={adults}
                      onChange={(e) =>
                        setAdults(Number(e.target.value))
                      }
                      className="w-full rounded-xl border border-warm-stone/30 bg-cream px-4 py-3"
                    />

                  </div>

                  <div>

                    <label className="text-sm font-medium text-espresso mb-1 block">
                      Children
                    </label>

                    <input
                      type="number"
                      min={0}
                      value={children}
                      onChange={(e) =>
                        setChildren(Number(e.target.value))
                      }
                      className="w-full rounded-xl border border-warm-stone/30 bg-cream px-4 py-3"
                    />

                  </div>

                </div>

                <button
                  className="w-full bg-bronze hover:bg-bronze-dark text-white font-semibold rounded-xl py-3 transition-all"
                  disabled
                >
                  Select a room above to continue
                </button>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Gallery Modal */}

      <AnimatePresence>

        {galleryOpen && (

          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            <button
              onClick={() => setGalleryOpen(false)}
              className="absolute top-6 right-6 text-white"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={() =>
                setCurrentImage((prev) =>
                  prev === 0
                    ? hotel.images.length - 1
                    : prev - 1
                )
              }
              className="absolute left-6 text-white"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <img
              src={hotel.images[currentImage]}
              alt={hotel.name}
              className="max-h-[85vh] max-w-[90vw] rounded-xl"
            />

            <button
              onClick={() =>
                setCurrentImage((prev) =>
                  prev === hotel.images.length - 1
                    ? 0
                    : prev + 1
                )
              }
              className="absolute right-6 text-white"
            >
              <ChevronRight className="w-10 h-10" />
            </button>

          </motion.div>

        )}

      </AnimatePresence>

    </MainLayout>
  );
}