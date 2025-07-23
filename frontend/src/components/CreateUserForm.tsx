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
import { ArrowLeft, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api";

interface CreateUserFormProps {
  onBack: () => void;
}

interface Role {
  value: string;
  label: string;
  description: string;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
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

  const createUserMutation = useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "User berhasil dibuat",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onBack();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal membuat user",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
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
            Tambah User Baru
          </h1>
          <p className="text-slate-600 mt-2">
            Buat user baru untuk sistem SPK SAW WP
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Masukkan email"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Masukkan password"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500">
                Minimal 8 karakter dengan kombinasi huruf dan angka
              </p>
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
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {createUserMutation.isPending ? "Membuat..." : "Buat User"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
