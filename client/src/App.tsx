import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";

import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

/* =========================================================
   PUBLIC
========================================================= */

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchResults from "./pages/SearchResults";
import HotelDetails from "./pages/HotelDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import HelpCenter from "./pages/HelpCenter";
import ListingForOwners from "./pages/ListingForOwners";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

/* =========================================================
   BOOKING
========================================================= */

import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import BookingFailed from "./pages/BookingFailed";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyBookings from "./pages/MyBookings";
import BookingDetails from "./pages/BookingDetails";
import ManageGuests from "./pages/ManageGuests";

/* =========================================================
   REVIEWS
========================================================= */

import WriteReview from "./pages/WriteReview";
import EditReview from "./pages/EditReview";

/* =========================================================
   OWNER
========================================================= */

import OwnerApply from "./pages/OwnerApply";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerHotels from "./pages/OwnerHotels";
import OwnerRooms from "./pages/OwnerRooms";
import OwnerInventory from "./pages/OwnerInventory";
import OwnerBookings from "./pages/OwnerBookings";
import OwnerVerification from "./pages/OwnerVerification";
import OwnerVerificationResubmit from "./pages/OwnerVerificationResubmit";
import OwnerRevenue from "./pages/OwnerRevenue";
import OwnerSettings from "./pages/OwnerSettings";
import OwnerHotelCreate from "./pages/OwnerHotelCreate";
import OwnerHotelDetails from "./pages/OwnerHotelDetails";
import OwnerReviews from "./pages/OwnerReviews";

/* =========================================================
   ADMIN
========================================================= */

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHotels from "./pages/admin/AdminHotels";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVerification from "./pages/admin/AdminVerification";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminReports from "./pages/admin/AdminReports";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminSettings from "./pages/admin/AdminSettings";

import Profile from "./pages/Profile";

/* =========================================================
   ERROR
========================================================= */

import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      {/* =====================================================
          PUBLIC
      ====================================================== */}

      <Route
        path="/"
        component={Home}
      />

      <Route
        path="/login"
        component={Login}
      />

      <Route
        path="/register"
        component={Register}
      />

      <Route
        path="/search"
        component={SearchResults}
      />

      <Route
        path="/hotel/:hotelId"
        component={HotelDetails}
      />

      <Route
        path="/about"
        component={About}
      />

      <Route
        path="/contact"
        component={Contact}
      />

      <Route
        path="/help"
        component={HelpCenter}
      />

      <Route
        path="/list-property"
        component={ListingForOwners}
      />

      <Route
        path="/terms"
        component={Terms}
      />

      <Route
        path="/privacy"
        component={Privacy}
      />

      {/* =====================================================
          BOOKING
      ====================================================== */}

      <Route
        path="/booking/:bookingId"
        component={Booking}
      />

      <Route
        path="/booking-success/:bookingId"
        component={BookingSuccess}
      />

      <Route
        path="/booking-failed/:bookingId"
        component={BookingFailed}
      />

      <Route
        path="/booking/:bookingId/confirmation"
        component={BookingConfirmation}
      />

      {/* =====================================================
          MY BOOKINGS
      ====================================================== */}

      <Route
        path="/my-bookings"
        component={MyBookings}
      />

      <Route
        path="/my-bookings/:bookingId"
        component={BookingDetails}
      />

      <Route
        path="/my-bookings/:bookingId/guests"
        component={ManageGuests}
      />

      {/* =====================================================
          REVIEWS
      ====================================================== */}

      <Route
        path="/my-bookings/:bookingId/review"
        component={WriteReview}
      />

      <Route
        path="/my-bookings/review/:reviewId/edit"
        component={EditReview}
      />

      {/* =====================================================
          PROFILE
      ====================================================== */}

      <Route
        path="/profile"
        component={() => (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )}
      />

      {/* =====================================================
          OWNER ONBOARDING
      ====================================================== */}

      <Route
        path="/owner/apply"
        component={() => (
          <ProtectedRoute>
            <OwnerApply />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/owner/verification"
        component={() => (
          <ProtectedRoute>
            <OwnerVerification />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/owner/verification/resubmit"
        component={() => (
          <ProtectedRoute>
            <OwnerVerificationResubmit />
          </ProtectedRoute>
        )}
      />

      {/* =====================================================
          OWNER PORTAL
      ====================================================== */}

      <Route
        path="/owner"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_OWNER">
            <OwnerDashboard />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/owner/hotels"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_OWNER">
            <OwnerHotels />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/owner/hotels/new"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_OWNER">
            <OwnerHotelCreate />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/owner/hotels/:hotelId"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_OWNER">
            <OwnerHotelDetails />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/owner/rooms"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_OWNER">
            <OwnerRooms />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/owner/:hotelId/rooms"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_OWNER">
            <OwnerRooms />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/owner/inventory"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_OWNER">
            <OwnerInventory />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/owner/bookings"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_OWNER">
            <OwnerBookings />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/owner/hotels/:hotelId/bookings"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_OWNER">
            <OwnerBookings />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/owner/revenue"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_OWNER">
            <OwnerRevenue />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/owner/reviews"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_OWNER">
            <OwnerReviews />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/owner/settings"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_OWNER">
            <OwnerSettings />
          </ProtectedRoute>
        )}
      />

      {/* =====================================================
          ADMIN PORTAL
      ====================================================== */}

      <Route
        path="/admin"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/admin/users"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminUsers />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/admin/hotels"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminHotels />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/admin/verification"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminVerification />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/admin/reviews"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminReviews />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/admin/reports"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminReports />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/admin/activity"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminActivity />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/admin/settings"
        component={() => (
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminSettings />
          </ProtectedRoute>
        )}
      />

      {/* =====================================================
          404
      ====================================================== */}

      <Route
        path="/404"
        component={NotFound}
      />

      <Route
        component={NotFound}
      />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>

            <Toaster
              richColors
              position="top-right"
            />

            <Router />

          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;