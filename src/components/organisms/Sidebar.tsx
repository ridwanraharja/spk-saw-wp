import React from "react";
import { twMerge } from "tailwind-merge";
import {
  FiHome,
  FiBarChart2,
  FiFileText,
  FiSettings,
  FiDatabase,
  FiUsers,
  FiKey,
} from "react-icons/fi";
import type { NavigationItem } from "../../types";

interface SidebarProps {
  className?: string;
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

const mainNavigation: NavigationItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: "FiHome",
    path: "/dashboard",
  },
  {
    id: "order",
    title: "Order",
    icon: "FiFileText",
    path: "/order",
  },
  {
    id: "report",
    title: "Report",
    icon: "FiBarChart2",
    path: "/report",
  },
  {
    id: "track",
    title: "Track",
    icon: "FiTrendingUp",
    path: "/track",
  },
  {
    id: "maintenance",
    title: "Maintenance",
    icon: "FiSettings",
    path: "/maintenance",
  },
];

const secondaryNavigation: NavigationItem[] = [
  {
    id: "master-data",
    title: "Master Data",
    icon: "FiDatabase",
    path: "/master-data",
  },
  {
    id: "user",
    title: "User",
    icon: "FiUsers",
    path: "/user",
  },
  {
    id: "role",
    title: "Role",
    icon: "FiKey",
    path: "/role",
  },
];

const iconMap: Record<string, React.ElementType> = {
  FiHome,
  FiBarChart2,
  FiFileText,
  FiSettings,
  FiDatabase,
  FiUsers,
  FiKey,
};

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  onNavigate,
  currentPath = "/dashboard",
}) => {
  return (
    <aside
      className={twMerge(
        "bg-white border-r border-gray-200 w-64 flex flex-col h-full",
        className
      )}
    >
      {/* Logo and App Name */}
      <div className="flex items-center px-6 py-6 mb-2">
        {/* <img src="/logo.svg" alt="Logo" className="w-7 h-7 mr-2" /> */}
        <span className="font-bold text-lg text-primary">Oqury</span>
      </div>
      {/* Main Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {mainNavigation.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.path)}
              className={twMerge(
                "w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {Icon && <Icon className="w-5 h-5 mr-3" />}
              <span className="flex-1 text-left">{item.title}</span>
            </button>
          );
        })}
      </nav>
      {/* Divider */}
      <div className="my-3 border-t border-gray-200" />
      {/* Secondary Navigation */}
      <nav className="px-2 space-y-1 mb-4">
        {secondaryNavigation.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.path)}
              className={twMerge(
                "w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {Icon && <Icon className="w-5 h-5 mr-3" />}
              <span className="flex-1 text-left">{item.title}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
