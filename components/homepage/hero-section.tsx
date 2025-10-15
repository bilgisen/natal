"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Meteors } from "@/components/ui/meteors";

export default function SpaceHero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/milkyway.jpeg" // kendi görselini buraya koy
          alt="Cosmic background"
          fill
          className="object-cover opacity-60"
          priority
          quality={85}
        />
      </div>

      {/* Meteor Effect */}
      <div className="absolute inset-0 -z-10">
        <Meteors number={35} />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-muted-foreground px-6">
        <motion.h3
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-md md:text-xl text-foreground tracking-wider mb-3 mt-6"
        >
          Welcome to Natalmark
        </motion.h3>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-4xl md:text-6xl font-bold text-foreground leading-tight/60 letter-spacing-tight max-w-5xl"
        >
          Where astrology meets science: your cosmic data, analysed by AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-6 text-2xl md:text-xl max-w-4xl mx-auto"
        >
          Discover a new era of astrology powered by precision and intelligence. Your birth chart is generated with the scientifically trusted Swiss Ephemeris and analysed by AI to reveal personalised insights. 
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-10 px-8 py-3 bg-primary hover:bg-primary/80 rounded-full text-white font-medium text-lg shadow-lg shadow-primary/30 transition-all duration-300"
        >
          Try for Free
        </motion.button>
      </div>

      {/* Optional subtle overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 -z-10" />
    </section>
  );
}
