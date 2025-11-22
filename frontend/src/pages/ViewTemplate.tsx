import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { templateApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit } from "lucide-react";

const ViewTemplate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: templateData, isLoading } = useQuery({
    queryKey: ["template", id],
    queryFn: () => templateApi.getById(id!),
    enabled: !!id,
  });

  const template = templateData?.data?.template;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/templates")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Memuat template...</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/templates")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Template tidak ditemukan</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/templates")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {template.name}
            </h1>
            <p className="text-slate-600 mt-2">Detail template SPK</p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/edit-template/${template.templateId}`)}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit Template
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Template Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-slate-500">Nama:</span>
                <p className="font-medium">{template.name}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Status:</span>
                <div className="mt-1">
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? "Aktif" : "Non-aktif"}
                  </Badge>
                </div>
              </div>
              {template.category && (
                <div>
                  <span className="text-sm text-slate-500">Kategori:</span>
                  <p className="font-medium">{template.category}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-slate-500">Dibuat:</span>
                <p className="font-medium">
                  {new Date(template.createdAt).toLocaleDateString("id-ID")}
                </p>
              </div>
              {template.description && (
                <div className="col-span-2">
                  <span className="text-sm text-slate-500">Deskripsi:</span>
                  <p className="font-medium">{template.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Criteria */}
        <Card>
          <CardHeader>
            <CardTitle>
              Kriteria Penilaian ({template.templateCriteria.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {template.templateCriteria.map((criterion) => (
                <Card key={criterion.templateCriterionId} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{criterion.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Bobot: {criterion.weight.toFixed(3)}
                        </Badge>
                        <Badge
                          variant={
                            criterion.type === "benefit"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {criterion.type === "benefit" ? "Benefit" : "Cost"}
                        </Badge>
                      </div>
                    </div>

                    {criterion.templateSubCriteria.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-slate-700 mb-2 block">
                          Sub Kriteria:
                        </span>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {criterion.templateSubCriteria
                            .sort((a, b) => a.order - b.order)
                            .map((sub) => (
                              <div
                                key={sub.templateSubCriteriaId}
                                className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
                              >
                                <span>{sub.label}</span>
                                <Badge variant="outline" className="text-xs">
                                  {sub.value}
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewTemplate;
