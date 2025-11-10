"use client";
import React from "react";
import Link from "next/link";
import { Heart, ShoppingCart, User } from "lucide-react";
import useUser from "@/hooks/useUser";

const ActionButtons = () => {
  const { user, isLoading } = useUser();
  return (
    <div className="hidden lg:flex items-center gap-6">
      {/* User Section */}
      {!isLoading && user ? (
        <Link
          href="/profile"
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#134686]/10 to-[#2b6cb0]/10 rounded-xl border border-[#134686]/30"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#134686] via-[#1e5a9e] to-[#2b6cb0] flex items-center justify-center text-white shadow-md">
            <User size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-Poppins">Hello,</p>
            <p className="text-sm font-semibold text-gray-800 font-Roboto">
              {user?.name?.split(" ")[0]}
            </p>
          </div>
        </Link>
      ) : (
        <Link
          href="/login"
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#134686]/10 to-[#2b6cb0]/10 rounded-xl border border-[#134686]/30"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#134686] via-[#1e5a9e] to-[#2b6cb0] flex items-center justify-center text-white shadow-md">
            <User size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-Poppins">Hello,</p>
            <p className="text-sm font-semibold text-gray-800 font-Roboto">
              {isLoading ? "..." : "Sign In"}
            </p>
          </div>
        </Link>
      )}

      {/* Wishlist */}
      <Link href="/wishlist" className="relative group">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-50 transition-all duration-300 group-hover:scale-110">
          <Heart
            size={20}
            className="text-gray-700 group-hover:text-red-500 group-hover:fill-red-500 transition-all duration-300"
          />
        </div>
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
          3
        </span>
      </Link>

      {/* Cart */}
      <Link href="/cart" className="relative group">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#134686] via-[#1e5a9e] to-[#2b6cb0] flex items-center justify-center hover:shadow-lg transition-all duration-300 group-hover:scale-110">
          <ShoppingCart size={20} className="text-white" />
        </div>
        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-pulse">
          5
        </span>
      </Link>
    </div>
  );
};

export default ActionButtons;
