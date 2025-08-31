import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { templateApi, UpdateTemplateData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft, AlertCircle } from "lucide-react";

interface CriterionFormData {
  id?: string;
  name: string;
  weight: number;
  type: "benefit" | "cost";
  order: number;
  subCriteria: Array<{
    id?: string;
    label: string;
    value: number;
    order: number;
  }>;
}

const EditTemplate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  });

  const [criteria, setCriteria] = useState<CriterionFormData[]>([]);
  const [totalWeight, setTotalWeight] = useState(0);

  const { data: templateData, isLoading } = useQuery({
    queryKey: ["template", id],
    queryFn: () => templateApi.getById(id!),
    enabled: !!id,
  });

  const template = templateData?.data?.template;

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || "",
        category: template.category || "",
      });

      const formCriteria: CriterionFormData[] = template.templateCriteria.map((tc) => ({
        id: tc.id,
        name: tc.name,
        weight: tc.weight,
        type: tc.type,
        order: tc.order,
        subCriteria: tc.templateSubCriteria.map((tsc) => ({
          id: tsc.id,
          label: tsc.label,
          value: tsc.value,
          order: tsc.order,
        })),
      }));
      setCriteria(formCriteria);
    }
  }, [template]);

  useEffect(() => {
    const total = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
    setTotalWeight(total);
  }, [criteria]);

  const updateTemplateMutation = useMutation({
    mutationFn: (data: UpdateTemplateData) => templateApi.update(id!, data),
    onSuccess: () => {
      toast({
        title: "Template Berhasil Diperbarui",
        description: "Perubahan template telah disimpan",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-templates"] });
      queryClient.invalidateQueries({ queryKey: ["template", id] });
      navigate("/templates");
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal Memperbarui Template",
        description: error.message || "Terjadi kesalahan saat memperbarui template",
        variant: "destructive",
      });
    },
  });

  const addCriterion = () => {
    const newCriterion: CriterionFormData = {
      name: "",
      weight: 0,
      type: "benefit",
      order: criteria.length + 1,
      subCriteria: [
        { label: "Sangat Kurang", value: 1, order: 1 },
        { label: "Kurang", value: 2, order: 2 },
        { label: "Cukup", value: 3, order: 3 },
        { label: "Baik", value: 4, order: 4 },
        { label: "Sangat Baik", value: 5, order: 5 },
      ],
    };
    setCriteria([...criteria, newCriterion]);
  };

  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter((criterion) => criterion.id !== id));
  };

  const updateCriterion = (id: string, updates: Partial<CriterionFormData>) => {
    setCriteria(
      criteria.map((criterion) =>
        criterion.id === id ? { ...criterion, ...updates } : criterion
      )
    );
  };

  const addSubCriterion = (criterionId: string) => {
    const criterion = criteria.find((c) => c.id === criterionId);
    if (!criterion) return;

    const newSubCriterion = {
      label: "",
      value: criterion.subCriteria.length + 1,
      order: criterion.subCriteria.length + 1,
    };

    updateCriterion(criterionId, {
      subCriteria: [...criterion.subCriteria, newSubCriterion],
    });
  };

  const updateSubCriterion = (
    criterionId: string,
    subIndex: number,
    updates: Partial<{ label: string; value: number }>
  ) => {
    const criterion = criteria.find((c) => c.id === criterionId);
    if (!criterion) return;

    const updatedSubCriteria = criterion.subCriteria.map((sub, index) =>
      index === subIndex ? { ...sub, ...updates } : sub
    );

    updateCriterion(criterionId, { subCriteria: updatedSubCriteria });
  };

  const removeSubCriterion = (criterionId: string, subIndex: number) => {
    const criterion = criteria.find((c) => c.id === criterionId);
    if (!criterion) return;

    const updatedSubCriteria = criterion.subCriteria.filter(
      (_, index) => index !== subIndex
    );

    updateCriterion(criterionId, { subCriteria: updatedSubCriteria });
  };

  const canSubmit = () => {
    return (
      formData.name.trim() !== "" &&
      criteria.length >= 2 &&
      criteria.every(
        (criterion) =>
          criterion.name.trim() !== "" &&
          criterion.weight > 0 &&
          criterion.subCriteria.length > 0 &&
          criterion.subCriteria.every((sub) => sub.label.trim() !== "")
      ) &&
      Math.abs(totalWeight - 1) < 0.001
    );
  };

  const handleSubmit = () => {
    if (!canSubmit()) return;

    const templateData: UpdateTemplateData = {
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category || undefined,
      criteria: criteria.map((criterion) => ({
        name: criterion.name,
        weight: criterion.weight,
        type: criterion.type,
        order: criterion.order,
        subCriteria: criterion.subCriteria.map((sub) => ({
          label: sub.label,
          value: sub.value,
          order: sub.order,
        })),
      })),
    };

    updateTemplateMutation.mutate(templateData);
  };

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
              Edit Template
            </h1>
            <p className="text-slate-600 mt-2">
              Perbarui template SPK
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Template Info Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Template *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Masukkan nama template"
              />
            </div>
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Deskripsi template (opsional)"
              />
            </div>
            <div>
              <Label htmlFor="category">Kategori</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Kategori template (opsional)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Criteria Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Kriteria Penilaian</CardTitle>
              <Button onClick={addCriterion} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Tambah Kriteria
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {criteria.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Belum ada kriteria. Klik "Tambah Kriteria" untuk memulai.
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {criteria.map((criterion) => (
                    <Card key={criterion.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <Label htmlFor={`name-${criterion.id}`}>
                              Nama Kriteria
                            </Label>
                            <Input
                              id={`name-${criterion.id}`}
                              value={criterion.name}
                              onChange={(e) =>
                                updateCriterion(criterion.id!, {
                                  name: e.target.value,
                                })
                              }
                              placeholder="Nama kriteria"
                            />
                          </div>
                          <div className="w-32">
                            <Label htmlFor={`weight-${criterion.id}`}>
                              Bobot
                            </Label>
                            <Input
                              id={`weight-${criterion.id}`}
                              type="number"
                              min="0"
                              max="1"
                              step="0.01"
                              value={criterion.weight}
                              onChange={(e) =>
                                updateCriterion(criterion.id!, {
                                  weight: parseFloat(e.target.value) || 0,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div className="w-32">
                            <Label htmlFor={`type-${criterion.id}`}>Tipe</Label>
                            <Select
                              value={criterion.type}
                              onValueChange={(value: "benefit" | "cost") =>
                                updateCriterion(criterion.id!, { type: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="benefit">Benefit</SelectItem>
                                <SelectItem value="cost">Cost</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCriterion(criterion.id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Sub Criteria Section */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-sm font-medium">
                              Sub Kriteria
                            </Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addSubCriterion(criterion.id!)}
                              className="flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              Tambah
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {criterion.subCriteria.map((sub, subIndex) => (
                              <div
                                key={subIndex}
                                className="flex items-center gap-2"
                              >
                                <Input
                                  value={sub.label}
                                  onChange={(e) =>
                                    updateSubCriterion(criterion.id!, subIndex, {
                                      label: e.target.value,
                                    })
                                  }
                                  placeholder="Label sub kriteria"
                                  className="flex-1"
                                />
                                <Input
                                  type="number"
                                  value={sub.value}
                                  onChange={(e) =>
                                    updateSubCriterion(criterion.id!, subIndex, {
                                      value: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  placeholder="Nilai"
                                  className="w-20"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeSubCriterion(criterion.id!, subIndex)
                                  }
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium">Total Bobot:</span>
                  <span
                    className={`text-sm font-bold ${
                      Math.abs(totalWeight - 1) < 0.001
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {totalWeight.toFixed(3)}
                  </span>
                </div>

                {Math.abs(totalWeight - 1) >= 0.001 && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">
                      Total bobot harus sama dengan 1.000
                    </span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/templates")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit() || updateTemplateMutation.isPending}
            className="flex items-center gap-2"
          >
            {updateTemplateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditTemplate;