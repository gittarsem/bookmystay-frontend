import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";

import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchResults from "./pages/SearchResults";
import HotelDetails from "./pages/HotelDetails";
import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import BookingFailed from "./pages/BookingFailed";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyBookings from "./pages/MyBookings";
import BookingDetails from "./pages/BookingDetails";


import EditReview from "@/pages/EditReview";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerHotels from "./pages/OwnerHotels";
import OwnerRooms from "./pages/OwnerRooms";
import OwnerInventory from "./pages/OwnerInventory";
import OwnerBookings from "./pages/OwnerBookings";
import OwnerVerification from "./pages/OwnerVerification";
import OwnerRevenue from "./pages/OwnerRevenue";
import OwnerSettings from "./pages/OwnerSettings";
import ManageGuests from "./pages/ManageGuests";
import AdminDashboard from "./pages/AdminDashboard";
import AdminHotels from "./pages/AdminHotels";
import AdminUsers from "./pages/AdminUsers";
import AdminVerification from "./pages/AdminVerification";

import About from "./pages/About";
import Contact from "./pages/Contact";
import ListingForOwners from "./pages/ListingForOwners";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

import NotFound from "./pages/NotFound";
import WriteReview from "./pages/WriteReview";

function Router() {
  return (
    <Switch>

      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/search" component={SearchResults} />
      <Route path="/hotel/:hotelId" component={HotelDetails} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/list-property" component={ListingForOwners} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />

      {/* User */}
      <Route path="/booking/:bookingId" component={Booking} />

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

      <Route
        path="/my-bookings"
        component={MyBookings}
      />

      <Route
        path="/my-bookings/:bookingId/review"
        component={WriteReview}
      />

      <Route
        path="/my-bookings/review/:reviewId/edit"
        component={EditReview}
      />

      <Route
        path="/my-bookings/:bookingId"
        component={BookingDetails}
      />

      {/* Owner */}
      <Route path="/owner" component={OwnerDashboard} />
      <Route path="/owner/hotels" component={OwnerHotels} />
      <Route path="/owner/rooms" component={OwnerRooms} />
      <Route path="/owner/inventory" component={OwnerInventory} />
      <Route path="/owner/bookings" component={OwnerBookings} />
      <Route path="/owner/verification" component={OwnerVerification} />
      <Route path="/owner/revenue" component={OwnerRevenue} />
      <Route path="/owner/settings" component={OwnerSettings} />
      <Route
        path="/my-bookings/:bookingId/review"
        component={WriteReview}
      />
      {/* Admin */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/hotels" component={AdminHotels} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/verification" component={AdminVerification} />

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />

    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster richColors position="top-right" />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;