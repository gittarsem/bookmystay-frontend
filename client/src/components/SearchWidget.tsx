import { useState } from "react";
import { useLocation } from "wouter";
import {
  Search,
  Calendar,
  Clock,
  Users,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";

export default function SearchWidget() {
  const [, setLocation] = useLocation();

  const [city, setCity] = useState("");

  const [bookingMode, setBookingMode] =
    useState<"DAILY" | "HOURLY">("DAILY");

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const today =
    new Date().toISOString().split("T")[0];

  /* =========================================================
     BOOKING MODE
     ========================================================= */

  const handleBookingModeChange = (
    mode: "DAILY" | "HOURLY"
  ) => {
    setBookingMode(mode);

    /*
     * Daily bookings do not use time.
     */
    if (mode === "DAILY") {
      setCheckInTime("");
      setCheckOutTime("");
    }

    /*
     * Hourly bookings are same-day bookings.
     */
    if (mode === "HOURLY" && checkInDate) {
      setCheckOutDate(checkInDate);
    }
  };

  /* =========================================================
     CHECK-IN DATE
     ========================================================= */

  const handleCheckInDateChange = (
    value: string
  ) => {
    setCheckInDate(value);

    /*
     * Hourly bookings are always same-day.
     */
    if (bookingMode === "HOURLY") {
      setCheckOutDate(value);
    }

    /*
     * For daily bookings, if the current
     * checkout date becomes invalid, clear it.
     */
    if (
      bookingMode === "DAILY" &&
      checkOutDate &&
      value > checkOutDate
    ) {
      setCheckOutDate("");
    }
  };

  /* =========================================================
     CHECK-OUT DATE
     ========================================================= */

  const handleCheckOutDateChange = (
    value: string
  ) => {
    /*
     * Hourly booking must remain on the
     * same date as check-in.
     */
    if (
      bookingMode === "HOURLY" &&
      value !== checkInDate
    ) {
      return;
    }

    setCheckOutDate(value);
  };

  /* =========================================================
     SEARCH
     ========================================================= */

  const handleSearch = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    /*
     * IMPORTANT:
     *
     * Search does NOT require dates.
     *
     * A user can search:
     *
     *   /search
     *
     * or:
     *
     *   /search?city=Manali
     *
     * or:
     *
     *   /search?city=Manali&checkInDate=...
     *
     * Dates will only be included if the user
     * actually selected them.
     */

    const params = new URLSearchParams();

    /* -------------------------------------------------------
       DESTINATION
       ------------------------------------------------------- */

    if (city.trim()) {
      params.set(
        "city",
        city.trim()
      );
    }

    /* -------------------------------------------------------
       BOOKING MODE
       ------------------------------------------------------- */

    params.set(
      "bookingMode",
      bookingMode
    );

    /* -------------------------------------------------------
       DATES
       ------------------------------------------------------- */

    if (checkInDate) {
      params.set(
        "checkInDate",
        checkInDate
      );
    }

    if (checkOutDate) {
      params.set(
        "checkOutDate",
        checkOutDate
      );
    }

    /* -------------------------------------------------------
       HOURLY TIME
       ------------------------------------------------------- */

    /*
     * Time is sent ONLY for hourly searches.
     *
     * Since search dates/times are optional,
     * we do NOT validate them here.
     */

    if (bookingMode === "HOURLY") {
      if (checkInTime) {
        params.set(
          "checkInTime",
          checkInTime
        );
      }

      if (checkOutTime) {
        params.set(
          "checkOutTime",
          checkOutTime
        );
      }
    }

    /* -------------------------------------------------------
       GUESTS
       ------------------------------------------------------- */

    params.set(
      "adults",
      adults.toString()
    );

    params.set(
      "children",
      children.toString()
    );

    /* -------------------------------------------------------
       NAVIGATE
       ------------------------------------------------------- */

    const queryString =
      params.toString();

    setLocation(
      queryString
        ? `/search?${queryString}`
        : "/search"
    );
  };

  return (
    <motion.form
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
        delay: 0.3,
      }}
      onSubmit={handleSearch}
      className="
        glass
        mx-auto
        w-full
        max-w-6xl
        rounded-3xl
        border
        border-white/30
        p-5
        shadow-warm-lg
        md:p-6
      "
    >
      {/* =====================================================
          BOOKING MODE
          ===================================================== */}

      <div className="mb-5">
        <label
          className="
            mb-2
            block
            text-xs
            font-medium
            uppercase
            tracking-widest
            text-muted-foreground
          "
        >
          Booking Type
        </label>

        <div
          className="
            flex
            w-fit
            rounded-2xl
            border
            border-warm-stone/30
            bg-white
            p-1
          "
        >
          <button
            type="button"
            onClick={() =>
              handleBookingModeChange("DAILY")
            }
            className={`
              rounded-xl
              px-6
              py-2.5
              text-sm
              font-semibold
              transition-all
              ${
                bookingMode === "DAILY"
                  ? "bg-bronze text-white shadow-sm"
                  : "text-espresso hover:bg-warm-stone/10"
              }
            `}
          >
            Daily
          </button>

          <button
            type="button"
            onClick={() =>
              handleBookingModeChange("HOURLY")
            }
            className={`
              rounded-xl
              px-6
              py-2.5
              text-sm
              font-semibold
              transition-all
              ${
                bookingMode === "HOURLY"
                  ? "bg-bronze text-white shadow-sm"
                  : "text-espresso hover:bg-warm-stone/10"
              }
            `}
          >
            Hourly
          </button>
        </div>
      </div>

      {/* =====================================================
          SEARCH FIELDS
          ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-4
          md:grid-cols-12
          md:gap-3
          lg:gap-4
        "
      >
        {/* ===================================================
            DESTINATION
            =================================================== */}

        <div className="md:col-span-3">
          <label
            className="
              mb-2
              block
              text-xs
              font-medium
              uppercase
              tracking-widest
              text-muted-foreground
            "
          >
            Destination
          </label>

          <div className="relative">
            <MapPin
              className="
                absolute
                left-4
                top-1/2
                h-5
                w-5
                -translate-y-1/2
                text-bronze
              "
            />

            <input
              type="text"
              value={city}
              onChange={(e) =>
                setCity(e.target.value)
              }
              placeholder="Where to?"
              className="
                h-14
                w-full
                rounded-2xl
                border
                border-warm-stone/30
                bg-white
                pl-12
                pr-4
                text-sm
                text-espresso
                shadow-sm
                outline-none
                transition-all
                placeholder:text-muted-foreground
                focus:border-bronze
                focus:ring-2
                focus:ring-bronze/20
              "
            />
          </div>
        </div>

        {/* ===================================================
            CHECK-IN DATE
            =================================================== */}

        <div
          className={
            bookingMode === "HOURLY"
              ? "md:col-span-2"
              : "md:col-span-3"
          }
        >
          <label
            className="
              mb-2
              block
              text-xs
              font-medium
              uppercase
              tracking-widest
              text-muted-foreground
            "
          >
            Check In
          </label>

          <div className="relative">
            <Calendar
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                z-10
                h-5
                w-5
                -translate-y-1/2
                text-bronze
              "
            />

            <input
              type="date"
              value={checkInDate}
              min={today}
              onChange={(e) =>
                handleCheckInDateChange(
                  e.target.value
                )
              }
              className="
                h-14
                w-full
                min-w-0
                rounded-2xl
                border
                border-warm-stone/30
                bg-white
                px-4
                pl-12
                text-sm
                text-espresso
                shadow-sm
                outline-none
                transition-all
                focus:border-bronze
                focus:ring-2
                focus:ring-bronze/20
              "
            />
          </div>
        </div>

        {/* ===================================================
            CHECK-IN TIME — HOURLY ONLY
            =================================================== */}

        {bookingMode === "HOURLY" && (
          <div className="md:col-span-2">
            <label
              className="
                mb-2
                block
                text-xs
                font-medium
                uppercase
                tracking-widest
                text-muted-foreground
              "
            >
              Check In Time
            </label>

            <div className="relative">
              <Clock
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  z-10
                  h-5
                  w-5
                  -translate-y-1/2
                  text-bronze
                "
              />

              <input
                type="time"
                value={checkInTime}
                onChange={(e) =>
                  setCheckInTime(
                    e.target.value
                  )
                }
                className="
                  h-14
                  w-full
                  rounded-2xl
                  border
                  border-warm-stone/30
                  bg-white
                  px-4
                  pl-12
                  text-sm
                  text-espresso
                  shadow-sm
                  outline-none
                  transition-all
                  focus:border-bronze
                  focus:ring-2
                  focus:ring-bronze/20
                "
              />
            </div>
          </div>
        )}

        {/* ===================================================
            CHECK-OUT DATE
            =================================================== */}

        <div
          className={
            bookingMode === "HOURLY"
              ? "md:col-span-2"
              : "md:col-span-3"
          }
        >
          <label
            className="
              mb-2
              block
              text-xs
              font-medium
              uppercase
              tracking-widest
              text-muted-foreground
            "
          >
            Check Out
          </label>

          <div className="relative">
            <Calendar
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                z-10
                h-5
                w-5
                -translate-y-1/2
                text-bronze
              "
            />

            <input
              type="date"
              value={checkOutDate}
              min={
                checkInDate || today
              }
              max={
                bookingMode === "HOURLY"
                  ? checkInDate
                  : undefined
              }
              onChange={(e) =>
                handleCheckOutDateChange(
                  e.target.value
                )
              }
              className="
                h-14
                w-full
                min-w-0
                rounded-2xl
                border
                border-warm-stone/30
                bg-white
                px-4
                pl-12
                text-sm
                text-espresso
                shadow-sm
                outline-none
                transition-all
                focus:border-bronze
                focus:ring-2
                focus:ring-bronze/20
              "
            />
          </div>
        </div>

        {/* ===================================================
            CHECK-OUT TIME — HOURLY ONLY
            =================================================== */}

        {bookingMode === "HOURLY" && (
          <div className="md:col-span-2">
            <label
              className="
                mb-2
                block
                text-xs
                font-medium
                uppercase
                tracking-widest
                text-muted-foreground
              "
            >
              Check Out Time
            </label>

            <div className="relative">
              <Clock
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  z-10
                  h-5
                  w-5
                  -translate-y-1/2
                  text-bronze
                "
              />

              <input
                type="time"
                value={checkOutTime}
                onChange={(e) =>
                  setCheckOutTime(
                    e.target.value
                  )
                }
                className="
                  h-14
                  w-full
                  rounded-2xl
                  border
                  border-warm-stone/30
                  bg-white
                  px-4
                  pl-12
                  text-sm
                  text-espresso
                  shadow-sm
                  outline-none
                  transition-all
                  focus:border-bronze
                  focus:ring-2
                  focus:ring-bronze/20
                "
              />
            </div>
          </div>
        )}

        {/* ===================================================
            GUESTS
            =================================================== */}

        <div className="md:col-span-3">
          <label
            className="
              mb-2
              block
              text-xs
              font-medium
              uppercase
              tracking-widest
              text-muted-foreground
            "
          >
            Guests
          </label>

          <div
            className="
              flex
              h-14
              w-full
              items-center
              rounded-2xl
              border
              border-warm-stone/30
              bg-white
              px-4
              shadow-sm
            "
          >
            <Users
              className="
                mr-3
                h-5
                w-5
                shrink-0
                text-bronze
              "
            />

            {/* ADULTS */}

            <select
              value={adults}
              onChange={(e) =>
                setAdults(
                  Number(e.target.value)
                )
              }
              className="
                min-w-0
                flex-1
                cursor-pointer
                appearance-none
                bg-transparent
                text-sm
                text-espresso
                outline-none
              "
            >
              {[1, 2, 3, 4, 5, 6].map(
                (n) => (
                  <option
                    key={n}
                    value={n}
                  >
                    {n} Adult
                    {n > 1 ? "s" : ""}
                  </option>
                )
              )}
            </select>

            <span
              className="
                mx-2
                text-warm-stone
              "
            >
              |
            </span>

            {/* CHILDREN */}

            <select
              value={children}
              onChange={(e) =>
                setChildren(
                  Number(e.target.value)
                )
              }
              className="
                min-w-0
                flex-1
                cursor-pointer
                appearance-none
                bg-transparent
                text-sm
                text-espresso
                outline-none
              "
            >
              {[0, 1, 2, 3].map(
                (n) => (
                  <option
                    key={n}
                    value={n}
                  >
                    {n} Child
                    {n !== 1
                      ? "ren"
                      : ""}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* ===================================================
            SEARCH BUTTON
            =================================================== */}

        <div
          className="
            flex
            items-end
            md:col-span-2
          "
        >
          <button
            type="submit"
            className="
              flex
              h-14
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-bronze
              px-6
              text-sm
              font-semibold
              text-white
              shadow-md
              transition-all
              duration-200
              hover:bg-bronze-dark
              hover:shadow-lg
              active:scale-[0.97]
            "
          >
            <Search className="h-5 w-5" />

            <span>
              Search
            </span>
          </button>
        </div>
      </div>
    </motion.form>
  );
}