import { Link } from "wouter";
import { MapPin, Star } from "lucide-react";
import type { Hotel } from "@/types";
import { motion } from "framer-motion";

interface HotelCardProps {
  hotel: Hotel;
  index?: number;
}

export default function HotelCard({
  hotel,
  index = 0,
}: HotelCardProps) {
  console.log("HOTEL CARD DATA:", {
    id: hotel.id,
    name: hotel.name,
    price: hotel.priceRange?.min,
    rating: hotel.rating,
    reviewCount: hotel.reviewCount,
  });
  
  const image =
    hotel.images && hotel.images.length > 0
      ? hotel.images[0]
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
      }}
    >
      <Link href={`/hotel/${hotel.id}`}>
        <div className="group bg-white rounded-xl overflow-hidden shadow-warm hover:shadow-warm-lg transition-all duration-300">

          {/* =====================================================
              IMAGE
              ===================================================== */}

          <div className="relative h-56 overflow-hidden bg-cream">

            {image ? (
              <img
                src={image}
                alt={hotel.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}

            {/* =================================================
                RATING
                ================================================= */}

            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-sm">

              <Star
                className={`w-3.5 h-3.5 ${
                  hotel.rating > 0
                    ? "fill-bronze text-bronze"
                    : "text-muted-foreground"
                }`}
              />

              <span className="text-xs font-semibold text-espresso">
                {hotel.rating > 0
                  ? hotel.rating.toFixed(1)
                  : "New"}
              </span>

            </div>

          </div>

          {/* =====================================================
              CONTENT
              ===================================================== */}

          <div className="p-5">

            <h3 className="font-serif text-lg font-semibold text-espresso group-hover:text-bronze transition-colors line-clamp-1">
              {hotel.name}
            </h3>

            {/* =================================================
                LOCATION
                ================================================= */}

            <div className="flex items-center gap-1 mt-2 text-muted-foreground">

              <MapPin className="w-3.5 h-3.5" />

              <span className="text-sm">
                {hotel.location.city}

                {hotel.location.state
                  ? `, ${hotel.location.state}`
                  : ""}
              </span>

            </div>

            {/* =================================================
                DESCRIPTION
                ================================================= */}

            {hotel.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {hotel.description}
              </p>
            )}

            {/* =================================================
                PRICE + REVIEWS
                ================================================= */}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-warm-stone/30">

              {/* PRICE */}

              <div>

                <span className="text-xs text-muted-foreground">
                  from
                </span>

                <span className="text-lg font-semibold text-espresso ml-1">
                  ₹
                  {hotel.priceRange.min.toLocaleString(
                    "en-IN"
                  )}
                </span>

                <span className="text-xs text-muted-foreground">
                  /night
                </span>

              </div>

              {/* REVIEWS */}

              <span className="text-xs text-sage font-medium">

                {hotel.reviewCount > 0
                  ? `${hotel.reviewCount} ${
                      hotel.reviewCount === 1
                        ? "review"
                        : "reviews"
                    }`
                  : "No reviews"}

              </span>

            </div>

          </div>

        </div>
      </Link>
    </motion.div>
  );
}