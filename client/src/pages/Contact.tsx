import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <MainLayout>
      <section className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-bronze font-medium mb-3">
              Get In Touch
            </p>
            <h1 className="font-serif text-4xl font-bold text-espresso mb-3">
              Contact Us
            </h1>
            <p className="text-muted-foreground">
              We'd love to hear from you. Reach out for any questions, partnerships, or feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              {[
                { icon: Mail, label: "Email", value: "hello@bookmystay.com" },
                { icon: Phone, label: "Phone", value: "+91 98765 43210" },
                { icon: MapPin, label: "Address", value: "Bandra Kurla Complex, Mumbai 400051" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-bronze/10 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-bronze" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                      {item.label}
                    </p>
                    <p className="text-espresso font-medium mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-warm border border-warm-stone/20 p-8 space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">Name</label>
                    <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-bronze/20" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">Email</label>
                    <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-bronze/20" />
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">Subject</label>
                  <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-bronze/20" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">Message</label>
                  <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-bronze/20 resize-none" />
                </div>
                <button type="submit" className="flex items-center gap-2 bg-bronze hover:bg-bronze-dark text-white font-semibold px-8 py-3 rounded-xl transition-all active:scale-[0.97]">
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </motion.form>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
