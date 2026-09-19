import { useState } from "react";
import { useLocation } from "wouter";
import {
  Search,
  Calendar,
  Clock,
  Users,
  MapPin,
  Building2,
  Compass,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

export default function SearchWidget() {
  const [, setLocation] = useLocation();

  const [city, setCity] = useState("");
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState("");

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

  const destinationOptions = {
    popular: [
      {
        name: "Goa",
        subtitle: "Beach stays & resorts",
        type: "Destination",
      },
      {
        name: "Manali",
        subtitle: "Mountain stays",
        type: "Destination",
      },
      {
        name: "Amritsar",
        subtitle: "Golden Temple & city stays",
        type: "City",
      },
      {
        name: "Delhi",
        subtitle: "Hotels & city stays",
        type: "City",
      },
      {
        name: "Mumbai",
        subtitle: "Hotels & business stays",
        type: "City",
      },
      {
        name: "Jaipur",
        subtitle: "Heritage stays",
        type: "City",
      },
    ],
    hotels: [
      {
        name: "Grand Hyatt Kochi Bolgatty",
        subtitle: "Kochi, Kerala",
        type: "Hotel",
      },
      {
        name: "Taj Lakefront",
        subtitle: "Bhopal, Madhya Pradesh",
        type: "Hotel",
      },
      {
        name: "The Oberoi Mumbai",
        subtitle: "Mumbai, Maharashtra",
        type: "Hotel",
      },
      {
        name: "Taj Palace",
        subtitle: "New Delhi, Delhi",
        type: "Hotel",
      },
    ],
    areas: [
      {
        name: "Golden Temple",
        subtitle: "Amritsar, Punjab",
        type: "Landmark",
      },
      {
        name: "Mall Road",
        subtitle: "Shimla, Himachal Pradesh",
        type: "Area",
      },
      {
        name: "Marine Drive",
        subtitle: "Mumbai, Maharashtra",
        type: "Area",
      },
      {
        name: "MG Road",
        subtitle: "Bengaluru, Karnataka",
        type: "Area",
      },
    ],
    states: [
      {
        name: "Himachal Pradesh",
        subtitle: "Mountain destinations",
        type: "State",
      },
      {
        name: "Punjab",
        subtitle: "Amritsar, Ludhiana & more",
        type: "State",
      },
      {
        name: "Kerala",
        subtitle: "Kochi, Munnar & more",
        type: "State",
      },
      {
        name: "Rajasthan",
        subtitle: "Jaipur, Udaipur & more",
        type: "State",
      },
    ],
  };

  const allDestinationOptions = [
    ...destinationOptions.popular,
    ...destinationOptions.hotels,
    ...destinationOptions.areas,
    ...destinationOptions.states,
  ];

  const filteredDestinationOptions = allDestinationOptions.filter(
    (item) => {
      const query = destinationQuery.trim().toLowerCase();

      if (!query) {
        return true;
      }

      return (
        item.name.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
      );
    }
  );


  const handleBookingModeChange = (
    mode: "DAILY" | "HOURLY"
  ) => {
    setBookingMode(mode);

    if (mode === "DAILY") {
      setCheckInTime("");
      setCheckOutTime("");
    }

    if (mode === "HOURLY" && checkInDate) {
      setCheckOutDate(checkInDate);
    }
  };


  const handleCheckInDateChange = (
    value: string
  ) => {
    setCheckInDate(value);

    if (bookingMode === "HOURLY") {
      setCheckOutDate(value);
    }

    if (
      bookingMode === "DAILY" &&
      checkOutDate &&
      value > checkOutDate
    ) {
      setCheckOutDate("");
    }
  };


  const handleCheckOutDateChange = (
    value: string
  ) => {
    if (
      bookingMode === "HOURLY" &&
      value !== checkInDate
    ) {
      return;
    }

    setCheckOutDate(value);
  };


  const handleSearch = (
    e: React.FormEvent
  ) => {
    e.preventDefault();


    const params = new URLSearchParams();


    if (city.trim()) {
      params.set(
        "city",
        city.trim()
      );
    }


    params.set(
      "bookingMode",
      bookingMode
    );


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


    params.set(
      "adults",
      adults.toString()
    );

    params.set(
      "children",
      children.toString()
    );


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
              ${bookingMode === "DAILY"
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
              ${bookingMode === "HOURLY"
                ? "bg-bronze text-white shadow-sm"
                : "text-espresso hover:bg-warm-stone/10"
              }
            `}
          >
            Hourly
          </button>
        </div>
      </div>



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


        <div className="relative md:col-span-3">
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

          <button
            type="button"
            onClick={() => setDestinationOpen(true)}
            className="
              flex
              h-14
              w-full
              items-center
              gap-3
              rounded-2xl
              border
              border-warm-stone/30
              bg-white
              px-4
              text-left
              shadow-sm
              outline-none
              transition-all
              hover:border-bronze
              focus:border-bronze
              focus:ring-2
              focus:ring-bronze/20
            "
          >
            <MapPin className="h-5 w-5 shrink-0 text-bronze" />

            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-sm ${city
                    ? "font-medium text-espresso"
                    : "text-muted-foreground"
                  }`}
              >
                {city || "Where to?"}
              </p>

              {city && (
                <p className="truncate text-[11px] text-muted-foreground">
                  Hotel, city or destination
                </p>
              )}
            </div>
          </button>

          {destinationOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]">
              <button
                type="button"
                aria-label="Close destination search"
                onClick={() => setDestinationOpen(false)}
                className="absolute inset-0 h-full w-full cursor-default"
              />

              <div
                className="
                  relative
                  z-10
                  w-full
                  max-w-2xl
                  overflow-hidden
                  rounded-3xl
                  border
                  border-warm-stone/20
                  bg-white
                  shadow-2xl
                "
              >
                <div className="border-b border-warm-stone/10 p-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-bronze">
                        Destination
                      </p>
                      <h3 className="mt-1 text-xl font-semibold text-espresso">
                        Where would you like to go?
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setDestinationQuery("");
                        setDestinationOpen(false);
                      }}
                      className="rounded-full p-2 text-muted-foreground transition hover:bg-warm-stone/10 hover:text-espresso"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div
                    className="
                      flex
                      h-14
                      items-center
                      gap-3
                      rounded-2xl
                      border-2
                      border-warm-stone/30
                      bg-white
                      px-4
                      shadow-sm
                      transition
                      focus-within:border-bronze
                      focus-within:ring-2
                      focus-within:ring-bronze/10
                    "
                  >
                    <Search className="h-5 w-5 shrink-0 text-bronze" />

                    <input
                      autoFocus
                      type="text"
                      value={destinationQuery}
                      onChange={(e) =>
                        setDestinationQuery(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();

                          const value = destinationQuery.trim();

                          if (!value) {
                            return;
                          }

                          setCity(value);
                          setDestinationQuery("");
                          setDestinationOpen(false);
                        }
                      }}
                      placeholder="Search hotel, city, state or landmark"
                      className="
                        min-w-0
                        flex-1
                        bg-transparent
                        text-sm
                        text-espresso
                        outline-none
                        placeholder:text-muted-foreground
                      "
                    />

                    {destinationQuery && (
                      <button
                        type="button"
                        onClick={() => setDestinationQuery("")}
                        className="rounded-full p-1.5 text-muted-foreground transition hover:bg-warm-stone/10 hover:text-espresso"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <p className="mt-2 px-1 text-xs text-muted-foreground">
                    Search by hotel, city, state, area or landmark
                  </p>
                </div>

                <div className="max-h-[430px] overflow-y-auto p-5">
                  {!destinationQuery.trim() ? (
                    <div className="space-y-6">
                      <section>
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-warm-stone">
                            Popular searches
                          </h4>
                          <Compass className="h-4 w-4 text-bronze" />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {[
                            "Goa",
                            "Manali",
                            "Kochi",
                            "Kerala",
                            "Hyatt",
                            "Golden Temple",
                          ].map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setDestinationQuery(item)}
                              className="rounded-full border border-warm-stone/20 bg-white px-4 py-2 text-xs font-medium text-espresso transition hover:border-bronze/40 hover:bg-bronze/5"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </section>

                      <section>
                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-warm-stone">
                          Popular destinations
                        </h4>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {destinationOptions.popular.map((item) => (
                            <button
                              key={`${item.type}-${item.name}`}
                              type="button"
                              onClick={() => {
                                setCity(item.name);
                                setDestinationQuery("");
                                setDestinationOpen(false);
                              }}
                              className="flex items-center gap-3 rounded-xl border border-warm-stone/15 p-3 text-left transition hover:border-bronze/30 hover:bg-cream"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bronze/10">
                                <MapPin className="h-5 w-5 text-bronze" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-espresso">
                                  {item.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {item.subtitle}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </section>

                      <section>
                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-warm-stone">
                          Hotels & landmarks
                        </h4>

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                          {[
                            ...destinationOptions.hotels.slice(0, 2),
                            ...destinationOptions.areas.slice(0, 2),
                          ].map((item) => (
                            <button
                              key={`${item.type}-${item.name}`}
                              type="button"
                              onClick={() => {
                                setCity(item.name);
                                setDestinationQuery("");
                                setDestinationOpen(false);
                              }}
                              className="flex items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-cream"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bronze/10">
                                {item.type === "Hotel" ? (
                                  <Building2 className="h-4 w-4 text-bronze" />
                                ) : (
                                  <Compass className="h-4 w-4 text-bronze" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-espresso">
                                  {item.name}
                                </p>
                                <p className="truncate text-[11px] text-muted-foreground">
                                  {item.subtitle}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </section>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-warm-stone">
                          Search results
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {filteredDestinationOptions.length} found
                        </span>
                      </div>

                      {filteredDestinationOptions.length > 0 ? (
                        <div className="space-y-1">
                          {filteredDestinationOptions.map((item) => (
                            <button
                              key={`${item.type}-${item.name}`}
                              type="button"
                              onClick={() => {
                                setCity(item.name);
                                setDestinationQuery("");
                                setDestinationOpen(false);
                              }}
                              className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-cream"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bronze/10">
                                {item.type === "Hotel" ? (
                                  <Building2 className="h-5 w-5 text-bronze" />
                                ) : item.type === "Landmark" || item.type === "Area" ? (
                                  <Compass className="h-5 w-5 text-bronze" />
                                ) : (
                                  <MapPin className="h-5 w-5 text-bronze" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-espresso">
                                  {item.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {item.subtitle}
                                </p>
                              </div>

                              <span className="shrink-0 text-[11px] text-muted-foreground">
                                {item.type}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-warm-stone/30 p-8 text-center">
                          <Search className="mx-auto h-7 w-7 text-bronze/70" />
                          <p className="mt-3 text-sm font-medium text-espresso">
                            No suggestions found
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            You can still search for "{destinationQuery}"
                          </p>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setCity(destinationQuery.trim());
                          setDestinationQuery("");
                          setDestinationOpen(false);
                        }}
                        className="mt-4 flex w-full items-center gap-3 rounded-xl border border-bronze/20 bg-bronze/5 p-3 text-left transition hover:bg-bronze/10"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bronze">
                          <Search className="h-4 w-4 text-white" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-espresso">
                            Search for "{destinationQuery}"
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Use this destination in your hotel search
                          </p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

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
