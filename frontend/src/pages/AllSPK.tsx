import React from "react";
import { useNavigate } from "react-router-dom";
import { AllSPKList } from "@/components/AllSPKList";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { SPKRecord } from "@/lib/api";

const AllSPK = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleViewSPK = (spk: SPKRecord) => {
    navigate(`/result/${spk.spkId}`);
  };

  const handleEditSPK = (spk: SPKRecord) => {
    navigate(`/edit-spk/${spk.spkId}`);
  };

  const handleDeleteSPK = (id: string) => {
    // The delete functionality is handled within AllSPKList component
    console.log("Delete SPK:", id);
  };

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
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AllSPKList
      onViewSPK={handleViewSPK}
      onEditSPK={handleEditSPK}
      onDeleteSPK={handleDeleteSPK}
    />
  );
};

export default AllSPK;