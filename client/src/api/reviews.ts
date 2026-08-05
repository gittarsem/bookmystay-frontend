import api from "./axios";

export interface CreateReviewRequest {
    bookingId: number;
    ratings: number;
    comment: string;
}

export interface UpdateReviewRequest {
    ratings: number;
    comment: string;
}

export interface ReviewResponse {
    reviewId: number;
    guestName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export const reviewsApi = {

    // Create Review
    create: (request: CreateReviewRequest) =>
        api.post<ReviewResponse>(
            "/guest/review",
            request
        ),

    // Get single review
    get: (reviewId: number) =>
        api.get<ReviewResponse>(
            `/guest/review/${reviewId}`
        ),

    // Update Review
    update: (
        reviewId: number,
        request: UpdateReviewRequest
    ) =>
        api.put<ReviewResponse>(
            `/guest/review/${reviewId}`,
            request
        ),

    // Delete Review
    delete: (reviewId: number) =>
        api.delete(
            `/guest/review/${reviewId}`
        ),

    // Get hotel reviews
    getHotelReviews: (
        hotelId: number,
        page = 0,
        size = 10
    ) =>
        api.get<{
            content: ReviewResponse[];
            totalElements: number;
            totalPages: number;
            number: number;
        }>(
            `/hotels/${hotelId}/reviews`,
            {
                params: {
                    page,
                    size,
                },
            }
        ),
};