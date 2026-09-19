import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
} from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { toast } from "sonner";


type ContactType =
  | "GENERAL"
  | "BOOKING"
  | "CANCELLATION"
  | "PAYMENT"
  | "HOTEL"
  | "FEEDBACK";


const CONTACT_TYPES: {
  value: ContactType;
  label: string;
}[] = [
  {
    value: "GENERAL",
    label: "General Question",
  },
  {
    value: "BOOKING",
    label: "Booking Issue",
  },
  {
    value: "CANCELLATION",
    label: "Cancellation / Refund",
  },
  {
    value: "PAYMENT",
    label: "Payment Issue",
  },
  {
    value: "HOTEL",
    label: "Hotel Issue",
  },
  {
    value: "FEEDBACK",
    label: "Feedback",
  },
];


export default function Contact() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "GENERAL" as ContactType,
    bookingId: "",
    subject: "",
    message: "",
  });


  const [submitting, setSubmitting] =
    useState(false);


  const handleChange = (
    field: keyof typeof form,
    value: string
  ) => {

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

  };


  const handleSubmit = (
    e: React.FormEvent
  ) => {

    e.preventDefault();


    // =====================================================
    // VALIDATION
    // =====================================================

    if (!form.name.trim()) {

      toast.error(
        "Please enter your name."
      );

      return;
    }


    if (!form.email.trim()) {

      toast.error(
        "Please enter your email."
      );

      return;
    }


    if (!form.message.trim()) {

      toast.error(
        "Please enter your message."
      );

      return;
    }


    setSubmitting(true);


    // =====================================================
    // GET ISSUE TYPE LABEL
    // =====================================================

    const selectedType =
      CONTACT_TYPES.find(
        (item) =>
          item.value === form.type
      )?.label ??
      "General Question";


    // =====================================================
    // EMAIL SUBJECT
    // =====================================================

    const emailSubject =
      form.subject.trim() ||
      `BookMyStay - ${selectedType}`;


    // =====================================================
    // EMAIL BODY
    // =====================================================

    const emailBody = [
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      `Issue Type: ${selectedType}`,
      form.bookingId.trim()
        ? `Booking ID: ${form.bookingId.trim()}`
        : "Booking ID: Not provided",
      "",
      "Message:",
      form.message.trim(),
    ].join("\n");


    // =====================================================
    // OPEN GMAIL COMPOSE
    // =====================================================

    const gmailUrl =
      "https://mail.google.com/mail/" +
      "?view=cm" +
      "&fs=1" +
      "&to=staymybook@gmail.com" +
      `&su=${encodeURIComponent(
        emailSubject
      )}` +
      `&body=${encodeURIComponent(
        emailBody
      )}`;


    const gmailWindow =
      window.open(
        gmailUrl,
        "_blank",
        "noopener,noreferrer"
      );


    // =====================================================
    // CHECK WHETHER POPUP WAS BLOCKED
    // =====================================================

    if (!gmailWindow) {

      toast.error(
        "Please allow pop-ups to open Gmail."
      );

      setSubmitting(false);

      return;
    }


    // =====================================================
    // SUCCESS
    // =====================================================

    toast.success(
      "Gmail opened with your message ready to send."
    );


    // =====================================================
    // RESET FORM
    // =====================================================

    setForm({
      name: "",
      email: "",
      type: "GENERAL",
      bookingId: "",
      subject: "",
      message: "",
    });


    setSubmitting(false);

  };


  return (

    <MainLayout>

      <section
        className="
          min-h-[calc(100vh-80px)]
          py-16
          md:py-20
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
              mb-12
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
              We're Here To Help
            </p>


            <h1
              className="
                mb-3
                font-serif
                text-4xl
                font-bold
                text-espresso
                md:text-5xl
              "
            >
              Contact Us
            </h1>


            <p
              className="
                text-muted-foreground
              "
            >
              Have a question, booking issue, or
              feedback? Send us a message and we'll
              get back to you.
            </p>

          </motion.div>


          <div
            className="
              grid
              grid-cols-1
              gap-8
              lg:grid-cols-3
            "
          >

            {/* =================================================
                CONTACT INFORMATION
            ================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.6,
              }}
              className="
                space-y-5
              "
            >

              <div
                className="
                  rounded-2xl
                  border
                  border-warm-stone/20
                  bg-white
                  p-6
                  shadow-warm
                "
              >

                <h2
                  className="
                    mb-5
                    font-serif
                    text-xl
                    font-semibold
                    text-espresso
                  "
                >
                  Get In Touch
                </h2>


                <div
                  className="
                    space-y-5
                  "
                >

                  {/* EMAIL */}

                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-bronze/10
                      "
                    >

                      <Mail
                        className="
                          h-4
                          w-4
                          text-bronze
                        "
                      />

                    </div>


                    <div>

                      <p
                        className="
                          text-xs
                          font-medium
                          uppercase
                          tracking-widest
                          text-muted-foreground
                        "
                      >
                        Email
                      </p>


                      <a
                        href="mailto:staymybook@gmail.com"
                        className="
                          mt-0.5
                          block
                          font-medium
                          text-espresso
                          transition-colors
                          hover:text-bronze
                        "
                      >
                        staymybook@gmail.com
                      </a>

                    </div>

                  </div>


                  {/* PHONE */}

                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-bronze/10
                      "
                    >

                      <Phone
                        className="
                          h-4
                          w-4
                          text-bronze
                        "
                      />

                    </div>


                    <div>

                      <p
                        className="
                          text-xs
                          font-medium
                          uppercase
                          tracking-widest
                          text-muted-foreground
                        "
                      >
                        Phone
                      </p>


                      <a
                        href="tel:+917814903883"
                        className="
                          mt-0.5
                          block
                          font-medium
                          text-espresso
                          transition-colors
                          hover:text-bronze
                        "
                      >
                        +91 78149 03883
                      </a>

                    </div>

                  </div>


                  {/* ADDRESS */}

                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-bronze/10
                      "
                    >

                      <MapPin
                        className="
                          h-4
                          w-4
                          text-bronze
                        "
                      />

                    </div>


                    <div>

                      <p
                        className="
                          text-xs
                          font-medium
                          uppercase
                          tracking-widest
                          text-muted-foreground
                        "
                      >
                        Address
                      </p>


                      <p
                        className="
                          mt-0.5
                          font-medium
                          leading-relaxed
                          text-espresso
                        "
                      >
                        Punjab, India
                      </p>

                    </div>

                  </div>

                </div>

              </div>


              {/* =================================================
                  QUICK HELP
              ================================================== */}

              <div
                className="
                  rounded-2xl
                  bg-espresso
                  p-6
                  text-white
                  shadow-warm
                "
              >

                <MessageSquare
                  className="
                    mb-4
                    h-7
                    w-7
                    text-bronze
                  "
                />


                <h3
                  className="
                    font-serif
                    text-xl
                    font-semibold
                  "
                >
                  Need Help With A Booking?
                </h3>


                <p
                  className="
                    mt-2
                    text-sm
                    leading-relaxed
                    text-white/60
                  "
                >
                  Include your booking ID in your
                  message so we can help you faster.
                </p>

              </div>

            </motion.div>


            {/* =================================================
                CONTACT FORM
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
                delay: 0.1,
              }}
              className="
                lg:col-span-2
              "
            >

              <form
                onSubmit={handleSubmit}
                className="
                  space-y-5
                  rounded-2xl
                  border
                  border-warm-stone/20
                  bg-white
                  p-6
                  shadow-warm
                  md:p-8
                "
              >

                {/* NAME + EMAIL */}

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                  "
                >

                  <div>

                    <label
                      htmlFor="contact-name"
                      className="
                        mb-1.5
                        block
                        text-xs
                        font-medium
                        uppercase
                        tracking-widest
                        text-muted-foreground
                      "
                    >
                      Name *
                    </label>


                    <input
                      id="contact-name"
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        handleChange(
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Your name"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-warm-stone/30
                        bg-cream
                        px-4
                        py-3
                        text-sm
                        text-espresso
                        outline-none
                        transition
                        placeholder:text-muted-foreground/60
                        focus:border-bronze
                        focus:ring-2
                        focus:ring-bronze/20
                      "
                    />

                  </div>


                  <div>

                    <label
                      htmlFor="contact-email"
                      className="
                        mb-1.5
                        block
                        text-xs
                        font-medium
                        uppercase
                        tracking-widest
                        text-muted-foreground
                      "
                    >
                      Email *
                    </label>


                    <input
                      id="contact-email"
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        handleChange(
                          "email",
                          e.target.value
                        )
                      }
                      placeholder="you@example.com"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-warm-stone/30
                        bg-cream
                        px-4
                        py-3
                        text-sm
                        text-espresso
                        outline-none
                        transition
                        placeholder:text-muted-foreground/60
                        focus:border-bronze
                        focus:ring-2
                        focus:ring-bronze/20
                      "
                    />

                  </div>

                </div>


                {/* ISSUE TYPE + BOOKING ID */}

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                  "
                >

                  <div>

                    <label
                      htmlFor="contact-type"
                      className="
                        mb-1.5
                        block
                        text-xs
                        font-medium
                        uppercase
                        tracking-widest
                        text-muted-foreground
                      "
                    >
                      What Can We Help With? *
                    </label>


                    <select
                      id="contact-type"
                      required
                      value={form.type}
                      onChange={(e) =>
                        handleChange(
                          "type",
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        rounded-xl
                        border
                        border-warm-stone/30
                        bg-cream
                        px-4
                        py-3
                        text-sm
                        text-espresso
                        outline-none
                        transition
                        focus:border-bronze
                        focus:ring-2
                        focus:ring-bronze/20
                      "
                    >

                      {CONTACT_TYPES.map(
                        (type) => (

                          <option
                            key={type.value}
                            value={type.value}
                          >
                            {type.label}
                          </option>

                        )
                      )}

                    </select>

                  </div>


                  <div>

                    <label
                      htmlFor="contact-booking"
                      className="
                        mb-1.5
                        block
                        text-xs
                        font-medium
                        uppercase
                        tracking-widest
                        text-muted-foreground
                      "
                    >
                      Booking ID

                      <span
                        className="
                          ml-1
                          normal-case
                          tracking-normal
                        "
                      >
                        (optional)
                      </span>

                    </label>


                    <input
                      id="contact-booking"
                      type="text"
                      value={form.bookingId}
                      onChange={(e) =>
                        handleChange(
                          "bookingId",
                          e.target.value
                        )
                      }
                      placeholder="e.g. 12345"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-warm-stone/30
                        bg-cream
                        px-4
                        py-3
                        text-sm
                        text-espresso
                        outline-none
                        transition
                        placeholder:text-muted-foreground/60
                        focus:border-bronze
                        focus:ring-2
                        focus:ring-bronze/20
                      "
                    />

                  </div>

                </div>


                {/* SUBJECT */}

                <div>

                  <label
                    htmlFor="contact-subject"
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-medium
                      uppercase
                      tracking-widest
                      text-muted-foreground
                    "
                  >
                    Subject
                  </label>


                  <input
                    id="contact-subject"
                    type="text"
                    value={form.subject}
                    onChange={(e) =>
                      handleChange(
                        "subject",
                        e.target.value
                      )
                    }
                    placeholder="How can we help?"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-warm-stone/30
                      bg-cream
                      px-4
                      py-3
                      text-sm
                      text-espresso
                      outline-none
                      transition
                      placeholder:text-muted-foreground/60
                      focus:border-bronze
                      focus:ring-2
                      focus:ring-bronze/20
                    "
                  />

                </div>


                {/* MESSAGE */}

                <div>

                  <label
                    htmlFor="contact-message"
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-medium
                      uppercase
                      tracking-widest
                      text-muted-foreground
                    "
                  >
                    Message *
                  </label>


                  <textarea
                    id="contact-message"
                    required
                    value={form.message}
                    onChange={(e) =>
                      handleChange(
                        "message",
                        e.target.value
                      )
                    }
                    rows={6}
                    placeholder="Tell us how we can help..."
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-warm-stone/30
                      bg-cream
                      px-4
                      py-3
                      text-sm
                      text-espresso
                      outline-none
                      transition
                      placeholder:text-muted-foreground/60
                      focus:border-bronze
                      focus:ring-2
                      focus:ring-bronze/20
                    "
                  />

                </div>


                {/* SUBMIT */}

                <div
                  className="
                    flex
                    flex-col
                    gap-3
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >

                  <p
                    className="
                      text-xs
                      leading-relaxed
                      text-muted-foreground
                    "
                  >
                    Gmail will open with your message
                    prepared. Review it and click Send.
                  </p>


                  <button
                    type="submit"
                    disabled={submitting}
                    className="
                      flex
                      shrink-0
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-bronze
                      px-8
                      py-3
                      font-semibold
                      text-white
                      transition-all
                      hover:bg-bronze-dark
                      active:scale-[0.97]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >

                    <Send
                      className="
                        h-4
                        w-4
                      "
                    />

                    {submitting
                      ? "Opening Gmail..."
                      : "Send Message"}

                  </button>

                </div>

              </form>

            </motion.div>

          </div>

        </div>

      </section>

    </MainLayout>
  );
}