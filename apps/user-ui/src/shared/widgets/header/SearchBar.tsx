import React, { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  className?: string;
}

const SearchBar = ({ className = "" }: SearchBarProps) => {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className={`flex-1 max-w-2xl ${className}`}>
      <div
        className={`flex items-center w-full bg-gray-50 rounded-full border-2 transition-all duration-300 ${
          searchFocused
            ? "border-[#134686] shadow-lg ring-4 ring-[#134686]/20"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <input
          type="text"
          placeholder="Search for products, brands, and more..."
          className="bg-transparent outline-none flex-1 px-5 py-3 text-sm font-medium text-gray-700 placeholder:text-gray-400 font-Poppins"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <button className="bg-gradient-to-r from-[#134686] via-[#1e5a9e] to-[#2b6cb0] text-white px-6 py-3 rounded-full hover:from-[#0f3a6d] hover:via-[#134686] hover:to-[#1e5a9e] transition-all duration-300 flex items-center gap-2 font-medium mr-1 shadow-md hover:shadow-lg font-Roboto">
          <Search size={18} />
          <span className="hidden lg:inline">Search</span>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
