import React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface Department {
  name: string;
  subcategories: string[];
}

interface CategoryListProps {
  department: Department;
  activeSub: string | null;
  setActiveSub: (name: string | null) => void;
}

const CategoryList = ({
  department,
  activeSub,
  setActiveSub,
}: CategoryListProps) => {
  const handleClick = () => {
    setActiveSub(activeSub === department.name ? null : department.name);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="w-full px-5 py-3 hover:bg-gradient-to-r hover:from-[#134686]/10 hover:to-[#2b6cb0]/10 cursor-pointer flex justify-between items-center transition-all duration-200 border-b border-gray-100 last:border-b-0 group"
      >
        <span className="text-sm font-medium text-gray-700 group-hover:text-[#134686] font-Roboto">
          {department.name}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 group-hover:text-[#134686] transition-all duration-300 ${
            activeSub === department.name ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Subcategories */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          activeSub === department.name
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
          {department.subcategories.map((sub, subIdx) => (
            <Link
              key={subIdx}
              href={`/category/${sub.toLowerCase().replace(/\s+/g, "-")}`}
              className="block px-8 py-2.5 hover:bg-white text-sm text-gray-600 hover:text-[#134686] transition-all duration-200 border-b border-gray-200 last:border-b-0 font-Poppins"
            >
              {sub}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
