
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, Plus, History, BarChart3 } from 'lucide-react';

interface AdminSidebarProps {
  currentView: 'dashboard' | 'new-spk' | 'history' | 'view-result';
  onViewChange: (view: 'dashboard' | 'new-spk' | 'history' | 'view-result') => void;
  totalSPK: number;
  isMobile?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentView,
  onViewChange,
  totalSPK,
  isMobile = false
}) => {
  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: Home,
      description: 'Ringkasan & statistik'
    },
    {
      id: 'new-spk' as const,
      label: 'SPK Baru',
      icon: Plus,
      description: 'Buat analisis baru'
    },
    {
      id: 'history' as const,
      label: 'History',
      icon: History,
      description: 'Riwayat SPK'
    }
  ];

  return (
    <div className={`bg-white border-r border-slate-200 flex flex-col ${isMobile ? 'h-full' : 'h-screen w-64'}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">SPK Admin</h2>
            <p className="text-xs sm:text-sm text-slate-500">Dashboard Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-auto p-3 text-left ${
                isActive 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <div className="flex items-center gap-3 w-full min-w-0">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm sm:text-base truncate">{item.label}</div>
                  <div className={`text-xs mt-0.5 truncate ${
                    isActive ? 'text-blue-100' : 'text-slate-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </nav>

      {/* Stats Card */}
      <div className="p-3 sm:p-4 border-t border-slate-200">
        <Card className="p-3 sm:p-4 bg-slate-50">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-slate-900">{totalSPK}</div>
            <div className="text-xs sm:text-sm text-slate-600 mt-1">Total SPK Tersimpan</div>
          </div>
        </Card>
      </div>
    </div>
  );
};
