import { useState } from "react";
import { useLocation } from "wouter";
import {
  Search,
  Calendar,
  Users,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";


export default function SearchWidget() {

  const [, setLocation] = useLocation();

  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);


  const handleSearch = (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    const params = new URLSearchParams();

    if (city) {
      params.set("city", city);
    }

    if (checkIn) {
      params.set("checkIn", checkIn);
    }

    if (checkOut) {
      params.set("checkOut", checkOut);
    }

    params.set(
      "adults",
      adults.toString()
    );

    if (children > 0) {
      params.set(
        "children",
        children.toString()
      );
    }

    setLocation(
      `/search?${params.toString()}`
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

        {/* =====================================
            DESTINATION
        ====================================== */}

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


        {/* =====================================
            CHECK IN
        ====================================== */}

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
              value={checkIn}
              onChange={(e) =>
                setCheckIn(e.target.value)
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


        {/* =====================================
            CHECK OUT
        ====================================== */}

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
              value={checkOut}
              onChange={(e) =>
                setCheckOut(e.target.value)
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


        {/* =====================================
            GUESTS
        ====================================== */}

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

            {/* Adults */}

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


            {/* Children */}

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


        {/* =====================================
            SEARCH BUTTON
        ====================================== */}

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