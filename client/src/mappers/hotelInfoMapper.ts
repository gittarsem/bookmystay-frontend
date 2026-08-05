import { MOCK_HOTELS } from "@/lib/mockData";

export function mapHotelInfo(dto: any) {
  const template = MOCK_HOTELS[0];

  return {
    ...template,

    id: dto.hotels.id.toString(),

    name: dto.hotels.name,

    description: dto.description,

    location: {
      ...template.location,
      city: dto.hotels.city,
      address: dto.hotels.hotelContactInfo.address,
    },

    images:
      dto.images && dto.images.length > 0
        ? dto.images
        : template.images,

    amenities:
      dto.amenities?.map((amenity: string) =>
        amenity
          .replaceAll("_", " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase())
      ) ?? [],

    rating: dto.rating,

    reviewCount: dto.reviewCount,

    priceRange: {
  min: Number(dto.minPrice ?? 0),
  max: Number(dto.minPrice ?? 0),
},

    isActive: dto.hotels.active,
  };
}