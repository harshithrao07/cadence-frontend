"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, Music2 } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const authDetails = localStorage.getItem("auth_details");
    if (authDetails) {
      try {
        const { id } = JSON.parse(authDetails);
        setUserId(id);
      } catch (e) {
        console.error("Failed to parse auth details", e);
      }
    }
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight flex items-center gap-2"
        >
          <Music2 className="w-6 h-6 text-red-500" />
          <span className="text-white">Cadence</span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-zinc-300">
          <Link href="/artists" className="hover:text-white transition">
            Artists
          </Link>
          {userId ? (
            <Link
              href={`/profile/${userId}`}
              className="hover:text-white transition flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="hover:text-white transition flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
