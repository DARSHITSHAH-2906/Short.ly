"use client";

import { motion } from "framer-motion";

export const Background = () => {
    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-background transition-colors duration-300" />

            {/* Primary indigo orb — top left */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], x: [0, 80, 0], y: [0, 40, 0] }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[25%] -left-[15%] w-[65vw] h-[65vw] rounded-full blur-[130px]"
                style={{ background: "radial-gradient(circle, oklch(0.55 0.22 264 / 12%), transparent 70%)" }}
            />

            {/* Violet orb — right */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], x: [0, -60, 0], y: [0, 80, 0] }}
                transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                className="absolute top-[15%] -right-[15%] w-[55vw] h-[55vw] rounded-full blur-[140px]"
                style={{ background: "radial-gradient(circle, oklch(0.58 0.20 303 / 8%), transparent 70%)" }}
            />

            {/* Subtle center glow */}
            <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 6 }}
                className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] rounded-full blur-[160px]"
                style={{ background: "radial-gradient(circle, oklch(0.62 0.18 264 / 6%), transparent 70%)" }}
            />
        </div>
    );
};
