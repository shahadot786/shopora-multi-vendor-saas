import React from "react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import ActionButtons from "./ActionButtons";
import MobileActions from "./MobileActions";

interface MainHeaderProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const MainHeader = ({ menuOpen, setMenuOpen }: MainHeaderProps) => {
  return (
    <div className="border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <SearchBar className="hidden md:flex" />
          <ActionButtons />
          <MobileActions menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        </div>
        <SearchBar className="md:hidden mt-4" />
      </div>
    </div>
  );
};

export default MainHeader;
