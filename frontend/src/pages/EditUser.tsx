import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { EditUserForm } from "@/components/EditUserForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();

  const editingUser = location.state?.user;

  const handleBackToUsers = () => {
    navigate("/users");
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

  if (!editingUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Data Tidak Ditemukan
          </h2>
          <p className="text-gray-600">
            Data user tidak ditemukan atau tidak valid.
          </p>
          <Button onClick={() => navigate("/users")} className="mt-4">
            Kembali ke Daftar User
          </Button>
        </div>
      </div>
    );
  }

  return <EditUserForm user={editingUser} onBack={handleBackToUsers} />;
};

export default EditUser;