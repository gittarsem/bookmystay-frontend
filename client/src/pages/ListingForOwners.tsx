import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Users, TrendingUp, Shield, Check } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

export default function ListingForOwners() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img
          src="/manus-storage/destination-maldives_d72b3c0d.jpg"
          alt="List your property"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 h-full flex items-center justify-center px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-bronze text-sm uppercase tracking-[0.25em] font-medium mb-3">
              For Property Owners
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              List Your Property
            </h1>
            <p className="text-white/70 max-w-lg mx-auto mb-8">
              Join BookMyStay and reach thousands of discerning travelers seeking
              extraordinary stays.
            </p>
            <Link href="/register">
              <button className="bg-bronze hover:bg-bronze-dark text-white font-semibold px-8 py-3 rounded-full transition-all active:scale-[0.97] inline-flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-bronze font-medium mb-2">Simple Process</p>
            <h2 className="font-serif text-3xl font-bold text-espresso">How It Works</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Create Account", desc: "Sign up as a property owner and complete the verification process." },
              { step: "02", title: "Add Your Property", desc: "List your hotel with photos, descriptions, amenities, and room details." },
              { step: "03", title: "Start Receiving Bookings", desc: "Once verified, your property goes live and you start receiving bookings." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-bronze/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="font-serif text-2xl font-bold text-bronze">{item.step}</span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-espresso mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-espresso">Why List With Us</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Users, title: "Access to Discerning Travelers", desc: "Reach guests who value quality and luxury experiences." },
              { icon: Shield, title: "Secure Payments", desc: "Get paid reliably through our secure payment gateway." },
              { icon: TrendingUp, title: "Increased Visibility", desc: "Our platform boosts your property's online presence." },
              { icon: Building2, title: "Easy Management", desc: "Manage rooms, inventory, and bookings from one dashboard." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-5 bg-cream rounded-xl">
                <div className="w-10 h-10 bg-bronze/10 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-bronze" />
                </div>
                <div>
                  <h3 className="font-semibold text-espresso mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
