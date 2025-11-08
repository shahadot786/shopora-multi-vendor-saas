import React from "react";
import DepartmentsDropdown from "./DepartmentsDropdown";
import DesktopNavLinks from "./DesktopNavLinks";

const NavigationBar = () => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <DepartmentsDropdown />
          <DesktopNavLinks />
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
