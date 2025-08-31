import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleViewChange = (view: string) => {
    // This function is required by AdminSidebar but routing is handled by React Router
    console.log("View change:", view);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Map pathname to view for sidebar
  const getCurrentView = (pathname: string) => {
    if (pathname === "/dashboard") return "dashboard";
    if (pathname === "/new-spk") return "new-spk";
    if (pathname === "/history") return "history";
    if (pathname.startsWith("/result/")) return "view-result";
    if (pathname.startsWith("/edit-spk/")) return "edit-spk";
    if (pathname === "/users") return "users";
    if (pathname === "/create-user") return "create-user";
    if (pathname.startsWith("/edit-user/")) return "edit-user";
    if (pathname === "/all-spk") return "all-spk";
    if (pathname === "/templates") return "templates";
    return "dashboard";
  };

  const currentView = getCurrentView(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar
            currentView={currentView}
            onViewChange={handleViewChange}
            user={user}
            onLogout={handleLogout}
          />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden fixed top-4 left-4 z-40 bg-white shadow-md"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <AdminSidebar
              currentView={currentView}
              onViewChange={handleViewChange}
              user={user}
              onLogout={handleLogout}
              onNavigate={() => setIsMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 h-screen overflow-auto lg:ml-0">
          <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
