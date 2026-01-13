"use client"

import { motion } from "framer-motion"

export default function BackgroundWaves() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {/* Large, slow-moving ambient green glow - more prominent */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }}
        animate={{
          opacity: [0.3, 0.4, 0.3], // Increased opacity for more visibility
          scale: [0.9, 1.2, 0.9], // Larger scale variation
          x: ["-50%", "-55%", "-50%"], // Wider movement
          y: ["-50%", "-45%", "-50%"],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          duration: 25, // Slower, more majestic animation
          ease: "easeInOut",
        }}
        className="absolute top-0 left-0 h-[70rem] w-[70rem] rounded-full" // Larger size
        style={{
          background: "radial-gradient(closest-side, rgba(29,185,84,0.35), transparent 75%)", // Stronger green, wider fade
          filter: "blur(100px)", // Increased blur for softer glow
        }}
      />

      {/* Medium, pulsating blue-green glow - more prominent */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, x: "50%", y: "50%" }}
        animate={{
          opacity: [0.25, 0.35, 0.25], // Increased opacity
          scale: [0.8, 1.15, 0.8], // Larger scale variation
          x: ["50%", "45%", "50%"],
          y: ["50%", "55%", "50%"],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          duration: 22, // Slower animation
          ease: "easeInOut",
          delay: 1.5, // Slightly different delay
        }}
        className="absolute bottom-0 right-0 h-[65rem] w-[65rem] rounded-full" // Larger size
        style={{
          background: "radial-gradient(closest-side, rgba(16,185,129,0.3), transparent 75%)", // Stronger blue-green, wider fade
          filter: "blur(90px)", // Increased blur
        }}
      />

      {/* Dynamic wave 1 (bottom-left to top-right) - more visible and sweeping */}
      <motion.div
        initial={{ opacity: 0, y: "100%", x: "-40%", scaleX: 0.5, rotate: 20 }}
        animate={{
          opacity: [0.15, 0.25, 0.15], // Increased opacity
          y: ["100%", "-30%", "100%"], // Wider vertical sweep
          x: ["-40%", "30%", "-40%"], // Wider horizontal sweep
          scaleX: [0.5, 1.8, 0.5], // More dramatic scale change
          rotate: [20, 25, 20],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          duration: 30, // Even slower, grander sweeping motion
          ease: "linear",
          delay: 3,
        }}
        className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-r from-emerald-500/20 via-transparent to-transparent rounded-full" // Taller, stronger gradient
        style={{ filter: "blur(60px)" }} // Increased blur
      />

      {/* Dynamic wave 2 (top-right to bottom-left) - more visible and sweeping */}
      <motion.div
        initial={{ opacity: 0, y: "-100%", x: "40%", scaleX: 0.6, rotate: -15 }}
        animate={{
          opacity: [0.12, 0.2, 0.12], // Increased opacity
          y: ["-100%", "30%", "-100%"], // Wider vertical sweep
          x: ["40%", "-30%", "40%"], // Wider horizontal sweep
          scaleX: [0.6, 1.7, 0.6], // More dramatic scale change
          rotate: [-15, -20, -15],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          duration: 28, // Even slower, grander sweeping motion
          ease: "linear",
          delay: 5,
        }}
        className="absolute top-0 right-0 w-full h-80 bg-gradient-to-l from-blue-500/20 via-transparent to-transparent rounded-full" // Taller, stronger gradient
        style={{ filter: "blur(55px)" }} // Increased blur
      />

      {/* Smaller, faster pulsating element - more visible */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0.15, 0.1, 0.15], scale: [0.7, 1.0, 0.7] }} // Increased opacity and scale
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          duration: 10, // Slightly slower pulse
          ease: "easeInOut",
          delay: 0.8,
        }}
        className="absolute top-1/3 left-1/3 h-80 w-80 rounded-full" // Larger size
        style={{
          background: "radial-gradient(closest-side, rgba(29,185,84,0.15), transparent 70%)", // Stronger green
          filter: "blur(40px)", // Increased blur
        }}
      />
    </div>
  )
}
