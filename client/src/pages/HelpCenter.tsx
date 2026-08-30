import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  CalendarDays,
  CreditCard,
  RotateCcw,
  Users,
  Clock,
  MessageCircle,
} from "lucide-react";

import MainLayout from "@/layouts/MainLayout";


interface FAQ {
  question: string;
  answer: string;
}


interface FAQCategory {
  title: string;
  icon: React.ElementType;
  questions: FAQ[];
}


const FAQ_CATEGORIES: FAQCategory[] = [

  {
    title: "Bookings",
    icon: CalendarDays,

    questions: [

      {
        question:
          "How do I make a booking?",

        answer:
          "Search for a destination, choose your preferred hotel, select a room and booking dates, and continue through the booking and payment flow. Once your payment is confirmed, your booking will appear under My Bookings.",
      },

      {
        question:
          "Can I view my booking details?",

        answer:
          "Yes. Open My Bookings and select the booking you want to view. You can see the hotel, room, dates, guests, payment information and other booking details.",
      },

      {
        question:
          "What is the difference between Daily and Hourly booking?",

        answer:
          "Daily bookings are based on hotel stay dates, while hourly bookings use specific check-in and check-out times. Hourly bookings display both the date and the selected time.",
      },

    ],
  },


  {
    title: "Cancellation & Refunds",
    icon: RotateCcw,

    questions: [

      {
        question:
          "Can I cancel my booking?",

        answer:
          "A booking can be cancelled before its check-in has started, provided the booking is still eligible for cancellation.",
      },

      {
        question:
          "How much will I receive as a refund?",

        answer:
          "The refund amount depends on the cancellation rules applicable to your booking and any non-refundable charges. The cancellation preview shows the amount you will receive before you confirm cancellation.",
      },

      {
        question:
          "Why can my refund be ₹0?",

        answer:
          "Some cancellations may not qualify for a monetary refund. In that situation, the cancellation preview will show ₹0 as the refund amount. The booking can still be cancelled if it is otherwise eligible for cancellation.",
      },

    ],
  },


  {
    title: "Payments",
    icon: CreditCard,

    questions: [

      {
        question:
          "What happens if my payment fails?",

        answer:
          "If your payment fails, the booking will not be treated as successfully paid. You can return to the booking flow and try the payment again when the booking is still available.",
      },

      {
        question:
          "My payment was successful. Where can I see my booking?",

        answer:
          "After successful payment, your confirmed booking can be viewed from My Bookings. Open the booking to see its complete details.",
      },

      {
        question:
          "Will I receive a refund confirmation?",

        answer:
          "After a cancellation, the booking details and booking history can display the refund status and refunded amount when that information is available.",
      },

    ],
  },


  {
    title: "Guests",
    icon: Users,

    questions: [

      {
        question:
          "Can I add guest details after booking?",

        answer:
          "Yes, guest details can be managed from the booking's guest-management section while the booking is still eligible for guest management.",
      },

      {
        question:
          "Can I edit guest details?",

        answer:
          "Yes, guest information can be updated while the booking is still eligible for editing. Once the stay has started or passed, guest editing is disabled.",
      },

    ],
  },


  {
    title: "Hourly Stays",
    icon: Clock,

    questions: [

      {
        question:
          "Why do hourly bookings show a time?",

        answer:
          "Hourly bookings are time-based, so both the check-in and check-out times are displayed along with their dates.",
      },

      {
        question:
          "Can I cancel after my hourly check-in time?",

        answer:
          "No. Once the hourly check-in time has started, the booking is no longer available for cancellation through the normal cancellation flow.",
      },

    ],
  },

];


