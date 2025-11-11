"use client";
import React from "react";
import Link from "next/link";
import { User } from "lucide-react";
import useUser from "@/hooks/useUser";

const mobileNavLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Shops", href: "/shops" },
  { name: "Wishlist", href: "/wishlist" },
  { name: "Hot Deals", href: "/offers" },
  { name: "Become a Seller", href: "/seller" },
];

interface MobileMenuProps {
  menuOpen: boolean;
}

const MobileMenu = ({ menuOpen }: MobileMenuProps) => {
  if (!menuOpen) return null;
  const { user } = useUser();

  return (
    <div className="lg:hidden bg-white shadow-2xl border-t border-gray-200">
      <div className="px-4 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* User Section */}
        <Link
          href="/login"
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#134686]/10 to-[#2b6cb0]/10 rounded-xl border border-[#134686]/30"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#134686] via-[#1e5a9e] to-[#2b6cb0] flex items-center justify-center text-white shadow-md">
            <User size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 font-Roboto">
              {user?.name ? user?.name : "Sign In"}
            </p>
            <p className="text-xs text-gray-500 font-Poppins">
              Access your account
            </p>
          </div>
        </Link>

        {/* Mobile Navigation */}
        <div className="space-y-1">
          {mobileNavLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-[#134686]/10 hover:to-[#2b6cb0]/10 transition-colors duration-200"
            >
              <span className="text-sm font-medium text-gray-700 font-Roboto">
                {link.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
