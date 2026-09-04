import { useEffect, useState } from "react";
import {
  Users,
  Hotel,
  ShieldCheck,
  Star,
  Flag,
  Activity,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

import DashboardLayout from "@/layouts/DashboardLayout";
import { adminApi } from "@/api/admin";

interface Metric {
  label: string;
  value: number;
  icon: typeof Users;
  href: string;
  description: string;
}

const initialMetrics: Metric[] = [
  {
    label: "Users",
    value: 0,
    icon: Users,
    href: "/admin/users",
    description: "Registered platform accounts",
  },
  {
    label: "Hotels",
    value: 0,
    icon: Hotel,
    href: "/admin/hotels",
    description: "Properties managed on the platform",
  },
  {
    label: "Pending Verifications",
    value: 0,
    icon: ShieldCheck,
    href: "/admin/verification",
    description: "Owner applications awaiting review",
  },
  {
    label: "Reviews",
    value: 0,
    icon: Star,
    href: "/admin/reviews",
    description: "Reviews currently in the system",
  },
  {
    label: "Reports",
    value: 0,
    icon: Flag,
    href: "/admin/reports",
    description: "Platform reports requiring attention",
  },
  {
    label: "Activity",
    value: 0,
    icon: Activity,
    href: "/admin/activity",
    description: "Recorded administrative activity",
  },
];

export default function AdminDashboard() {
  const [metrics, setMetrics] =
    useState<Metric[]>(initialMetrics);

  const [loading, setLoading] =
    useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        users,
        hotels,
        verifications,
        reviews,
        reports,
        activity,
      ] = await Promise.all([
        adminApi.getUsers({
          search: "",
          role: undefined,
          page: 0,
          size: 1,
        }),

        adminApi.getHotels({
          search: "",
          active: undefined,
          page: 0,
          size: 1,
        }),

        adminApi.getPendingVerifications(),

        adminApi.getReviews({
          rating: undefined,
          page: 0,
          size: 1,
        }),

        adminApi.getReports({
          status: undefined,
          page: 0,
          size: 1,
        }),

        adminApi.getActivity({
          page: 0,
          size: 1,
        }),
      ]);

      setMetrics([
        {
          ...initialMetrics[0],
          value: users.totalElements,
        },

        {
          ...initialMetrics[1],
          value: hotels.totalElements,
        },

        {
          ...initialMetrics[2],
          value: verifications.length,
        },

        {
          ...initialMetrics[3],
          value: reviews.totalElements,
        },

        {
          ...initialMetrics[4],
          value: reports.totalElements,
        },

        {
          ...initialMetrics[5],
          value: activity.totalElements,
        },
      ]);
    } catch (error) {
      console.error(
        "Failed to load admin dashboard",
        error,
      );

      toast.error(
        "Unable to load admin dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* HEADER */}

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Administration
            </p>

            <h1 className="mt-2 font-serif text-3xl font-semibold text-espresso md:text-4xl">
              Platform overview
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-espresso/60">
              A real-time operational view of the
              BookMyStay platform.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
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
              font-medium
              text-espresso
              hover:bg-cream
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

        {/* METRICS */}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <Link
                key={metric.href}
                href={metric.href}
              >
                <div
                  className="
                    group
                    h-full
                    cursor-pointer
                    rounded-2xl
                    border
                    border-warm-stone/30
                    bg-white
                    p-6
                    shadow-sm
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:shadow-md
                  "
                >
                  <div className="flex items-start justify-between">
                    <div className="rounded-xl bg-bronze/10 p-3">
                      <Icon className="h-5 w-5 text-bronze" />
                    </div>

                    <ArrowRight
                      className="
                        h-4 w-4
                        text-espresso/20
                        transition-transform
                        group-hover:translate-x-1
                        group-hover:text-bronze
                      "
                    />
                  </div>

                  <p className="mt-6 text-sm text-espresso/60">
                    {metric.label}
                  </p>

                  <p className="mt-1 font-serif text-3xl font-semibold text-espresso">
                    {loading
                      ? "—"
                      : metric.value.toLocaleString()}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-espresso/45">
                    {metric.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}