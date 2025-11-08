import React from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#134686] via-[#1e5a9e] to-[#2b6cb0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
        <ShoppingBag
          className="w-5 h-5 sm:w-6 sm:h-6 text-white"
          strokeWidth={2.5}
        />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#3b82f6] rounded-full animate-pulse"></div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-[#134686] via-[#1e5a9e] to-[#2b6cb0] bg-clip-text text-transparent font-Roboto">
          Shopora
        </span>
        <span className="text-[10px] sm:text-xs font-medium text-gray-500 -mt-1 tracking-wider font-Poppins">
          SHOP MORE, SAVE MORE
        </span>
      </div>
    </Link>
  );
};

export default Logo;
