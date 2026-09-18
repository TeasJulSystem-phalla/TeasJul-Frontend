// src/components/public/PublicHeader.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Menu, X } from "lucide-react";

import logo from "../../assets/logo.png";

const LINKS = [
  { to: "/public", key: "home", label: "ទំព័រដើម" },
  { to: "/public/rooms", key: "rooms", label: "បន្ទប់ជួល" },
  { to: "/public/marketing", key: "marketing", label: "ហេតុអ្វី TeasJul?" },
  { to: "/public/about", key: "about", label: "អំពីយើង" },
];

const PublicHeader = ({ active }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-[#f8f8f6]/85 backdrop-blur-xl">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mx-auto flex items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          {/* Logo — scaled up to compensate for padding inside the file */}
          <Link
            to="/public"
            className="relative flex h-14 w-24 shrink-0 items-center sm:w-28"
          >
            <img
              src={logo}
              alt="TeasJul"
              className="absolute left-0 top-1/2 h-10 w-auto -translate-y-1/2 origin-left scale-[2.2] object-contain sm:scale-[2.5]"
            />
          </Link>

          <nav className="hidden items-center gap-7 xl:flex">
            {LINKS.map((link) => (
              <Link
                key={link.key}
                to={link.to}
                className={`font-khmer text-[13px] font-medium transition-colors ${
                  active === link.key
                    ? "text-[#0f2942]"
                    : "text-slate-800 hover:text-[#0f2942]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              className="relative hidden p-2 text-slate-600 hover:text-[#0f2942] sm:block"
              aria-label="ការជូនដំណឹង"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-[#f8f8f6]" />
            </button>

            <a
              href="#"
              className="font-khmer hidden text-[13px] font-medium text-slate-800 hover:text-[#0f2942] sm:block"
            >
              ពាក់ព័ន្ធ
            </a>

            <Link
              to="/public/register-business"
              className="font-khmer rounded-md bg-[#0f2942] px-3.5 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-[#1a3d5f]"
            >
              ចុះឈ្មោះ
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 text-slate-700 xl:hidden"
              aria-label="ម៉ឺនុយ"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-2 xl:hidden">
            {LINKS.map((link) => (
              <Link
                key={link.key}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`font-khmer block py-2.5 text-[14px] ${
                  active === link.key
                    ? "font-semibold text-[#0f2942]"
                    : "text-slate-700 hover:text-[#0f2942]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default PublicHeader;