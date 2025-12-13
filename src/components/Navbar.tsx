"use client";

import Image from "next/image";
import { useAuth } from "../Providers/UserProvider";

const Navbar = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // or a skeleton loader

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-sm">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="Search" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none"
        />
      </div>

      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full">
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
          <Image src="/message.png" alt="Messages" width={20} height={20} />
        </div>
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Image
            src="/announcement.png"
            alt="Announcements"
            width={20}
            height={20}
          />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            1
          </div>
        </div>

        {/* USER INFO */}
        <div className="flex flex-col text-right">
          <span className="text-xs leading-3 font-medium">
            {user?.username ?? "Guest"}
          </span>
          <span className="text-[10px] text-gray-500">{user?.role ?? ""}</span>
        </div>

        {/* AVATAR / BUTTON */}
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer">
          <span className="text-xs font-bold text-gray-700">
            {user?.username?.[0] ?? "G"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
