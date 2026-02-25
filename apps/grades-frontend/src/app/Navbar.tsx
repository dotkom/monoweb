"use client";

import Link from "next/link";

export const Navbar = () => {
  return (
    <header className="sticky backdrop-blur-xxl top-4 underline z-50 flex justify-between items-center w-full items-end max-w-screen-xl mt-4 p-4 rounded-full font-mono font-bold">
      <div className="flex items-baseline space-x-4">
        <p className="text-2xl">Grades</p>

        <Link href="/" className="text-ml">
          Emner
        </Link>
      </div>

      <div className="space-x-4">
        <Link href="/" className="text-ml">
          Om siden
        </Link>
        <Link href="/" className="text-ml">
          Logg inn
        </Link>
      </div>
    </header>
  );
};
