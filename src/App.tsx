import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { User, LogIn, Mail, Lock, ShieldCheck, X } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PPASection from "./components/PPASection";
import PPADetailSection from "./components/PPADetailSection";
import RoommatesDirectorySection from "./components/RoommatesDirectorySection";
import ReviewsSection from "./components/ReviewsSection";
import { useAppStore } from "./store/useAppStore";

// Setup a new TanStack Query Client for client-side state
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

type Screen = "directory" | "roommates" | "reviews" | { type: "ppa-detail"; ppaId: string };

export default function App() {
  const { login } = useAppStore();
  const [screen, setScreen] = useState<Screen>("directory");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSignInModal, setShowSignInModal] = useState(false);

  // SignIn state values
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [signInSuccessMsg, setSignInSuccessMsg] = useState("");

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    login(emailInput, "Bobby Keys");
    setSignInSuccessMsg("Successfully signed in!");
    setTimeout(() => {
      setShowSignInModal(false);
      setSignInSuccessMsg("");
      setEmailInput("");
      setPasswordInput("");
    }, 1500);
  };

  const handleNavigateToRoommates = () => {
    setScreen("roommates");
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen bg-[#f8faf9] text-[#191c1c] font-sans antialiased">
        {/* Shared Navbar */}
        <Navbar
          currentScreen={screen}
          setScreen={(s) => {
            setScreen(s);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onSearch={(val) => setSearchTerm(val)}
          onSignIn={() => setShowSignInModal(true)}
        />

        {/* Dynamic Screen Routing Render with smooth animations */}
        <main className="flex-grow w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={typeof screen === "string" ? screen : screen.type + "-" + screen.ppaId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {screen === "directory" && (
                <PPASection
                  searchTerm={searchTerm}
                  onViewDetails={(ppaId) => setScreen({ type: "ppa-detail", ppaId })}
                />
              )}

              {typeof screen === "object" && screen.type === "ppa-detail" && (
                <PPADetailSection
                  ppaId={screen.ppaId}
                  onNavigateToRoommates={handleNavigateToRoommates}
                  onBack={() => setScreen("directory")}
                />
              )}

              {screen === "roommates" && (
                <RoommatesDirectorySection searchTerm={searchTerm} />
              )}

              {screen === "reviews" && (
                <ReviewsSection />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Shared Footer */}
        <Footer
          onNavigate={(s) => {
            setScreen(s as any);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />

        {/* Sign In Dialog */}
        <AnimatePresence>
          {showSignInModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-sm shadow-2xl relative"
              >
                <button
                  onClick={() => setShowSignInModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-primary/10">
                    <LogIn className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-extrabold text-primary">
                    Welcome to NYSC Help
                  </h3>
                  <p className="text-gray-500 text-xs mt-1">
                    Sign in to save PPAs and connect with fellow corps members.
                  </p>
                </div>

                {signInSuccessMsg ? (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-center text-sm font-semibold flex flex-col items-center gap-2"
                  >
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                    <span>{signInSuccessMsg}</span>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSignInSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="corpsmember@nysc.gov.ng"
                          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-light outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-light outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#1B4332] text-white py-3 rounded-lg font-bold hover:bg-primary active:scale-95 transition-all mt-4 cursor-pointer"
                    >
                      Sign In
                    </button>
                  </form>
                )}

                <div className="text-center mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-400">
                  By signing in, you agree to follow the NYSC Help community guidelines.
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </QueryClientProvider>
  );
}
