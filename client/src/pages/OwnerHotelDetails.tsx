import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useRoute,
} from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarCheck,
  BedDouble,
  CheckCircle2,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Power,
  RefreshCcw,
  Trash2,
  Warehouse,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  ownerHotelsApi,
  type OwnerHotelResponse,
} from "@/api/ownerHotels";

export default function OwnerHotelDetails() {
  const [, setLocation] = useLocation();

  /*
   * IMPORTANT:
   * Get hotelId directly from the Wouter route.
   *
   * /owner/hotels/:hotelId
   */
  const [, params] = useRoute(
    "/owner/hotels/:hotelId"
  );

  const hotelId = Number(params?.hotelId);

  const [hotel, setHotel] =
    useState<OwnerHotelResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activating, setActivating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* =====================================================
     LOAD HOTEL
  ====================================================== */

  const loadHotel = async (
    showRefresh = false
  ) => {
    if (!hotelId || Number.isNaN(hotelId)) {
      console.error(
        "Invalid hotel ID:",
        params?.hotelId
      );

      setHotel(null);
      setLoading(false);
      return;
    }

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log(
        "Loading owner hotel:",
        hotelId
      );

      const response =
        await ownerHotelsApi.getById(hotelId);

      console.log(
        "Owner hotel API response:",
        response
      );

      console.log(
        "Owner hotel data:",
        response.data
      );

      setHotel(response.data);
    } catch (error: any) {
      console.error(
        "Owner hotel request failed:",
        error
      );

      setHotel(null);

      toast.error(
        error?.response?.data?.message ||
          "Unable to load property."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHotel();
  }, [hotelId]);

  /* =====================================================
     ACTIVATE
  ====================================================== */

  const handleActivate = async () => {
    if (!hotel) return;

    try {
      setActivating(true);

      await ownerHotelsApi.activate(
        hotel.id
      );

      toast.success(
        "Property activated successfully."
      );

      await loadHotel(true);
    } catch (error: any) {
      console.error(
        "Activate hotel failed:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to activate property."
      );
    } finally {
      setActivating(false);
    }
  };

  /* =====================================================
     DELETE
  ====================================================== */

  const handleDelete = async () => {
    if (!hotel) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${hotel.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await ownerHotelsApi.delete(
        hotel.id
      );

      toast.success(
        "Property deleted successfully."
      );

      setLocation("/owner/hotels");
    } catch (error: any) {
      console.error(
        "Delete hotel failed:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to delete property."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =====================================================
     LOADING
  ====================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <HotelHeader />

        <main className="max-w-7xl mx-auto px-5 md:px-8 py-10">
          <div className="h-5 w-36 rounded bg-warm-stone/20 animate-pulse" />

          <div className="mt-6 h-48 rounded-2xl bg-white border border-warm-stone/20 animate-pulse" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-44 rounded-2xl bg-white border border-warm-stone/20 animate-pulse"
              />
            ))}
          </div>

          <div className="mt-6 h-72 rounded-2xl bg-white border border-warm-stone/20 animate-pulse" />
        </main>
      </div>
    );
  }

  /* =====================================================
     INVALID / NOT FOUND
  ====================================================== */

  if (!hotel) {
    return (
      <div className="min-h-screen bg-cream">
        <HotelHeader />

        <main className="max-w-5xl mx-auto px-5 md:px-8 py-16">
          <div className="bg-white border border-warm-stone/20 rounded-2xl p-10 text-center">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>

            <h1 className="mt-5 font-serif text-2xl font-semibold text-espresso">
              Property not found
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              We couldn't load this property.
            </p>

            <button
              type="button"
              onClick={() =>
                setLocation("/owner/hotels")
              }
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-bronze hover:bg-bronze-dark text-white text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to properties
            </button>

          </div>
        </main>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ====================================================== */

  return (
    <div className="min-h-screen bg-cream">

      <HotelHeader />

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            setLocation("/owner/hotels")
          }
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-espresso transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to properties
        </button>

        {/* =================================================
            HOTEL HEADER
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mt-6 bg-white border border-warm-stone/20 rounded-2xl overflow-hidden"
        >
          <div className="p-6 md:p-8 lg:p-10">

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-7">

              <div className="flex gap-5">

                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-bronze/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-8 h-8 text-bronze" />
                </div>

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <h1 className="font-serif text-3xl md:text-4xl font-semibold text-espresso">
                      {hotel.name}
                    </h1>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        hotel.active
                          ? "bg-sage/10 text-sage"
                          : "bg-warm-stone/10 text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          hotel.active
                            ? "bg-sage"
                            : "bg-warm-stone"
                        }`}
                      />

                      {hotel.active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>

                  <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                    <MapPin className="w-4 h-4" />

                    <span>
                      {hotel.city}
                    </span>
                  </div>

                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={() =>
                    loadHotel(true)
                  }
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-warm-stone/30 bg-white hover:bg-cream text-sm font-medium text-espresso disabled:opacity-50"
                >
                  <RefreshCcw
                    className={`w-4 h-4 ${
                      refreshing
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setLocation(
                      `/owner/hotels/${hotel.id}/edit`
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-warm-stone/30 bg-white hover:bg-cream text-sm font-medium text-espresso"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>

                {!hotel.active && (
                  <button
                    type="button"
                    onClick={handleActivate}
                    disabled={activating}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bronze hover:bg-bronze-dark text-white text-sm font-semibold disabled:opacity-50"
                  >
                    <Power className="w-4 h-4" />

                    {activating
                      ? "Activating..."
                      : "Activate"}
                  </button>
                )}

              </div>

            </div>
          </div>
        </motion.section>

        {/* =================================================
            MANAGEMENT
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
          }}
          className="mt-6"
        >

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <ManagementCard
              icon={BedDouble}
              title="Rooms"
              description="Add and manage rooms belonging to this property."
              href={`/owner/${hotel.id}/rooms`}
            />

            <ManagementCard
              icon={Warehouse}
              title="Inventory"
              description="Manage room availability and inventory."
              href={`/owner/inventory?hotelId=${hotel.id}`}
            />

            <ManagementCard
              icon={CalendarCheck}
              title="Bookings"
              description="View bookings for this property."
              href={`/owner/hotels/${hotel.id}/bookings`}
            />

          </div>

        </motion.section>

        {/* =================================================
            PROPERTY INFORMATION
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
          }}
          className="mt-6 bg-white border border-warm-stone/20 rounded-2xl overflow-hidden"
        >

          <div className="px-6 md:px-8 py-5 border-b border-warm-stone/20">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-lg bg-bronze/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-bronze" />
              </div>

              <div>
                <h2 className="font-medium text-espresso">
                  Property information
                </h2>

                <p className="text-xs text-muted-foreground mt-1">
                  Basic information about your property
                </p>
              </div>

            </div>

          </div>

          <div className="p-6 md:p-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">

              <InfoItem
                label="Property name"
                value={hotel.name}
              />

              <InfoItem
                label="City"
                value={hotel.city}
              />

              <InfoItem
                label="Phone number"
                value={
                  hotel.hotelContactInfo?.phoneNumber ||
                  "—"
                }
                icon={Phone}
              />

              <InfoItem
                label="Email"
                value={
                  hotel.hotelContactInfo?.email ||
                  "—"
                }
                icon={Mail}
              />

              <div className="md:col-span-2">

                <InfoItem
                  label="Address"
                  value={
                    hotel.hotelContactInfo?.address ||
                    "—"
                  }
                  icon={MapPin}
                />

              </div>

            </div>

          </div>

        </motion.section>

        {/* =================================================
            STATUS
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
          className="mt-6 bg-white border border-warm-stone/20 rounded-2xl p-6 md:p-8"
        >

          <div className="flex items-start gap-4">

            <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-sage" />
            </div>

            <div>

              <h2 className="font-medium text-espresso">
                Property status
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                This property is currently{" "}
                <span className="font-medium text-espresso">
                  {hotel.active
                    ? "active"
                    : "inactive"}
                </span>
                .
              </p>

            </div>

          </div>

        </motion.section>

        {/* =================================================
            DELETE
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.25,
          }}
          className="mt-6 bg-white border border-red-200 rounded-2xl overflow-hidden"
        >

          <div className="px-6 md:px-8 py-5 border-b border-red-100">

            <h2 className="font-medium text-red-700">
              Property management
            </h2>

            <p className="text-xs text-red-500/80 mt-1">
              Destructive actions for this property
            </p>

          </div>

          <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

            <div>

              <p className="text-sm font-medium text-espresso">
                Delete property
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Permanently remove this property from
                your owner account.
              </p>

            </div>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />

              {deleting
                ? "Deleting..."
                : "Delete property"}
            </button>

          </div>

        </motion.section>

      </main>
    </div>
  );
}

/* =========================================================
   MANAGEMENT CARD
========================================================= */

function ManagementCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: typeof BedDouble;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="group h-full bg-white border border-warm-stone/20 rounded-2xl p-6 hover:border-bronze/30 hover:shadow-warm transition-all cursor-pointer">

        <div className="flex items-start justify-between gap-4">

          <div className="w-11 h-11 rounded-xl bg-bronze/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-bronze" />
          </div>

          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-bronze group-hover:translate-x-1 transition-all" />

        </div>

        <h2 className="mt-5 font-serif text-xl font-semibold text-espresso">
          {title}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

      </div>
    </Link>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof MapPin;
}) {
  return (
    <div>

      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
        {label}
      </p>

      <div className="mt-2 flex items-start gap-2">

        {Icon && (
          <Icon className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
        )}

        <p className="text-sm text-espresso break-words">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   HEADER
========================================================= */

function HotelHeader() {
  return (
    <header className="border-b border-warm-stone/20 bg-white/90 backdrop-blur-xl">

      <div className="max-w-7xl mx-auto h-20 px-5 md:px-8 flex items-center justify-between">

        <Link href="/owner">

          <div className="flex items-center gap-3 cursor-pointer">

            <div className="w-9 h-9 rounded-xl bg-bronze/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-bronze" />
            </div>

            <div>

              <p className="font-serif text-lg font-bold text-espresso leading-none">
                BookMyStay
              </p>

              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mt-1">
                Partner portal
              </p>

            </div>

          </div>

        </Link>

        <Link href="/owner/hotels">

          <span className="text-sm text-espresso/65 hover:text-espresso transition-colors">
            Properties
          </span>

        </Link>

      </div>

    </header>
  );
}