import React from "react";
import { useNavigate } from "react-router-dom";
import { UserList } from "@/components/UserList";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Users = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCreateUser = () => {
    navigate("/create-user");
  };

  const handleEditUser = (userToEdit: {
    userId: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }) => {
    navigate(`/edit-user/${userToEdit.userId}`, { state: { user: userToEdit } });
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
    <UserList onCreateUser={handleCreateUser} onEditUser={handleEditUser} />
  );
};

export default Users;