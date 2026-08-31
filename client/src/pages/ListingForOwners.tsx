import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Users,
  TrendingUp,
  Shield,
  Check,
} from "lucide-react";

import MainLayout from "@/layouts/MainLayout";

export default function ListingForOwners() {
  return (
    <MainLayout>
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img
          src="https://www.traveltrendstoday.in/storage/posts/azalea-by-stone-wood1-scaled.jpg"
          alt="List your property with BookMyStay"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 h-full flex items-center justify-center px-4 text-center">
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
              duration: 0.6,
            }}
          >
            <p className="text-bronze text-sm uppercase tracking-[0.25em] font-medium mb-3">
              For Property Owners
            </p>

            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              List Your Property
            </h1>

            <p className="text-white/70 max-w-lg mx-auto mb-8 leading-relaxed">
              Join BookMyStay and reach thousands of discerning
              travelers seeking extraordinary stays.
            </p>

            {/* 
              IMPORTANT:
              Do not send the user to /register here.

              /owner/apply is the beginning of the owner
              onboarding flow. It can decide whether the user
              needs authentication before continuing.
            */}
            <Link href="/owner/apply">
              <button
                type="button"
                className="bg-bronze hover:bg-bronze-dark text-white font-semibold px-8 py-3 rounded-full transition-all active:scale-[0.97] inline-flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
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
            className="text-center mb-12"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-bronze font-medium mb-2">
              Simple Process
            </p>

            <h2 className="font-serif text-3xl font-bold text-espresso">
              How It Works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Become a Partner",
                desc: "Submit your business and identity information for verification.",
              },
              {
                step: "02",
                title: "Add Your Property",
                desc: "Once verified, create your hotel listing with photos, amenities, and property details.",
              },
              {
                step: "03",
                title: "Start Receiving Bookings",
                desc: "Manage your property, rooms, inventory, and bookings from your owner dashboard.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
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
                <div className="w-16 h-16 bg-bronze/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="font-serif text-2xl font-bold text-bronze">
                    {item.step}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-semibold text-espresso mb-2">
                  {item.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          BENEFITS
      ====================================================== */}

      <section className="py-20 bg-white">
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
            className="text-center mb-12"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-bronze font-medium mb-2">
              The BookMyStay Advantage
            </p>

            <h2 className="font-serif text-3xl font-bold text-espresso">
              Why List With Us
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: Users,
                title: "Access to Discerning Travelers",
                desc: "Reach guests who value quality and memorable hospitality experiences.",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                desc: "Receive bookings through BookMyStay's secure booking and payment infrastructure.",
              },
              {
                icon: TrendingUp,
                title: "Increased Visibility",
                desc: "Give your property a presence on a platform built for travelers looking for exceptional stays.",
              },
              {
                icon: Building2,
                title: "Easy Property Management",
                desc: "Manage your hotels, rooms, inventory, and bookings from one owner portal.",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                className="flex gap-4 p-5 bg-cream rounded-xl border border-warm-stone/10"
              >
                <div className="w-10 h-10 bg-bronze/10 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-bronze" />
                </div>

                <div>
                  <h3 className="font-semibold text-espresso mb-1">
                    {item.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto bg-espresso rounded-2xl px-6 md:px-10 py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-bronze/15 flex items-center justify-center mx-auto mb-5">
              <Check className="w-5 h-5 text-bronze" />
            </div>

            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
              Ready to list your property?
            </h2>

            <p className="mt-4 text-white/60 max-w-xl mx-auto leading-relaxed">
              Start your partner application and take the first step
              toward managing your property on BookMyStay.
            </p>

            <Link href="/owner/apply">
              <button
                type="button"
                className="mt-7 bg-bronze hover:bg-bronze-dark text-white font-semibold px-7 py-3 rounded-full transition-all active:scale-[0.97] inline-flex items-center gap-2"
              >
                Start Application
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}