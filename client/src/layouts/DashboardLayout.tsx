import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

import {
  LayoutDashboard,
  Hotel,
  BedDouble,
  ClipboardList,
  CalendarCheck,
  DollarSign,
  Star,
  Settings,
  Users,
  ShieldCheck,
  Flag,
  Activity,
  LogOut,
  Menu,
  X,
  Compass,
  type LucideIcon,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "owner" | "admin";
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  operational?: boolean;
}

/* =========================================================
   OWNER NAVIGATION
========================================================= */

const ownerNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/owner",
    icon: LayoutDashboard,
  },
  {
    label: "Hotels",
    href: "/owner/hotels",
    icon: Hotel,
  },
  {
    label: "Rooms",
    href: "/owner/rooms",
    icon: BedDouble,
    operational: true,
  },
  {
    label: "Inventory",
    href: "/owner/inventory",
    icon: ClipboardList,
    operational: true,
  },
  {
    label: "Bookings",
    href: "/owner/bookings",
    icon: CalendarCheck,
    operational: true,
  },
  {
    label: "Revenue",
    href: "/owner/revenue",
    icon: DollarSign,
  },
  {
    label: "Reviews",
    href: "/owner/reviews",
    icon: Star,
  },
  {
    label: "Verification",
    href: "/owner/verification",
    icon: ShieldCheck,
  },
  {
    label: "Settings",
    href: "/owner/settings",
    icon: Settings,
  },
];

/* =========================================================
   ADMIN NAVIGATION
========================================================= */

const adminNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Hotels",
    href: "/admin/hotels",
    icon: Hotel,
  },
  {
    label: "Verifications",
    href: "/admin/verification",
    icon: ShieldCheck,
  },
  {
    label: "Reviews",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: Flag,
  },
  {
    label: "Activity",
    href: "/admin/activity",
    icon: Activity,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  const { logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const isOwnerDashboard =
    role === "owner" &&
    location === "/owner";

  const baseNavItems =
    role === "owner"
      ? ownerNavItems
      : adminNavItems;

  const navItems =
    role === "owner" && isOwnerDashboard
      ? baseNavItems.filter(
          (item) => !item.operational,
        )
      : baseNavItems;

  const getPageTitle = () => {
    const matchedItem = navItems
      .filter((item) => {
        if (location === item.href) {
          return true;
        }

        if (
          item.href === "/owner" ||
          item.href === "/admin"
        ) {
          return false;
        }

        return location.startsWith(
          `${item.href}/`,
        );
      })
      .sort(
        (a, b) =>
          b.href.length - a.href.length,
      )[0];

    return matchedItem?.label ?? "Dashboard";
  };

  const handleNavigation = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed
          md:sticky
          top-0
          left-0
          h-screen
          w-72
          bg-white
          border-r
          border-warm-stone/30
          z-50
          transform
          transition-transform
          duration-300
          ease-out
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* =================================================
              BRAND
          ================================================== */}

          <div className="px-6 py-5 border-b border-warm-stone/30">
            <Link
              href="/"
              onClick={handleNavigation}
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <Compass className="w-7 h-7 text-bronze" />

                <span className="font-serif text-lg font-bold text-espresso">
                  BookMyStay
                </span>
              </div>
            </Link>

            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
              {role === "owner"
                ? "Owner Panel"
                : "Admin Panel"}
            </p>
          </div>

          {/* =================================================
              NAVIGATION
          ================================================== */}

          <nav className="flex-1 py-4 px-3 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                location === item.href ||
                (item.href !== "/owner" &&
                  item.href !== "/admin" &&
                  location.startsWith(
                    `${item.href}/`,
                  ));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavigation}
                >
                  <button
                    type="button"
                    className={`
                      w-full
                      flex
                      items-center
                      gap-3
                      px-4
                      py-2.5
                      rounded-lg
                      text-sm
                      font-medium
                      transition-all
                      duration-200
                      mb-0.5
                      ${
                        isActive
                          ? "bg-bronze/10 text-bronze"
                          : "text-espresso/70 hover:bg-cream hover:text-espresso"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 shrink-0" />

                    <span>
                      {item.label}
                    </span>
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* =================================================
              BOTTOM ACTIONS
          ================================================== */}

          <div className="p-4 border-t border-warm-stone/30">
            <Link
              href="/"
              onClick={handleNavigation}
            >
              <button
                type="button"
                className="
                  w-full
                  flex
                  items-center
                  gap-3
                  px-4
                  py-2.5
                  rounded-lg
                  text-sm
                  font-medium
                  text-espresso/70
                  hover:bg-cream
                  hover:text-espresso
                  transition-all
                "
              >
                <Compass className="w-5 h-5" />

                View Site
              </button>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="
                w-full
                flex
                items-center
                gap-3
                px-4
                py-2.5
                rounded-lg
                text-sm
                font-medium
                text-red-600
                hover:bg-red-50
                transition-all
                mt-1
              "
            >
              <LogOut className="w-5 h-5" />

              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================
          MAIN AREA
      ====================================================== */}

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* =================================================
            TOP BAR
        ================================================== */}

        <header
          className="
            sticky
            top-0
            z-30
            bg-white/80
            backdrop-blur-xl
            border-b
            border-warm-stone/30
            px-4
            md:px-8
            py-4
          "
        >
          <div className="flex items-center justify-between">
            {/* Mobile menu */}

            <button
              type="button"
              className="
                md:hidden
                p-2
                -ml-2
                text-espresso
                rounded-lg
                hover:bg-cream
                transition-colors
              "
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop title */}

            <div className="hidden md:block">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {role === "owner"
                  ? "Partner portal"
                  : "Administration"}
              </p>

              <h2 className="font-serif text-xl font-semibold text-espresso mt-0.5">
                {getPageTitle()}
              </h2>
            </div>

            {/* Mobile close */}

            <button
              type="button"
              className="
                md:hidden
                p-2
                -mr-2
                text-espresso
                rounded-lg
                hover:bg-cream
                transition-colors
              "
              onClick={() =>
                setSidebarOpen(false)
              }
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================== */}

        <main className="flex-1 p-4 md:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}