import type { Hotel } from "@/types";

interface HotelSearchDocument {
  id: string;
  name: string;
  city: string;
  price: number;
  ratings: number;
  reviewCount: number;
  active: boolean;
  thumbnail: string | null;
}

export function mapHotel(document: HotelSearchDocument): Hotel {
  return {
    id: String(document.id),

    name: document.name,

    description: "",

    location: {
      city: document.city,
      state: "",
      country: "India",
      address: "",
      latitude: 0,
      longitude: 0,
    },

    images: document.thumbnail
      ? [document.thumbnail]
      : [],

    amenities: [],

    rating: document.ratings ?? 0,

    reviewCount: document.reviewCount ?? 0,

    priceRange: {
      min: document.price ?? 0,
      max: document.price ?? 0,
    },

    isActive: document.active ?? false,

    createdAt: "",
  };
}

export function mapHotels(
  documents: HotelSearchDocument[] = []
): Hotel[] {
  return documents.map(mapHotel);
}