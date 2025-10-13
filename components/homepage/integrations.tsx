"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const features = [
  {
    title: "Unlock Your Cosmic Blueprint: Let's Analyze Your Birth Data",
    details:
      "Start by entering your date, time, and place of birth. We use the scientifically robust Swiss Ephemeris to precisely map your complete astrological data—including planetary positions, houses, Ascendant, nodes, and Moon phase—for an unparalleled foundation.",
    image: "/03.jpg",
  },
  {
    title: "Meet Your Cosmic Twin: AI Deep-Dives Your Astro-Profile",
    details:
      "Our advanced Artificial Intelligence takes your comprehensive astrological dataset, analyzes the complex relationships and aspects between every single component, and synthesizes it all to generate your unique, detailed astrological profile.",
    image: "/01.jpg",
  },
  {
    title: "Ask the Cosmos: Get Personalized Answers from Gemini AI",
    details:
      "The power of Google Gemini is now at your service. It not only generates your in-depth chart analysis but also uses your specific astrological data to provide detailed, nuanced, and insightful answers to all your burning cosmic questions.",
    image: "/04.jpg",
  },
  {
    title: "Share the Stars: Analyze Profiles of Loved Ones",
    details:
      "Astrology is better together! Go beyond just your own chart. Easily input the birth details of your family and friends to generate their comprehensive profiles and gain deeper understanding of your most important relationships.",
    image: "/06.jpg",
  },
  {
    title: "Your Daily Cosmic Guide: Receive Truly Personal Horoscopes",
    details:
      "Forget generic forecasts. Our AI leverages your unique astrological birth data alongside the current transits and planetary movements to craft daily, weekly, or monthly horoscopes that are generated just for you.",
    image: "/07.jpg",
  },
];

const Features = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-5xl w-full py-16 px-6">
        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl text-primary uppercase tracking-[-0.03em] text-center"
        >
          How It Works
        </motion.h3>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-[2.75rem] font-semibold tracking-[-0.03em] text-center"
        >
          Your Journey to Cosmic Clarity
        </motion.h2>

        <div className="mt-16 space-y-24">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className={`flex flex-col md:flex-row items-center gap-x-12 gap-y-8 ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="w-full md:w-1/2">
                <div className="overflow-hidden rounded-2xl shadow-lg border border-border/50">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={800}
                    height={600}
                    className="object-cover aspect-[4/3] hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              <div className="w-full md:w-1/2 text-center md:text-left">
                <h4 className="text-3xl font-semibold leading-snug">
                  {feature.title}
                </h4>
                <p className="mt-4 text-lg text-muted-foreground">{feature.details}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
