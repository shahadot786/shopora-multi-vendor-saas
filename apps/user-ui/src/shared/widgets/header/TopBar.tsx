import React from "react";
import { Phone, MapPin, Tag } from "lucide-react";

const TopBar = () => {
  return (
    <div className="bg-gradient-to-r from-[#134686] via-[#1e5a9e] to-[#2b6cb0] text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1">
            <Phone size={14} />
            <span className="font-Poppins">Support: +1-234-567-8900</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span className="hidden sm:inline font-Poppins">Deliver to</span>
            <span className="font-Roboto font-semibold">New York 10001</span>
          </div>
        </div>
        <div className="flex items-center gap-1 animate-pulse">
          <Tag size={14} />
          <span className="font-Roboto font-medium">
            Free Shipping on Orders Over $50!
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
