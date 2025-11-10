"use client";
import React, { useState, useEffect } from "react";
import TopBar from "./TopBar";
import MainHeader from "./MainHeader";
import NavigationBar from "./NavigationBar";
import MobileMenu from "./MobileMenu";
import useUser from "@/hooks/useUser";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoading } = useUser();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`w-full bg-white sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-lg" : "shadow-md"
      }`}
    >
      <TopBar />
      <MainHeader
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        scrolled={scrolled}
      />
      <NavigationBar />
      <MobileMenu menuOpen={menuOpen} user={user} isLoading={isLoading} />
    </header>
  );
};

export default Header;
