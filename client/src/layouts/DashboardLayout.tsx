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
  LogOut,
  Menu,
  X,
  Compass,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "owner" | "admin";
}

const ownerNavItems = [
  { label: "Dashboard", href: "/owner", icon: LayoutDashboard },
  { label: "Hotels", href: "/owner/hotels", icon: Hotel },
  { label: "Rooms", href: "/owner/rooms", icon: BedDouble },
  { label: "Inventory", href: "/owner/inventory", icon: ClipboardList },
  { label: "Bookings", href: "/owner/bookings", icon: CalendarCheck },
  { label: "Revenue", href: "/owner/revenue", icon: DollarSign },
  { label: "Reviews", href: "/owner/reviews", icon: Star },
  { label: "Verification", href: "/owner/verification", icon: ShieldCheck },
  { label: "Settings", href: "/owner/settings", icon: Settings },
];

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Verifications", href: "/admin/verification", icon: ShieldCheck },
  { label: "Hotels", href: "/admin/hotels", icon: Hotel },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Moderation", href: "/admin/moderation", icon: ShieldCheck },
];

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = role === "owner" ? ownerNavItems : adminNavItems;

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-white border-r border-warm-stone/30 z-50 transform transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-warm-stone/30">
            <Link href="/">
              <div className="flex items-center gap-2">
                <Compass className="w-7 h-7 text-bronze" />
                <span className="font-serif text-lg font-bold text-espresso">
                  BookMyStay
                </span>
              </div>
            </Link>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
              {role === "owner" ? "Owner Panel" : "Admin Panel"}
            </p>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 py-4 px-3 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                location === item.href ||
                (item.href !== "/owner" && item.href !== "/admin" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mb-0.5 ${
                      isActive
                        ? "bg-bronze/10 text-bronze"
                        : "text-espresso/70 hover:bg-cream hover:text-espresso"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-warm-stone/30">
            <Link href="/">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-espresso/70 hover:bg-cream hover:text-espresso transition-all">
                <Compass className="w-5 h-5" />
                View Site
              </button>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all mt-1"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-warm-stone/30 px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              className="md:hidden p-2 text-espresso"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:block">
              <h2 className="font-serif text-xl font-semibold text-espresso">
                {navItems.find((n) => location === n.href)?.label || "Dashboard"}
              </h2>
            </div>
            <button
              className="md:hidden p-2 text-espresso"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
