import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import {
    ArrowLeft,
    Star,
    Trash2,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

import MainLayout from "@/layouts/MainLayout";
import { reviewsApi } from "@/api/reviews";

export default function EditReview() {

    const [, params] = useRoute<{
        reviewId: string;
    }>("/my-bookings/review/:reviewId/edit");

    const [, setLocation] = useLocation();

    const [ratings, setRatings] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");

    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);


    // ==========================================
    // LOAD EXISTING REVIEW
    // ==========================================

    useEffect(() => {

        if (!params?.reviewId) {
            toast.error("Review not found");
            setLocation("/my-bookings");
            return;
        }

        loadReview();

    }, [params?.reviewId]);


    const loadReview = async () => {

        try {

            setLoading(true);

            const { data } = await reviewsApi.get(
                Number(params?.reviewId)
            );

            // Backend ReviewResponse uses "rating"
            setRatings(data.rating);

            setComment(data.comment);

        } catch (err: any) {

            toast.error(
                err?.response?.data?.message ??
                "Unable to load review."
            );

            setLocation("/my-bookings");

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // UPDATE REVIEW
    // ==========================================

    const handleUpdate = async () => {

        if (!params?.reviewId) {
            toast.error("Review not found");
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

            setUpdateLoading(true);

            await reviewsApi.update(
                Number(params.reviewId),
                {
                    ratings: ratings,
                    comment: comment.trim(),
                }
            );

            toast.success(
                "Review updated successfully."
            );

            setLocation("/my-bookings");

        } catch (err: any) {

            toast.error(
                err?.response?.data?.message ??
                "Unable to update review."
            );

        } finally {

            setUpdateLoading(false);

        }

    };


    // ==========================================
    // DELETE REVIEW
    // ==========================================

    const handleDelete = async () => {

        if (!params?.reviewId) {
            toast.error("Review not found");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this review?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setDeleteLoading(true);

            await reviewsApi.delete(
                Number(params.reviewId)
            );

            toast.success(
                "Review deleted successfully."
            );

            setLocation("/my-bookings");

        } catch (err: any) {

            toast.error(
                err?.response?.data?.message ??
                "Unable to delete review."
            );

        } finally {

            setDeleteLoading(false);

        }

    };


    // ==========================================
    // LOADING SCREEN
    // ==========================================

    if (loading) {

        return (
            <MainLayout>

                <div className="container max-w-3xl py-20">

                    <div className="flex items-center justify-center">

                        <Loader2 className="h-10 w-10 animate-spin text-bronze" />

                    </div>

                </div>

            </MainLayout>
        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (
        <MainLayout>

            <div className="container max-w-3xl py-10">

                {/* Back Button */}

                <button
                    onClick={() =>
                        setLocation("/my-bookings")
                    }
                    disabled={
                        updateLoading ||
                        deleteLoading
                    }
                    className="mb-8 flex items-center gap-2 text-muted-foreground transition hover:text-espresso disabled:cursor-not-allowed disabled:opacity-50"
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
                            Edit Your Review
                        </h1>

                        <p className="mt-2 text-muted-foreground">
                            Update your rating and experience.
                        </p>

                    </div>


                    {/* ==================================
                        RATING
                    ================================== */}

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
                                        disabled={
                                            updateLoading ||
                                            deleteLoading
                                        }
                                        onClick={() =>
                                            setRatings(star)
                                        }
                                        onMouseEnter={() =>
                                            setHoverRating(star)
                                        }
                                        onMouseLeave={() =>
                                            setHoverRating(0)
                                        }
                                        className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
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


                    {/* ==================================
                        COMMENT
                    ================================== */}

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
                            disabled={
                                updateLoading ||
                                deleteLoading
                            }
                            placeholder="Tell us about your stay..."
                            className="mt-2 w-full resize-none rounded-xl border border-warm-stone/30 bg-cream/30 px-4 py-3 text-espresso outline-none transition focus:border-bronze focus:ring-2 focus:ring-bronze/20 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <div className="mt-1 flex justify-end">

                            <span className="text-xs text-muted-foreground">
                                {comment.length}/1000
                            </span>

                        </div>

                    </div>


                    {/* ==================================
                        ACTIONS
                    ================================== */}

                    <div className="mt-8 flex flex-wrap gap-3">

                        {/* Cancel */}

                        <button
                            type="button"
                            onClick={() =>
                                setLocation("/my-bookings")
                            }
                            disabled={
                                updateLoading ||
                                deleteLoading
                            }
                            className="rounded-xl border border-warm-stone/30 px-6 py-3 font-medium text-espresso transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>


                        {/* Update */}

                        <button
                            type="button"
                            onClick={handleUpdate}
                            disabled={
                                updateLoading ||
                                deleteLoading ||
                                ratings === 0 ||
                                !comment.trim()
                            }
                            className="rounded-xl bg-bronze px-6 py-3 font-medium text-white transition hover:bg-bronze-dark disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            {updateLoading ? (
                                <span className="flex items-center gap-2">

                                    <Loader2 className="h-4 w-4 animate-spin" />

                                    Updating...

                                </span>
                            ) : (
                                "Update Review"
                            )}

                        </button>


                        {/* Delete */}

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={
                                updateLoading ||
                                deleteLoading
                            }
                            className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            {deleteLoading ? (

                                <>

                                    <Loader2 className="h-4 w-4 animate-spin" />

                                    Deleting...

                                </>

                            ) : (

                                <>

                                    <Trash2 className="h-4 w-4" />

                                    Delete Review

                                </>

                            )}

                        </button>

                    </div>

                </div>

            </div>

        </MainLayout>
    );
}