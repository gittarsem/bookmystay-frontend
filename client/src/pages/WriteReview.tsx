import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Star } from "lucide-react";
import { toast } from "sonner";

import MainLayout from "@/layouts/MainLayout";
import { reviewsApi } from "@/api/reviews";

export default function WriteReview() {
    const [, params] = useRoute<{
        bookingId: string;
    }>("/my-bookings/:bookingId/review");

    const [, setLocation] = useLocation();

    const [ratings, setRatings] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {

        if (!params?.bookingId) {
            toast.error("Booking not found");
            return;
        }

        if (ratings === 0) {
            toast.error("Please select a rating");
            return;
        }

        if (!comment.trim()) {
            toast.error("Please write a review");
            return;
        }

        try {
            setLoading(true);

            await reviewsApi.create({
                bookingId: Number(params.bookingId),
                ratings: ratings,
                comment: comment.trim(),
            });

            toast.success(
                "Review submitted successfully"
            );

            setLocation("/my-bookings");

        } catch (err: any) {

            toast.error(
                err?.response?.data?.message ||
                "Unable to submit review"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>

            <div className="container max-w-3xl py-10">

                {/* Back Button */}

                <button
                    onClick={() =>
                        setLocation("/my-bookings")
                    }
                    className="mb-8 flex items-center gap-2 text-muted-foreground transition hover:text-espresso"
                >
                    <ArrowLeft className="h-4 w-4" />

                    <span className="text-sm font-medium">
                        Back to My Bookings
                    </span>
                </button>

                {/* Review Card */}

                <div className="rounded-2xl border border-warm-stone/20 bg-white p-6 shadow-warm md:p-8">

                    {/* Header */}

                    <div className="mb-8">

                        <h1 className="font-serif text-3xl font-semibold text-espresso">
                            Write a Review
                        </h1>

                        <p className="mt-2 text-muted-foreground">
                            Share your experience with us.
                        </p>

                    </div>

                    {/* Rating */}

                    <div className="mb-8">

                        <label className="text-sm font-medium text-espresso">
                            Your Rating
                        </label>

                        <div className="mt-3 flex items-center gap-2">

                            {[1, 2, 3, 4, 5].map(
                                (star) => (

                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() =>
                                            setRatings(star)
                                        }
                                        onMouseEnter={() =>
                                            setHoverRating(star)
                                        }
                                        onMouseLeave={() =>
                                            setHoverRating(0)
                                        }
                                        className="transition-transform hover:scale-110"
                                    >

                                        <Star
                                            className={`h-9 w-9 ${
                                                star <=
                                                (hoverRating ||
                                                    ratings)
                                                    ? "fill-bronze text-bronze"
                                                    : "text-warm-stone/40"
                                            }`}
                                        />

                                    </button>

                                )
                            )}

                        </div>

                        <p className="mt-2 text-sm text-muted-foreground">

                            {ratings === 0
                                ? "Select a rating"
                                : `${ratings} out of 5`}

                        </p>

                    </div>

                    {/* Comment */}

                    <div>

                        <label
                            htmlFor="review-comment"
                            className="text-sm font-medium text-espresso"
                        >
                            Your Review
                        </label>

                        <textarea
                            id="review-comment"
                            value={comment}
                            onChange={(e) =>
                                setComment(e.target.value)
                            }
                            maxLength={1000}
                            rows={6}
                            placeholder="Tell us about your stay..."
                            className="mt-2 w-full resize-none rounded-xl border border-warm-stone/30 bg-cream/30 px-4 py-3 text-espresso outline-none transition focus:border-bronze focus:ring-2 focus:ring-bronze/20"
                        />

                        <div className="mt-1 flex justify-end">

                            <span className="text-xs text-muted-foreground">
                                {comment.length}/1000
                            </span>

                        </div>

                    </div>

                    {/* Buttons */}

                    <div className="mt-8 flex flex-wrap gap-3">

                        <button
                            type="button"
                            onClick={() =>
                                setLocation("/my-bookings")
                            }
                            disabled={loading}
                            className="rounded-xl border border-warm-stone/30 px-6 py-3 font-medium text-espresso transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={
                                loading ||
                                ratings === 0 ||
                                !comment.trim()
                            }
                            className="rounded-xl bg-bronze px-6 py-3 font-medium text-white transition hover:bg-bronze-dark disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Submitting..."
                                : "Submit Review"}
                        </button>

                    </div>

                </div>

            </div>

        </MainLayout>
    );
}