"use client";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Meteors } from "@/components/ui/meteors";
import { motion } from "framer-motion";

export default function CTABanner() {
  return (
    <div className="px-6">
      <div className="relative overflow-hidden my-5 w-full max-w-screen-lg mx-auto rounded-xl py-12 md:py-16 px-6 md:px-14 text-center text-foreground">

        {/* Background image */}
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/cta.jpg')" }}
        />

        {/* Overlay for readability */}
        <div className="absolute inset-0 -z-10" />

        {/* Meteor effect */}
        <div className="absolute inset-0 -z-10">
          <Meteors number={40} />
        </div>

        {/* Animated content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-4">
          {/* Gemini Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-4"
          >
            <img
              src="/gemini.svg"
              alt="Gemini AI"
              className="w-16 h-16 mx-auto"
            />
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl md:text-4xl font-semibold tracking-tight"
          >
            Try our AI-powered app for free!
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="mt-2 max-w-2xl text-base md:text-lg"
          >
            Create scientific birth charts for yourself and your loved ones. Ask Gemini anything you're curious about regarding your cosmic profile!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-2"
          >
            <Button size="lg" className="px-0">
              Create a Cosmic Profile <ArrowUpRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
