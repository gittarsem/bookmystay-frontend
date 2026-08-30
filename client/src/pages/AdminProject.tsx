import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  ExternalLink,
  Code2,
  Database,
  Server,
  Globe,
  ShieldCheck,
  CreditCard,
  Search,
  Layers,
  Mail,
} from "lucide-react";

import MainLayout from "@/layouts/MainLayout";


/* =========================================================
   DEVELOPER LINKS
   ========================================================= */

const GITHUB_URL =
  "https://github.com/gittarsem/BookMyStay";

/*
 * Add your actual portfolio URL here when available.
 *
 * Example:
 * const PORTFOLIO_URL = "https://yourportfolio.com";
 */
const PORTFOLIO_URL = "";

/*
 * Add your actual LinkedIn URL here when available.
 *
 * Example:
 * const LINKEDIN_URL = "https://www.linkedin.com/in/yourusername";
 */
const LINKEDIN_URL = "";


/* =========================================================
   TECH STACK
   ========================================================= */

const TECH_STACK = [

  {
    icon: Code2,
    name: "Java",
    description:
      "Core backend programming language",
  },

  {
    icon: Server,
    name: "Spring Boot",
    description:
      "REST APIs and backend business logic",
  },

  {
    icon: Database,
    name: "PostgreSQL",
    description:
      "Relational database for application data",
  },

  {
    icon: Search,
    name: "Elasticsearch",
    description:
      "Hotel search and indexing",
  },

  {
    icon: Globe,
    name: "React + TypeScript",
    description:
      "Frontend application and user interface",
  },

  {
    icon: Layers,
    name: "Hibernate / JPA",
    description:
      "Persistence and ORM layer",
  },

  {
    icon: CreditCard,
    name: "Razorpay",
    description:
      "Payment and refund processing",
  },

  {
    icon: ShieldCheck,
    name: "Spring Security",
    description:
      "Authentication and authorization",
  },

];


/* =========================================================
   COMPONENT
   ========================================================= */

