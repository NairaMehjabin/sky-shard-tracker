"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useVelocity, useTransform, useSpring } from "framer-motion";
import { Menu, X, Compass, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useNow } from "@/context/Now";

// Dynamically import the Clock with SSR disabled
const Clock = dynamic(() => import("@/components/Clock"), {
  ssr: false,
});

export default function SkylitHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { application: now } = useNow();

  // Kinetic Physics Base (Hanging/Swaying effect for links)
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const rotationTarget = useTransform(scrollVelocity, [-2000, 2000], [-12, 12]);
  const smoothRotation = useSpring(rotationTarget, { damping: 12, stiffness: 90 });

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Stabilize physics layout on mount and route changes
  useEffect(() => {
    setIsMounted(true);
    smoothRotation.set(0);
    scrollVelocity.set(0);
  }, [pathname, smoothRotation, scrollVelocity]);

  // Structural Navigation Links
  const navLinks = [
    { name: "Tracker", href: "/" },
    { name: "Timeline", href: "#" },
    { name: "Analytics", href: "#" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav className="fixed w-full top-0 left-0 z-[100] pointer-events-none transition-all duration-300">
        <div className="max-w-7xl mx-auto relative h-32 md:h-40 px-6">
          
          {/* --- LAYER 1: DECORATIVE BRANCHES --- */}
          <motion.div 
            initial={{ opacity: 0, y: 0 }} 
            animate={{ 
              y: isScrolled ? -20 : 0, 
              opacity: isScrolled ? 0 : 0.9
            }}
            transition={{ 
              duration: 0.4, 
              ease: "easeOut",
              layout: { type: "tween" } 
            }}
            className="absolute inset-x-0 top-0 h-full z-0 overflow-visible"
          >
            <svg viewBox="0 0 1200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover md:object-fill drop-shadow-[0_4px_12px_rgba(61,43,31,0.15)]">
              <path d="M-20 20C150 22 280 45 450 35C620 25 780 15 950 25C1080 32 1150 20 1250 15" stroke="#3D2B1F" strokeWidth="7" strokeLinecap="round" />
              <path d="M120 23C200 35 320 50 390 62" stroke="#3D2B1F" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M750 20C820 32 890 48 930 65" stroke="#3D2B1F" strokeWidth="3" strokeLinecap="round" />
              <circle cx="160" cy="28" r="7" fill="#E2B4BD" opacity="0.95" />
              <circle cx="320" cy="48" r="8" fill="#8A9A5B" opacity="0.95" />
              <circle cx="780" cy="22" r="8" fill="#E2B4BD" opacity="0.95" />
            </svg>
          </motion.div>

          {/* --- LAYER 2: CAPSULE STRIP SCROLL BACKDROP --- */}
          <div className="absolute inset-x-6 top-4 flex justify-center z-10">
            <motion.div 
              animate={{ 
                opacity: isScrolled ? 1 : 0,
                scale: isScrolled ? 1 : 0.95,
                y: isScrolled ? 0 : -10
              }}
              className="w-full max-w-5xl h-14 bg-[#FFFDF7]/95 backdrop-blur-md border-2 border-[#3D2B1F]/15 rounded-full shadow-lg"
            />
          </div>

          {/* --- LAYER 3: CORE INTERACTIVE NAVIGATION --- */}
          <motion.div 
            animate={{
              maxWidth: isScrolled ? "64rem" : "80rem", 
              y: isScrolled ? -2 : 0
            }}
            transition={{ type: "spring", stiffness: 120, damping: 22 }}
            className="relative w-full h-full mx-auto flex items-start justify-between pt-6 z-20 pointer-events-auto"
          >
            
            {/* LEFT NAVIGATION LINKS */}
            <div className="flex items-center gap-6 mt-1 md:mt-3 flex-1">
              <button 
                onClick={() => setMobileMenuOpen(true)} 
                className="md:hidden p-2 rounded-full bg-[#FFFDF7] border-2 border-[#3D2B1F]/20 text-[#3D2B1F] shadow-sm hover:border-[#3D2B1F]"
              >
                <Menu size={20} />
              </button>

              <div className="hidden md:flex items-center gap-2 lg:gap-4 pl-4 transition-all duration-500">
                {navLinks.map((link) => (
                  <motion.div
                    key={link.name}
                    animate={{ y: isScrolled ? -2 : 0 }}
                    style={{ 
                      rotate: !isMounted || isScrolled ? 0 : smoothRotation, 
                      transformOrigin: "top center" 
                    }}
                    whileHover={isScrolled ? { scale: 1.05 } : { scale: 1.05, rotate: 3 }}
                    className="flex flex-col items-center justify-start"
                  >
                    <motion.div animate={{ height: isScrolled ? 0 : 32, opacity: isScrolled ? 0 : 0.6 }} className="w-[1.5px] bg-[#3D2B1F]" />
                    <Link 
                      href={link.href} 
                      className={`px-3.5 py-2 transition-all duration-300 font-mono font-black uppercase tracking-[0.2em] text-[10px] whitespace-nowrap ${
                        isScrolled
                          ? isActive(link.href)
                            ? "text-[#3D2B1F] bg-[#E2B4BD]/30 rounded-full"
                            : "text-[#5C4033] hover:text-[#3D2B1F]"
                          : isActive(link.href)
                            ? "bg-[#3D2B1F] text-[#E2B4BD] border-2 border-[#3D2B1F] rounded-xl shadow-md"
                            : "bg-[#FFFDF7] text-[#3D2B1F] border-2 border-[#3D2B1F]/15 hover:border-[#3D2B1F] rounded-xl shadow-sm"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CENTER BRAND LOGO EMBLEM HUB */}
            <div className="flex flex-col items-center self-start mx-2">
              <motion.div animate={{ height: isScrolled ? 0 : 20, opacity: isScrolled ? 0 : 1 }} className="w-[2px] bg-[#3D2B1F]" />
              <Link href="/" className="group flex flex-col items-center">
                <motion.div 
                  animate={{ scale: isScrolled ? 0.85 : 1, y: isScrolled ? -9 : 0, borderWidth: isScrolled ? "3px" : "4px" }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  className="relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 shadow-xl bg-[#3D2B1F] border-[#E2B4BD] p-0 z-10"
                >
                  <Compass size={24} className="text-[#E2B4BD] animate-[spin_12s_linear_infinite]" />
                </motion.div>
              </Link>
            </div>

            {/* RIGHT CLOCK BLOCK */}
            <div className="flex items-center justify-end flex-1 mt-1 md:mt-3 pr-4">
              <motion.div
                animate={{ y: isScrolled ? -2 : 0 }}
                style={{ 
                  rotate: !isMounted || isScrolled ? 0 : smoothRotation, 
                  transformOrigin: "top center" 
                }}
                className="flex flex-col items-center justify-start"
              >
                <motion.div animate={{ height: isScrolled ? 0 : 32, opacity: isScrolled ? 0 : 0.6 }} className="w-[1.5px] bg-[#3D2B1F]" />
                <div className="text-[11px] font-mono tracking-tight font-bold text-[#3D2B1F] bg-[#FFFDF7] border-2 border-[#3D2B1F]/20 px-3.5 py-1.5 rounded-xl shadow-sm flex items-center gap-2">
                  <span className="text-[#8A9A5B] font-sans uppercase text-[9px] font-black hidden sm:inline">Dhaka</span>
                  <Clock time={now} convertTo="local" />
                </div>
              </motion.div>
            </div>

          </motion.div>
        </div>
      </nav>

      {/* MOBILE ACCORDION COMPONENT DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="fixed inset-0 z-[200] bg-[#FDFBF7] flex flex-col p-8 justify-between border-r-4 border-[#3D2B1F]"
          >
            <div>
              <div className="flex justify-between items-center mb-12 border-b-2 border-[#3D2B1F]/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#3D2B1F] flex items-center justify-center">
                    <Compass size={20} className="text-[#E2B4BD]" />
                  </div>
                  <span className="text-[#3D2B1F] font-mono font-black tracking-widest text-2xl uppercase">
                    SKYLIT
                  </span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="w-10 h-10 rounded-xl bg-[#FFFDF7] border-2 border-[#3D2B1F]/20 flex items-center justify-center text-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-[#E2B4BD] transition-all"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    onClick={() => setMobileMenuOpen(false)} 
                    className={`text-2xl font-mono font-bold uppercase tracking-wider flex justify-between items-center transition-colors p-3 rounded-2xl ${
                      isActive(link.href) 
                        ? "bg-[#3D2B1F] text-[#E2B4BD]" 
                        : "text-[#3D2B1F] hover:bg-[#E2B4BD]/20"
                    }`}
                  >
                    {link.name} <ArrowRight className={isActive(link.href) ? "text-[#E2B4BD]" : "text-[#8A9A5B]"} size={20} />
                  </Link>
                ))}
              </div>
            </div>

            {/* MOBILE DRAWER FOOTER CLOCK */}
            <div className="border-t-2 border-[#3D2B1F]/10 pt-6">
              <div className="w-full text-center text-xs font-mono font-bold uppercase tracking-wider py-3.5 rounded-2xl bg-[#FFFDF7] text-[#3D2B1F] border-2 border-[#3D2B1F]/15 shadow-sm flex items-center justify-center gap-3">
                <span className="text-[#8A9A5B] font-sans text-[10px] font-black">DHAKA</span>
                <Clock time={now} convertTo="local" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}