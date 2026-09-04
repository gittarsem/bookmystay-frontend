import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Power,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "@/layouts/DashboardLayout";
import {
  adminApi,
  type AdminHotel,
} from "@/api/admin";

export default function AdminHotels() {
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState<number | null>(null);

  const loadHotels = async () => {
    try {
      setLoading(true);

      let active: boolean | undefined;

      if (status === "active") {
        active = true;
      } else if (status === "suspended") {
        active = false;
      }

      const response = await adminApi.getHotels({
        search: search.trim(),
        active,
        page,
        size: 10,
      });

      setHotels(response.content ?? []);
      setTotalPages(response.totalPages ?? 0);
      setTotalElements(response.totalElements ?? 0);
    } catch (error) {
      console.error(
        "Failed to load hotels",
        error,
      );

      setHotels([]);
      setTotalPages(0);
      setTotalElements(0);

      toast.error("Unable to load hotels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, [page, status]);

  const handleSearch = () => {
    if (page === 0) {
      loadHotels();
    } else {
      setPage(0);
    }
  };

  const handleActivate = async (hotelId: number) => {
    try {
      setActionLoading(hotelId);

      await adminApi.activateHotel(hotelId);

      toast.success("Hotel activated");

      await loadHotels();
    } catch (error) {
      console.error(
        "Failed to activate hotel",
        error,
      );

      toast.error("Unable to activate hotel");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (hotelId: number) => {
    const confirmed = window.confirm(
      "Suspend this hotel?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(hotelId);

      await adminApi.suspendHotel(hotelId);

      toast.success("Hotel suspended");

      await loadHotels();
    } catch (error) {
      console.error(
        "Failed to suspend hotel",
        error,
      );

      toast.error("Unable to suspend hotel");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (hotelId: number) => {
    const confirmed = window.confirm(
      "Remove this hotel permanently? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(hotelId);

      await adminApi.deleteHotel(hotelId);

      toast.success("Hotel removed");

      /*
       * If the deleted hotel was the only item
       * on the current page, move back one page.
       */
      if (hotels.length === 1 && page > 0) {
        setPage((current) =>
          Math.max(0, current - 1),
        );
      } else {
        await loadHotels();
      }
    } catch (error) {
      console.error(
        "Failed to remove hotel",
        error,
      );

      toast.error("Unable to remove hotel");
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
            Hotels
          </h1>

          <p className="mt-2 text-sm text-espresso/60">
            Monitor and manage properties listed on
            BookMyStay.
          </p>
        </div>

        {/* FILTERS */}

        <div className="rounded-2xl border border-warm-stone/30 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Search by hotel name or city..."
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
                  text-espresso
                  outline-none
                  focus:border-bronze
                "
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
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
                text-espresso
                outline-none
                focus:border-bronze
              "
            >
              <option value="">
                All properties
              </option>

              <option value="active">
                Active
              </option>

              <option value="suspended">
                Suspended
              </option>
            </select>

            <button
              type="button"
              onClick={handleSearch}
              className="
                rounded-lg
                bg-bronze
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                hover:bg-bronze/90
              "
            >
              Search
            </button>

            <button
              type="button"
              onClick={loadHotels}
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
                text-espresso
                hover:bg-cream
                disabled:opacity-50
              "
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />

              Refresh
            </button>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-warm-stone/30 bg-white">
          <div className="border-b border-warm-stone/30 px-5 py-4">
            <p className="text-sm text-espresso/60">
              {totalElements.toLocaleString()} properties
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-warm-stone/30 bg-cream/40">
                <tr className="text-left">
                  <th className="px-5 py-4">
                    Property
                  </th>

                  <th className="px-5 py-4">
                    City
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-16 text-center text-espresso/50"
                    >
                      Loading hotels...
                    </td>
                  </tr>
                )}

                {!loading && hotels.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-16 text-center"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-espresso">
                          No hotels found
                        </p>

                        <p className="text-xs text-espresso/50">
                          Try changing your search or
                          status filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  hotels.map((hotel) => {
                    const busy =
                      actionLoading === hotel.id;

                    return (
                      <tr
                        key={hotel.id}
                        className="
                          border-b
                          border-warm-stone/20
                          last:border-0
                        "
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-espresso">
                            {hotel.name || "Unnamed property"}
                          </p>

                          <p className="mt-1 text-xs text-espresso/40">
                            ID #{hotel.id}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-espresso/60">
                          {hotel.city || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              hotel.active
                                ? `
                                  rounded-full
                                  bg-green-50
                                  px-2.5
                                  py-1
                                  text-xs
                                  text-green-700
                                `
                                : `
                                  rounded-full
                                  bg-red-50
                                  px-2.5
                                  py-1
                                  text-xs
                                  text-red-700
                                `
                            }
                          >
                            {hotel.active
                              ? "Active"
                              : "Suspended"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <a
                              href={`/hotel/${hotel.id}`}
                              target="_blank"
                              rel="noreferrer"
                              title="View property"
                              className="
                                rounded-lg
                                border
                                border-warm-stone/40
                                p-2
                                text-espresso/60
                                hover:bg-cream
                              "
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>

                            {hotel.active ? (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  handleSuspend(
                                    hotel.id,
                                  )
                                }
                                title="Suspend hotel"
                                className="
                                  rounded-lg
                                  border
                                  border-amber-200
                                  p-2
                                  text-amber-700
                                  hover:bg-amber-50
                                  disabled:opacity-50
                                "
                              >
                                <Power
                                  className={`h-4 w-4 ${
                                    busy
                                      ? "animate-pulse"
                                      : ""
                                  }`}
                                />
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  handleActivate(
                                    hotel.id,
                                  )
                                }
                                title="Activate hotel"
                                className="
                                  rounded-lg
                                  border
                                  border-green-200
                                  p-2
                                  text-green-700
                                  hover:bg-green-50
                                  disabled:opacity-50
                                "
                              >
                                <Power
                                  className={`h-4 w-4 ${
                                    busy
                                      ? "animate-pulse"
                                      : ""
                                  }`}
                                />
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                handleDelete(
                                  hotel.id,
                                )
                              }
                              title="Remove hotel"
                              className="
                                rounded-lg
                                border
                                border-red-200
                                p-2
                                text-red-600
                                hover:bg-red-50
                                disabled:opacity-50
                              "
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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
                disabled={page === 0 || loading}
                onClick={() =>
                  setPage((current) =>
                    Math.max(0, current - 1),
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
                Page {page + 1} of {totalPages}
              </span>

              <button
                type="button"
                disabled={
                  page >= totalPages - 1 ||
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
      </div>
    </DashboardLayout>
  );
}