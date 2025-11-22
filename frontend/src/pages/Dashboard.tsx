import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calculator, BarChart3, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { dashboardApi, DashboardStats } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: dashboardStats, isLoading: statsLoading } =
    useQuery<DashboardStats>({
      queryKey: ["dashboard-stats"],
      queryFn: async () => {
        const response = await dashboardApi.getStats();
        return response.data!;
      },
    });

  return (
    <div className="space-y-6">
      {/* Header with User Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Dashboard SPK
          </h1>
          <p className="text-slate-600 mt-2">
            Selamat datang, {user?.name || "User"}! Kelola sistem pendukung
            keputusan SAW & WP Anda.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Total SPK</h3>
              <p className="text-2xl font-bold text-blue-600">
                {statsLoading ? "..." : dashboardStats?.totalSPK || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">SPK Terbaru</h3>
              <p className="text-2xl font-bold text-emerald-600">
                {statsLoading
                  ? "..."
                  : dashboardStats?.recentSPK?.length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">User</h3>
              <p className="text-2xl font-bold text-purple-600">
                {user?.name?.split(" ")[0] || "User"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent SPK */}
      {dashboardStats?.recentSPK && dashboardStats.recentSPK.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h3 className="font-semibold text-slate-900 mb-4">SPK Terbaru</h3>
          <div className="space-y-3">
            {dashboardStats.recentSPK.map((spk) => (
              <div
                key={spk.spkId}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900">{spk.title}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(spk.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/history")}
                >
                  Lihat Detail
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;