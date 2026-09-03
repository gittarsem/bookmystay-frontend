import api from "./axios";

export interface OwnerReview {
  reviewId: number;
  guestName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface OwnerReviewsPage {
  content: OwnerReview[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export const ownerReviewsApi = {
  getHotelReviews(
    hotelId: number,
    page = 0,
    size = 10
  ) {
    return api.get<OwnerReviewsPage>(
      `/hotels/${hotelId}/reviews`,
      {
        params: {
          page,
          size,
        },
      }
    );
  },
};