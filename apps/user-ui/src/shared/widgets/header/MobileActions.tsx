import React from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X, Heart } from "lucide-react";

interface MobileActionsProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const MobileActions = ({ menuOpen, setMenuOpen }: MobileActionsProps) => {
  return (
    <div className="flex lg:hidden items-center gap-3">
      <Link href="/cart" className="relative">
        <ShoppingCart size={24} className="text-gray-700" />
        <span className="absolute -top-2 -right-2 bg-[#134686] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          0
        </span>
      </Link>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-300"
      >
        {menuOpen ? (
          <X size={24} color="black" />
        ) : (
          <Menu size={24} color="black" />
        )}
      </button>
    </div>
  );
};

export default MobileActions;
