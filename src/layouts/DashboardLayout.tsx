import React from "react";
import { twMerge } from "tailwind-merge";
import { Header } from "../components/organisms/Header";
import { Sidebar } from "../components/organisms/Sidebar";
import { FiMenu, FiX } from "react-icons/fi";
import { Button } from "../components/atoms/Button";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
  onSearch?: (value: string) => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onNavigate?: (path: string) => void;
  currentPath?: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  className,
  onSearch,
  onNotificationClick,
  onProfileClick,
  onNavigate,
  currentPath,
  user,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <Sidebar
          onNavigate={onNavigate}
          currentPath={currentPath}
          className="h-full w-64 fixed md:static top-0 left-0 z-30"
        />
      </div>

      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 bg-opacity-30"
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Sidebar */}
          <div className="relative w-64 bg-white h-full shadow-xl z-50">
            <button
              className="absolute top-4 right-4 text-gray-500 cursor-pointer"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <FiX className="w-6 h-6" />
            </button>
            <Sidebar
              onNavigate={(path) => {
                setIsSidebarOpen(false);
                onNavigate?.(path);
              }}
              currentPath={currentPath}
              className="h-full"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 ">
        {/* Header/Navbar */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 flex items-center px-4 py-3 md:py-0 md:px-0">
          {/* Sidebar toggle button for mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(true)}
            className="mr-2 md:hidden"
            aria-label="Open sidebar"
          >
            <FiMenu className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <Header
              onSearch={onSearch}
              onNotificationClick={onNotificationClick}
              onProfileClick={onProfileClick}
              user={user}
            />
          </div>
        </div>

        <main
          className={twMerge(
            "flex-1 overflow-y-auto p-4 md:p-6",
            "bg-gray-100",
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
