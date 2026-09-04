import { useEffect, useState } from "react";
import {
  RefreshCw,
  Eye,
  Check,
  X,
  Flag,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "@/layouts/DashboardLayout";
import {
  adminApi,
  type AdminReport,
} from "@/api/admin";

export default function AdminReports() {
  const [reports, setReports] =
    useState<AdminReport[]>([]);

  const [status, setStatus] =
    useState("");

  const [page, setPage] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState<number | null>(null);

  const [selected, setSelected] =
    useState<AdminReport | null>(null);

  const loadReports = async () => {
    try {
      setLoading(true);

      const response =
        await adminApi.getReports({
          status: status || undefined,
          page,
          size: 10,
        });

      setReports(response.content);

      setTotalPages(
        response.totalPages,
      );
    } catch (error) {
      console.error(
        "Failed to load reports",
        error,
      );

      toast.error(
        "Unable to load reports",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [page, status]);

  const handleResolve = async (
    reportId: number,
  ) => {
    try {
      setActionLoading(reportId);

      await adminApi.resolveReport(
        reportId,
      );

      toast.success(
        "Report resolved",
      );

      setSelected(null);

      await loadReports();
    } catch (error) {
      console.error(
        "Failed to resolve report",
        error,
      );

      toast.error(
        "Unable to resolve report",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (
    reportId: number,
  ) => {
    try {
      setActionLoading(reportId);

      await adminApi.dismissReport(
        reportId,
      );

      toast.success(
        "Report dismissed",
      );

      setSelected(null);

      await loadReports();
    } catch (error) {
      console.error(
        "Failed to dismiss report",
        error,
      );

      toast.error(
        "Unable to dismiss report",
      );
    } finally {
      setActionLoading(null);
    }
  };

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
              Reports
            </h1>

            <p className="mt-2 text-sm text-espresso/60">
              Review platform reports and
              record their resolution.
            </p>
          </div>

          <button
            type="button"
            onClick={loadReports}
            disabled={loading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-warm-stone/40
              bg-white
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

        {/* FILTER */}

        <div className="rounded-2xl border border-warm-stone/30 bg-white p-4">
          <select
            value={status}
            onChange={(event) => {
              setStatus(
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
              All reports
            </option>

            <option value="OPEN">
              Open
            </option>

            <option value="RESOLVED">
              Resolved
            </option>

            <option value="DISMISSED">
              Dismissed
            </option>
          </select>
        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-warm-stone/30 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-warm-stone/30 bg-cream/40">
                <tr className="text-left">
                  <th className="px-5 py-4">
                    Report
                  </th>

                  <th className="px-5 py-4">
                    Status
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
                      colSpan={4}
                      className="px-5 py-16 text-center text-espresso/50"
                    >
                      Loading reports...
                    </td>
                  </tr>
                )}

                {/* EMPTY */}

                {!loading &&
                  reports.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-16 text-center"
                      >
                        <Flag className="mx-auto h-8 w-8 text-espresso/15" />

                        <p className="mt-3 text-sm text-espresso/50">
                          No reports found.
                        </p>
                      </td>
                    </tr>
                  )}

                {/* REPORTS */}

                {!loading &&
                  reports.map((report) => {
                    const normalizedStatus =
                      report.status?.toUpperCase();

                    const open =
                      normalizedStatus ===
                        "OPEN" ||
                      normalizedStatus ===
                        "PENDING";

                    return (
                      <tr
                        key={report.id}
                        className="
                          border-b
                          border-warm-stone/20
                          last:border-0
                        "
                      >
                        {/* REPORT */}

                        <td className="px-5 py-4">
                          <p className="font-medium text-espresso">
                            {report.reason ||
                              "Reported issue"}
                          </p>

                          <p className="mt-1 max-w-md truncate text-xs text-espresso/50">
                            {report.description ||
                              "No description"}
                          </p>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <span
                            className={`
                              rounded-full
                              px-2.5
                              py-1
                              text-xs
                              ${
                                open
                                  ? "bg-amber-50 text-amber-700"
                                  : normalizedStatus ===
                                      "RESOLVED"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-espresso/5 text-espresso/60"
                              }
                            `}
                          >
                            {report.status ||
                              "—"}
                          </span>
                        </td>

                        {/* CREATED */}

                        <td className="px-5 py-4 text-espresso/50">
                          {report.createdAt
                            ? new Date(
                                report.createdAt,
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
                                  report,
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
                              title="View report"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* RESOLVE / DISMISS */}

                            {open && (
                              <>
                                <button
                                  type="button"
                                  disabled={
                                    actionLoading ===
                                    report.id
                                  }
                                  onClick={() =>
                                    handleResolve(
                                      report.id,
                                    )
                                  }
                                  className="
                                    rounded-lg
                                    border
                                    border-green-200
                                    p-2
                                    text-green-700
                                    hover:bg-green-50
                                    disabled:opacity-50
                                  "
                                  title="Resolve"
                                >
                                  <Check className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    actionLoading ===
                                    report.id
                                  }
                                  onClick={() =>
                                    handleDismiss(
                                      report.id,
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
                                  title="Dismiss"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

        {/* DETAIL MODAL */}

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
              {/* MODAL HEADER */}

              <div className="flex items-center justify-between border-b border-warm-stone/30 px-6 py-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Report
                  </p>

                  <h2 className="mt-1 font-serif text-xl font-semibold text-espresso">
                    Report #{selected.id}
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

              {/* MODAL CONTENT */}

              <div className="space-y-5 p-6">
                {/* STATUS */}

                <div>
                  <p className="text-xs text-espresso/40">
                    Status
                  </p>

                  <p className="mt-1 text-sm text-espresso">
                    {selected.status ||
                      "—"}
                  </p>
                </div>

                {/* REASON */}

                <div>
                  <p className="text-xs text-espresso/40">
                    Reason
                  </p>

                  <p className="mt-1 text-sm text-espresso">
                    {selected.reason ||
                      "—"}
                  </p>
                </div>

                {/* DESCRIPTION */}

                <div>
                  <p className="text-xs text-espresso/40">
                    Description
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-espresso/70">
                    {selected.description ||
                      "No description provided."}
                  </p>
                </div>

                {/* CREATED */}

                <div>
                  <p className="text-xs text-espresso/40">
                    Created
                  </p>

                  <p className="mt-1 text-sm text-espresso">
                    {selected.createdAt
                      ? new Date(
                          selected.createdAt,
                        ).toLocaleString()
                      : "—"}
                  </p>
                </div>

                {/* ACTIONS */}

                <div className="flex justify-end gap-2 border-t border-warm-stone/30 pt-5">
                  <button
                    type="button"
                    onClick={() =>
                      setSelected(null)
                    }
                    className="
                      rounded-lg
                      border
                      border-warm-stone/40
                      px-4
                      py-2.5
                      text-sm
                    "
                  >
                    Close
                  </button>

                  {(
                    selected.status || ""
                  ).toUpperCase() !==
                    "RESOLVED" &&
                    (
                      selected.status ||
                      ""
                    ).toUpperCase() !==
                      "DISMISSED" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleDismiss(
                              selected.id,
                            )
                          }
                          disabled={
                            actionLoading ===
                            selected.id
                          }
                          className="
                            rounded-lg
                            border
                            border-red-200
                            px-4
                            py-2.5
                            text-sm
                            text-red-600
                            disabled:opacity-50
                          "
                        >
                          Dismiss
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleResolve(
                              selected.id,
                            )
                          }
                          disabled={
                            actionLoading ===
                            selected.id
                          }
                          className="
                            rounded-lg
                            bg-bronze
                            px-4
                            py-2.5
                            text-sm
                            font-medium
                            text-white
                            disabled:opacity-50
                          "
                        >
                          Resolve
                        </button>
                      </>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}