export default function HelpCenter() {

  const [openFAQ, setOpenFAQ] =
    useState<string | null>(null);


  const toggleFAQ = (
    key: string
  ) => {

    setOpenFAQ(
      (current) =>
        current === key
          ? null
          : key
    );

  };


  return (

    <MainLayout>

      <section
        className="
          py-16
          md:py-20
        "
      >

        <div
          className="
            container
            max-w-5xl
          "
        >

          {/* =================================================
              HEADER
          ================================================== */}

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
            className="
              mx-auto
              mb-14
              max-w-2xl
              text-center
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
              Support
            </p>


            <h1
              className="
                mb-4
                font-serif
                text-4xl
                font-bold
                text-espresso
                md:text-5xl
              "
            >
              Help Center
            </h1>


            <p
              className="
                leading-relaxed
                text-muted-foreground
              "
            >
              Find answers to common questions about
              bookings, payments, cancellations,
              refunds and guest management.
            </p>

          </motion.div>


          {/* =================================================
              FAQ CATEGORIES
          ================================================== */}

          <div
            className="
              space-y-8
            "
          >

            {FAQ_CATEGORIES.map(
              (
                category,
                categoryIndex
              ) => {

                const Icon =
                  category.icon;


                return (

                  <motion.section
                    key={
                      category.title
                    }
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
                      duration: 0.5,
                      delay:
                        categoryIndex *
                        0.05,
                    }}
                  >

                    <div
                      className="
                        mb-3
                        flex
                        items-center
                        gap-3
                      "
                    >

                      <div
                        className="
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


                      <h2
                        className="
                          font-serif
                          text-xl
                          font-semibold
                          text-espresso
                        "
                      >
                        {
                          category.title
                        }
                      </h2>

                    </div>


                    <div
                      className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-warm-stone/20
                        bg-white
                        shadow-warm
                      "
                    >

                      {category.questions.map(
                        (
                          faq,
                          faqIndex
                        ) => {

                          const key =
                            `${category.title}-${faqIndex}`;

                          const isOpen =
                            openFAQ ===
                            key;


                          return (

                            <div
                              key={key}
                              className="
                                border-b
                                border-warm-stone/15
                                last:border-b-0
                              "
                            >

                              <button
                                type="button"
                                onClick={() =>
                                  toggleFAQ(
                                    key
                                  )
                                }
                                className="
                                  flex
                                  w-full
                                  items-center
                                  justify-between
                                  gap-4
                                  px-5
                                  py-5
                                  text-left
                                  transition-colors
                                  hover:bg-cream/60
                                "
                              >

                                <span
                                  className="
                                    font-medium
                                    text-espresso
                                  "
                                >
                                  {
                                    faq.question
                                  }
                                </span>


                                <ChevronDown
                                  className={`
                                    h-5
                                    w-5
                                    shrink-0
                                    text-bronze
                                    transition-transform
                                    duration-300
                                    ${
                                      isOpen
                                        ? "rotate-180"
                                        : ""
                                    }
                                  `}
                                />

                              </button>


                              <AnimatePresence
                                initial={false}
                              >

                                {isOpen && (

                                  <motion.div
                                    initial={{
                                      height: 0,
                                      opacity: 0,
                                    }}
                                    animate={{
                                      height:
                                        "auto",
                                      opacity: 1,
                                    }}
                                    exit={{
                                      height: 0,
                                      opacity: 0,
                                    }}
                                    transition={{
                                      duration:
                                        0.25,
                                    }}
                                    className="
                                      overflow-hidden
                                    "
                                  >

                                    <p
                                      className="
                                        px-5
                                        pb-5
                                        pr-12
                                        text-sm
                                        leading-relaxed
                                        text-muted-foreground
                                      "
                                    >
                                      {
                                        faq.answer
                                      }
                                    </p>

                                  </motion.div>

                                )}

                              </AnimatePresence>

                            </div>

                          );

                        }
                      )}

                    </div>

                  </motion.section>

                );

              }
            )}

          </div>


          {/* =================================================
              CONTACT CTA
          ================================================== */}

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
              mt-14
              rounded-3xl
              bg-espresso
              p-8
              text-center
              md:p-10
            "
          >

            <MessageCircle
              className="
                mx-auto
                mb-4
                h-8
                w-8
                text-bronze
              "
            />


            <h2
              className="
                font-serif
                text-2xl
                font-bold
                text-white
              "
            >
              Still Need Help?
            </h2>


            <p
              className="
                mx-auto
                mt-2
                max-w-lg
                text-sm
                leading-relaxed
                text-white/60
              "
            >
              Can't find what you're looking for?
              Send us your question or feedback and
              we'll help you out.
            </p>


            <Link
              href="/contact"
            >

              <button
                className="
                  mt-6
                  rounded-xl
                  bg-bronze
                  px-7
                  py-3
                  font-semibold
                  text-white
                  transition
                  hover:bg-bronze-dark
                  active:scale-[0.97]
                "
              >
                Contact BookMyStay
              </button>

            </Link>

          </motion.div>

        </div>

      </section>

    </MainLayout>
  );
}