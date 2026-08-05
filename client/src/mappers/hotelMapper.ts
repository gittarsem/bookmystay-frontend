import { MOCK_HOTELS } from "@/lib/mockData";

export function mapHotel(document: any, index: number) {
  const template = MOCK_HOTELS[index % MOCK_HOTELS.length];

  return {
    ...template,

    id: document.id,
    name: document.name,

    location: {
      ...template.location,
      city: document.city,
    },

    priceRange: {
      min: document.price ?? template.priceRange.min,
      max: document.price ?? template.priceRange.max,
    },

    rating: document.ratings ?? template.rating,

    // ✅ Use Cloudinary thumbnail if available
    images:
      document.thumbnail && document.thumbnail.length > 0
        ? [document.thumbnail]
        : template.images,

    isActive: document.active,
  };
}

export function mapHotels(documents: any[] = []) {
  return documents.map(mapHotel);
}