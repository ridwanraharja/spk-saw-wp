import React, { useState, useEffect } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { CriteriaForm } from "@/components/CriteriaForm";
import { AlternativeForm } from "@/components/AlternativeForm";
import { ReviewData } from "@/components/ReviewData";
import { ResultComparison } from "@/components/ResultComparison";
import { HistoryList } from "@/components/HistoryList";
import { AdminSidebar } from "@/components/AdminSidebar";
import { UserList } from "@/components/UserList";
import { CreateUserForm } from "@/components/CreateUserForm";
import { EditUserForm } from "@/components/EditUserForm";
import { AllSPKList } from "@/components/AllSPKList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Calculator,
  BarChart3,
  PlusCircle,
  Menu,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { spkApi, dashboardApi, SPKRecord, DashboardStats } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import API types
import type {
  Criterion as APICriterion,
  Alternative as APIAlternative,
  SAWResult,
  WPResult,
  CreateSPKData,
  UpdateSPKData,
} from "@/lib/api";

// Local types for form components (simpler structure)
export interface Criterion {
  id: string;
  name: string;
  weight: number;
  type: "benefit" | "cost";
}

export interface Alternative {
  id: string;
  name: string;
  values: { [criterionId: string]: number };
}

// Helper functions to transform data between API and form formats
const transformApiToForm = (record: SPKRecord) => {
  const criteria: Criterion[] = record.criteria.map((c) => ({
    id: c.id,
    name: c.name,
    weight: c.weight,
    type: c.type,
  }));

  const alternatives: Alternative[] = record.alternatives.map((alt) => {
    const values: { [criterionId: string]: number } = {};

    if (alt.alternativeValues && Array.isArray(alt.alternativeValues)) {
      alt.alternativeValues.forEach((val) => {
        values[val.criterionId] = val.value;
      });
    } else if (alt.values && typeof alt.values === "object") {
      Object.assign(values, alt.values);
    } else {
      // Initialize empty values for all criteria to prevent errors
      criteria.forEach((criterion) => {
        values[criterion.id] = 0;
      });
    }

    const transformedAlt: Alternative = {
      id: alt.id,
      name: alt.name,
      values,
    };

    return transformedAlt;
  });

  return { criteria, alternatives };
};

const transformFormToApi = (
  title: string,
  criteria: Criterion[],
  alternatives: Alternative[]
): CreateSPKData | UpdateSPKData => {
  // Backend expects criteria without IDs
  const apiCriteria = criteria.map((c) => ({
    name: c.name,
    weight: c.weight,
    type: c.type,
  }));

  console.log(alternatives);

  // For updates, alternative values must use criterion NAMES as keys, not IDs
  const apiAlternatives = alternatives.map((alt) => {
    const mappedValues: { [key: string]: number } = {};

    // Map from criterion ID to criterion name
    criteria.forEach((criterion) => {
      const value = alt.values[criterion.id];
      if (value !== undefined) {
        mappedValues[criterion.name] = value; // Use criterion name as key
      }
    });

    return {
      name: alt.name,
      values: mappedValues,
    };
  });

  return {
    title,
    criteria: apiCriteria,
    alternatives: apiAlternatives,
  };
};

