import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BedDouble,
  Building2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Hotel,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

interface OwnerLayoutProps {
  children: ReactNode;
}

const navigation = [
  {
    label: "Dashboard",
    href: "/owner",
    icon: LayoutDashboard,
  },
  {
    label: "My Hotels",
    href: "/owner/hotels",
    icon: Building2,
  },
  {
    label: "Rooms",
    href: "/owner/rooms",
    icon: BedDouble,
  },
  {
    label: "Inventory",
    href: "/owner/inventory",
    icon: ClipboardList,
  },
  {
    label: "Bookings",
    href: "/owner/bookings",
    icon: CalendarCheck,
  },
  {
    label: "Revenue",
    href: "/owner/revenue",
    icon: BarChart3,
  },
  {
    label: "Expenses",
    href: "/owner/expenses",
    icon: CircleDollarSign,
  },
  {
    label: "Reviews",
    href: "/owner/reviews",
    icon: MessageSquare,
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

export default function OwnerLayout({
  children,
}: OwnerLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/owner") {
      return location === "/owner";
    }

    return (
      location === href ||
      location.startsWith(`${href}/`)
    );
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-cream text-espresso">
      {/* =====================================================
          MOBILE HEADER
      ====================================================== */}

      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-16 bg-white/95 backdrop-blur-xl border-b border-warm-stone/20">
        <div className="h-full px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open owner navigation"
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-cream transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/owner">
            <div className="flex items-center gap-2">
              <Hotel className="w-5 h-5 text-bronze" />

              <span className="font-serif text-lg font-bold">
                BookMyStay
              </span>
            </div>
          </Link>

          <div className="w-10" />
        </div>
      </header>

      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside
        className={`hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col bg-white border-r border-warm-stone/20 transition-all duration-300 ${
          collapsed ? "w-[76px]" : "w-[260px]"
        }`}
      >
        {/* Brand */}

        <div
          className={`h-20 flex items-center border-b border-warm-stone/15 ${
            collapsed
              ? "justify-center px-3"
              : "px-6"
          }`}
        >
          <Link href="/owner">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-bronze/10 flex items-center justify-center shrink-0">
                <Hotel className="w-5 h-5 text-bronze" />
              </div>

              {!collapsed && (
                <div>
                  <div className="font-serif font-bold text-lg leading-none">
                    BookMyStay
                  </div>

                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mt-1">
                    Owner Portal
                  </div>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Navigation */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                >
                  <div
                    className={`relative group flex items-center gap-3 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                      collapsed
                        ? "justify-center px-3 py-3"
                        : "px-3 py-2.5"
                    } ${
                      active
                        ? "bg-bronze/10 text-bronze"
                        : "text-espresso/65 hover:bg-cream hover:text-espresso"
                    }`}
                    title={
                      collapsed
                        ? item.label
                        : undefined
                    }
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-bronze rounded-r-full" />
                    )}

                    <Icon
                      className={`w-[18px] h-[18px] shrink-0 ${
                        active
                          ? "text-bronze"
                          : "text-espresso/45 group-hover:text-espresso"
                      }`}
                    />

                    {!collapsed && (
                      <span>{item.label}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User */}

        <div className="border-t border-warm-stone/15 p-3">
          {!collapsed && user && (
            <div className="px-3 py-3 mb-2 rounded-xl bg-cream/60">
              <p className="text-sm font-medium truncate">
                {user.name}
              </p>

              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {user.email}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 rounded-xl text-sm text-espresso/60 hover:text-red-600 hover:bg-red-50 transition-colors ${
              collapsed
                ? "justify-center px-3 py-3"
                : "px-3 py-2.5"
            }`}
            title={
              collapsed
                ? "Logout"
                : undefined
            }
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />

            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse button */}

        <button
          type="button"
          onClick={() =>
            setCollapsed((value) => !value)
          }
          aria-label={
            collapsed
              ? "Expand navigation"
              : "Collapse navigation"
          }
          className="absolute -right-3 top-[76px] w-6 h-6 rounded-full bg-white border border-warm-stone/25 shadow-sm flex items-center justify-center text-muted-foreground hover:text-espresso transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </aside>

      {/* =====================================================
          MOBILE DRAWER
      ====================================================== */}

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25 }}
              className="lg:hidden fixed inset-y-0 left-0 z-[60] w-[280px] bg-white flex flex-col shadow-xl"
            >
              {/* Header */}

              <div className="h-20 px-5 flex items-center justify-between border-b border-warm-stone/15">
                <Link
                  href="/owner"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-bronze/10 flex items-center justify-center">
                      <Hotel className="w-5 h-5 text-bronze" />
                    </div>

                    <div>
                      <div className="font-serif font-bold text-lg leading-none">
                        BookMyStay
                      </div>

                      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mt-1">
                        Owner Portal
                      </div>
                    </div>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  aria-label="Close owner navigation"
                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-cream"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}

              <nav className="flex-1 overflow-y-auto px-4 py-5">
                <div className="space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const active =
                      isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() =>
                          setMobileOpen(false)
                        }
                      >
                        <div
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                            active
                              ? "bg-bronze/10 text-bronze"
                              : "text-espresso/65 hover:bg-cream hover:text-espresso"
                          }`}
                        >
                          <Icon className="w-[18px] h-[18px]" />

                          <span>
                            {item.label}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* User */}

              <div className="border-t border-warm-stone/15 p-4">
                {user && (
                  <div className="px-3 py-3 mb-2 rounded-xl bg-cream/60">
                    <p className="text-sm font-medium truncate">
                      {user.name}
                    </p>

                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-espresso/60 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* =====================================================
          PAGE CONTENT
      ====================================================== */}

      <main
        className={`min-h-screen pt-16 lg:pt-0 transition-[margin] duration-300 ${
          collapsed
            ? "lg:ml-[76px]"
            : "lg:ml-[260px]"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}