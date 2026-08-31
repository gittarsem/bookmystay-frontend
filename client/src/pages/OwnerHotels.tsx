import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Building2,
  Plus,
  RefreshCcw,
  Hotel,
  MapPin,
  BedDouble,
  CalendarCheck,
  Power,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import {
  ownerHotelsApi,
  type OwnerHotelResponse,
} from "@/api/ownerHotels";

export default function OwnerHotels() {
  const [hotels, setHotels] = useState<OwnerHotelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const loadHotels = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await ownerHotelsApi.getMyHotels();

      setHotels(response.data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to load your properties."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const handleActivate = async (hotelId: number) => {
    try {
      setActionId(hotelId);

      await ownerHotelsApi.activate(hotelId);

      toast.success("Property activated successfully.");

      await loadHotels(true);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to activate property."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (hotelId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(hotelId);

      await ownerHotelsApi.delete(hotelId);

      toast.success("Property deleted successfully.");

      setHotels((current) =>
        current.filter(
          (hotel) => hotel.id !== hotelId
        )
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to delete property."
      );
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return <HotelsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-cream">
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

          <Link href="/owner">
            <button
              type="button"
              className="text-sm text-espresso/65 hover:text-espresso transition-colors"
            >
              Dashboard
            </button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12">
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-5"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-bronze font-semibold">
              Property management
            </p>

            <h1 className="mt-3 font-serif text-4xl md:text-5xl font-semibold text-espresso">
              Your properties
            </h1>

            <p className="mt-3 text-muted-foreground">
              Manage your hotels, rooms and property details.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadHotels(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-warm-stone/30 bg-white text-sm font-medium text-espresso hover:bg-cream transition-colors disabled:opacity-60"
            >
              <RefreshCcw
                className={`w-4 h-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />

              Refresh
            </button>

            <Link href="/owner/hotels/new">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bronze hover:bg-bronze-dark text-white text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add property
              </button>
            </Link>
          </div>
        </motion.div>

        {hotels.length === 0 ? (
          <EmptyHotels />
        ) : (
          <motion.div
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
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-9"
          >
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                actionId={actionId}
                onActivate={handleActivate}
                onDelete={handleDelete}
              />
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}

function HotelCard({
  hotel,
  actionId,
  onActivate,
  onDelete,
}: {
  hotel: OwnerHotelResponse;
  actionId: number | null;
  onActivate: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const busy = actionId === hotel.id;

  return (
    <div className="bg-white border border-warm-stone/20 rounded-2xl overflow-hidden hover:shadow-warm transition-shadow">
      <div className="h-52 bg-cream relative overflow-hidden">
        {hotel.imageUrl ? (
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Hotel className="w-12 h-12 text-bronze/50" />
          </div>
        )}

        <div className="absolute top-4 right-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md ${
              hotel.active
                ? "bg-white/90 text-sage"
                : "bg-white/90 text-muted-foreground"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                hotel.active
                  ? "bg-sage"
                  : "bg-warm-stone"
              }`}
            />

            {hotel.active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h2 className="font-serif text-xl font-semibold text-espresso truncate">
          {hotel.name}
        </h2>

        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 shrink-0" />

          <span className="truncate">
            {hotel.city}
          </span>
        </div>

        <div className="mt-5 pt-5 border-t border-warm-stone/15 grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <BedDouble className="w-4 h-4" />

              <span className="text-xs">
                Rooms
              </span>
            </div>

            <p className="mt-1 text-sm font-semibold text-espresso">
              {hotel.numberOfRooms}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarCheck className="w-4 h-4" />

              <span className="text-xs">
                Bookings
              </span>
            </div>

            <p className="mt-1 text-sm font-semibold text-espresso">
              —
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <Link
            href={`/owner/hotels/${hotel.id}`}
            className="flex-1"
          >
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-warm-stone/30 text-sm font-medium text-espresso hover:bg-cream transition-colors"
            >
              Manage

              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>

          {!hotel.active && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                onActivate(hotel.id)
              }
              className="px-3 py-2.5 rounded-xl bg-bronze hover:bg-bronze-dark text-white disabled:opacity-50 transition-colors"
              title="Activate property"
            >
              <Power className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            disabled={busy}
            onClick={() =>
              onDelete(hotel.id)
            }
            className="px-3 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
            title="Delete property"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyHotels() {
  return (
    <div className="mt-9 bg-white border border-warm-stone/20 rounded-2xl px-6 py-16 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-bronze/10 flex items-center justify-center">
        <Building2 className="w-7 h-7 text-bronze" />
      </div>

      <h2 className="mt-5 font-serif text-2xl font-semibold text-espresso">
        No properties yet
      </h2>

      <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground leading-relaxed">
        You haven't added a property yet. Create your
        first hotel listing to start managing rooms,
        inventory and bookings.
      </p>

      <Link href="/owner/hotels/new">
        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-bronze hover:bg-bronze-dark text-white text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add your first property
        </button>
      </Link>
    </div>
  );
}

function HotelsSkeleton() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-warm-stone/20 bg-white">
        <div className="max-w-7xl mx-auto h-20 px-5 md:px-8 flex items-center justify-between">
          <div className="h-9 w-36 bg-warm-stone/15 rounded-xl animate-pulse" />

          <div className="h-5 w-20 bg-warm-stone/15 rounded animate-pulse" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12">
        <div className="h-3 w-40 bg-warm-stone/20 rounded animate-pulse" />

        <div className="mt-4 h-12 w-72 bg-warm-stone/20 rounded animate-pulse" />

        <div className="mt-3 h-5 w-96 max-w-full bg-warm-stone/20 rounded animate-pulse" />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-9">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[420px] bg-white border border-warm-stone/20 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </main>
    </div>
  );
}