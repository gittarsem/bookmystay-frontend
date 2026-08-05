import { Link } from "wouter";
import { MapPin, Star } from "lucide-react";
import type { Hotel } from "@/types";
import { motion } from "framer-motion";

interface HotelCardProps {
  hotel: Hotel;
  index?: number;
}

export default function HotelCard({ hotel, index = 0 }: HotelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={`/hotel/${hotel.id}`}>
        <div className="group bg-white rounded-xl overflow-hidden shadow-warm hover:shadow-warm-lg transition-all duration-300">
          {/* Image */}
          <div className="relative h-56 overflow-hidden">
            <img
              src={hotel.images[0]}
              alt={hotel.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-bronze text-bronze" />
              <span className="text-xs font-semibold text-espresso">{hotel.rating}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-serif text-lg font-semibold text-espresso group-hover:text-bronze transition-colors line-clamp-1">
              {hotel.name}
            </h3>

            <div className="flex items-center gap-1 mt-2 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-sm">
                {hotel.location.city}, {hotel.location.state}
              </span>
            </div>

            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {hotel.description}
            </p>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-warm-stone/30">
              <div>
                <span className="text-xs text-muted-foreground">from</span>
                <span className="text-lg font-semibold text-espresso ml-1">
                  ₹{hotel.priceRange.min.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">/night</span>
              </div>
              <span className="text-xs text-sage font-medium">
                {hotel.reviewCount} reviews
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
