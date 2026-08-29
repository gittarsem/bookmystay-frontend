import { motion } from "framer-motion";
import {
  Sparkles,
  Globe,
  Heart,
  Award,
  Github,
  ExternalLink,
} from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

const PORTFOLIO_URL =
  "https://tarsem-portfolio-chi.vercel.app";

const GITHUB_URL =
  "https://github.com/gittarsem/BookMyStay";

export default function About() {
  return (
    <MainLayout>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative h-[40vh] min-h-[300px] overflow-hidden">

        <img
          src="https://mobirise.com/extensions/hotelm4/assets/images/background13-1920x1280.jpg"
          alt="About BookMyStay"
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
        />

        <div className="absolute inset-0 bg-black/50" />

        <div
          className="
            relative
            z-10
            flex
            h-full
            items-center
            justify-center
            px-4
          "
        >

          <div className="text-center">

            <h1
              className="
                mb-3
                font-serif
                text-4xl
                font-bold
                text-white
                md:text-5xl
              "
            >
              Our Story
            </h1>

            <p className="mx-auto max-w-lg text-white/70">
              We believe every journey deserves a stay
              that tells a story.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          STORY
      ====================================================== */}

      <section className="py-20">

        <div className="container">

          <div className="mx-auto max-w-3xl text-center">

            <p
              className="
                mb-3
                text-xs
                font-medium
                uppercase
                tracking-[0.25em]
                text-bronze
              "
            >
              About BookMyStay
            </p>


            <h2
              className="
                mb-6
                font-serif
                text-3xl
                font-bold
                text-espresso
                md:text-4xl
              "
            >
              Crafting Extraordinary Stays Since 2020
            </h2>


            <p
              className="
                mb-4
                leading-relaxed
                text-espresso/70
              "
            >
              BookMyStay was born from a simple belief:
              that finding the perfect stay should be as
              memorable as the stay itself. We've curated
              a collection of India's finest properties —
              from heritage palaces to contemporary
              retreats — ensuring every guest experiences
              the extraordinary.
            </p>


            <p
              className="
                leading-relaxed
                text-espresso/70
              "
            >
              Our team personally visits and verifies every
              property on our platform. We work directly
              with property owners to maintain the highest
              standards of hospitality, comfort, and
              authenticity. The result is a trusted
              marketplace where travelers find not just a
              room, but an experience.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          VALUES
      ====================================================== */}

      <section className="bg-white py-20">

        <div className="container">

          <div
            className="
              grid
              grid-cols-1
              gap-8
              md:grid-cols-2
              lg:grid-cols-4
            "
          >

            {[
              {
                icon: Sparkles,
                title: "Curated Quality",
                desc: "Every property is handpicked and personally verified by our team.",
              },
              {
                icon: Globe,
                title: "Local Expertise",
                desc: "Deep knowledge of Indian hospitality and travel destinations.",
              },
              {
                icon: Heart,
                title: "Guest First",
                desc: "Every decision we make starts with the guest experience.",
              },
              {
                icon: Award,
                title: "Trusted Platform",
                desc: "Secure bookings, transparent pricing, and reliable support.",
              },
            ].map((item, i) => (

              <motion.div
                key={item.title}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: i * 0.1,
                }}
                className="text-center"
              >

                <div
                  className="
                    mx-auto
                    mb-4
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-bronze/10
                  "
                >

                  <item.icon
                    className="
                      h-6
                      w-6
                      text-bronze
                    "
                  />

                </div>


                <h3
                  className="
                    mb-2
                    font-serif
                    text-lg
                    font-semibold
                    text-espresso
                  "
                >
                  {item.title}
                </h3>


                <p
                  className="
                    text-sm
                    leading-relaxed
                    text-muted-foreground
                  "
                >
                  {item.desc}
                </p>

              </motion.div>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          DEVELOPER LINKS
      ====================================================== */}

      <section className="py-20">

        <div className="container">

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="
              mx-auto
              max-w-3xl
              rounded-3xl
              border
              border-warm-stone/20
              bg-cream
              p-8
              text-center
              shadow-warm
              md:p-10
            "
          >

            <p
              className="
                mb-3
                text-xs
                font-medium
                uppercase
                tracking-[0.25em]
                text-bronze
              "
            >
              Built With Passion
            </p>


            <h2
              className="
                font-serif
                text-2xl
                font-bold
                text-espresso
                md:text-3xl
              "
            >
              Meet the Developer
            </h2>


            <p
              className="
                mx-auto
                mt-3
                max-w-xl
                text-sm
                leading-relaxed
                text-muted-foreground
              "
            >
              BookMyStay is designed and developed by
              Tarsem as a full-stack hotel booking
              platform.
            </p>


            {/* Links */}

            <div
              className="
                mt-7
                flex
                flex-col
                justify-center
                gap-3
                sm:flex-row
              "
            >

              {/* Portfolio */}

              <a
                href={PORTFOLIO_URL}
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
                  text-sm
                  font-semibold
                  text-white
                  transition-all
                  hover:bg-bronze-dark
                  active:scale-[0.97]
                "
              >

                <Globe className="h-4 w-4" />

                Portfolio

                <ExternalLink className="h-3.5 w-3.5" />

              </a>


              {/* GitHub */}

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
                  border
                  border-warm-stone/30
                  bg-white
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-espresso
                  transition-all
                  hover:border-bronze
                  hover:text-bronze
                  active:scale-[0.97]
                "
              >

                <Github className="h-4 w-4" />

                GitHub

                <ExternalLink className="h-3.5 w-3.5" />

              </a>

            </div>

          </motion.div>

        </div>

      </section>

    </MainLayout>
  );
}