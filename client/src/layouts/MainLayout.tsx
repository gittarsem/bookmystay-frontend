import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

import {
  Search,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Compass,
  LayoutDashboard,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";


interface MainLayoutProps {
  children: ReactNode;
}


export default function MainLayout({
  children,
}: MainLayoutProps) {

  const {
    user,
    isAuthenticated,
    logout,
    hasRole,
  } = useAuth();


  const [scrolled, setScrolled] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [location] =
    useLocation();


  // =========================================================
  // SCROLL ANIMATION
  // =========================================================

  useEffect(() => {

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };

  }, []);


  // =========================================================
  // CLOSE MOBILE MENU ON ROUTE CHANGE
  // =========================================================

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);


  // =========================================================
  // NAVBAR
  // =========================================================

  const isHomePage =
    location === "/";


  const navBg =
    scrolled || !isHomePage
      ? `
          bg-white/95
          backdrop-blur-xl
          shadow-warm
          border-b
          border-warm-stone/20
        `
      : `
          bg-white/75
          backdrop-blur-md
          border-b
          border-white/30
        `;


  // =========================================================
  // NAV LINKS
  // =========================================================

  const navLinks = [

    {
      label: "Home",
      href: "/",
    },

    {
      label: "Explore",
      href: "/search",
    },

    {
      label: "About",
      href: "/about",
    },

    {
      label: "List Property",
      href: "/list-property",
    },

  ];


  return (

    <div
      className="
        flex
        min-h-screen
        flex-col
        bg-cream
      "
    >

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header
        className={`
          fixed
          left-0
          right-0
          top-0
          z-50
          w-full
          transition-all
          duration-300
          ease-in-out
          ${navBg}
        `}
      >

        <div
          className="
            container
            flex
            h-16
            items-center
            justify-between
            md:h-20
          "
        >

          {/* LOGO */}

          <Link href="/">

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <Compass
                className="
                  h-8
                  w-8
                  text-bronze
                  transition-all
                  duration-300
                "
              />

              <span
                className="
                  font-serif
                  text-xl
                  font-bold
                  text-espresso
                  transition-colors
                  duration-300
                  md:text-2xl
                "
              >
                BookMyStay
              </span>

            </div>

          </Link>


          {/* =================================================
              DESKTOP NAVIGATION
          ================================================== */}

          <nav
            className="
              hidden
              items-center
              gap-8
              md:flex
            "
          >

            {navLinks.map((link) => (

              <Link
                key={link.href}
                href={link.href}
              >

                <span
                  className={`
                    text-sm
                    font-medium
                    uppercase
                    tracking-wide
                    transition-all
                    duration-300
                    hover:text-bronze
                    ${
                      location === link.href
                        ? "text-bronze"
                        : "text-espresso"
                    }
                  `}
                >
                  {link.label}
                </span>

              </Link>

            ))}

          </nav>


          {/* =================================================
              AUTH SECTION
          ================================================== */}

          <div
            className="
              hidden
              items-center
              gap-4
              md:flex
            "
          >

            {isAuthenticated ? (

              <DropdownMenu>

                <DropdownMenuTrigger
                  asChild
                >

                  <button
                    className="
                      flex
                      items-center
                      gap-2
                      text-espresso
                      transition-opacity
                      duration-200
                      hover:opacity-80
                    "
                  >

                    <Avatar
                      className="
                        h-9
                        w-9
                        ring-2
                        ring-bronze/20
                      "
                    >

                      <AvatarFallback
                        className="
                          bg-bronze
                          text-sm
                          font-semibold
                          text-white
                        "
                      >
                        {user?.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>

                    </Avatar>


                    <span
                      className="
                        text-sm
                        font-medium
                        text-espresso
                      "
                    >
                      {user?.name ||
                        "Guest"}
                    </span>


                    <ChevronDown
                      className="
                        h-4
                        w-4
                        text-espresso
                      "
                    />

                  </button>

                </DropdownMenuTrigger>


                <DropdownMenuContent
                  align="end"
                  className="
                    w-56
                    rounded-xl
                    border
                    border-warm-stone
                    bg-white
                    p-1
                    shadow-warm-lg
                  "
                >

                  {/* My Bookings */}

                  <DropdownMenuItem
                    asChild
                  >

                    <Link
                      href="/my-bookings"
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-lg
                        px-3
                        py-2
                        hover:bg-cream
                      "
                    >

                      <Search
                        className="h-4 w-4"
                      />

                      My Bookings

                    </Link>

                  </DropdownMenuItem>


                  {/* Owner Dashboard */}

                  <DropdownMenuItem
                    asChild
                  >

                    <Link
                      href="/owner"
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-lg
                        px-3
                        py-2
                        hover:bg-cream
                      "
                    >

                      <LayoutDashboard
                        className="h-4 w-4"
                      />

                      Owner Dashboard

                    </Link>

                  </DropdownMenuItem>


                  {/* Admin */}

                  {hasRole("ROLE_ADMIN") && (

                    <DropdownMenuItem
                      asChild
                    >

                      <Link
                        href="/admin"
                        className="
                          flex
                          items-center
                          gap-2
                          rounded-lg
                          px-3
                          py-2
                          hover:bg-cream
                        "
                      >

                        <LayoutDashboard
                          className="h-4 w-4"
                        />

                        Admin Panel

                      </Link>

                    </DropdownMenuItem>

                  )}


                  <DropdownMenuSeparator
                    className="
                      bg-warm-stone/30
                    "
                  />


                  {/* Logout */}

                  <DropdownMenuItem
                    onClick={logout}
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-lg
                      px-3
                      py-2
                      text-red-600
                      hover:bg-red-50
                    "
                  >

                    <LogOut
                      className="h-4 w-4"
                    />

                    Logout

                  </DropdownMenuItem>

                </DropdownMenuContent>

              </DropdownMenu>

            ) : (

              <>

                <Link href="/login">

                  <Button
                    variant="ghost"
                    className="
                      text-sm
                      font-medium
                      text-espresso
                      transition-colors
                      hover:bg-transparent
                      hover:text-bronze
                    "
                  >
                    Sign In
                  </Button>

                </Link>


                <Link href="/register">

                  <Button
                    className="
                      rounded-full
                      bg-bronze
                      px-5
                      py-2
                      text-sm
                      font-medium
                      text-white
                      transition-all
                      hover:bg-bronze-dark
                    "
                  >
                    Join Free
                  </Button>

                </Link>

              </>

            )}

          </div>


          {/* =================================================
              MOBILE MENU BUTTON
          ================================================== */}

          <button
            className="
              p-2
              text-espresso
              transition-colors
              hover:text-bronze
              md:hidden
            "
            onClick={() =>
              setMobileMenuOpen(
                !mobileMenuOpen
              )
            }
            aria-label="Toggle menu"
          >

            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}

          </button>

        </div>


        {/* =====================================================
            MOBILE MENU
        ====================================================== */}

        {mobileMenuOpen && (

          <div
            className="
              absolute
              left-0
              right-0
              top-full
              border-t
              border-warm-stone/30
              bg-white
              shadow-warm-lg
              md:hidden
            "
          >

            <div
              className="
                container
                flex
                flex-col
                gap-3
                py-4
              "
            >

              {navLinks.map((link) => (

                <Link
                  key={link.href}
                  href={link.href}
                >

                  <span
                    className={`
                      block
                      py-2
                      font-medium
                      transition-colors
                      hover:text-bronze
                      ${
                        location === link.href
                          ? "text-bronze"
                          : "text-espresso"
                      }
                    `}
                  >
                    {link.label}
                  </span>

                </Link>

              ))}


              <div
                className="
                  my-2
                  h-px
                  bg-warm-stone/30
                "
              />


              {isAuthenticated ? (

                <>

                  <Link
                    href="/my-bookings"
                  >

                    <span
                      className="
                        block
                        py-2
                        font-medium
                        text-espresso
                        hover:text-bronze
                      "
                    >
                      My Bookings
                    </span>

                  </Link>


                  <Link
                    href="/owner"
                  >

                    <span
                      className="
                        block
                        py-2
                        font-medium
                        text-espresso
                        hover:text-bronze
                      "
                    >
                      Owner Dashboard
                    </span>

                  </Link>


                  {hasRole("ROLE_ADMIN") && (

                    <Link
                      href="/admin"
                    >

                      <span
                        className="
                          block
                          py-2
                          font-medium
                          text-espresso
                          hover:text-bronze
                        "
                      >
                        Admin Panel
                      </span>

                    </Link>

                  )}


                  <button
                    onClick={logout}
                    className="
                      py-2
                      text-left
                      font-medium
                      text-red-600
                      hover:text-red-700
                    "
                  >
                    Logout
                  </button>

                </>

              ) : (

                <>

                  <Link
                    href="/login"
                  >

                    <span
                      className="
                        block
                        py-2
                        font-medium
                        text-espresso
                        hover:text-bronze
                      "
                    >
                      Sign In
                    </span>

                  </Link>


                  <Link
                    href="/register"
                  >

                    <Button
                      className="
                        w-full
                        rounded-full
                        bg-bronze
                        text-white
                        hover:bg-bronze-dark
                      "
                    >
                      Join Free
                    </Button>

                  </Link>

                </>

              )}

            </div>

          </div>

        )}

      </header>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main
        className="
          flex-1
          pt-16
          md:pt-20
        "
      >
        {children}
      </main>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer
        className="
          bg-espresso
          text-white/80
        "
      >

        <div
          className="
            container
            py-16
          "
        >

          <div
            className="
              grid
              grid-cols-1
              gap-10
              md:grid-cols-4
            "
          >

            {/* BRAND */}

            <div>

              <div
                className="
                  mb-4
                  flex
                  items-center
                  gap-2
                "
              >

                <Compass
                  className="
                    h-7
                    w-7
                    text-bronze
                  "
                />

                <span
                  className="
                    font-serif
                    text-xl
                    font-bold
                    text-white
                  "
                >
                  BookMyStay
                </span>

              </div>


              <p
                className="
                  text-sm
                  leading-relaxed
                  text-white/60
                "
              >
                Curated luxury stays for the
                discerning traveler. Discover
                extraordinary accommodations
                around the world.
              </p>

            </div>


            {/* EXPLORE */}

            <div>

              <h4
                className="
                  mb-4
                  text-sm
                  font-semibold
                  uppercase
                  tracking-widest
                  text-bronze
                "
              >
                Explore
              </h4>


              <ul className="space-y-2">

                <li>

                  <Link href="/search">

                    <span
                      className="
                        cursor-pointer
                        text-sm
                        text-white/60
                        transition-colors
                        hover:text-bronze
                      "
                    >
                      Popular Destinations
                    </span>

                  </Link>

                </li>


                <li>

                  <Link href="/search">

                    <span
                      className="
                        cursor-pointer
                        text-sm
                        text-white/60
                        transition-colors
                        hover:text-bronze
                      "
                    >
                      Luxury Hotels
                    </span>

                  </Link>

                </li>


                <li>

                  <Link
                    href="/search?keyword=mountain"
                  >

                    <span
                      className="
                        cursor-pointer
                        text-sm
                        text-white/60
                        transition-colors
                        hover:text-bronze
                      "
                    >
                      Mountain Retreats
                    </span>

                  </Link>

                </li>


                <li>

                  <Link
                    href="/search?keyword=beach"
                  >

                    <span
                      className="
                        cursor-pointer
                        text-sm
                        text-white/60
                        transition-colors
                        hover:text-bronze
                      "
                    >
                      Beach Resorts
                    </span>

                  </Link>

                </li>

              </ul>

            </div>


            {/* COMPANY */}

            <div>

              <h4
                className="
                  mb-4
                  text-sm
                  font-semibold
                  uppercase
                  tracking-widest
                  text-bronze
                "
              >
                Company
              </h4>


              <ul className="space-y-2">

                <li>

                  <Link href="/about">

                    <span
                      className="
                        cursor-pointer
                        text-sm
                        text-white/60
                        transition-colors
                        hover:text-bronze
                      "
                    >
                      About Us
                    </span>

                  </Link>

                </li>


                <li>

                  <Link href="/list-property">

                    <span
                      className="
                        cursor-pointer
                        text-sm
                        text-white/60
                        transition-colors
                        hover:text-bronze
                      "
                    >
                      List Property
                    </span>

                  </Link>

                </li>

              </ul>

            </div>


            {/* SUPPORT */}

            <div>

              <h4
                className="
                  mb-4
                  text-sm
                  font-semibold
                  uppercase
                  tracking-widest
                  text-bronze
                "
              >
                Support
              </h4>


              <ul className="space-y-2">

                {/* IMPORTANT:
                    This must be /help, NOT /contact.
                */}

                <li>

                  <Link href="/help">

                    <span
                      className="
                        cursor-pointer
                        text-sm
                        text-white/60
                        transition-colors
                        hover:text-bronze
                      "
                    >
                      Help Center
                    </span>

                  </Link>

                </li>


                <li>

                  <Link href="/contact">

                    <span
                      className="
                        cursor-pointer
                        text-sm
                        text-white/60
                        transition-colors
                        hover:text-bronze
                      "
                    >
                      Contact Us
                    </span>

                  </Link>

                </li>


                <li>

                  <Link href="/terms">

                    <span
                      className="
                        cursor-pointer
                        text-sm
                        text-white/60
                        transition-colors
                        hover:text-bronze
                      "
                    >
                      Terms of Service
                    </span>

                  </Link>

                </li>


                <li>

                  <Link href="/privacy">

                    <span
                      className="
                        cursor-pointer
                        text-sm
                        text-white/60
                        transition-colors
                        hover:text-bronze
                      "
                    >
                      Privacy Policy
                    </span>

                  </Link>

                </li>

              </ul>

            </div>

          </div>


          {/* =================================================
              FOOTER BOTTOM
          ================================================== */}

          <div
            className="
              mt-12
              flex
              flex-col
              items-center
              justify-between
              gap-4
              border-t
              border-white/10
              pt-8
              md:flex-row
            "
          >

            <p
              className="
                text-xs
                text-white/40
              "
            >
              &copy;{" "}
              {new Date().getFullYear()}{" "}
              BookMyStay. All rights reserved.
            </p>


            <div
              className="
                flex
                gap-6
              "
            >

              <span
                className="
                  cursor-pointer
                  text-xs
                  text-white/40
                  transition-colors
                  hover:text-bronze
                "
              >
                Instagram
              </span>


              <span
                className="
                  cursor-pointer
                  text-xs
                  text-white/40
                  transition-colors
                  hover:text-bronze
                "
              >
                Twitter
              </span>


              <span
                className="
                  cursor-pointer
                  text-xs
                  text-white/40
                  transition-colors
                  hover:text-bronze
                "
              >
                Facebook
              </span>

            </div>

          </div>

        </div>

      </footer>

    </div>

  );
}