import React, { useState, useEffect, useRef } from "react";
import { Menu, ChevronDown } from "lucide-react";
import CategoryList from "./CategoryList";

const departments = [
  {
    name: "Electronics",
    subcategories: [
      "Mobiles",
      "Laptops",
      "Tablets",
      "Cameras",
      "Gaming",
      "Accessories",
    ],
  },
  {
    name: "Fashion",
    subcategories: [
      "Men's Clothing",
      "Women's Clothing",
      "Kids",
      "Shoes",
      "Accessories",
    ],
  },
  {
    name: "Home & Kitchen",
    subcategories: ["Furniture", "Decor", "Cookware", "Bedding", "Storage"],
  },
  {
    name: "Beauty & Health",
    subcategories: [
      "Skincare",
      "Makeup",
      "Haircare",
      "Supplements",
      "Personal Care",
    ],
  },
  {
    name: "Sports & Outdoors",
    subcategories: [
      "Fitness",
      "Cycling",
      "Camping",
      "Team Sports",
      "Water Sports",
    ],
  },
  {
    name: "Books & Media",
    subcategories: ["Books", "Movies", "Music", "Games", "Magazines"],
  },
];

const DepartmentsDropdown = () => {
  const [deptOpen, setDeptOpen] = useState(false);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const deptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deptRef.current && !deptRef.current.contains(event.target as Node)) {
        setDeptOpen(false);
        setActiveSub(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={deptRef}>
      <button
        onClick={() => {
          setDeptOpen(!deptOpen);
          setActiveSub(null);
        }}
        className="flex items-center gap-2 bg-gradient-to-r from-[#134686] via-[#1e5a9e] to-[#2b6cb0] text-white px-5 py-2.5 rounded-lg font-semibold hover:from-[#0f3a6d] hover:via-[#134686] hover:to-[#1e5a9e] transition-all duration-300 shadow-md hover:shadow-lg font-Roboto"
      >
        <Menu size={18} />
        <span className="hidden sm:inline">All Departments</span>
        <span className="sm:hidden">Menu</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${
            deptOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {deptOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white shadow-2xl border border-gray-200 rounded-xl overflow-hidden z-50">
          {departments.map((dept, idx) => (
            <CategoryList
              key={idx}
              department={dept}
              activeSub={activeSub}
              setActiveSub={setActiveSub}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentsDropdown;
