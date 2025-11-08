import React from "react";
import Link from "next/link";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Shops", href: "/shops" },
  { name: "Hot Deals", href: "/offers", badge: "New" },
  { name: "Become a Seller", href: "/seller" },
];

const DesktopNavLinks = () => {
  return (
    <nav className="hidden md:flex items-center gap-8">
      {navLinks.map((link, idx) => (
        <Link
          key={idx}
          href={link.href}
          className="relative text-sm font-medium text-gray-700 hover:text-[#134686] transition-colors duration-300 group font-Roboto"
        >
          {link.name}
          {link.badge && (
            <span className="absolute -top-2 -right-8 bg-gradient-to-r from-[#134686] to-[#2b6cb0] text-white text-xs px-2 py-0.5 rounded-full animate-pulse shadow-md">
              {link.badge}
            </span>
          )}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#134686] via-[#1e5a9e] to-[#2b6cb0] group-hover:w-full transition-all duration-300"></span>
        </Link>
      ))}
    </nav>
  );
};

export default DesktopNavLinks;
