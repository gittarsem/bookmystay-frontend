import { motion } from "framer-motion";
import { Sparkles, Globe, Heart, Award } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

export default function About() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <img
          src="/manus-storage/destination-jaipur_7b21f071.jpg"
          alt="About BookMyStay"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-3">
              Our Story
            </h1>
            <p className="text-white/70 max-w-lg mx-auto">
              We believe every journey deserves a stay that tells a story.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-bronze font-medium mb-3">
              About BookMyStay
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-espresso mb-6">
              Crafting Extraordinary Stays Since 2020
            </h2>
            <p className="text-espresso/70 leading-relaxed mb-4">
              BookMyStay was born from a simple belief: that finding the perfect stay should be
              as memorable as the stay itself. We've curated a collection of India's finest
              properties — from heritage palaces to contemporary retreats — ensuring every guest
              experiences the extraordinary.
            </p>
            <p className="text-espresso/70 leading-relaxed">
              Our team personally visits and verifies every property on our platform. We work
              directly with property owners to maintain the highest standards of hospitality,
              comfort, and authenticity. The result is a trusted marketplace where travelers
              find not just a room, but an experience.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Sparkles, title: "Curated Quality", desc: "Every property is handpicked and personally verified by our team." },
              { icon: Globe, title: "Local Expertise", desc: "Deep knowledge of Indian hospitality and travel destinations." },
              { icon: Heart, title: "Guest First", desc: "Every decision we make starts with the guest experience." },
              { icon: Award, title: "Trusted Platform", desc: "Secure bookings, transparent pricing, and reliable support." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-bronze/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-bronze" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-espresso mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
