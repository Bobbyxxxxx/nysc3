import React, { useState } from "react";
import { Search, Menu, X, User, Bookmark, LogOut } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

interface NavbarProps {
  currentScreen: string | { type: string; ppaId: string };
  setScreen: (screen: any) => void;
  onSearch: (query: string) => void;
  onSignIn?: () => void;
  userEmail?: string;
}

export default function Navbar({
  currentScreen,
  setScreen,
  onSearch,
  onSignIn,
  userEmail,
}: NavbarProps) {
  const { user, login, logout, savedPpaIds } = useAppStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const isDirectoryActive =
    currentScreen === "directory" ||
    (typeof currentScreen === "object" && currentScreen.type === "ppa-detail");
  const isRoommatesActive = currentScreen === "roommates";
  const isReviewsActive = currentScreen === "reviews";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    onSearch(val);
  };

  const handleLinkClick = (screen: string) => {
    setScreen(screen);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all shadow-sm">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center h-26">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => handleLinkClick("directory")}
        >
          <span className="font-display text-4xl font-extrabold tracking-tight text-primary transition-colors group-hover:text-primary-container">
            Corp
          </span>
          <span className="hidden sm:inline bg-primary-light/30 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            Hub
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => handleLinkClick("directory")}
            className={`font-sans font-medium text-xl transition-all pb-1 border-b-2 ${
              isDirectoryActive
                ? "text-primary border-primary font-semibold"
                : "text-gray-500 border-transparent hover:text-primary hover:border-primary-light"
            }`}
          >
            Directory
          </button>
          <button
            onClick={() => handleLinkClick("roommates")}
            className={`font-sans font-medium text-xl transition-all pb-1 border-b-2 ${
              isRoommatesActive
                ? "text-primary border-primary font-semibold"
                : "text-gray-500 border-transparent hover:text-primary hover:border-primary-light"
            }`}
          >
            Roommates
          </button>
          <button
            onClick={() => handleLinkClick("reviews")}
            className={`font-sans font-medium text-xl transition-all pb-1 border-b-2 ${
              isReviewsActive
                ? "text-primary border-primary font-semibold"
                : "text-gray-500 border-transparent hover:text-primary hover:border-primary-light"
            }`}
          >
            Reviews
          </button>
        </div>

        {/* Search, Action & Mobile Button */}
        <div className="flex items-center gap-4">
          {/* Quick Search */}
          <div className="hidden sm:flex items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-primary-light focus-within:border-primary transition-all">
            <Search className="text-gray-400 w-4 h-4 mr-2" />
            <input
              type="text"
              value={searchVal}
              onChange={handleSearchChange}
              placeholder="Quick search..."
              className="bg-transparent border-none outline-none focus:ring-0 text-sm w-36 lg:w-48 text-gray-800"
            />
          </div>

          {/* User Sign In / Profile */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-primary/5 hover:bg-primary/10 px-4 py-1.5 rounded-full border border-primary-light/30 transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs text-primary font-semibold max-w-[100px] truncate">
                  {user.name}
                </span>
              </button>

              {dropdownOpen && (
                <>
                  {/* Backdrop to close dropdown on outer click */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-150 shadow-xl py-2.5 z-50 animate-fade-in">
                    <div className="px-4 py-1.5 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-800">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                        <Bookmark className="w-3.5 h-3.5 text-primary" />
                        <span>
                          Saved PPAs: <strong>{savedPpaIds.length}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="pt-1.5">
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                login("bobby.keys@nysc.gov.ng", "Bobby Keys");
              }}
              className="bg-primary text-white px-6 py-2 rounded-full font-sans font-semibold text-sm hover:bg-primary-container active:scale-95 hover:shadow-md transition-all cursor-pointer"
            >
              Sign In
            </button>
          )}

          {/* Burger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-primary p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-4 space-y-2 animate-fade-in">
          {/* Search Bar for Mobile */}
          <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <Search className="text-gray-400 w-4 h-4 mr-2" />
            <input
              type="text"
              value={searchVal}
              onChange={handleSearchChange}
              placeholder="Search directory or roommates..."
              className="bg-transparent border-none outline-none focus:ring-0 text-sm w-full text-gray-800"
            />
          </div>

          <button
            onClick={() => handleLinkClick("directory")}
            className={`block w-full text-left px-3 py-2 rounded-md font-sans font-medium text-sm ${
              isDirectoryActive
                ? "bg-primary/5 text-primary font-semibold"
                : "text-gray-600 hover:bg-gray-50 hover:text-primary"
            }`}
          >
            Directory
          </button>
          <button
            onClick={() => handleLinkClick("roommates")}
            className={`block w-full text-left px-3 py-2 rounded-md font-sans font-medium text-sm ${
              isRoommatesActive
                ? "bg-primary/5 text-primary font-semibold"
                : "text-gray-600 hover:bg-gray-50 hover:text-primary"
            }`}
          >
            Roommates
          </button>
          <button
            onClick={() => handleLinkClick("reviews")}
            className={`block w-full text-left px-3 py-2 rounded-md font-sans font-medium text-sm ${
              isReviewsActive
                ? "bg-primary/5 text-primary font-semibold"
                : "text-gray-600 hover:bg-gray-50 hover:text-primary"
            }`}
          >
            Reviews
          </button>
        </div>
      )}
    </nav>
  );
}
