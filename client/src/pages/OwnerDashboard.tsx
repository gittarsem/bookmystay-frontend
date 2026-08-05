import { motion } from "framer-motion";
import {
  DollarSign,
  CalendarCheck,
  Star,
  TrendingUp,
  Building2,
  BedDouble,
  Users,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardSkeleton } from "@/components/Skeleton";

const stats = [
  {
    label: "Total Revenue",
    value: "₹12,45,000",
    change: "+12.5%",
    icon: DollarSign,
    color: "bg-green-50 text-green-600",
  },
  {
    label: "Active Bookings",
    value: "34",
    change: "+3",
    icon: CalendarCheck,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Average Rating",
    value: "4.8",
    change: "+0.2",
    icon: Star,
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    label: "Occupancy Rate",
    value: "78%",
    change: "+5%",
    icon: TrendingUp,
    color: "bg-purple-50 text-purple-600",
  },
  {
    label: "Total Hotels",
    value: "3",
    change: "+1",
    icon: Building2,
    color: "bg-bronze/10 text-bronze",
  },
  {
    label: "Total Rooms",
    value: "24",
    change: "+2",
    icon: BedDouble,
    color: "bg-sage/10 text-sage",
  },
];

const recentBookings = [
  { id: "BK-001", hotel: "The Amanbagh Resort", guest: "Priya Sharma", amount: "₹75,000", status: "Confirmed", date: "Mar 15, 2025" },
  { id: "BK-002", hotel: "Wildflower Hall", guest: "Rahul Verma", amount: "₹54,000", status: "Pending", date: "Mar 18, 2025" },
  { id: "BK-003", hotel: "The Amanbagh Resort", guest: "Ananya Patel", amount: "₹1,20,000", status: "Confirmed", date: "Mar 20, 2025" },
  { id: "BK-004", hotel: "Raas Jodhpur", guest: "Vikram Singh", amount: "₹45,000", status: "Completed", date: "Mar 10, 2025" },
];

const recentReviews = [
  { guest: "Priya Sharma", rating: 5, comment: "Absolutely stunning property. The attention to detail is remarkable.", date: "Mar 15, 2025" },
  { guest: "Rahul Verma", rating: 5, comment: "The spa experience here is world-class.", date: "Mar 12, 2025" },
  { guest: "Ananya Patel", rating: 4, comment: "Beautiful resort with incredible views.", date: "Mar 8, 2025" },
];

export default function OwnerDashboard() {
  return (
    <ProtectedRoute requiredRole="ROLE_OWNER">
      <DashboardLayout role="owner">
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-warm border border-warm-stone/20"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-espresso">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                <p className="text-xs text-sage font-medium mt-1">{stat.change} this month</p>
              </motion.div>
            ))}
          </div>

          {/* Recent Bookings & Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-warm border border-warm-stone/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-warm-stone/20">
                <h3 className="font-serif text-lg font-semibold text-espresso">Recent Bookings</h3>
              </div>
              <div className="divide-y divide-warm-stone/20">
                {recentBookings.map((b) => (
                  <div key={b.id} className="px-6 py-4 hover:bg-cream/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-espresso">{b.guest}</p>
                        <p className="text-xs text-muted-foreground">{b.hotel} • {b.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-espresso">{b.amount}</p>
                        <span className={`text-xs font-medium ${
                          b.status === "Confirmed" ? "text-green-600" :
                          b.status === "Pending" ? "text-yellow-600" : "text-blue-600"
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-xl shadow-warm border border-warm-stone/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-warm-stone/20">
                <h3 className="font-serif text-lg font-semibold text-espresso">Recent Reviews</h3>
              </div>
              <div className="divide-y divide-warm-stone/20">
                {recentReviews.map((r, i) => (
                  <div key={i} className="px-6 py-4 hover:bg-cream/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-bronze/10 flex items-center justify-center shrink-0">
                        <span className="text-bronze text-xs font-semibold">{r.guest.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-espresso">{r.guest}</p>
                          <div className="flex gap-0.5">
                            {Array.from({ length: r.rating }).map((_, j) => (
                              <Star key={j} className="w-3 h-3 fill-bronze text-bronze" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.comment}</p>
                        <p className="text-xs text-muted-foreground mt-1">{r.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
