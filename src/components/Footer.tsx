import React, { useState } from "react";
import { Mail, Share2, Heart } from "lucide-react";

interface FooterProps {
  onNavigate: (screen: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "NYSC Help - Roommate & PPA Finder",
        text: "Check out NYSC Help to find your perfect PPA and compatible roommates!",
        url: window.location.href,
      });
    } else {
      alert("Link copied to clipboard!");
    }
  };

  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200 py-12 px-6 sm:px-8 lg:px-12 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand details */}
        <div className="flex flex-col gap-4 col-span-1 md:col-span-1">
          <span className="font-display text-2xl font-black text-primary">NYSC Help</span>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            Empowering the Next Generation of Nigerian leaders through community, information, and shared resources.
          </p>
          <p className="text-xs text-gray-400 mt-2 font-medium">
            © 2024 NYSC Help. Empowering the Next Generation.
          </p>
        </div>

        {/* Navigation Categories */}
        <div className="flex flex-col gap-4">
          <h4 className="font-display text-xs font-bold text-primary uppercase tracking-widest">
            Platform
          </h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>
              <button
                onClick={() => onNavigate("directory")}
                className="hover:text-secondary transition-colors cursor-pointer text-left"
              >
                About Us
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate("directory")}
                className="hover:text-secondary transition-colors cursor-pointer text-left"
              >
                PPA Directory
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate("roommates")}
                className="hover:text-secondary transition-colors cursor-pointer text-left"
              >
                Roommate Matcher
              </button>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-display text-xs font-bold text-primary uppercase tracking-widest">
            Resources
          </h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>
              <a href="#rules" className="hover:text-secondary transition-colors">
                Community Guidelines
              </a>
            </li>
            <li>
              <a href="#privacy" className="hover:text-secondary transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#terms" className="hover:text-secondary transition-colors">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>

        {/* Stay Connected/Newsletter */}
        <div className="flex flex-col gap-4 col-span-1">
          <h4 className="font-display text-xs font-bold text-primary uppercase tracking-widest">
            Stay Connected
          </h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            Join our newsletter for the latest relocation tips and house-hunting advice.
          </p>
          
          <form onSubmit={handleSubscribe} className="flex gap-2 mt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
              className="flex-grow bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-all"
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-container active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              {subscribed ? "Subscribed!" : "Join"}
            </button>
          </form>

          {/* Socials / Support buttons */}
          <div className="flex items-center gap-3 mt-4">
            <a
              href="mailto:support@nyschelp.com"
              className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-sm"
              title="Mail Support"
            >
              <Mail className="w-4 h-4" />
            </a>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
              title="Share Platform"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in Nigeria
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
