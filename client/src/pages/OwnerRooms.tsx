import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useRoute,
} from "wouter";

import {
  BedDouble,
  Building2,
  CalendarDays,
  ChevronDown,
  Clock3,
  Edit2,
  Loader2,
  Plus,
  Settings2,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { toast } from "sonner";

import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

import { ownerHotelsApi } from "@/api/ownerHotels";
import { ownerRoomsApi } from "@/api/ownerRooms";

import { ownerRoomTypePricingApi } from "@/api/roomTypePricing";

import type {
  RoomType,
  RoomTypePricing,
} from "@/types";

import type { OwnerRoom } from "@/api/rooms";

/* =========================================================
   TYPES
========================================================= */

interface HotelOption {
  id: number;
  name: string;
  city: string;
  imageUrl?: string | null;
  numberOfRooms: number;
  active: boolean;
}

interface RoomForm {
  capacity: number;
  roomType: RoomType;
}

interface PricingForm {
  roomType: RoomType;
  hourlyPrice: number;
  dailyPrice: number;
}

interface PricingUpdateForm {
  hourlyPrice: number;
  dailyPrice: number;
}

/* =========================================================
   ROOM TYPES
========================================================= */

const ROOM_TYPES: RoomType[] = [
  "STANDARD",
  "DOUBLE",
  "DELUXE",
  "SUITE",
  "FAMILY",
];

/* =========================================================
   EMPTY FORMS
========================================================= */

const EMPTY_ROOM_FORM: RoomForm = {
  capacity: 1,
  roomType: "STANDARD",
};

const EMPTY_PRICING_FORM: PricingForm = {
  roomType: "STANDARD",
  hourlyPrice: 0,
  dailyPrice: 0,
};

const EMPTY_PRICING_UPDATE_FORM: PricingUpdateForm = {
  hourlyPrice: 0,
  dailyPrice: 0,
};

/* =========================================================
   HELPERS
========================================================= */

function formatRoomType(
  type: RoomType | string
): string {
  return type
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatPrice(
  value: number | string | null | undefined
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return numericValue.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  );
}

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return fallback;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function OwnerRooms() {
  const [, setLocation] =
    useLocation();

  const [matchWithHotel, params] =
    useRoute(
      "/owner/:hotelId/rooms"
    );

  /* =======================================================
     ROUTE HOTEL
  ======================================================= */

  const routeHotelId =
    matchWithHotel &&
    params?.hotelId
      ? Number(params.hotelId)
      : null;

  /* =======================================================
     HOTELS
  ======================================================= */

  const [hotels, setHotels] =
    useState<HotelOption[]>([]);

  const [
    selectedHotelId,
    setSelectedHotelId,
  ] = useState<number | null>(
    routeHotelId
  );

  const [
    loadingHotels,
    setLoadingHotels,
  ] = useState(true);

  /* =======================================================
     ROOMS
  ======================================================= */

  const [rooms, setRooms] =
    useState<OwnerRoom[]>([]);

  const [
    loadingRooms,
    setLoadingRooms,
  ] = useState(false);

  /* =======================================================
     PRICING
  ======================================================= */

  const [pricing, setPricing] =
    useState<RoomTypePricing[]>(
      []
    );

  const [
    loadingPricing,
    setLoadingPricing,
  ] = useState(false);

  /* =======================================================
     ROOM MODAL
  ======================================================= */

  const [roomModalOpen, setRoomModalOpen] =
    useState(false);

  const [editingRoom, setEditingRoom] =
    useState<OwnerRoom | null>(
      null
    );

  const [roomForm, setRoomForm] =
    useState<RoomForm>(
      EMPTY_ROOM_FORM
    );

  /* =======================================================
     PRICING MODAL
  ======================================================= */

  const [
    pricingModalOpen,
    setPricingModalOpen,
  ] = useState(false);

  const [
    editingPricing,
    setEditingPricing,
  ] = useState<RoomTypePricing | null>(
    null
  );

  const [
    pricingForm,
    setPricingForm,
  ] = useState<PricingForm>(
    EMPTY_PRICING_FORM
  );

  const [
    pricingUpdateForm,
    setPricingUpdateForm,
  ] =
    useState<PricingUpdateForm>(
      EMPTY_PRICING_UPDATE_FORM
    );

  /* =======================================================
     ACTION STATE
  ======================================================= */

  const [savingRoom, setSavingRoom] =
    useState(false);

  const [
    savingPricing,
    setSavingPricing,
  ] = useState(false);

  const [
    deletingRoomId,
    setDeletingRoomId,
  ] = useState<number | null>(
    null
  );

  const [
    deletingPricingId,
    setDeletingPricingId,
  ] = useState<number | null>(
    null
  );

  /* =========================================================
     LOAD HOTELS
  ========================================================= */

  useEffect(() => {
    loadHotels();
  }, []);

  /* =========================================================
     KEEP ROUTE HOTEL IN SYNC
  ========================================================= */

  useEffect(() => {
    if (routeHotelId !== null) {
      setSelectedHotelId(
        routeHotelId
      );
      return;
    }

    if (
      selectedHotelId !== null &&
      hotels.some(
        (hotel) =>
          hotel.id === selectedHotelId
      )
    ) {
      return;
    }

    if (hotels.length > 0) {
      setSelectedHotelId(
        hotels[0].id
      );
    }
  }, [
    routeHotelId,
    hotels,
    selectedHotelId,
  ]);

  /* =========================================================
     LOAD ROOMS + PRICING
  ========================================================= */

  useEffect(() => {
    if (selectedHotelId === null) {
      setRooms([]);
      setPricing([]);
      return;
    }

    loadHotelData(
      selectedHotelId
    );
  }, [selectedHotelId]);

  /* =========================================================
     LOAD HOTELS
  ========================================================= */

  async function loadHotels() {
    try {
      setLoadingHotels(true);

      const response =
        await ownerHotelsApi.getMyHotels();

      const data =
        response.data ?? [];

      setHotels(data);

      if (
        data.length > 0 &&
        routeHotelId === null &&
        selectedHotelId === null
      ) {
        setSelectedHotelId(
          data[0].id
        );
      }
    } catch (error) {
      console.error(
        "Failed to load owner hotels:",
        error
      );

      setHotels([]);

      toast.error(
        getErrorMessage(
          error,
          "Unable to load your properties."
        )
      );
    } finally {
      setLoadingHotels(false);
    }
  }

  /* =========================================================
     LOAD ROOMS + PRICING
  ========================================================= */

  async function loadHotelData(
    hotelId: number
  ) {
    setLoadingRooms(true);
    setLoadingPricing(true);

    try {
      /*
       * IMPORTANT:
       *
       * These are the existing APIs.
       *
       * Rooms:
       * ownerRoomsApi.getAll(hotelId)
       *
       * Pricing:
       * ownerRoomTypePricingApi.getAll(hotelId)
       */

      const [
        roomsResponse,
        pricingResponse,
      ] = await Promise.all([
        ownerRoomsApi.getAll(
          hotelId
        ),
        ownerRoomTypePricingApi.getAll(
          hotelId
        ),
      ]);

      setRooms(
        roomsResponse.data ?? []
      );

      setPricing(
        pricingResponse.data ?? []
      );
    } catch (error) {
      console.error(
        "Failed to load room data:",
        error
      );

      /*
       * If nothing exists, show an empty
       * state instead of crashing.
       */
      setRooms([]);
      setPricing([]);

      toast.error(
        getErrorMessage(
          error,
          "Unable to load rooms and pricing."
        )
      );
    } finally {
      setLoadingRooms(false);
      setLoadingPricing(false);
    }
  }

  /* =========================================================
     HOTEL CHANGE
  ========================================================= */

  function handleHotelChange(
    hotelId: number
  ) {
    setSelectedHotelId(
      hotelId
    );

    closeRoomModal();
    closePricingModal();

    setLocation(
      `/owner/${hotelId}/rooms`
    );
  }

  /* =========================================================
     SELECTED HOTEL
  ========================================================= */

  const selectedHotel =
    useMemo(
      () =>
        hotels.find(
          (hotel) =>
            hotel.id ===
            selectedHotelId
        ),
      [
        hotels,
        selectedHotelId,
      ]
    );

  /* =========================================================
     PRICING LOOKUP
  ========================================================= */

  const pricingByRoomType =
    useMemo(() => {
      return new Map(
        pricing.map(
          (item) => [
            item.roomType,
            item,
          ]
        )
      );
    }, [pricing]);

  /* =========================================================
     CONFIGURED ROOM TYPES
  ========================================================= */

  const configuredRoomTypes =
    useMemo(() => {
      return new Set(
        pricing.map(
          (item) =>
            item.roomType
        )
      );
    }, [pricing]);

  /* =========================================================
     ROOM COUNTS
  ========================================================= */

  const roomTypeCounts =
    useMemo(() => {
      return ROOM_TYPES.map(
        (type) => ({
          type,
          count: rooms.filter(
            (room) =>
              room.roomType === type
          ).length,
        })
      );
    }, [rooms]);

  /* =========================================================
     OPEN CREATE PRICING
  ========================================================= */

  function openCreatePricing(roomType?: RoomType) {
  /*
   * If a specific room type was requested
   * (for example Deluxe), use that type.
   */
  if (roomType) {
    if (configuredRoomTypes.has(roomType)) {
      toast.error(
        `${formatRoomType(roomType)} pricing already exists.`
      );
      return;
    }

    setEditingPricing(null);

    setPricingForm({
      roomType,
      hourlyPrice: 0,
      dailyPrice: 0,
    });

    setPricingUpdateForm(
      EMPTY_PRICING_UPDATE_FORM
    );

    setPricingModalOpen(true);

    return;
  }

  /*
   * When clicking the global "Configure pricing"
   * button, NEVER default to STANDARD.
   *
   * Find the first room type that doesn't have
   * pricing configured yet.
   */
  const nextUnconfiguredType = ROOM_TYPES.find(
    (type) => !configuredRoomTypes.has(type)
  );

  if (!nextUnconfiguredType) {
    toast.info(
      "Pricing is already configured for all room types."
    );
    return;
  }

  setEditingPricing(null);

  setPricingForm({
    roomType: nextUnconfiguredType,
    hourlyPrice: 0,
    dailyPrice: 0,
  });

  setPricingUpdateForm(
    EMPTY_PRICING_UPDATE_FORM
  );

  setPricingModalOpen(true);
}

  /* =========================================================
     OPEN EDIT PRICING
  ========================================================= */

  function openEditPricing(
    item: RoomTypePricing
  ) {
    setEditingPricing(item);

    setPricingUpdateForm({
      hourlyPrice:
        Number(
          item.hourlyPrice
        ),
      dailyPrice:
        Number(
          item.dailyPrice
        ),
    });

    setPricingModalOpen(true);
  }

  /* =========================================================
     CLOSE PRICING
  ========================================================= */

  function closePricingModal() {
    if (savingPricing) {
      return;
    }

    setPricingModalOpen(false);

    setEditingPricing(null);

    setPricingForm(
      EMPTY_PRICING_FORM
    );

    setPricingUpdateForm(
      EMPTY_PRICING_UPDATE_FORM
    );
  }

  /* =========================================================
     SUBMIT PRICING
  ========================================================= */

  async function handlePricingSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (selectedHotelId === null) {
      toast.error(
        "Please select a property."
      );
      return;
    }

    const hourlyPrice =
      editingPricing
        ? Number(
            pricingUpdateForm.hourlyPrice
          )
        : Number(
            pricingForm.hourlyPrice
          );

    const dailyPrice =
      editingPricing
        ? Number(
            pricingUpdateForm.dailyPrice
          )
        : Number(
            pricingForm.dailyPrice
          );

    if (
      !Number.isFinite(
        hourlyPrice
      ) ||
      !Number.isFinite(
        dailyPrice
      )
    ) {
      toast.error(
        "Please enter valid prices."
      );
      return;
    }

    if (
      hourlyPrice < 0 ||
      dailyPrice < 0
    ) {
      toast.error(
        "Prices cannot be negative."
      );
      return;
    }

    if (
      hourlyPrice === 0 &&
      dailyPrice === 0
    ) {
      toast.error(
        "At least one price must be greater than zero."
      );
      return;
    }

    if (!editingPricing) {
      if (
        configuredRoomTypes.has(
          pricingForm.roomType
        )
      ) {
        toast.error(
          `${formatRoomType(
            pricingForm.roomType
          )} pricing already exists.`
        );

        return;
      }
    }

    setSavingPricing(true);

    try {
      if (editingPricing) {
        /*
         * Existing API.
         */
        await ownerRoomTypePricingApi.update(
          selectedHotelId,
          editingPricing.id,
          {
            hourlyPrice,
            dailyPrice,
          }
        );

        toast.success(
          "Room-type pricing updated."
        );
      } else {
        /*
         * Existing API.
         */
        await ownerRoomTypePricingApi.create(
          selectedHotelId,
          {
            roomType:
              pricingForm.roomType,
            hourlyPrice,
            dailyPrice,
          }
        );

        toast.success(
          "Room-type pricing created."
        );
      }

      closePricingModal();

      await loadHotelData(
        selectedHotelId
      );
    } catch (error) {
      console.error(
        "Failed to save pricing:",
        error
      );

      toast.error(
        getErrorMessage(
          error,
          "Unable to save pricing."
        )
      );
    } finally {
      setSavingPricing(false);
    }
  }

  /* =========================================================
     DELETE PRICING
  ========================================================= */

  async function handleDeletePricing(
    item: RoomTypePricing
  ) {
    if (selectedHotelId === null) {
      return;
    }

    /*
     * Do not remove pricing while
     * physical rooms still depend on it.
     */
    const roomCount =
      rooms.filter(
        (room) =>
          room.roomType ===
          item.roomType
      ).length;

    if (roomCount > 0) {
      toast.error(
        `Cannot delete ${formatRoomType(
          item.roomType
        )} pricing while physical rooms use it.`
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${formatRoomType(
          item.roomType
        )} pricing?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingPricingId(
        item.id
      );

      await ownerRoomTypePricingApi.delete(
        selectedHotelId,
        item.id
      );

      setPricing(
        (current) =>
          current.filter(
            (pricingItem) =>
              pricingItem.id !==
              item.id
          )
      );

      toast.success(
        "Room-type pricing deleted."
      );
    } catch (error) {
      console.error(
        "Failed to delete pricing:",
        error
      );

      toast.error(
        getErrorMessage(
          error,
          "Unable to delete pricing."
        )
      );
    } finally {
      setDeletingPricingId(
        null
      );
    }
  }

  /* =========================================================
     OPEN CREATE ROOM
  ========================================================= */

  function openCreateRoom(
    roomType?: RoomType
  ) {
    if (selectedHotelId === null) {
      toast.error(
        "Please select a property."
      );
      return;
    }

    /*
     * Pricing must exist before
     * physical rooms can be added.
     */
    if (pricing.length === 0) {
      toast.error(
        "Configure room-type pricing before adding rooms."
      );

      openCreatePricing();

      return;
    }

    const selectedType =
      roomType ??
      "STANDARD";

    /*
     * Selected type must have pricing.
     */
    if (
      !configuredRoomTypes.has(
        selectedType
      )
    ) {
      toast.error(
        `Configure ${formatRoomType(
          selectedType
        )} pricing before adding this room.`
      );

      openCreatePricing(
        selectedType
      );

      return;
    }

    setEditingRoom(null);

    setRoomForm({
      capacity: 1,
      roomType:
        selectedType,
    });

    setRoomModalOpen(true);
  }

  /* =========================================================
     OPEN EDIT ROOM
  ========================================================= */

  function openEditRoom(
    room: OwnerRoom
  ) {
    if (
      !configuredRoomTypes.has(
        room.roomType
      )
    ) {
      toast.error(
        `Pricing is not configured for ${formatRoomType(
          room.roomType
        )}.`
      );

      return;
    }

    setEditingRoom(room);

    setRoomForm({
      capacity: room.capacity,
      roomType:
        room.roomType,
    });

    setRoomModalOpen(true);
  }

  /* =========================================================
     CLOSE ROOM MODAL
  ========================================================= */

  function closeRoomModal() {
    if (savingRoom) {
      return;
    }

    setRoomModalOpen(false);

    setEditingRoom(null);

    setRoomForm(
      EMPTY_ROOM_FORM
    );
  }

  /* =========================================================
     SUBMIT ROOM
  ========================================================= */

  async function handleRoomSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (selectedHotelId === null) {
      toast.error(
        "Please select a property."
      );
      return;
    }

    if (
      !Number.isFinite(
        Number(roomForm.capacity)
      ) ||
      roomForm.capacity < 1
    ) {
      toast.error(
        "Capacity must be at least 1."
      );

      return;
    }

    /*
     * HARD RULE:
     *
     * No physical room without
     * room-type pricing.
     */
    if (
      !configuredRoomTypes.has(
        roomForm.roomType
      )
    ) {
      toast.error(
        `Configure ${formatRoomType(
          roomForm.roomType
        )} pricing before adding this room.`
      );

      return;
    }

    setSavingRoom(true);

    try {
      if (editingRoom) {
        /*
         * Same API used by your
         * existing OwnerRooms file.
         */
        await ownerRoomsApi.update(
          selectedHotelId,
          editingRoom.id,
          {
            capacity:
              Number(
                roomForm.capacity
              ),
            roomType:
              roomForm.roomType,
          }
        );

        toast.success(
          "Room updated successfully."
        );
      } else {
        /*
         * Same API used by your
         * existing OwnerRooms file.
         */
        await ownerRoomsApi.create(
          selectedHotelId,
          {
            capacity:
              Number(
                roomForm.capacity
              ),
            roomType:
              roomForm.roomType,
          }
        );

        toast.success(
          "Room added successfully."
        );
      }

      closeRoomModal();

      await loadHotelData(
        selectedHotelId
      );

      /*
       * Refresh property room count
       * if your hotel API exposes it.
       */
      await loadHotels();
    } catch (error) {
      console.error(
        "Failed to save room:",
        error
      );

      toast.error(
        getErrorMessage(
          error,
          editingRoom
            ? "Unable to update room."
            : "Unable to add room."
        )
      );
    } finally {
      setSavingRoom(false);
    }
  }

  /* =========================================================
     DELETE ROOM
  ========================================================= */

  async function handleDeleteRoom(
    roomId: number
  ) {
    if (selectedHotelId === null) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this room?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingRoomId(
        roomId
      );

      await ownerRoomsApi.delete(
        selectedHotelId,
        roomId
      );

      setRooms(
        (current) =>
          current.filter(
            (room) =>
              room.id !== roomId
          )
      );

      toast.success(
        "Room deleted successfully."
      );

      await loadHotels();
    } catch (error) {
      console.error(
        "Failed to delete room:",
        error
      );

      toast.error(
        getErrorMessage(
          error,
          "Unable to delete room."
        )
      );
    } finally {
      setDeletingRoomId(
        null
      );
    }
  }

  /* =========================================================
     NO HOTELS
  ========================================================= */

  if (
    !loadingHotels &&
    hotels.length === 0
  ) {
    return (
      <ProtectedRoute
        requiredRole="ROLE_OWNER"
      >
        <DashboardLayout role="owner">
          <div className="space-y-8">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bronze">
                Property Management
              </p>

              <h1 className="mt-2 font-serif text-3xl font-bold text-espresso">
                Rooms & Pricing
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Configure room pricing and physical rooms for your properties.
              </p>
            </div>

            <div className="rounded-2xl border border-warm-stone/20 bg-white p-12 text-center shadow-warm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bronze/10">
                <Building2 className="h-6 w-6 text-bronze" />
              </div>

              <h2 className="mt-5 font-serif text-xl font-semibold text-espresso">
                No properties found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Create a property before configuring room types, pricing and physical rooms.
              </p>

            </div>

          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <ProtectedRoute
      requiredRole="ROLE_OWNER"
    >
      <DashboardLayout role="owner">

        <div className="space-y-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bronze">
                Property Management
              </p>

              <h1 className="mt-2 font-serif text-3xl font-bold text-espresso">
                Rooms & Pricing
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Configure room-type pricing first, then add physical rooms.
              </p>
            </div>

            {/* PROPERTY SELECTOR */}

            <div className="w-full lg:w-[380px]">

              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Property
              </label>

              <div className="relative">

                <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bronze" />

                <select
                  value={
                    selectedHotelId ??
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    handleHotelChange(
                      Number(
                        event.target
                          .value
                      )
                    )
                  }
                  disabled={
                    loadingHotels ||
                    hotels.length === 0
                  }
                  className="
                    h-12
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-warm-stone/30
                    bg-white
                    px-4
                    pl-11
                    pr-10
                    text-sm
                    text-espresso
                    outline-none
                    transition
                    focus:border-bronze
                    focus:ring-2
                    focus:ring-bronze/10
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {loadingHotels ? (
                    <option value="">
                      Loading properties...
                    </option>
                  ) : hotels.length === 0 ? (
                    <option value="">
                      No properties found
                    </option>
                  ) : (
                    hotels.map(
                      (hotel) => (
                        <option
                          key={
                            hotel.id
                          }
                          value={
                            hotel.id
                          }
                        >
                          {
                            hotel.name
                          }{" "}
                          —{" "}
                          {
                            hotel.city
                          }
                        </option>
                      )
                    )
                  )}

                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              </div>

            </div>

          </div>

          {/* =================================================
              SELECTED PROPERTY SUMMARY
          ================================================= */}

          {selectedHotel && (

            <div className="rounded-2xl border border-warm-stone/20 bg-white p-5 shadow-warm">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bronze/10">

                    <Building2 className="h-5 w-5 text-bronze" />

                  </div>

                  <div>

                    <h2 className="font-serif text-lg font-semibold text-espresso">
                      {
                        selectedHotel.name
                      }
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      {
                        selectedHotel.city
                      }
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-6">

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Physical rooms
                    </p>

                    <p className="mt-1 font-serif text-xl font-bold text-espresso">
                      {
                        rooms.length
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Configured types
                    </p>

                    <p className="mt-1 font-serif text-xl font-bold text-espresso">
                      {
                        pricing.length
                      }
                    </p>
                  </div>

                </div>

              </div>

            </div>

          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {(loadingRooms ||
            loadingPricing) ? (

            <div className="rounded-2xl border border-warm-stone/20 bg-white p-12 shadow-warm">

              <div className="flex flex-col items-center justify-center">

                <Loader2 className="h-7 w-7 animate-spin text-bronze" />

                <p className="mt-4 text-sm text-muted-foreground">
                  Loading rooms and pricing...
                </p>

              </div>

            </div>

          ) : (

            <>
              {/* =============================================
                  ROOM TYPE PRICING
              ============================================== */}

              <section className="space-y-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                  <div>

                    <div className="flex items-center gap-2">

                      <Settings2 className="h-5 w-5 text-bronze" />

                      <h2 className="font-serif text-2xl font-semibold text-espresso">
                        Room Type Pricing
                      </h2>

                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Configure pricing at the room-type level. Physical rooms inherit this pricing.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openCreatePricing()
                    }
                    disabled={
                      pricing.length >=
                      ROOM_TYPES.length
                    }
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-bronze
                      px-5
                      py-2.5
                      text-sm
                      font-medium
                      text-white
                      transition
                      hover:bg-bronze-dark
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >

                    <Plus className="h-4 w-4" />

                    Configure pricing

                  </button>

                </div>

                {/* PRICING CARDS */}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                  {ROOM_TYPES.map(
                    (roomType) => {

                      const item =
                        pricingByRoomType.get(
                          roomType
                        );

                      const roomCount =
                        roomTypeCounts.find(
                          (entry) =>
                            entry.type ===
                            roomType
                        )?.count ??
                        0;

                      const configured =
                        Boolean(item);

                      return (
                        <div
                          key={
                            roomType
                          }
                          className="
                            rounded-2xl
                            border
                            border-warm-stone/20
                            bg-white
                            p-5
                            shadow-warm
                          "
                        >

                          {/* HEADER */}

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                Room type
                              </p>

                              <h3 className="mt-1 font-serif text-xl font-semibold text-espresso">
                                {
                                  formatRoomType(
                                    roomType
                                  )
                                }
                              </h3>

                            </div>

                            <span
                              className={`
                                rounded-full
                                px-2.5
                                py-1
                                text-xs
                                font-medium
                                ${
                                  configured
                                    ? "bg-green-50 text-green-700"
                                    : "bg-amber-50 text-amber-700"
                                }
                              `}
                            >
                              {configured
                                ? "Configured"
                                : "Not configured"}
                            </span>

                          </div>

                          {configured &&
                          item ? (

                            <>
                              {/* PRICES */}

                              <div className="mt-5 grid grid-cols-2 gap-3">

                                <div className="rounded-xl bg-cream/70 p-3">

                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">

                                    <Clock3 className="h-3.5 w-3.5" />

                                    Hourly

                                  </div>

                                  <p className="mt-1 font-serif text-lg font-semibold text-espresso">

                                    ₹
                                    {formatPrice(
                                      item.hourlyPrice
                                    )}

                                  </p>

                                </div>

                                <div className="rounded-xl bg-cream/70 p-3">

                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">

                                    <CalendarDays className="h-3.5 w-3.5" />

                                    Daily

                                  </div>

                                  <p className="mt-1 font-serif text-lg font-semibold text-espresso">

                                    ₹
                                    {formatPrice(
                                      item.dailyPrice
                                    )}

                                  </p>

                                </div>

                              </div>

                              {/* ROOM COUNT */}

                              <div className="mt-4 flex items-center justify-between border-t border-warm-stone/20 pt-4">

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">

                                  <BedDouble className="h-4 w-4" />

                                  {roomCount}{" "}
                                  physical{" "}
                                  {roomCount ===
                                  1
                                    ? "room"
                                    : "rooms"}

                                </div>

                                <div className="flex items-center gap-1">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditPricing(
                                        item
                                      )
                                    }
                                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-cream hover:text-espresso"
                                    title="Edit pricing"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeletePricing(
                                        item
                                      )
                                    }
                                    disabled={
                                      deletingPricingId ===
                                      item.id
                                    }
                                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                    title={
                                      roomCount >
                                      0
                                        ? "Delete physical rooms first"
                                        : "Delete pricing"
                                    }
                                  >

                                    {deletingPricingId ===
                                    item.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}

                                  </button>

                                </div>

                              </div>

                              {/* ADD ROOM */}

                              <button
                                type="button"
                                onClick={() =>
                                  openCreateRoom(
                                    roomType
                                  )
                                }
                                className="
                                  mt-4
                                  inline-flex
                                  w-full
                                  items-center
                                  justify-center
                                  gap-2
                                  rounded-xl
                                  border
                                  border-bronze/30
                                  px-4
                                  py-2.5
                                  text-sm
                                  font-medium
                                  text-bronze
                                  transition
                                  hover:bg-bronze/5
                                "
                              >

                                <Plus className="h-4 w-4" />

                                Add{" "}
                                {formatRoomType(
                                  roomType
                                )}{" "}
                                room

                              </button>

                            </>

                          ) : (

                            <div className="mt-5 rounded-xl border border-dashed border-warm-stone/40 bg-cream/30 p-4">

                              <p className="text-sm text-muted-foreground">
                                Pricing has not been configured for this room type.
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  openCreatePricing(
                                    roomType
                                  )
                                }
                                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-bronze hover:text-bronze-dark"
                              >
                                Configure pricing
                                <span>
                                  →
                                </span>
                              </button>

                            </div>

                          )}

                        </div>
                      );
                    }
                  )}

                </div>

              </section>

              {/* =============================================
                  PHYSICAL ROOMS
              ============================================== */}

              <section className="space-y-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                  <div>

                    <div className="flex items-center gap-2">

                      <BedDouble className="h-5 w-5 text-bronze" />

                      <h2 className="font-serif text-2xl font-semibold text-espresso">
                        Physical Rooms
                      </h2>

                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Add individual rooms after configuring their room type pricing.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openCreateRoom()
                    }
                    disabled={
                      pricing.length ===
                      0
                    }
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-bronze
                      px-5
                      py-2.5
                      text-sm
                      font-medium
                      text-white
                      transition
                      hover:bg-bronze-dark
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >

                    <Plus className="h-4 w-4" />

                    Add physical room

                  </button>

                </div>

                {/* NO PRICING */}

                {pricing.length ===
                0 ? (

                  <div className="rounded-2xl border border-dashed border-warm-stone/40 bg-white p-12 text-center shadow-warm">

                    <Settings2 className="mx-auto h-8 w-8 text-bronze/60" />

                    <h3 className="mt-4 font-serif text-xl font-semibold text-espresso">
                      Configure pricing first
                    </h3>

                    <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                      You need to configure at least one room type before you can add physical rooms.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        openCreatePricing()
                      }
                      className="
                        mt-5
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-bronze
                        px-5
                        py-2.5
                        text-sm
                        font-medium
                        text-white
                        hover:bg-bronze-dark
                      "
                    >

                      <Plus className="h-4 w-4" />

                      Configure pricing

                    </button>

                  </div>

                ) : rooms.length ===
                  0 ? (

                  <div className="rounded-2xl border border-warm-stone/20 bg-white p-12 text-center shadow-warm">

                    <BedDouble className="mx-auto h-8 w-8 text-bronze/60" />

                    <h3 className="mt-4 font-serif text-xl font-semibold text-espresso">
                      No physical rooms yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                      Select a configured room type above and add your first physical room.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        openCreateRoom()
                      }
                      className="
                        mt-5
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-bronze
                        px-5
                        py-2.5
                        text-sm
                        font-medium
                        text-white
                        hover:bg-bronze-dark
                      "
                    >

                      <Plus className="h-4 w-4" />

                      Add physical room

                    </button>

                  </div>

                ) : (

                  <div className="overflow-hidden rounded-2xl border border-warm-stone/20 bg-white shadow-warm">

                    <div className="overflow-x-auto">

                      <table className="w-full min-w-[720px]">

                        <thead>

                          <tr className="border-b border-warm-stone/20 bg-cream/30">

                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Room
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Type
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Capacity
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Hourly
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Daily
                            </th>

                            <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Actions
                            </th>

                          </tr>

                        </thead>

                        <tbody className="divide-y divide-warm-stone/20">

                          {rooms.map(
                            (room) => {

                              const roomPricing =
                                pricingByRoomType.get(
                                  room.roomType
                                );

                              return (
                                <tr
                                  key={
                                    room.id
                                  }
                                  className="transition hover:bg-cream/40"
                                >

                                  {/* ROOM */}

                                  <td className="px-6 py-5">

                                    <div className="flex items-center gap-3">

                                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bronze/10">

                                        <BedDouble className="h-4 w-4 text-bronze" />

                                      </div>

                                      <div>

                                        <p className="text-sm font-medium text-espresso">
                                          Room #
                                          {
                                            room.id
                                          }
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                          Physical room
                                        </p>

                                      </div>

                                    </div>

                                  </td>

                                  {/* TYPE */}

                                  <td className="px-6 py-5">

                                    <span className="rounded-full bg-bronze/10 px-2.5 py-1 text-xs font-medium text-bronze">

                                      {
                                        formatRoomType(
                                          room.roomType
                                        )
                                      }

                                    </span>

                                  </td>

                                  {/* CAPACITY */}

                                  <td className="px-6 py-5">

                                    <div className="flex items-center gap-2 text-sm text-espresso">

                                      <Users className="h-4 w-4 text-muted-foreground" />

                                      {
                                        room.capacity
                                      }{" "}
                                      {
                                        room.capacity ===
                                        1
                                          ? "guest"
                                          : "guests"
                                      }

                                    </div>

                                  </td>

                                  {/* HOURLY */}

                                  <td className="px-6 py-5">

                                    {roomPricing ? (

                                      <span className="text-sm text-espresso">

                                        ₹
                                        {
                                          formatPrice(
                                            roomPricing.hourlyPrice
                                          )
                                        }

                                      </span>

                                    ) : (

                                      <span className="text-xs text-red-600">
                                        Not configured
                                      </span>

                                    )}

                                  </td>

                                  {/* DAILY */}

                                  <td className="px-6 py-5">

                                    {roomPricing ? (

                                      <span className="text-sm text-espresso">

                                        ₹
                                        {
                                          formatPrice(
                                            roomPricing.dailyPrice
                                          )
                                        }

                                      </span>

                                    ) : (

                                      <span className="text-xs text-red-600">
                                        Not configured
                                      </span>

                                    )}

                                  </td>

                                  {/* ACTIONS */}

                                  <td className="px-6 py-5">

                                    <div className="flex items-center justify-end gap-1">

                                      <button
                                        type="button"
                                        onClick={() =>
                                          openEditRoom(
                                            room
                                          )
                                        }
                                        className="rounded-lg p-2 text-muted-foreground transition hover:bg-cream hover:text-espresso"
                                        title="Edit room"
                                      >

                                        <Edit2 className="h-4 w-4" />

                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteRoom(
                                            room.id
                                          )
                                        }
                                        disabled={
                                          deletingRoomId ===
                                          room.id
                                        }
                                        className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                        title="Delete room"
                                      >

                                        {deletingRoomId ===
                                        room.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}

                                      </button>

                                    </div>

                                  </td>

                                </tr>
                              );
                            }
                          )}

                        </tbody>

                      </table>

                    </div>

                  </div>

                )}

              </section>
            </>
          )}

        </div>

        {/* =================================================
            PRICING MODAL
        ================================================== */}

        {pricingModalOpen && (

          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-black/40
              px-4
              py-6
            "
            onMouseDown={(
              event
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closePricingModal();
              }
            }}
          >

            <div
              className="
                w-full
                max-w-lg
                overflow-hidden
                rounded-2xl
                bg-white
                shadow-2xl
              "
            >

              {/* HEADER */}

              <div className="flex items-start justify-between border-b border-warm-stone/20 px-6 py-5">

                <div>

                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Room type pricing
                  </p>

                  <h2 className="mt-1 font-serif text-xl font-semibold text-espresso">
                    {editingPricing
                      ? "Edit pricing"
                      : "Configure pricing"}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Configure the hourly and daily prices for a room type.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closePricingModal
                  }
                  disabled={
                    savingPricing
                  }
                  className="rounded-lg p-2 text-muted-foreground hover:bg-cream disabled:opacity-50"
                >

                  <X className="h-5 w-5" />

                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={
                  handlePricingSubmit
                }
                className="space-y-5 p-6"
              >

                {/* ROOM TYPE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-espresso">
                    Room type
                  </label>

                  {editingPricing ? (

                    <div className="rounded-xl bg-cream/70 px-4 py-3">

                      <p className="text-xs text-muted-foreground">
                        Room type
                      </p>

                      <p className="mt-1 font-medium text-espresso">
                        {
                          formatRoomType(
                            editingPricing.roomType
                          )
                        }
                      </p>

                    </div>

                  ) : (

                    <select
                      value={
                        pricingForm.roomType
                      }
                      onChange={(
                        event
                      ) =>
                        setPricingForm(
                          (current) => ({
                            ...current,
                            roomType:
                              event
                                .target
                                .value as RoomType,
                          })
                        )
                      }
                      className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-warm-stone/30
                        bg-white
                        px-4
                        text-sm
                        text-espresso
                        outline-none
                        focus:border-bronze
                        focus:ring-2
                        focus:ring-bronze/10
                      "
                    >

                      {ROOM_TYPES
                        .filter(
                          (type) =>
                            !configuredRoomTypes.has(
                              type
                            )
                        )
                        .map(
                          (type) => (
                            <option
                              key={
                                type
                              }
                              value={
                                type
                              }
                            >
                              {
                                formatRoomType(
                                  type
                                )
                              }
                            </option>
                          )
                        )}

                    </select>

                  )}

                </div>

                {/* PRICES */}

                <div className="grid gap-4 sm:grid-cols-2">

                  {/* HOURLY */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-espresso">
                      Hourly price
                    </label>

                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        ₹
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          editingPricing
                            ? pricingUpdateForm.hourlyPrice
                            : pricingForm.hourlyPrice
                        }
                        onChange={(
                          event
                        ) => {

                          const value =
                            Number(
                              event
                                .target
                                .value
                            );

                          if (
                            editingPricing
                          ) {

                            setPricingUpdateForm(
                              (
                                current
                              ) => ({
                                ...current,
                                hourlyPrice:
                                  value,
                              })
                            );

                          } else {

                            setPricingForm(
                              (
                                current
                              ) => ({
                                ...current,
                                hourlyPrice:
                                  value,
                              })
                            );

                          }
                        }}
                        className="
                          h-12
                          w-full
                          rounded-xl
                          border
                          border-warm-stone/30
                          bg-white
                          px-4
                          pl-9
                          text-sm
                          text-espresso
                          outline-none
                          focus:border-bronze
                          focus:ring-2
                          focus:ring-bronze/10
                        "
                        placeholder="0"
                      />

                    </div>

                  </div>

                  {/* DAILY */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-espresso">
                      Daily price
                    </label>

                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        ₹
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          editingPricing
                            ? pricingUpdateForm.dailyPrice
                            : pricingForm.dailyPrice
                        }
                        onChange={(
                          event
                        ) => {

                          const value =
                            Number(
                              event
                                .target
                                .value
                            );

                          if (
                            editingPricing
                          ) {

                            setPricingUpdateForm(
                              (
                                current
                              ) => ({
                                ...current,
                                dailyPrice:
                                  value,
                              })
                            );

                          } else {

                            setPricingForm(
                              (
                                current
                              ) => ({
                                ...current,
                                dailyPrice:
                                  value,
                              })
                            );

                          }
                        }}
                        className="
                          h-12
                          w-full
                          rounded-xl
                          border
                          border-warm-stone/30
                          bg-white
                          px-4
                          pl-9
                          text-sm
                          text-espresso
                          outline-none
                          focus:border-bronze
                          focus:ring-2
                          focus:ring-bronze/10
                        "
                        placeholder="0"
                      />

                    </div>

                  </div>

                </div>

                {/* INFORMATION */}

                <div className="rounded-xl bg-cream/70 p-4">

                  <div className="flex items-start gap-3">

                    <Settings2 className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />

                    <div>

                      <p className="text-sm font-medium text-espresso">
                        Pricing belongs to the room type
                      </p>

                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Physical rooms do not have separate prices. Every room of this type uses the configured hourly and daily rates.
                      </p>

                    </div>

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="flex justify-end gap-3 border-t border-warm-stone/20 pt-5">

                  <button
                    type="button"
                    onClick={
                      closePricingModal
                    }
                    disabled={
                      savingPricing
                    }
                    className="
                      rounded-xl
                      border
                      border-warm-stone/30
                      px-5
                      py-2.5
                      text-sm
                      font-medium
                      text-espresso
                      hover:bg-cream
                      disabled:opacity-50
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      savingPricing
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-bronze
                      px-5
                      py-2.5
                      text-sm
                      font-medium
                      text-white
                      hover:bg-bronze-dark
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >

                    {savingPricing && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {editingPricing
                      ? "Save changes"
                      : "Save pricing"}

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

        {/* =================================================
            ROOM MODAL
        ================================================== */}

        {roomModalOpen && (

          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-black/40
              px-4
              py-6
            "
            onMouseDown={(
              event
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeRoomModal();
              }
            }}
          >

            <div
              className="
                w-full
                max-w-lg
                overflow-hidden
                rounded-2xl
                bg-white
                shadow-2xl
              "
            >

              {/* HEADER */}

              <div className="flex items-start justify-between border-b border-warm-stone/20 px-6 py-5">

                <div>

                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Physical room
                  </p>

                  <h2 className="mt-1 font-serif text-xl font-semibold text-espresso">
                    {editingRoom
                      ? "Edit room"
                      : "Add physical room"}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Select the room type and capacity.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeRoomModal
                  }
                  disabled={
                    savingRoom
                  }
                  className="rounded-lg p-2 text-muted-foreground hover:bg-cream disabled:opacity-50"
                >

                  <X className="h-5 w-5" />

                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={
                  handleRoomSubmit
                }
                className="space-y-5 p-6"
              >

                {/* ROOM TYPE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-espresso">
                    Room type
                  </label>

                  <select
                    value={
                      roomForm.roomType
                    }
                    onChange={(
                      event
                    ) => {

                      const roomType =
                        event
                          .target
                          .value as RoomType;

                      setRoomForm(
                        (
                          current
                        ) => ({
                          ...current,
                          roomType,
                        })
                      );

                    }}
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-warm-stone/30
                      bg-white
                      px-4
                      text-sm
                      text-espresso
                      outline-none
                      focus:border-bronze
                      focus:ring-2
                      focus:ring-bronze/10
                    "
                  >

                    {ROOM_TYPES.map(
                      (type) => {

                        const hasPricing =
                          configuredRoomTypes.has(
                            type
                          );

                        return (
                          <option
                            key={
                              type
                            }
                            value={
                              type
                            }
                            disabled={
                              !hasPricing
                            }
                          >
                            {
                              formatRoomType(
                                type
                              )
                            }
                            {!hasPricing
                              ? " — pricing not configured"
                              : ""}
                          </option>
                        );

                      }
                    )}

                  </select>

                </div>

                {/* CAPACITY */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-espresso">
                    Capacity
                  </label>

                  <div className="relative">

                    <Users className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={
                        formValue(
                          roomForm.capacity
                        )
                      }
                      onChange={(
                        event
                      ) =>
                        setRoomForm(
                          (
                            current
                          ) => ({
                            ...current,
                            capacity:
                              Number(
                                event
                                  .target
                                  .value
                              ),
                          })
                        )
                      }
                      className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-warm-stone/30
                        bg-white
                        px-4
                        pl-11
                        text-sm
                        text-espresso
                        outline-none
                        focus:border-bronze
                        focus:ring-2
                        focus:ring-bronze/10
                      "
                    />

                  </div>

                </div>

                {/* PRICING SUMMARY */}

                {pricingByRoomType.has(
                  roomForm.roomType
                ) && (

                  <div className="rounded-xl bg-cream/70 p-4">

                    <div className="flex items-center gap-2">

                      <Settings2 className="h-4 w-4 text-bronze" />

                      <p className="text-sm font-medium text-espresso">
                        Applied room-type pricing
                      </p>

                    </div>

                    {(() => {

                      const item =
                        pricingByRoomType.get(
                          roomForm.roomType
                        );

                      if (!item) {
                        return null;
                      }

                      return (
                        <div className="mt-3 grid grid-cols-2 gap-3">

                          <div>

                            <p className="text-xs text-muted-foreground">
                              Hourly
                            </p>

                            <p className="mt-1 font-semibold text-espresso">
                              ₹
                              {
                                formatPrice(
                                  item.hourlyPrice
                                )
                              }
                            </p>

                          </div>

                          <div>

                            <p className="text-xs text-muted-foreground">
                              Daily
                            </p>

                            <p className="mt-1 font-semibold text-espresso">
                              ₹
                              {
                                formatPrice(
                                  item.dailyPrice
                                )
                              }
                            </p>

                          </div>

                        </div>
                      );

                    })()}

                  </div>

                )}

                {/* INFORMATION */}

                <div className="rounded-xl border border-warm-stone/20 bg-white p-4">

                  <p className="text-sm font-medium text-espresso">
                    No room-level pricing
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    This physical room will automatically use the pricing configured for its selected room type.
                  </p>

                </div>

                {/* ACTIONS */}

                <div className="flex justify-end gap-3 border-t border-warm-stone/20 pt-5">

                  <button
                    type="button"
                    onClick={
                      closeRoomModal
                    }
                    disabled={
                      savingRoom
                    }
                    className="
                      rounded-xl
                      border
                      border-warm-stone/30
                      px-5
                      py-2.5
                      text-sm
                      font-medium
                      text-espresso
                      hover:bg-cream
                      disabled:opacity-50
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      savingRoom ||
                      !configuredRoomTypes.has(
                        roomForm.roomType
                      )
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-bronze
                      px-5
                      py-2.5
                      text-sm
                      font-medium
                      text-white
                      hover:bg-bronze-dark
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >

                    {savingRoom && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {editingRoom
                      ? "Save changes"
                      : "Add room"}

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </DashboardLayout>
    </ProtectedRoute>
  );
}

/*
 * Small helper to keep the JSX clean and
 * guarantee a valid input value.
 */
function formValue(
  value: number
): number {
  return Number.isFinite(value)
    ? value
    : 1;
}