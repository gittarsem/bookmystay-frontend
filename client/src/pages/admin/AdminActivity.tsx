import { useEffect, useState } from "react";
import {
  Activity,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "@/layouts/DashboardLayout";
import {
  adminApi,
  type AdminActivity as ActivityItem,
} from "@/api/admin";

export default function AdminActivity() {
  const [activities, setActivities] =
    useState<ActivityItem[]>([]);

  const [page, setPage] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const loadActivity = async () => {
    try {
      setLoading(true);

      const response =
        await adminApi.getActivity({
          page,
          size: 20,
        });

      setActivities(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error(error);

      toast.error(
        "Unable to load activity",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, [page]);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* HEADER */}

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Administration
            </p>

            <h1 className="mt-2 font-serif text-3xl font-semibold text-espresso">
              Activity
            </h1>

            <p className="mt-2 text-sm text-espresso/60">
              Administrative actions and platform events.
            </p>
          </div>

          <button
            type="button"
            onClick={loadActivity}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-warm-stone/40 bg-white px-4 py-2.5 text-sm disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {/* ACTIVITY */}

        <div className="overflow-hidden rounded-2xl border border-warm-stone/30 bg-white">
          {loading && (
            <div className="px-6 py-16 text-center text-sm text-espresso/50">
              Loading activity...
            </div>
          )}

          {!loading &&
            activities.length === 0 && (
              <div className="px-6 py-16 text-center">
                <Activity className="mx-auto h-9 w-9 text-espresso/15" />

                <p className="mt-3 text-sm text-espresso/50">
                  No activity recorded.
                </p>
              </div>
            )}

          {!loading &&
            activities.length > 0 && (
              <div className="divide-y divide-warm-stone/20">
                {activities.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 px-6 py-5"
                  >
                    {/* ICON */}

                    <div className="mt-0.5 shrink-0 rounded-full bg-bronze/10 p-2.5">
                      <Activity className="h-4 w-4 text-bronze" />
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-medium text-espresso">
                            {item.action ||
                              "Administrative action"}
                          </p>

                          {item.description && (
                            <p className="mt-1 text-sm leading-6 text-espresso/60">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {item.createdAt && (
                          <p className="shrink-0 text-xs text-espresso/40">
                            {new Date(
                              item.createdAt,
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* PAGINATION */}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={
                page === 0 || loading
              }
              onClick={() =>
                setPage((currentPage) =>
                  Math.max(
                    0,
                    currentPage - 1,
                  ),
                )
              }
              className="rounded-lg border border-warm-stone/40 bg-white px-4 py-2.5 text-sm disabled:opacity-40"
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
                page >= totalPages - 1 ||
                loading
              }
              onClick={() =>
                setPage((currentPage) =>
                  Math.min(
                    totalPages - 1,
                    currentPage + 1,
                  ),
                )
              }
              className="rounded-lg border border-warm-stone/40 bg-white px-4 py-2.5 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}