export default function AdminProject() {

  return (

    <MainLayout>

      <section
        className="
          min-h-screen
          py-12
          md:py-16
        "
      >

        <div
          className="
            container
            max-w-6xl
          "
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <motion.div
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
            }}
            className="
              mb-10
            "
          >

            <p
              className="
                mb-2
                text-xs
                font-medium
                uppercase
                tracking-[0.25em]
                text-bronze
              "
            >
              Administration
            </p>


            <h1
              className="
                font-serif
                text-4xl
                font-bold
                text-espresso
              "
            >
              Project & Developer
            </h1>


            <p
              className="
                mt-3
                max-w-2xl
                text-muted-foreground
              "
            >
              Information about the BookMyStay project,
              its technology stack, and the developer
              behind the application.
            </p>

          </motion.div>


          {/* =================================================
              PROJECT CARD
          ================================================= */}

          <motion.div
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
              delay: 0.1,
            }}
            className="
              overflow-hidden
              rounded-3xl
              border
              border-warm-stone/20
              bg-white
              shadow-warm
            "
          >

            <div
              className="
                bg-espresso
                p-8
                md:p-10
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-6
                  md:flex-row
                  md:items-center
                  md:justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-xs
                      font-medium
                      uppercase
                      tracking-[0.25em]
                      text-bronze
                    "
                  >
                    Full-Stack Hotel Booking Platform
                  </p>


                  <h2
                    className="
                      mt-2
                      font-serif
                      text-3xl
                      font-bold
                      text-white
                      md:text-4xl
                    "
                  >
                    BookMyStay
                  </h2>


                  <p
                    className="
                      mt-3
                      max-w-2xl
                      text-sm
                      leading-relaxed
                      text-white/60
                    "
                  >
                    A full-stack hotel booking platform
                    supporting hotel discovery, room
                    inventory, reservations, payments,
                    cancellations, refunds, reviews,
                    guest management, and administration.
                  </p>

                </div>


                {/* GitHub */}

                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-white
                    px-6
                    py-3
                    font-semibold
                    text-espresso
                    transition-all
                    hover:bg-cream
                    active:scale-[0.97]
                  "
                >

                  <Github
                    className="
                      h-5
                      w-5
                    "
                  />

                  GitHub

                  <ExternalLink
                    className="
                      h-4
                      w-4
                    "
                  />

                </a>

              </div>

            </div>


            {/* =================================================
                DEVELOPER
            ================================================== */}

            <div
              className="
                border-b
                border-warm-stone/20
                p-8
                md:p-10
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-6
                  md:flex-row
                  md:items-center
                  md:justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-xs
                      font-medium
                      uppercase
                      tracking-[0.2em]
                      text-bronze
                    "
                  >
                    Developer
                  </p>


                  <h2
                    className="
                      mt-2
                      font-serif
                      text-2xl
                      font-bold
                      text-espresso
                    "
                  >
                    Tarsem
                  </h2>


                  <p
                    className="
                      mt-2
                      max-w-xl
                      text-sm
                      leading-relaxed
                      text-muted-foreground
                    "
                  >
                    Developer and creator of the
                    BookMyStay application.
                  </p>

                </div>


                <div
                  className="
                    flex
                    flex-wrap
                    gap-3
                  "
                >

                  {/* GitHub */}

                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-warm-stone/30
                      px-5
                      py-2.5
                      text-sm
                      font-medium
                      text-espresso
                      transition
                      hover:border-bronze
                      hover:text-bronze
                    "
                  >

                    <Github
                      className="
                        h-4
                        w-4
                      "
                    />

                    GitHub

                  </a>


                  {/* Portfolio */}

                  {PORTFOLIO_URL ? (

                    <a
                      href={
                        PORTFOLIO_URL
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-warm-stone/30
                        px-5
                        py-2.5
                        text-sm
                        font-medium
                        text-espresso
                        transition
                        hover:border-bronze
                        hover:text-bronze
                      "
                    >

                      <Globe
                        className="
                          h-4
                          w-4
                        "
                      />

                      Portfolio

                    </a>

                  ) : (

                    <span
                      className="
                        inline-flex
                        cursor-not-allowed
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-warm-stone/20
                        px-5
                        py-2.5
                        text-sm
                        font-medium
                        text-muted-foreground
                      "
                    >

                      <Globe
                        className="
                          h-4
                          w-4
                        "
                      />

                      Portfolio

                    </span>

                  )}


                  {/* LinkedIn */}

                  {LINKEDIN_URL ? (

                    <a
                      href={
                        LINKEDIN_URL
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-warm-stone/30
                        px-5
                        py-2.5
                        text-sm
                        font-medium
                        text-espresso
                        transition
                        hover:border-bronze
                        hover:text-bronze
                      "
                    >

                      <Linkedin
                        className="
                          h-4
                          w-4
                        "
                      />

                      LinkedIn

                    </a>

                  ) : (

                    <span
                      className="
                        inline-flex
                        cursor-not-allowed
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-warm-stone/20
                        px-5
                        py-2.5
                        text-sm
                        font-medium
                        text-muted-foreground
                      "
                    >

                      <Linkedin
                        className="
                          h-4
                          w-4
                        "
                      />

                      LinkedIn

                    </span>

                  )}

                </div>

              </div>

            </div>


            {/* =================================================
                TECH STACK
            ================================================== */}

            <div
              className="
                p-8
                md:p-10
              "
            >

              <div className="mb-7">

                <p
                  className="
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.2em]
                    text-bronze
                  "
                >
                  Technology
                </p>


                <h2
                  className="
                    mt-2
                    font-serif
                    text-2xl
                    font-bold
                    text-espresso
                  "
                >
                  Tech Stack
                </h2>

              </div>


              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                  lg:grid-cols-4
                "
              >

                {TECH_STACK.map(
                  (
                    technology,
                    index
                  ) => {

                    const Icon =
                      technology.icon;


                    return (

                      <motion.div
                        key={
                          technology.name
                        }
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.3,
                          delay:
                            0.15 +
                            index *
                              0.04,
                        }}
                        className="
                          rounded-2xl
                          border
                          border-warm-stone/20
                          bg-cream
                          p-5
                        "
                      >

                        <div
                          className="
                            mb-4
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-bronze/10
                          "
                        >

                          <Icon
                            className="
                              h-5
                              w-5
                              text-bronze
                            "
                          />

                        </div>


                        <h3
                          className="
                            font-semibold
                            text-espresso
                          "
                        >
                          {
                            technology.name
                          }
                        </h3>


                        <p
                          className="
                            mt-1
                            text-xs
                            leading-relaxed
                            text-muted-foreground
                          "
                        >
                          {
                            technology.description
                          }
                        </p>

                      </motion.div>

                    );

                  }
                )}

              </div>

            </div>


            {/* =================================================
                PROJECT LINKS
            ================================================== */}

            <div
              className="
                border-t
                border-warm-stone/20
                bg-cream/50
                p-8
                md:p-10
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-4
                  md:flex-row
                  md:items-center
                  md:justify-between
                "
              >

                <div>

                  <h3
                    className="
                      font-serif
                      text-xl
                      font-semibold
                      text-espresso
                    "
                  >
                    Project Repository
                  </h3>


                  <p
                    className="
                      mt-1
                      text-sm
                      text-muted-foreground
                    "
                  >
                    Explore the source code and
                    development history of BookMyStay.
                  </p>

                </div>


                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-bronze
                    px-6
                    py-3
                    font-semibold
                    text-white
                    transition
                    hover:bg-bronze-dark
                    active:scale-[0.97]
                  "
                >

                  <Github
                    className="
                      h-5
                      w-5
                    "
                  />

                  View on GitHub

                  <ExternalLink
                    className="
                      h-4
                      w-4
                    "
                  />

                </a>

              </div>

            </div>

          </motion.div>

        </div>

      </section>

    </MainLayout>
  );
}