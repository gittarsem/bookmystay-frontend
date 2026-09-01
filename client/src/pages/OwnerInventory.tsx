import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Hotel,
  BedDouble,
  Users,
  Save,
  Lock,
  Unlock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  CircleDollarSign,
  PackageOpen,
  X,
  Layers3,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "@/layouts/DashboardLayout";

import { ownerHotelsApi } from "@/api/ownerHotels";
import { ownerRoomsApi } from "@/api/rooms";
import {
  ownerInventoryApi,
  type Inventory,
  type InventoryUpdateRequest,
} from "@/api/inventory";

import type { Room } from "@/types";

interface Hotel {
  id: number;
  name: string;
  city: string;
}

interface RoomTypeGroup {
  roomType: string;
  rooms: Room[];
  inventory: Inventory[];
}

interface AggregatedInventory {
  date: string;
  totalCount: number;
  bookCount: number;
  reservedCount: number;
  availableCount: number;
  price: number;
  surgeFactor: number;
  closedCount: number;
  totalRooms: number;
}

/* =========================================================
   PAGE
========================================================= */

export default function OwnerInventory() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [inventoryByRoom, setInventoryByRoom] =
    useState<Record<number, Inventory[]>>({});

  const [selectedHotelId, setSelectedHotelId] =
    useState<number | null>(null);

  const [selectedRoomType, setSelectedRoomType] =
    useState<string | null>(null);

  const [loadingHotels, setLoadingHotels] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingInventory, setLoadingInventory] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [currentDate, setCurrentDate] = useState(
    () => new Date()
  );

  /* =========================================================
     MODAL
  ========================================================= */

  const [selectedInventory, setSelectedInventory] =
    useState<AggregatedInventory | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [surgeFactor, setSurgeFactor] = useState(1);
  const [closed, setClosed] = useState(false);

  /* =========================================================
     LOAD HOTELS
  ========================================================= */

  useEffect(() => {
    void loadHotels();
  }, []);

  async function loadHotels() {
    setLoadingHotels(true);

    try {
      const response = await ownerHotelsApi.getMyHotels();

      const data: Hotel[] = response.data.map((hotel) => ({
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
      }));

      setHotels(data);

      if (data.length === 0) {
        setSelectedHotelId(null);
        setRooms([]);
        setSelectedRoomType(null);
        return;
      }

      setSelectedHotelId((current) => {
        if (
          current !== null &&
          data.some((hotel) => hotel.id === current)
        ) {
          return current;
        }

        return data[0].id;
      });
    } catch (error: any) {
      console.error("Failed to load hotels:", error);

      toast.error(
        error?.response?.data?.message ||
          "Unable to load your properties."
      );

      setHotels([]);
      setSelectedHotelId(null);
    } finally {
      setLoadingHotels(false);
    }
  }

  /* =========================================================
     LOAD ROOMS
  ========================================================= */

  useEffect(() => {
    if (selectedHotelId === null) {
      setRooms([]);
      setSelectedRoomType(null);
      setInventoryByRoom({});
      return;
    }

    void loadRooms(selectedHotelId);
  }, [selectedHotelId]);

  async function loadRooms(hotelId: number) {
    setLoadingRooms(true);
    setLoadingInventory(false);

    setRooms([]);
    setSelectedRoomType(null);
    setInventoryByRoom({});

    try {
      const response = await ownerRoomsApi.getAll(hotelId);

      const roomData = response.data;

      setRooms(roomData);

      if (roomData.length === 0) {
        return;
      }

      /*
       * Load inventory for every physical room.
       *
       * We aggregate it below by room type.
       * This uses your existing backend API and
       * does not require a new endpoint.
       */

      setLoadingInventory(true);

      const results = await Promise.all(
        roomData.map(async (room) => {
          try {
            const inventoryResponse =
              await ownerInventoryApi.getByRoom(room.id);

            return {
              roomId: room.id,
              inventory: Array.isArray(
                inventoryResponse.data
              )
                ? inventoryResponse.data
                : [],
            };
          } catch (error) {
            console.error(
              `Failed to load inventory for room ${room.id}:`,
              error
            );

            return {
              roomId: room.id,
              inventory: [],
            };
          }
        })
      );

      const grouped: Record<number, Inventory[]> = {};

      results.forEach((result) => {
        grouped[result.roomId] = result.inventory;
      });

      setInventoryByRoom(grouped);

      /*
       * Select first available room type.
       */

      const firstRoomType =
        roomData.find(
          (room) => room.roomType
        )?.roomType;

      if (firstRoomType) {
        setSelectedRoomType(firstRoomType);
      }
    } catch (error: any) {
      console.error("Failed to load rooms:", error);

      toast.error(
        error?.response?.data?.message ||
          "Unable to load rooms."
      );

      setRooms([]);
      setSelectedRoomType(null);
      setInventoryByRoom({});
    } finally {
      setLoadingRooms(false);
      setLoadingInventory(false);
    }
  }

  /* =========================================================
     SELECTED HOTEL
  ========================================================= */

  const selectedHotel = useMemo(
    () =>
      hotels.find(
        (hotel) => hotel.id === selectedHotelId
      ) ?? null,
    [hotels, selectedHotelId]
  );

  /* =========================================================
     GROUP ROOMS BY ROOM TYPE
  ========================================================= */

  const roomTypeGroups = useMemo(() => {
    const groups = new Map<string, Room[]>();

    rooms.forEach((room) => {
      const type = room.roomType;

      if (!type) {
        return;
      }

      const existing = groups.get(type) ?? [];

      existing.push(room);

      groups.set(type, existing);
    });

    return Array.from(groups.entries())
      .map(([roomType, groupedRooms]) => ({
        roomType,
        rooms: groupedRooms,
        inventory: groupedRooms.flatMap(
          (room) =>
            inventoryByRoom[room.id] ?? []
        ),
      }))
      .sort((a, b) =>
        a.roomType.localeCompare(b.roomType)
      );
  }, [rooms, inventoryByRoom]);

  const selectedGroup = useMemo(
    () =>
      roomTypeGroups.find(
        (group) =>
          group.roomType === selectedRoomType
      ) ?? null,
    [roomTypeGroups, selectedRoomType]
  );

  /* =========================================================
     AGGREGATE INVENTORY BY DATE
  ========================================================= */

  const aggregatedInventory = useMemo(() => {
    if (!selectedGroup) {
      return new Map<string, AggregatedInventory>();
    }

    const byDate = new Map<
      string,
      {
        items: Inventory[];
        roomIds: Set<number>;
      }
    >();

    selectedGroup.rooms.forEach((room) => {
      const roomInventory =
        inventoryByRoom[room.id] ?? [];

      roomInventory.forEach((item) => {
        const existing = byDate.get(item.date);

        if (existing) {
          existing.items.push(item);
          existing.roomIds.add(room.id);
        } else {
          byDate.set(item.date, {
            items: [item],
            roomIds: new Set([room.id]),
          });
        }
      });
    });

    const result = new Map<
      string,
      AggregatedInventory
    >();

    byDate.forEach((value, date) => {
      const items = value.items;

      const totalCount = items.reduce(
        (sum, item) =>
          sum + (item.totalCount ?? 0),
        0
      );

      const bookCount = items.reduce(
        (sum, item) =>
          sum + (item.bookCount ?? 0),
        0
      );

      const reservedCount = items.reduce(
        (sum, item) =>
          sum + (item.reservedCount ?? 0),
        0
      );

      const availableCount = Math.max(
        0,
        totalCount -
          bookCount -
          reservedCount
      );

      /*
       * Inventory is initialized from room-type
       * pricing, so normally these values will
       * be identical across the physical rooms.
       *
       * We use the first inventory price as the
       * displayed room-type price.
       */

      const firstItem = items[0];

      const averageSurge =
        items.reduce(
          (sum, item) =>
            sum +
            Number(item.surgeFactor ?? 1),
          0
        ) / items.length;

      const closedCount = items.filter(
        (item) => item.closed
      ).length;

      result.set(date, {
        date,
        totalCount,
        bookCount,
        reservedCount,
        availableCount,
        price: Number(
          firstItem?.price ?? 0
        ),
        surgeFactor: averageSurge,
        closedCount,
        totalRooms: value.roomIds.size,
      });
    });

    return result;
  }, [
    selectedGroup,
    inventoryByRoom,
  ]);

  /* =========================================================
     ROOM TYPE SUMMARY
  ========================================================= */

  const inventoryStats = useMemo(() => {
    let available = 0;
    let booked = 0;
    let reserved = 0;
    let closed = 0;

    aggregatedInventory.forEach((item) => {
      available += item.availableCount;
      booked += item.bookCount;
      reserved += item.reservedCount;

      if (
        item.closedCount === item.totalRooms
      ) {
        closed++;
      }
    });

    return {
      available,
      booked,
      reserved,
      closed,
    };
  }, [aggregatedInventory]);

  /* =========================================================
     CALENDAR
  ========================================================= */

  const monthStart = useMemo(
    () =>
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      ),
    [currentDate]
  );

  const monthEnd = useMemo(
    () =>
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ),
    [currentDate]
  );

  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];

    const firstDay = monthStart.getDay();

    const daysInMonth =
      monthEnd.getDate();

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      days.push(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          day
        )
      );
    }

    return days;
  }, [
    currentDate,
    monthStart,
    monthEnd,
  ]);

  /* =========================================================
     DATE HELPERS
  ========================================================= */

  function toDateString(date: Date) {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function formatDate(value: string) {
    if (!value) return "";

    const [year, month, day] =
      value.split("-").map(Number);

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).format(
      new Date(
        year,
        month - 1,
        day
      )
    );
  }

  function formatMonth() {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    ).format(currentDate);
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(value);
  }

  function formatRoomType(value: string) {
    return value
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  }

  /* =========================================================
     NAVIGATION
  ========================================================= */

  function previousMonth() {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      )
    );
  }

  function nextMonth() {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      )
    );
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  /* =========================================================
     OPEN INVENTORY
  ========================================================= */

  function openInventory(
    item: AggregatedInventory
  ) {
    setSelectedInventory(item);

    setStartDate(item.date);
    setEndDate(item.date);

    setSurgeFactor(
      Number(item.surgeFactor ?? 1)
    );

    setClosed(
      item.closedCount === item.totalRooms
    );

    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setSelectedInventory(null);

    setStartDate("");
    setEndDate("");
    setSurgeFactor(1);
    setClosed(false);
  }

  /* =========================================================
     SAVE ROOM TYPE INVENTORY
  ========================================================= */

  async function saveInventory(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!selectedGroup) {
      toast.error(
        "Please select a room type."
      );
      return;
    }

    if (!startDate || !endDate) {
      toast.error(
        "Please select a date range."
      );
      return;
    }

    if (endDate < startDate) {
      toast.error(
        "End date cannot be before start date."
      );
      return;
    }

    if (
      !Number.isFinite(surgeFactor) ||
      surgeFactor <= 0
    ) {
      toast.error(
        "Surge factor must be greater than 0."
      );
      return;
    }

    const request: InventoryUpdateRequest = {
      startDate,
      endDate,
      surgeFactor,
      closed,
    };

    setSaving(true);

    try {
      /*
       * There is currently a room-level PATCH endpoint.
       *
       * Therefore, when the owner manages a room type,
       * apply the same inventory change to every physical
       * room belonging to that room type.
       */

      await Promise.all(
        selectedGroup.rooms.map((room) =>
          ownerInventoryApi.update(
            room.id,
            request
          )
        )
      );

      toast.success(
        `${formatRoomType(
          selectedGroup.roomType
        )} inventory updated.`
      );

      setModalOpen(false);
      setSelectedInventory(null);

      await reloadSelectedHotel();
    } catch (error: any) {
      console.error(
        "Failed to update room type inventory:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to update inventory."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     REFRESH
  ========================================================= */

  async function reloadSelectedHotel() {
    if (selectedHotelId === null) {
      return;
    }

    await loadRooms(selectedHotelId);
  }

  /* =========================================================
     NO PROPERTY
  ========================================================= */

  if (
    !loadingHotels &&
    hotels.length === 0
  ) {
    return (
      <DashboardLayout role="owner">
        <div className="space-y-8">

          <Header />

          <EmptyState
            icon={
              <Hotel className="h-10 w-10 text-bronze/60" />
            }
            title="No properties found"
            description="Create a property and add rooms before managing inventory."
          />

        </div>
      </DashboardLayout>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <DashboardLayout role="owner">
      <div className="space-y-8">

        <Header />

        {/* =================================================
            PROPERTY
        ================================================= */}

        <section className="rounded-2xl border border-warm-stone/20 bg-white p-5 shadow-warm">

          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Property
              </label>

              <select
                value={
                  selectedHotelId ?? ""
                }
                disabled={loadingHotels}
                onChange={(event) =>
                  setSelectedHotelId(
                    event.target.value
                      ? Number(
                          event.target.value
                        )
                      : null
                  )
                }
                className="h-11 w-full rounded-xl border border-warm-stone/30 bg-white px-3 text-sm text-espresso outline-none transition focus:border-bronze focus:ring-2 focus:ring-bronze/10"
              >
                {loadingHotels ? (
                  <option value="">
                    Loading properties...
                  </option>
                ) : (
                  hotels.map((hotel) => (
                    <option
                      key={hotel.id}
                      value={hotel.id}
                    >
                      {hotel.name} —{" "}
                      {hotel.city}
                    </option>
                  ))
                )}
              </select>
            </div>

            {selectedHotel && (
              <div className="flex items-center gap-2 rounded-xl bg-cream px-4 py-2.5 text-sm text-espresso">
                <Hotel className="h-4 w-4 text-bronze" />
                {selectedHotel.name}
              </div>
            )}

          </div>

        </section>

        {/* =================================================
            ROOM TYPE SELECTOR
        ================================================= */}

        {loadingRooms ? (
          <LoadingState text="Loading room types..." />
        ) : roomTypeGroups.length === 0 ? (
          <EmptyState
            icon={
              <BedDouble className="h-10 w-10 text-bronze/60" />
            }
            title="No rooms found"
            description="Add physical rooms to your property before managing room-type inventory."
          />
        ) : (
          <section className="space-y-4">

            <div className="flex items-end justify-between gap-4">

              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Inventory By
                </p>

                <h2 className="mt-1 font-serif text-xl font-semibold text-espresso">
                  Room Type
                </h2>
              </div>

              <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                <Layers3 className="h-4 w-4" />
                {rooms.length} physical rooms
              </div>

            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

              {roomTypeGroups.map((group) => {
                const isSelected =
                  group.roomType ===
                  selectedRoomType;

                const roomCount =
                  group.rooms.length;

                const totalCapacity =
                  group.rooms.reduce(
                    (sum, room) =>
                      sum +
                      (room.capacity ?? 0),
                    0
                  );

                return (
                  <button
                    key={group.roomType}
                    type="button"
                    onClick={() =>
                      setSelectedRoomType(
                        group.roomType
                      )
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                      isSelected
                        ? "border-bronze bg-bronze/[0.06] shadow-warm"
                        : "border-warm-stone/20 bg-white hover:border-bronze/40 hover:bg-cream/30"
                    }`}
                  >

                    <div className="flex items-start justify-between">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bronze/10 text-bronze">
                        <BedDouble className="h-5 w-5" />
                      </div>

                      {isSelected && (
                        <span className="rounded-full bg-bronze px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                          Selected
                        </span>
                      )}

                    </div>

                    <h3 className="mt-4 font-serif text-lg font-semibold text-espresso">
                      {formatRoomType(
                        group.roomType
                      )}
                    </h3>

                    <div className="mt-3 flex items-center justify-between text-sm">

                      <span className="text-muted-foreground">
                        {roomCount}{" "}
                        {roomCount === 1
                          ? "room"
                          : "rooms"}
                      </span>

                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {totalCapacity}
                      </span>

                    </div>

                  </button>
                );
              })}

            </div>
          </section>
        )}

        {/* =================================================
            SELECTED ROOM TYPE
        ================================================= */}

        {selectedGroup && (
          <>
            {/* SUMMARY */}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <SummaryCard
                icon={
                  <CheckCircle2 className="h-5 w-5" />
                }
                label="Available"
                value={inventoryStats.available}
                description="Available across this room type"
              />

              <SummaryCard
                icon={
                  <PackageOpen className="h-5 w-5" />
                }
                label="Booked"
                value={inventoryStats.booked}
                description="Booked inventory"
              />

              <SummaryCard
                icon={
                  <AlertCircle className="h-5 w-5" />
                }
                label="Reserved"
                value={inventoryStats.reserved}
                description="Temporarily reserved"
              />

              <SummaryCard
                icon={
                  <Lock className="h-5 w-5" />
                }
                label="Closed Days"
                value={inventoryStats.closed}
                description="Fully closed dates"
              />

            </section>

            {/* =================================================
                CALENDAR
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-warm-stone/20 bg-white shadow-warm">

              {/* HEADER */}

              <div className="border-b border-warm-stone/20 px-5 py-5 sm:px-6">

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bronze/10 text-bronze">
                      <BedDouble className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        Inventory Calendar
                      </p>

                      <h2 className="mt-1 font-serif text-xl font-semibold text-espresso">
                        {formatRoomType(
                          selectedGroup.roomType
                        )}
                      </h2>
                    </div>

                  </div>

                  <div className="flex items-center gap-2">

                    <span className="mr-2 hidden text-xs text-muted-foreground sm:inline">
                      {selectedGroup.rooms.length}{" "}
                      physical{" "}
                      {selectedGroup.rooms.length ===
                      1
                        ? "room"
                        : "rooms"}
                    </span>

                    <button
                      type="button"
                      onClick={goToToday}
                      className="rounded-lg border border-warm-stone/30 px-3 py-2 text-sm font-medium text-espresso transition hover:bg-cream"
                    >
                      Today
                    </button>

                    <button
                      type="button"
                      onClick={previousMonth}
                      aria-label="Previous month"
                      className="rounded-lg border border-warm-stone/30 p-2 text-espresso transition hover:bg-cream"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={nextMonth}
                      aria-label="Next month"
                      className="rounded-lg border border-warm-stone/30 p-2 text-espresso transition hover:bg-cream"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        reloadSelectedHotel()
                      }
                      disabled={
                        loadingInventory ||
                        loadingRooms
                      }
                      aria-label="Refresh inventory"
                      className="rounded-lg border border-warm-stone/30 p-2 text-espresso transition hover:bg-cream disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          loadingInventory
                            ? "animate-spin"
                            : ""
                        }`}
                      />
                    </button>

                  </div>

                </div>

              </div>

              {loadingInventory ? (
                <LoadingState text="Loading inventory..." />
              ) : aggregatedInventory.size === 0 ? (
                <EmptyState
                  icon={
                    <CalendarDays className="h-10 w-10 text-bronze/50" />
                  }
                  title="No inventory available"
                  description="Inventory has not been initialized for this room type yet."
                />
              ) : (
                <div className="p-3 sm:p-5">

                  {/* WEEKDAYS */}

                  <div className="grid grid-cols-7 overflow-hidden rounded-t-xl border-l border-t border-warm-stone/20">

                    {[
                      "Sun",
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                    ].map((day) => (
                      <div
                        key={day}
                        className="border-b border-r border-warm-stone/20 bg-cream/70 px-1 py-3 text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:text-xs"
                      >
                        {day}
                      </div>
                    ))}

                  </div>

                  {/* DAYS */}

                  <div className="grid grid-cols-7 overflow-hidden rounded-b-xl border-l border-warm-stone/20">

                    {calendarDays.map(
                      (date, index) => {
                        if (!date) {
                          return (
                            <div
                              key={`empty-${index}`}
                              className="min-h-[105px] border-b border-r border-warm-stone/20 bg-cream/20 sm:min-h-[150px]"
                            />
                          );
                        }

                        const dateString =
                          toDateString(date);

                        const item =
                          aggregatedInventory.get(
                            dateString
                          );

                        const isToday =
                          dateString ===
                          toDateString(
                            new Date()
                          );

                        const isFullyClosed =
                          item
                            ? item.closedCount ===
                              item.totalRooms
                            : false;

                        const isPartiallyClosed =
                          item
                            ? item.closedCount > 0 &&
                              !isFullyClosed
                            : false;

                        return (
                          <motion.button
                            key={dateString}
                            type="button"
                            disabled={!item}
                            onClick={() =>
                              item &&
                              openInventory(item)
                            }
                            whileHover={
                              item
                                ? {
                                    backgroundColor:
                                      "rgba(196, 121, 49, 0.035)",
                                  }
                                : undefined
                            }
                            className={`min-h-[105px] border-b border-r border-warm-stone/20 p-2 text-left transition sm:min-h-[150px] sm:p-3 ${
                              item
                                ? "cursor-pointer bg-white"
                                : "cursor-default bg-white"
                            }`}
                          >

                            {/* DATE */}

                            <div className="flex items-center justify-between">

                              <span
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold sm:text-sm ${
                                  isToday
                                    ? "bg-bronze text-white"
                                    : "text-espresso"
                                }`}
                              >
                                {date.getDate()}
                              </span>

                              {isFullyClosed ? (
                                <Lock className="h-3.5 w-3.5 text-red-500 sm:h-4 sm:w-4" />
                              ) : isPartiallyClosed ? (
                                <Lock className="h-3.5 w-3.5 text-amber-500 sm:h-4 sm:w-4" />
                              ) : item ? (
                                <Unlock className="h-3.5 w-3.5 text-sage sm:h-4 sm:w-4" />
                              ) : null}

                            </div>

                            {/* DATA */}

                            {item && (
                              <div className="mt-3 space-y-2 sm:mt-5 sm:space-y-3">

                                {/* AVAILABLE */}

                                <div>
                                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground sm:text-[10px]">
                                    Available
                                  </p>

                                  <p className="mt-0.5 text-xs font-semibold text-espresso sm:mt-1 sm:text-sm">
                                    {
                                      item.availableCount
                                    }

                                    <span className="font-normal text-muted-foreground">
                                      {" "}
                                      /{" "}
                                      {
                                        item.totalCount
                                      }
                                    </span>
                                  </p>
                                </div>

                                {/* BOOKED */}

                                <div className="hidden sm:block">
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                    Booked
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-espresso">
                                    {
                                      item.bookCount
                                    }
                                  </p>
                                </div>

                                {/* PRICE */}

                                <div className="hidden sm:block">
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                    Price
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-espresso">
                                    {formatCurrency(
                                      item.price
                                    )}
                                  </p>
                                </div>

                                {/* SURGE */}

                                {Math.abs(
                                  item.surgeFactor -
                                    1
                                ) >
                                  0.001 && (
                                  <span className="inline-flex rounded-md bg-bronze/10 px-2 py-1 text-[9px] font-semibold text-bronze sm:text-[10px]">
                                    {item.surgeFactor.toFixed(
                                      2
                                    )}
                                    ×
                                  </span>
                                )}

                                {/* CLOSED */}

                                {isFullyClosed && (
                                  <span className="inline-flex rounded-md bg-red-50 px-2 py-1 text-[9px] font-semibold text-red-600 sm:text-[10px]">
                                    Closed
                                  </span>
                                )}

                                {isPartiallyClosed && (
                                  <span className="inline-flex rounded-md bg-amber-50 px-2 py-1 text-[9px] font-semibold text-amber-600 sm:text-[10px]">
                                    Partial
                                  </span>
                                )}

                              </div>
                            )}

                          </motion.button>
                        );
                      }
                    )}

                  </div>

                  {/* LEGEND */}

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">

                    <div className="flex items-center gap-2">
                      <Unlock className="h-3.5 w-3.5 text-sage" />
                      Available
                    </div>

                    <div className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-red-500" />
                      Fully closed
                    </div>

                    <div className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-amber-500" />
                      Partially closed
                    </div>

                    <div className="flex items-center gap-2">
                      <CircleDollarSign className="h-3.5 w-3.5 text-bronze" />
                      Pricing
                    </div>

                  </div>

                </div>
              )}

            </section>
          </>
        )}

      </div>

      {/* =====================================================
          UPDATE MODAL
      ===================================================== */}

      {modalOpen && selectedInventory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97,
              y: 8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
          >

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-warm-stone/20 px-5 py-5 sm:px-6">

              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Room Type Inventory
                </p>

                <h2 className="mt-1 font-serif text-xl font-semibold text-espresso">
                  {formatRoomType(
                    selectedGroup?.roomType ?? ""
                  )}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDate(
                    selectedInventory.date
                  )}{" "}
                  ·{" "}
                  {selectedInventory.totalRooms}{" "}
                  physical{" "}
                  {selectedInventory.totalRooms ===
                  1
                    ? "room"
                    : "rooms"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-cream hover:text-espresso disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* CURRENT INVENTORY */}

            <div className="grid grid-cols-3 gap-3 px-5 pt-5 sm:px-6">

              <MiniStat
                label="Available"
                value={
                  selectedInventory.availableCount
                }
              />

              <MiniStat
                label="Booked"
                value={
                  selectedInventory.bookCount
                }
              />

              <MiniStat
                label="Reserved"
                value={
                  selectedInventory.reservedCount
                }
              />

            </div>

            {/* FORM */}

            <form
              onSubmit={saveInventory}
              className="space-y-5 p-5 sm:p-6"
            >

              {/* DATE RANGE */}

              <div className="grid gap-4 sm:grid-cols-2">

                <FormField label="Start date">
                  <input
                    type="date"
                    value={startDate}
                    min={
                      selectedInventory.date
                    }
                    onChange={(event) =>
                      setStartDate(
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-warm-stone/30 px-3 text-sm text-espresso outline-none transition focus:border-bronze focus:ring-2 focus:ring-bronze/10"
                  />
                </FormField>

                <FormField label="End date">
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(event) =>
                      setEndDate(
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-warm-stone/30 px-3 text-sm text-espresso outline-none transition focus:border-bronze focus:ring-2 focus:ring-bronze/10"
                  />
                </FormField>

              </div>

              <div className="rounded-xl border border-warm-stone/20 bg-cream/40 p-4">

                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Room type update
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  This change will be applied to
                  every physical room in this room
                  type.
                </p>

              </div>

              {/* SURGE */}

              <FormField label="Surge factor">

                <div className="relative">

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={surgeFactor}
                    onChange={(event) =>
                      setSurgeFactor(
                        Number(
                          event.target.value
                        )
                      )
                    }
                    className="h-11 w-full rounded-xl border border-warm-stone/30 px-3 pr-16 text-sm text-espresso outline-none transition focus:border-bronze focus:ring-2 focus:ring-bronze/10"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                    × base
                  </span>

                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  1.00 = base price · 1.20 =
                  20% increase
                </p>

              </FormField>

              {/* PRICE */}

              <div className="flex items-center justify-between rounded-xl border border-warm-stone/20 bg-white p-4">

                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Current room-type price
                  </p>

                  <p className="mt-1 text-lg font-semibold text-espresso">
                    {formatCurrency(
                      selectedInventory.price
                    )}
                  </p>
                </div>

                <CircleDollarSign className="h-5 w-5 text-bronze" />

              </div>

              {/* CLOSED */}

              <div className="flex items-center justify-between rounded-xl border border-warm-stone/20 p-4">

                <div className="pr-4">

                  <p className="text-sm font-medium text-espresso">
                    Close this room type
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Prevent all physical rooms of
                    this type from being sold for
                    the selected date range.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setClosed(
                      (current) => !current
                    )
                  }
                  aria-pressed={closed}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    closed
                      ? "bg-red-500"
                      : "bg-warm-stone/40"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                      closed
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>

              </div>

              {/* ACTIONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-warm-stone/20 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-espresso transition hover:bg-cream disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-bronze px-5 py-2.5 text-sm font-medium text-white transition hover:bg-bronze-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Update Room Type
                    </>
                  )}
                </button>

              </div>

            </form>

          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}

/* ===========================================================
   HEADER
=========================================================== */

function Header() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bronze">
        Availability Management
      </p>

      <h1 className="mt-2 font-serif text-3xl font-bold text-espresso">
        Inventory
      </h1>

      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Manage availability across your room
        types instead of individual physical rooms.
      </p>
    </div>
  );
}

/* ===========================================================
   SUMMARY CARD
=========================================================== */

function SummaryCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-warm-stone/20 bg-white p-5 shadow-warm">
      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </p>

          <p className="mt-2 font-serif text-2xl font-bold text-espresso">
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bronze/10 text-bronze">
          {icon}
        </div>

      </div>
    </div>
  );
}

/* ===========================================================
   MINI STAT
=========================================================== */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-cream/70 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-espresso">
        {value}
      </p>
    </div>
  );
}

/* ===========================================================
   FORM FIELD
=========================================================== */

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-espresso">
        {label}
      </label>

      {children}
    </div>
  );
}

/* ===========================================================
   EMPTY STATE
=========================================================== */

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-warm-stone/30 bg-white p-12 text-center shadow-warm">
      <div className="mx-auto flex justify-center">
        {icon}
      </div>

      <h2 className="mt-5 font-serif text-xl font-semibold text-espresso">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

/* ===========================================================
   LOADING
=========================================================== */

function LoadingState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-warm-stone/20 bg-white p-16 text-center shadow-warm">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-bronze/20 border-t-bronze" />

      <p className="mt-4 text-sm text-muted-foreground">
        {text}
      </p>
    </div>
  );
}