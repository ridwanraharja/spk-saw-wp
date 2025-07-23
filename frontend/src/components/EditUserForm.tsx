import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface EditUserFormProps {
  user: User;
  onBack: () => void;
}

interface Role {
  value: string;
  label: string;
  description: string;
}

export const EditUserForm: React.FC<EditUserFormProps> = ({ user, onBack }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const roles: Role[] = [
    {
      value: "user",
      label: "User",
      description: "Regular user with limited access",
    },
    {
      value: "admin",
      label: "Administrator",
      description: "Full access to all features",
    },
  ];

  const updateUserMutation = useMutation({
    mutationFn: async (data: { userId: string; role: string }) => {
      // This will be implemented in the API
      const response = await fetch(
        `/api/auth/admin/users/${data.userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ role: data.role }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "User berhasil diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onBack();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui user",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMutation.mutate({
      userId: user.id,
      role: formData.role,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Edit User
          </h1>
          <p className="text-slate-600 mt-2">Edit informasi user {user.name}</p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Masukkan nama lengkap"
                disabled
              />
              <p className="text-xs text-gray-500">Nama tidak dapat diubah</p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Masukkan email"
                disabled
              />
              <p className="text-xs text-gray-500">Email tidak dapat diubah</p>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-xs text-gray-500">
                          {role.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Created Date */}
            <div className="space-y-2">
              <Label>Tanggal Dibuat</Label>
              <Input
                value={new Date(user.createdAt).toLocaleDateString("id-ID")}
                disabled
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={updateUserMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {updateUserMutation.isPending
                ? "Menyimpan..."
                : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
