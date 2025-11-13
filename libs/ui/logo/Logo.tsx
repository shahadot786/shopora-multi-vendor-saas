import React from "react";

export const Logo = ({ size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bag outline */}
      <rect
        x="12"
        y="20"
        width="40"
        height="36"
        rx="8"
        stroke="url(#bagGradient)"
        strokeWidth="4"
        fill="white"
      />
      {/* Bag handles */}
      <path
        d="M20 20C20 12 28 8 32 8C36 8 44 12 44 20"
        stroke="url(#bagGradient)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* “S” letter */}
      <path
        d="M36 30C36 27 32 26 29 27C26 28 25 31 27 33C29 35 35 35 37 37C39 39 38 43 34 44C30 45 26 44 26 44"
        stroke="url(#bagGradient)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Gradient */}
      <defs>
        <linearGradient
          id="bagGradient"
          x1="12"
          y1="8"
          x2="52"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#134686" />
          <stop offset="0.5" stopColor="#1e5a9e" />
          <stop offset="1" stopColor="#2b6cb0" />
        </linearGradient>
      </defs>
    </svg>
  );
};
