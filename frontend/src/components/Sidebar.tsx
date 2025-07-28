"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { HomeIcon, ClipboardDocumentListIcon, ChartBarIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Tooltip } from "@nextui-org/react"; // Optional: Install @nextui-org/react for tooltips

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Study Plan", href: "/plan", icon: ClipboardDocumentListIcon },
    { name: "Progress", href: "/progress", icon: ChartBarIcon },
  ];

  const isActiveRoute = (href: string) => pathname === href || pathname.startsWith(href);

  return (
    <div
      className={`bg-white border-r shadow-md ${
        collapsed ? "w-20" : "w-64"
      } transition-all duration-300 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h1 className={`text-xl font-bold text-blue-600 truncate ${collapsed ? "hidden" : ""}`}>
          InterviewPrep
        </h1>
        <button
          onClick={() => setCollapsed(!collapsed)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setCollapsed(!collapsed)}
          className="p-2 rounded hover:bg-gray-200 focus:outline-none"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronDoubleRightIcon className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronDoubleLeftIcon className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1">
        {menuItems.map((item) => {
          const active = isActiveRoute(item.href);
          const icon = <item.icon className={`h-6 w-6 ${active ? "text-blue-700" : "text-gray-600"}`} />;
          return (
            <Tooltip key={item.name} content={collapsed ? item.name : ""} placement="right">
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 transition rounded-md ${
                  active
                    ? "bg-blue-100 text-blue-700 font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {icon}
                {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
              </Link>
            </Tooltip>
          );
        })}
      </nav>
    </div>
  );
}
