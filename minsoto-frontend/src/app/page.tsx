"use client";

import { useState, useEffect, useRef } from "react";

const Link = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [stars, setStars] = useState<
    { id: number; x: number; y: number; size: number; opacity: number; speed: number }[]
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse + scroll tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const handleScroll = () => setScrollY(window.scrollY);

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Generate stars
  useEffect(() => {
    const newStars = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.6 + 0.3,
      speed: Math.random() * 0.5 + 0.1,
    }));
    setStars(newStars);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black text-white overflow-x-hidden relative"
    >
      {/* === Interactive Starfield Background === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              transform: `translate(
                ${(mousePos.x - (typeof window !== "undefined" ? window.innerWidth : 0) / 2) * star.speed * 0.15}px,
                ${(mousePos.y - (typeof window !== "undefined" ? window.innerHeight : 0) / 2) * star.speed * 0.15 +
                  scrollY * star.speed * 0.6}px
              )`,
              transition: "transform 0.15s ease-out",
            }}
          />
        ))}
      </div>

      {/* === Navbar === */}
      <nav className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Minsoto</h1>
          <div className="flex items-center space-x-6">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors hidden md:block">
              Features
            </Link>
            <Link href="#philosophy" className="text-gray-300 hover:text-white transition-colors hidden md:block">
              Philosophy
            </Link>
            <Link
              href="/login"
              className="px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* === Hero Section === */}
      <section className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="space-y-6">
              <span className="text-sm text-gray-400 tracking-widest">WELCOME TO THE FUTURE</span>
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Community,
                </span>
                <br />
                <span className="bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent">
                  Without the Chaos.
                </span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed max-w-lg font-light">
                Minsoto is your focused space to connect with your passions and achieve your goals.
                Experience the harmony of minimalist social connection.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-black rounded-2xl font-medium hover:bg-gray-100 transition transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
              </Link>
              <Link
                href=""
                className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition transform hover:scale-105 flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right Column - Dark Image */}
          <div className="relative">
            <div
              className="w-full h-[500px] rounded-3xl border border-white/10 shadow-2xl bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80')",
              }}
            />
          </div>
        </div>
      </section>

      {/* === Features Section === */}
      <section id="features" className="relative z-10 py-20 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          {["Simplicity", "Mindfulness", "Harmony"].map((title, i) => (
            <div
              key={i}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 space-y-4"
            >
              <div className="w-12 h-12 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white/30 rounded-full" />
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-gray-400 text-sm">
                {title === "Simplicity" &&
                  "Remove the unnecessary to focus on what truly matters in your digital connections."}
                {title === "Mindfulness" &&
                  "Every interaction is intentional, every connection meaningful and purposeful."}
                {title === "Harmony" &&
                  "Balance between digital presence and real-world experiences, creating perfect equilibrium."}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* === Footer === */}
      <footer className="relative z-10 py-6 text-center text-gray-500 text-sm border-t border-white/10">
        Â© {new Date().getFullYear()} Minsoto. All rights reserved.
      </footer>
    </div>
  );
}