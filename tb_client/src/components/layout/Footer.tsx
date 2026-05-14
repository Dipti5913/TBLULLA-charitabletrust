import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Users,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
const footerLogo = "/logo1.jpg";
import { useEffect, useRef, useState } from "react";
import { subscribeToVisitorCount } from "@/lib/visitorService";

export function Footer() {
  // Real-time visitor count from Firebase
  const [actualCount, setActualCount] = useState(0);
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(true); // Always show the pill
  const rafRef = useRef<number | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const hasAnimated = useRef(false);

  // Newsletter email state
  const [email, setEmail] = useState("");

  // Subscribe to real-time visitor count updates
  useEffect(() => {
    const unsubscribe = subscribeToVisitorCount((newCount) => {
      console.log("Footer: Received visitor count:", newCount);
      setActualCount(newCount); // Use only real Firebase data
    });
    return () => unsubscribe();
  }, []);

  // Observe when the pill enters viewport
  useEffect(() => {
    const el = pillRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) setVisible(true);
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Start the count animation the first time it becomes visible
  useEffect(() => {
    if (!visible || hasAnimated.current) return;

    const target = actualCount > 0 ? actualCount : 1; // Show at least 1 if no data yet
    const duration = 1200; // ms
    const start = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const value = Math.round(target * easeOutCubic(t));
      setCount(value);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    hasAnimated.current = true;
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, actualCount]);

  // Update count when actualCount changes after animation
  useEffect(() => {
    if (hasAnimated.current) {
      setCount(actualCount > 0 ? actualCount : 1); // Show at least 1
    }
  }, [actualCount]);

  return (
    <footer className="relative text-white bg-gradient-to-br from-primary via-primary/95 to-primary/90 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-hope rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-trust rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 lg:gap-0">
        {/* Logo */}
        <div className="flex items-center space-x-5 min-w-[260px]">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-hope/20 to-trust/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <img
              src={footerLogo}
              alt="NGO Logo"
              className="relative w-36 h-18 object-contain shadow-lg rounded-lg transition-transform duration-300 group-hover:scale-105"
            />
            {/* Visitors pill below logo */}
            <div
              ref={pillRef}
              className={`mt-3 transform transition-all duration-700 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }`}
            >
              <div className="inline-flex items-center gap-3 rounded-xl bg-white/10 border border-white/20 ring-1 ring-white/10 px-3 py-2 backdrop-blur-md shadow-xl hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hope/10 text-hope ring-1 ring-hope/20">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold tabular-nums tracking-[.02em]">
                  {(count || 1).toLocaleString()} Visitors
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Links & Newsletter */}
        <div className="flex-1 flex flex-col lg:flex-row justify-between items-start lg:items-start gap-12 lg:gap-16 w-full">
          {/* Quick Links */}
          <div>
            <p className="mb-4 font-semibold uppercase tracking-wider text-white/90">
              Quick Links
            </p>
            <ul className="space-y-3 text-sm">
              {[
                { label: "About Us", to: "/about" },
                { label: "Projects", to: "/projects" },
                { label: "Events", to: "/events" },
                { label: "Gallery", to: "/gallery" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-white/80 hover:text-hope transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information - Centered */}
          <div className="w-80 mx-auto lg:mx-0 lg:text-center">
            <p className="mb-4 font-semibold uppercase tracking-wider text-white/90 text-center">
              Contact Info
            </p>
            <div className="space-y-3 text-sm">
              {/* Address */}
              <div className="flex items-start gap-3 justify-center lg:justify-center">
                <MapPin className="w-4 h-4 text-hope mt-0.5 flex-shrink-0" />
                <div className="text-white/80 leading-relaxed text-center lg:text-center">
                  30-A, Abhyankar Complex, Amrai Road,
                  <br />
                  Sangli - 416 416, Maharashtra, India
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start justify-start lg:justify-start">
                <Phone className="w-4 h-4 text-hope mt-0.5 flex-shrink-0 ml-6" />
                <div className="text-white/80 pr-8 pl-4 m-0">
                  +91 9422407979
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 justify-start lg:justify-start">
                <Mail className="w-4 h-4 text-hope mt-0.5 flex-shrink-0 ml-6" />
                <a
                  href="mailto:lullakishor@gmail.com"
                  className="text-white/80 hover:text-hope transition-colors duration-300"
                >
                  lullakishor@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter & Social */}
          <div className="max-w-xs">
            <p className="mb-4 font-semibold uppercase tracking-wider text-white/90">
              Stay Connected
            </p>
            <form
              className="flex space-x-2 mt-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) {
                  toast({
                    title: "Submitted Successfully",
                    variant: "success",
                  });
                  setEmail(""); // Clear form after submission
                } else {
                  toast({
                    title: "Please enter a valid email address",
                    variant: "destructive",
                  });
                }
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="Your email address"
                className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-hope focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              />
              <button
                type="submit"
                className="bg-hope hover:bg-hope/90 text-white rounded-lg px-4 py-2.5 font-semibold transition-all duration-300 hover:scale-105"
              >
                Subscribe
              </button>
            </form>

            {/* Social Icons */}
            <div className="flex space-x-3 mt-6">
              {[
                {
                  Icon: Facebook,
                  bgColor: "bg-blue-600",
                  hoverColor: "hover:bg-blue-700",
                  name: "Facebook",
                },
                {
                  Icon: Twitter,
                  bgColor: "bg-sky-400",
                  hoverColor: "hover:bg-sky-500",
                  name: "Twitter",
                },
                {
                  Icon: Instagram,
                  bgColor:
                    "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
                  hoverColor:
                    "hover:from-purple-700 hover:via-pink-600 hover:to-orange-500",
                  name: "Instagram",
                },
                {
                  Icon: Linkedin,
                  bgColor: "bg-blue-500",
                  hoverColor: "hover:bg-blue-600",
                  name: "LinkedIn",
                },
              ].map(({ Icon, bgColor, hoverColor, name }, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={name}
                  className={`group p-3 rounded-2xl ${bgColor} ${hoverColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1`}
                >
                  <Icon className="w-6 h-6 text-white transition-all duration-300 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/10 bg-primary/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-white/80 font-medium tracking-wide">
          Copyright © {new Date().getFullYear()}{" "}
          <span className="hover:text-hope transition-colors duration-300 font-semibold">
            T. B. Lulla Charitable Foundation
          </span>
          . Designed and developed by{" "}
          <a
            href="https://www.infoyashonand.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-hope transition-colors duration-300 font-medium underline decoration-transparent hover:decoration-hope"
          >
            INFOYASHONAND TECHNOLOGY PVT.LTD
          </a>
        </div>
      </div>
    </footer>
  );
}