const Index = () => {
  const [currentView, setCurrentView] = useState<
    | "dashboard"
    | "new-spk"
    | "history"
    | "view-result"
    | "edit-spk"
    | "users"
    | "create-user"
    | "edit-user"
    | "all-spk"
  >("dashboard");
  const [currentStep, setCurrentStep] = useState(1);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [sawResults, setSawResults] = useState<SAWResult[]>([]);
  const [wpResults, setWpResults] = useState<WPResult[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<SPKRecord | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SPKRecord | null>(null);
  const [editingUser, setEditingUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  } | null>(null);

  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const steps = [
    {
      number: 1,
      title: "Input Kriteria",
      description: "Tentukan kriteria dan bobot",
    },
    {
      number: 2,
      title: "Input Alternatif",
      description: "Masukkan alternatif dan nilai",
    },
    {
      number: 3,
      title: "Review Data",
      description: "Periksa data yang diinput",
    },
    {
      number: 4,
      title: "Hasil Perhitungan",
      description: "Perbandingan SAW vs WP",
    },
  ];

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } =
    useQuery<DashboardStats>({
      queryKey: ["dashboard-stats"],
      queryFn: async () => {
        const response = await dashboardApi.getStats();
        return response.data!;
      },
      enabled: currentView === "dashboard",
    });

  // Fetch SPK history
  const {
    data: spkHistory,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useQuery<SPKRecord[]>({
    queryKey: ["spk-history"],
    queryFn: async () => {
      const response = await spkApi.getAll({ limit: 50 });
      return response.data!.spkRecords;
    },
    enabled: currentView === "history" || currentView === "dashboard",
  });

  // Create SPK mutation
  const createSPKMutation = useMutation({
    mutationFn: async (data: CreateSPKData) => {
      return await spkApi.create(data);
    },
    onSuccess: async (response) => {
      toast({
        title: "SPK Berhasil Disimpan",
        description: "Data SPK telah disimpan ke database",
      });

      // Fetch complete data using getById to populate results
      if (response.data?.id) {
        try {
          const detailResponse = await spkApi.getById(response.data.id);
          if (detailResponse.success && detailResponse.data) {
            const record = detailResponse.data.spkRecord;
            setSawResults(record.sawResults || []);
            setWpResults(record.wpResults || []);
          }
        } catch (error) {
          console.error("Failed to fetch detailed results:", error);
        }
      }

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ["spk-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal Menyimpan SPK",
        description: error.message || "Terjadi kesalahan saat menyimpan data",
        variant: "destructive",
      });
    },
  });

  // Update SPK mutation
  const updateSPKMutation = useMutation({
    mutationFn: async (data: { id: string; updateData: UpdateSPKData }) => {
      return await spkApi.update(data.id, data.updateData);
    },
    onSuccess: async (response) => {
      toast({
        title: "SPK Berhasil Diperbarui",
        description: "Data SPK telah diperbarui di database",
      });

      // Fetch complete updated data
      if (response.data?.spkRecord?.id) {
        try {
          const detailResponse = await spkApi.getById(
            response.data.spkRecord.id
          );
          if (detailResponse.success && detailResponse.data) {
            const record = detailResponse.data.spkRecord;
            setSawResults(record.sawResults || []);
            setWpResults(record.wpResults || []);
            setEditingRecord(record);
          }
        } catch (error) {
          console.error("Failed to fetch updated detailed results:", error);
        }
      }

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ["spk-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal Memperbarui SPK",
        description: error.message || "Terjadi kesalahan saat memperbarui data",
        variant: "destructive",
      });
    },
  });

  // Delete SPK mutation
  const deleteSPKMutation = useMutation({
    mutationFn: async (id: string) => {
      return await spkApi.delete(id);
    },
    onSuccess: () => {
      toast({
        title: "SPK Berhasil Dihapus",
        description: "Data SPK telah dihapus dari database",
      });

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ["spk-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal Menghapus SPK",
        description: error.message || "Terjadi kesalahan saat menghapus data",
        variant: "destructive",
      });
    },
  });

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setCriteria([]);
    setAlternatives([]);
    setSawResults([]);
    setWpResults([]);
    setEditingRecord(null);
  };

  const saveToHistory = async (title: string) => {
    if (!title.trim()) {
      toast({
        title: "Judul Diperlukan",
        description: "Mohon masukkan judul untuk SPK ini",
        variant: "destructive",
      });
      return;
    }

    const apiData = transformFormToApi(
      title,
      criteria,
      alternatives
    ) as CreateSPKData;
    createSPKMutation.mutate(apiData);
  };

  const updateSPK = async (title: string) => {
    if (!editingRecord) {
      toast({
        title: "Error",
        description: "Tidak ada data yang sedang diedit",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Judul Diperlukan",
        description: "Mohon masukkan judul untuk SPK ini",
        variant: "destructive",
      });
      return;
    }

    const apiData = transformFormToApi(
      title,
      criteria,
      alternatives
    ) as UpdateSPKData;
    updateSPKMutation.mutate({
      id: editingRecord.id,
      updateData: apiData,
    });
  };

  const viewResult = async (record: SPKRecord) => {
    try {
      // Fetch complete data including results
      const response = await spkApi.getById(record.id);
      if (response.success && response.data) {
        setSelectedRecord(response.data.spkRecord);
        handleViewChange("view-result");
      } else {
        throw new Error("Failed to fetch complete data");
      }
    } catch (error) {
      toast({
        title: "Gagal Memuat Data",
        description: "Terjadi kesalahan saat memuat detail SPK",
        variant: "destructive",
      });
    }
  };

  const deleteRecord = (id: string) => {
    deleteSPKMutation.mutate(id);
  };

  const startNewSPK = () => {
    resetForm();
    setCurrentView("new-spk");
  };

  const handleViewChange = (
    view:
      | "dashboard"
      | "new-spk"
      | "history"
      | "view-result"
      | "edit-spk"
      | "users"
      | "create-user"
      | "edit-user"
      | "all-spk"
  ) => {
    // Reset form when navigating to new-spk
    if (view === "new-spk") {
      resetForm();
    }
    setCurrentView(view);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const editSPK = async (record: SPKRecord) => {
    try {
      // Fetch complete data for editing
      const response = await spkApi.getById(record.id);
      if (response.success && response.data) {
        const fullRecord = response.data.spkRecord;
        const { criteria: formCriteria, alternatives: formAlternatives } =
          transformApiToForm(fullRecord);

        setEditingRecord(fullRecord);
        setCriteria(formCriteria);
        setAlternatives(formAlternatives);
        setSawResults(fullRecord.sawResults || []);
        setWpResults(fullRecord.wpResults || []);
        setCurrentStep(1);
        handleViewChange("edit-spk");
      } else {
        throw new Error("Failed to fetch complete data");
      }
    } catch (error) {
      toast({
        title: "Gagal Memuat Data",
        description: "Terjadi kesalahan saat memuat data untuk diedit",
        variant: "destructive",
      });
    }
  };

  const handleCreateUser = () => {
    handleViewChange("create-user");
  };

  const handleEditUser = (user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }) => {
    setEditingUser(user);
    handleViewChange("edit-user");
  };

  const handleBackToUsers = () => {
    handleViewChange("users");
    setEditingUser(null);
  };

  const handleViewAllSPK = (spk: SPKRecord) => {
    setSelectedRecord(spk);
    handleViewChange("view-result");
  };

  const handleEditAllSPK = (spk: SPKRecord) => {
    editSPK(spk);
  };

  const handleDeleteAllSPK = (id: string) => {
    deleteRecord(id);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CriteriaForm
            criteria={criteria}
            setCriteria={setCriteria}
            onNext={handleNextStep}
          />
        );
      case 2:
        return (
          <AlternativeForm
            criteria={criteria}
            alternatives={alternatives}
            setAlternatives={setAlternatives}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        );
      case 3:
        return (
          <ReviewData
            criteria={criteria}
            alternatives={alternatives}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            setSawResults={setSawResults}
            setWpResults={setWpResults}
          />
        );
      case 4:
        return (
          <ResultComparison
            criteria={criteria}
            alternatives={alternatives}
            sawResults={sawResults}
            wpResults={wpResults}
            onPrev={handlePrevStep}
            onReset={resetForm}
            onSave={editingRecord ? updateSPK : saveToHistory}
            isLoading={
              editingRecord
                ? updateSPKMutation.isPending
                : createSPKMutation.isPending
            }
            isEditing={!!editingRecord}
            currentTitle={editingRecord?.title}
          />
        );
      default:
        return null;
    }
  };

  const renderMainContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Header with User Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Dashboard SPK
                </h1>
                <p className="text-slate-600 mt-2">
                  Selamat datang, {user?.name || "User"}! Kelola sistem
                  pendukung keputusan SAW & WP Anda.
                </p>
              </div>
              <div className="flex items-center gap-2"></div>
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
                    <h3 className="font-semibold text-slate-900">
                      SPK Terbaru
                    </h3>
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
            {dashboardStats?.recentSPK &&
              dashboardStats.recentSPK.length > 0 && (
                <Card className="p-4 sm:p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">
                    SPK Terbaru
                  </h3>
                  <div className="space-y-3">
                    {dashboardStats.recentSPK.map((spk) => (
                      <div
                        key={spk.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {spk.title}
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(spk.createdAt).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewChange("history")}
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

      case "new-spk":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Buat SPK Baru
                </h1>
                <p className="text-slate-600 mt-2">
                  Ikuti langkah-langkah untuk membuat analisis SPK
                </p>
              </div>
            </div>

            <StepIndicator steps={steps} currentStep={currentStep} />
            {renderStepContent()}
          </div>
        );
      case "edit-spk":
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Edit SPK
                </h1>
                <p className="text-slate-600 mt-1">
                  {editingRecord?.title || "SPK"}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => handleViewChange("history")}
                className="w-full sm:w-auto"
              >
                Kembali ke History
              </Button>
            </div>

            <StepIndicator steps={steps} currentStep={currentStep} />

            <Card className="bg-white shadow-sm">
              <div className="p-4 sm:p-6 lg:p-8">{renderStepContent()}</div>
            </Card>
          </div>
        );
      case "history":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Riwayat SPK
                </h1>
                <p className="text-slate-600 mt-2">
                  Lihat dan kelola riwayat analisis SPK Anda
                </p>
              </div>
            </div>

            <HistoryList
              history={spkHistory || []}
              onViewResult={viewResult}
              onDeleteRecord={deleteRecord}
              isLoading={historyLoading}
              isDeleting={deleteSPKMutation.isPending}
              onEditSPK={editSPK}
            />
          </div>
        );

      case "view-result":
        return selectedRecord ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {selectedRecord.title}
                </h1>
                <p className="text-slate-600 mt-2">
                  Dibuat pada{" "}
                  {new Date(selectedRecord.createdAt).toLocaleDateString(
                    "id-ID"
                  )}
                </p>
              </div>
            </div>

            <ResultComparison
              criteria={transformApiToForm(selectedRecord).criteria}
              alternatives={transformApiToForm(selectedRecord).alternatives}
              sawResults={selectedRecord.sawResults}
              wpResults={selectedRecord.wpResults}
              onPrev={() => handleViewChange("history")}
              onReset={() => handleViewChange("dashboard")}
              onSave={() => {}}
              isReadOnly={true}
            />
          </div>
        ) : null;

      case "users":
        // Only allow admin to access user management
        if (user?.role !== "admin") {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">
                  Akses Ditolak
                </h2>
                <p className="text-gray-600">
                  Anda tidak memiliki izin untuk mengakses halaman ini.
                </p>
                <Button
                  onClick={() => handleViewChange("dashboard")}
                  className="mt-4"
                >
                  Kembali ke Dashboard
                </Button>
              </div>
            </div>
          );
        }
        return (
          <UserList
            onCreateUser={handleCreateUser}
            onEditUser={handleEditUser}
          />
        );

      case "create-user":
        // Only allow admin to access user management
        if (user?.role !== "admin") {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">
                  Akses Ditolak
                </h2>
                <p className="text-gray-600">
                  Anda tidak memiliki izin untuk mengakses halaman ini.
                </p>
                <Button
                  onClick={() => handleViewChange("dashboard")}
                  className="mt-4"
                >
                  Kembali ke Dashboard
                </Button>
              </div>
            </div>
          );
        }
        return <CreateUserForm onBack={handleBackToUsers} />;

      case "edit-user":
        // Only allow admin to access user management
        if (user?.role !== "admin") {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">
                  Akses Ditolak
                </h2>
                <p className="text-gray-600">
                  Anda tidak memiliki izin untuk mengakses halaman ini.
                </p>
                <Button
                  onClick={() => handleViewChange("dashboard")}
                  className="mt-4"
                >
                  Kembali ke Dashboard
                </Button>
              </div>
            </div>
          );
        }
        return editingUser ? (
          <EditUserForm user={editingUser} onBack={handleBackToUsers} />
        ) : null;

      case "all-spk":
        // Only allow admin to access all SPK view
        if (user?.role !== "admin") {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">
                  Akses Ditolak
                </h2>
                <p className="text-gray-600">
                  Anda tidak memiliki izin untuk mengakses halaman ini.
                </p>
                <Button
                  onClick={() => handleViewChange("dashboard")}
                  className="mt-4"
                >
                  Kembali ke Dashboard
                </Button>
              </div>
            </div>
          );
        }
        return (
          <AllSPKList
            onViewSPK={handleViewAllSPK}
            onEditSPK={handleEditAllSPK}
            onDeleteSPK={handleDeleteAllSPK}
          />
        );

      default:
        return null;
    }
  };

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
        <div className="flex-1 lg:ml-0">
          <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
