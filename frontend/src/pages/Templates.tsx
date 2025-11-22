import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { templateApi, SPKTemplate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  ToggleLeft,
  ToggleRight,
  FileText,
} from "lucide-react";

const Templates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: templatesData, isLoading } = useQuery({
    queryKey: ["admin-templates"],
    queryFn: () => templateApi.getAll(),
  });

  const templates = templatesData?.data?.templates || [];

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => templateApi.delete(id),
    onSuccess: () => {
      toast({
        title: "Template Berhasil Dihapus",
        description: "Template telah dihapus dari sistem",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-templates"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal Menghapus Template",
        description:
          error.message || "Terjadi kesalahan saat menghapus template",
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => templateApi.toggleStatus(id),
    onSuccess: () => {
      toast({
        title: "Status Template Berhasil Diubah",
        description: "Status aktif/non-aktif template telah diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-templates"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal Mengubah Status",
        description: error.message || "Terjadi kesalahan saat mengubah status",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Kelola Template
          </h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Memuat template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Kelola Template
          </h1>
          <p className="text-slate-600 mt-2">Buat dan kelola template SPK</p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => navigate("/create-template")}
        >
          <Plus className="h-4 w-4" />
          Buat Template Baru
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Belum Ada Template
            </h3>
            <p className="text-slate-600 mb-6">
              Mulai dengan membuat template SPK pertama Anda
            </p>
            <Button
              className="flex items-center gap-2 mx-auto"
              onClick={() => navigate("/create-template")}
            >
              <Plus className="h-4 w-4" />
              Buat Template Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card
              key={template.templateId}
              className="flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.category && (
                      <Badge variant="secondary">{template.category}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant={template.isActive ? "default" : "secondary"}
                    >
                      {template.isActive ? "Aktif" : "Non-aktif"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatusMutation.mutate(template.templateId)}
                      disabled={toggleStatusMutation.isPending}
                    >
                      {template.isActive ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {template.description && (
                  <p className="text-sm text-slate-600">
                    {template.description}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kriteria:</span>
                    <span className="font-medium">
                      {template.templateCriteria.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Digunakan:</span>
                    <span className="font-medium">
                      {template._count?.spkRecords || 0} kali
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dibuat:</span>
                    <span className="font-medium">
                      {new Date(template.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/view-template/${template.templateId}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Lihat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/edit-template/${template.templateId}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        // disabled={template._count?.spkRecords > 0}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Template</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus template "
                          {template.name}"? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            deleteTemplateMutation.mutate(template.templateId)
                          }
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Templates;
