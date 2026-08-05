import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Star,
  Shield,
  Heart,
  Award,
  Globe,
  Headphones,
  Sparkles,
  ArrowRight,
  Quote,
} from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import SearchWidget from "@/components/SearchWidget";
import HotelCard from "@/components/HotelCard";
import { POPULAR_DESTINATIONS } from "@/lib/mockData";
import { hotelsApi } from "@/api";
import { mapHotels } from "@/mappers/hotelMapper";
import { useEffect, useState } from "react";
import type { Hotel } from "@/types";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { staggerChildren: 0.1 },
};

export default function Home() {

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await hotelsApi.search({
          page: 0,
          size: 6,
        });

        const mappedHotels = mapHotels(response.data.hotels);

        setHotels(mappedHotels);
      } catch (error) {
        console.error("Failed to fetch hotels", error);
      } finally {
        setLoadingHotels(false);
      }
    };

    fetchHotels();
  }, []);
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80"
          alt="Luxury resort"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <p className="text-white/80 text-sm uppercase tracking-[0.3em] mb-3 font-medium">
              Curated Luxury Stays
            </p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Your Next Extraordinary
              <br />
              <span className="italic text-bronze">Stay Awaits</span>
            </h1>
            <p className="mt-4 text-white/70 text-lg max-w-lg mx-auto">
              Discover handpicked luxury accommodations around the world, where every
              detail has been curated for your comfort.
            </p>
          </motion.div>

          {/* Floating Search Widget */}
          <div className="absolute bottom-12 md:bottom-16 left-0 right-0 px-4">
            <SearchWidget />
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-20 px-4" id="featured">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-bronze font-medium mb-2">
              Handpicked For You
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-espresso">
              Featured Stays
            </h2>
            <div className="w-16 h-0.5 bg-bronze mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingHotels ? (
              <div className="col-span-full flex justify-center py-12">
                Loading hotels...
              </div>
            ) : (
              hotels.map((hotel, index) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  index={index}
                />
              ))
            )}
          </div>

          <motion.div
            {...fadeInUp}
            className="text-center mt-10"
          >
            <Link href="/search">
              <button className="inline-flex items-center gap-2 text-bronze font-medium hover:text-bronze-dark transition-colors group">
                View All Properties
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-white">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-bronze font-medium mb-2">
              Explore India
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-espresso">
              Popular Destinations
            </h2>
            <div className="w-16 h-0.5 bg-bronze mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_DESTINATIONS.map((dest, index) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link href={`/search?city=${dest.name}`}>
                  <div className="group relative rounded-xl overflow-hidden aspect-[3/4] cursor-pointer">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-serif font-semibold text-lg">
                        {dest.name}
                      </h3>
                      <p className="text-white/70 text-xs mt-0.5">{dest.tagline}</p>
                      <p className="text-bronze text-xs font-medium mt-1">
                        {dest.hotelCount} stays
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20" id="why-us">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-bronze font-medium mb-2">
              The BookMyStay Difference
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-espresso">
              Why Travelers Choose Us
            </h2>
            <div className="w-16 h-0.5 bg-bronze mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Verified Luxury",
                desc: "Every property is personally vetted to ensure it meets our exacting standards of quality and service.",
              },
              {
                icon: Heart,
                title: "Curated Experiences",
                desc: "We don't just book rooms — we craft journeys with carefully selected stays that tell a story.",
              },
              {
                icon: Globe,
                title: "Global Coverage",
                desc: "From Himalayan retreats to coastal paradises, discover exceptional stays across India and beyond.",
              },
              {
                icon: Headphones,
                title: "24/7 Concierge",
                desc: "Our dedicated concierge team is available around the clock to ensure your stay is flawless.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-bronze/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-bronze" />
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

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-bronze font-medium mb-2">
              Guest Stories
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-espresso">
              What Our Guests Say
            </h2>
            <div className="w-16 h-0.5 bg-bronze mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                role: "Travel Blogger",
                text: "BookMyStay made our honeymoon absolutely magical. The Udaipur palace hotel was beyond our wildest dreams. The booking process was seamless.",
                rating: 5,
              },
              {
                name: "Arjun Mehta",
                role: "Business Executive",
                text: "As someone who travels constantly for work, I appreciate the curation. Every hotel they recommend has been exceptional. The concierge service is outstanding.",
                rating: 5,
              },
              {
                name: "Neha Kapoor",
                role: "Family Traveler",
                text: "Found the perfect family-friendly luxury resort in Goa. The kids loved it as much as we did. Already planning our next trip through BookMyStay.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-cream rounded-2xl p-8 relative"
              >
                <Quote className="w-8 h-8 text-bronze/20 absolute top-6 right-6" />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-bronze text-bronze" />
                  ))}
                </div>
                <p className="text-espresso/80 leading-relaxed italic mb-6">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-bronze/10 flex items-center justify-center">
                    <span className="text-bronze font-semibold text-sm">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-espresso text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            {...fadeInUp}
            className="relative rounded-3xl overflow-hidden bg-espresso text-center py-16 px-8"
          >
            <div className="absolute inset-0 opacity-20">
              <img
                src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10">
              <Sparkles className="w-8 h-8 text-bronze mx-auto mb-4" />
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
                Begin Your Journey
              </h2>
              <p className="text-white/60 max-w-md mx-auto mb-8">
                Join thousands of discerning travelers who trust BookMyStay for their
                most memorable stays.
              </p>
              <Link href="/register">
                <button className="bg-bronze hover:bg-bronze-dark text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 active:scale-[0.97] shadow-lg">
                  Create Free Account
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
