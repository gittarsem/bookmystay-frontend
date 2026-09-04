import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Trash2,
  Star,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "@/layouts/DashboardLayout";
import {
  adminApi,
  type AdminReview,
} from "@/api/admin";

export default function AdminReviews() {
  const [reviews, setReviews] =
    useState<AdminReview[]>([]);

  const [search, setSearch] =
    useState("");

  const [rating, setRating] =
    useState("");

  const [page, setPage] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [selected, setSelected] =
    useState<AdminReview | null>(null);

  const [actionLoading, setActionLoading] =
    useState<number | null>(null);

  const loadReviews = async () => {
    try {
      setLoading(true);

      const response =
        await adminApi.getReviews({
          rating: rating
            ? Number(rating)
            : undefined,
          page,
          size: 10,
        });

      setReviews(response.content);

      setTotalPages(
        response.totalPages,
      );
    } catch (error) {
      console.error(
        "Failed to load reviews",
        error,
      );

      toast.error(
        "Unable to load reviews",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [page, rating]);

  const filteredReviews =
    search.trim()
      ? reviews.filter((review) => {
          const query =
            search.trim().toLowerCase();

          return (
            review.guestName
              ?.toLowerCase()
              .includes(query) ||
            review.comment
              ?.toLowerCase()
              .includes(query)
          );
        })
      : reviews;

  const handleDelete = async (
    reviewId: number,
  ) => {
    const confirmed =
      window.confirm(
        "Delete this review permanently?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(reviewId);

      await adminApi.deleteReview(
        reviewId,
      );

      toast.success(
        "Review deleted",
      );

      setSelected(null);

      await loadReviews();
    } catch (error) {
      console.error(
        "Failed to delete review",
        error,
      );

      toast.error(
        "Unable to delete review",
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* HEADER */}

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Administration
          </p>

          <h1 className="mt-2 font-serif text-3xl font-semibold text-espresso">
            Reviews
          </h1>

          <p className="mt-2 text-sm text-espresso/60">
            Review customer feedback and
            remove content that violates
            platform standards.
          </p>
        </div>

        {/* FILTERS */}

        <div className="rounded-2xl border border-warm-stone/30 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search reviews..."
                className="
                  w-full
                  rounded-lg
                  border
                  border-warm-stone/40
                  bg-cream/30
                  py-2.5
                  pl-10
                  pr-4
                  text-sm
                  outline-none
                  focus:border-bronze
                "
              />
            </div>

            <select
              value={rating}
              onChange={(event) => {
                setRating(
                  event.target.value,
                );
                setPage(0);
              }}
              className="
                rounded-lg
                border
                border-warm-stone/40
                bg-white
                px-4
                py-2.5
                text-sm
                outline-none
                focus:border-bronze
              "
            >
              <option value="">
                All ratings
              </option>

              <option value="5">
                5 stars
              </option>

              <option value="4">
                4 stars
              </option>

              <option value="3">
                3 stars
              </option>

              <option value="2">
                2 stars
              </option>

              <option value="1">
                1 star
              </option>
            </select>

            <button
              type="button"
              onClick={loadReviews}
              disabled={loading}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-warm-stone/40
                px-4
                py-2.5
                text-sm
                disabled:opacity-50
              "
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-warm-stone/30 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-warm-stone/30 bg-cream/40">
                <tr className="text-left">
                  <th className="px-5 py-4">
                    Guest
                  </th>

                  <th className="px-5 py-4">
                    Rating
                  </th>

                  <th className="min-w-[360px] px-5 py-4">
                    Review
                  </th>

                  <th className="px-5 py-4">
                    Created
                  </th>

                  <th className="px-5 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* LOADING */}

                {loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-16 text-center text-espresso/50"
                    >
                      Loading reviews...
                    </td>
                  </tr>
                )}

                {/* EMPTY */}

                {!loading &&
                  filteredReviews.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-16 text-center text-espresso/50"
                      >
                        No reviews found.
                      </td>
                    </tr>
                  )}

                {/* REVIEWS */}

                {!loading &&
                  filteredReviews.map(
                    (review) => (
                      <tr
                        key={
                          review.reviewId
                        }
                        className="
                          border-b
                          border-warm-stone/20
                          last:border-0
                        "
                      >
                        {/* GUEST */}

                        <td className="px-5 py-4 font-medium text-espresso">
                          {review.guestName ||
                            "—"}
                        </td>

                        {/* RATING */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-current text-bronze" />

                            <span>
                              {
                                review.rating
                              }
                            </span>
                          </div>
                        </td>

                        {/* COMMENT */}

                        <td className="px-5 py-4">
                          <p className="max-w-[480px] truncate text-espresso/70">
                            {review.comment ||
                              "—"}
                          </p>
                        </td>

                        {/* CREATED */}

                        <td className="px-5 py-4 text-espresso/50">
                          {review.createdAt
                            ? new Date(
                                review.createdAt,
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {/* VIEW */}

                            <button
                              type="button"
                              onClick={() =>
                                setSelected(
                                  review,
                                )
                              }
                              className="
                                rounded-lg
                                border
                                border-warm-stone/40
                                p-2
                                text-espresso/60
                                hover:bg-cream
                              "
                              title="View review"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              disabled={
                                actionLoading ===
                                review.reviewId
                              }
                              onClick={() =>
                                handleDelete(
                                  review.reviewId,
                                )
                              }
                              className="
                                rounded-lg
                                border
                                border-red-200
                                p-2
                                text-red-600
                                hover:bg-red-50
                                disabled:opacity-50
                              "
                              title="Delete review"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-warm-stone/30 px-5 py-4">
              <button
                type="button"
                disabled={
                  page === 0 ||
                  loading
                }
                onClick={() =>
                  setPage((current) =>
                    Math.max(
                      0,
                      current - 1,
                    ),
                  )
                }
                className="
                  rounded-lg
                  border
                  border-warm-stone/40
                  px-3
                  py-2
                  text-sm
                  disabled:opacity-40
                "
              >
                Previous
              </button>

              <span className="text-sm text-espresso/60">
                Page {page + 1} of{" "}
                {totalPages}
              </span>

              <button
                type="button"
                disabled={
                  page >=
                    totalPages - 1 ||
                  loading
                }
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      totalPages - 1,
                      current + 1,
                    ),
                  )
                }
                className="
                  rounded-lg
                  border
                  border-warm-stone/40
                  px-3
                  py-2
                  text-sm
                  disabled:opacity-40
                "
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* REVIEW DETAIL */}

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
              {/* MODAL HEADER */}

              <div className="border-b border-warm-stone/30 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Review
                    </p>

                    <h2 className="mt-1 font-serif text-xl font-semibold text-espresso">
                      {selected.guestName ||
                        "Guest review"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelected(null)
                    }
                    className="
                      text-xl
                      text-espresso/40
                      hover:text-espresso
                    "
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* MODAL CONTENT */}

              <div className="p-6">
                {/* RATING */}

                <div className="flex items-center gap-1">
                  {Array.from({
                    length: 5,
                  }).map((_, index) => (
                    <Star
                      key={index}
                      className={`
                        h-4 w-4
                        ${
                          index <
                          selected.rating
                            ? "fill-current text-bronze"
                            : "text-espresso/15"
                        }
                      `}
                    />
                  ))}
                </div>

                {/* COMMENT */}

                <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-espresso/75">
                  {selected.comment ||
                    "No comment provided."}
                </p>

                {/* CREATED */}

                <div className="mt-5 border-t border-warm-stone/30 pt-4 text-xs text-espresso/50">
                  {selected.createdAt
                    ? new Date(
                        selected.createdAt,
                      ).toLocaleString()
                    : ""}
                </div>

                {/* ACTION */}

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    disabled={
                      actionLoading ===
                      selected.reviewId
                    }
                    onClick={() =>
                      handleDelete(
                        selected.reviewId,
                      )
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-lg
                      bg-red-600
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      text-white
                      disabled:opacity-50
                    "
                  >
                    <Trash2 className="h-4 w-4" />

                    Delete review
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}