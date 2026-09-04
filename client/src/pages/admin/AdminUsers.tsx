import { useEffect, useState } from "react";
import {
  Search,
  UserCog,
  UserMinus,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "@/layouts/DashboardLayout";
import {
  adminApi,
  type AdminUser,
} from "@/api/admin";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(0);

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState<number | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await adminApi.getUsers({
        search: search.trim(),
        role: role || undefined,
        page,
        size: 10,
      });

      setUsers(response.content ?? []);
      setTotalPages(response.totalPages ?? 0);
      setTotalElements(response.totalElements ?? 0);
    } catch (error) {
      console.error("Failed to load users", error);

      setUsers([]);
      setTotalPages(0);
      setTotalElements(0);

      toast.error("Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, role]);

  const handleSearch = () => {
    if (page === 0) {
      loadUsers();
    } else {
      setPage(0);
    }
  };

  const handleMakeOwner = async (userId: number) => {
    try {
      setActionLoading(userId);

      await adminApi.changeRole(userId);

      toast.success("User promoted to owner");

      await loadUsers();
    } catch (error) {
      console.error(
        "Failed to update user role",
        error,
      );

      toast.error("Unable to update user role");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveOwner = async (userId: number) => {
    const confirmed = window.confirm(
      "Remove the owner role from this user?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(userId);

      await adminApi.removeOwnerRole(userId);

      toast.success("Owner role removed");

      await loadUsers();
    } catch (error) {
      console.error(
        "Failed to remove owner role",
        error,
      );

      toast.error("Unable to remove owner role");
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
            Users
          </h1>

          <p className="mt-2 text-sm text-espresso/60">
            Manage platform accounts and owner access.
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
                placeholder="Search by name or email..."
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
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
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
              <option value="">All users</option>

              <option value="ROLE_OWNER">
                Owners
              </option>

              {/* IMPORTANT:
                  Backend enum is ROLE_GUEST, not ROLE_USER.
              */}
              <option value="ROLE_GUEST">
                Guests
              </option>

              <option value="ROLE_ADMIN">
                Admins
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
              onClick={loadUsers}
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
          <div className="flex items-center justify-between border-b border-warm-stone/30 px-5 py-4">
            <p className="text-sm text-espresso/60">
              {totalElements.toLocaleString()} users
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-warm-stone/30 bg-cream/40">
                <tr className="text-left">
                  <th className="px-5 py-4">
                    User
                  </th>

                  <th className="px-5 py-4">
                    Roles
                  </th>

                  <th className="px-5 py-4">
                    Joined
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
                      Loading users...
                    </td>
                  </tr>
                )}

                {!loading && users.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-16 text-center"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-espresso">
                          No users found
                        </p>

                        <p className="text-xs text-espresso/50">
                          Try changing your search or
                          filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  users.map((user) => {
                    const roles = user.roles ?? [];

                    const isOwner =
                      roles.includes("ROLE_OWNER");

                    const isAdmin =
                      roles.includes("ROLE_ADMIN");

                    return (
                      <tr
                        key={user.id}
                        className="
                          border-b
                          border-warm-stone/20
                          last:border-0
                        "
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-espresso">
                            {user.name || "Unnamed user"}
                          </p>

                          <p className="mt-1 text-xs text-espresso/50">
                            {user.email || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {roles.length > 0 ? (
                              roles.map((item) => (
                                <span
                                  key={item}
                                  className="
                                    rounded-full
                                    bg-bronze/10
                                    px-2.5
                                    py-1
                                    text-xs
                                    text-bronze
                                  "
                                >
                                  {item.replace(
                                    "ROLE_",
                                    "",
                                  )}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-espresso/40">
                                No role
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-espresso/60">
                          {user.created_at
                            ? new Date(
                                user.created_at,
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {!isOwner && !isAdmin && (
                              <button
                                type="button"
                                disabled={
                                  actionLoading ===
                                  user.id
                                }
                                onClick={() =>
                                  handleMakeOwner(
                                    user.id,
                                  )
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-lg
                                  border
                                  border-bronze/30
                                  px-3
                                  py-2
                                  text-xs
                                  text-bronze
                                  hover:bg-bronze/10
                                  disabled:opacity-50
                                "
                              >
                                <UserCog className="h-4 w-4" />
                                Make Owner
                              </button>
                            )}

                            {isOwner && !isAdmin && (
                              <button
                                type="button"
                                disabled={
                                  actionLoading ===
                                  user.id
                                }
                                onClick={() =>
                                  handleRemoveOwner(
                                    user.id,
                                  )
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-lg
                                  border
                                  border-red-200
                                  px-3
                                  py-2
                                  text-xs
                                  text-red-600
                                  hover:bg-red-50
                                  disabled:opacity-50
                                "
                              >
                                <UserMinus className="h-4 w-4" />
                                Remove Owner
                              </button>
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