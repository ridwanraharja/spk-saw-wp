import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StepIndicator } from "@/components/StepIndicator";
import { CriteriaForm } from "@/components/CriteriaForm";
import { AlternativeForm } from "@/components/AlternativeForm";
import { ReviewData } from "@/components/ReviewData";
import { ResultComparison } from "@/components/ResultComparison";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { spkApi, SPKRecord, SAWResult, WPResult, UpdateSPKData } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SubCriteria } from "@/lib/api";

export interface Criterion {
  id: string;
  spkId?: string;
  name: string;
  weight: number;
  type: "benefit" | "cost";
  subCriteria?: SubCriteria[];
}

export interface Alternative {
  id: string;
  name: string;
  values: { [criterionId: string]: number };
}

const transformApiToForm = (record: SPKRecord) => {
  const criteria: Criterion[] = record.criteria.map((c) => ({
    id: c.criterionId,
    spkId: c.spkId,
    name: c.name,
    weight: c.weight,
    type: c.type,
    subCriteria: c.subCriteria,
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
      criteria.forEach((criterion) => {
        values[criterion.id] = 0;
      });
    }

    return {
      id: alt.alternativeId,
      name: alt.name,
      values,
    };
  });

  return { criteria, alternatives };
};

const transformFormToApi = (
  title: string,
  criteria: Criterion[],
  alternatives: Alternative[]
): UpdateSPKData => {
  const apiCriteria = criteria.map((c) => ({
    name: c.name,
    weight: c.weight,
    type: c.type,
    subCriteria: c.subCriteria
      ? c.subCriteria.map((sc) => ({
          label: sc.label,
          value: sc.value,
          order: sc.order,
        }))
      : undefined,
  }));

  const apiAlternatives = alternatives.map((alt) => {
    const mappedValues: { [key: string]: number } = {};
    criteria.forEach((criterion) => {
      const value = alt.values[criterion.id];
      if (value !== undefined) {
        mappedValues[criterion.name] = value;
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

const EditSPK = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [sawResults, setSawResults] = useState<SAWResult[]>([]);
  const [wpResults, setWpResults] = useState<WPResult[]>([]);
  const [editingRecord, setEditingRecord] = useState<SPKRecord | null>(null);
  const [loading, setLoading] = useState(true);

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

  const updateSPKMutation = useMutation({
    mutationFn: async (data: { id: string; updateData: UpdateSPKData }) => {
      return await spkApi.update(data.id, data.updateData);
    },
    onSuccess: async (response) => {
      toast({
        title: "SPK Berhasil Diperbarui",
        description: "Data SPK telah diperbarui di database",
      });

      if (response.data?.spkRecord?.spkId) {
        try {
          const detailResponse = await spkApi.getById(response.data.spkRecord.spkId);
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

  useEffect(() => {
    const fetchRecord = async () => {
      if (!id) {
        navigate("/history");
        return;
      }

      try {
        setLoading(true);
        const response = await spkApi.getById(id);
        if (response.success && response.data) {
          const fullRecord = response.data.spkRecord;
          const { criteria: formCriteria, alternatives: formAlternatives } =
            transformApiToForm(fullRecord);

          setEditingRecord(fullRecord);
          setCriteria(formCriteria);
          setAlternatives(formAlternatives);
          setSawResults(fullRecord.sawResults || []);
          setWpResults(fullRecord.wpResults || []);
        } else {
          throw new Error("Failed to fetch complete data");
        }
      } catch (error) {
        toast({
          title: "Gagal Memuat Data",
          description: "Terjadi kesalahan saat memuat data untuk diedit",
          variant: "destructive",
        });
        navigate("/history");
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id, navigate, toast]);

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

    const apiData = transformFormToApi(title, criteria, alternatives);
    updateSPKMutation.mutate({
      id: editingRecord.spkId,
      updateData: apiData,
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CriteriaForm
            criteria={criteria}
            setCriteria={setCriteria}
            onNext={handleNextStep}
            isEditing={true}
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
            onReset={() => navigate("/dashboard")}
            onSave={updateSPK}
            isLoading={updateSPKMutation.isPending}
            isEditing={true}
            currentTitle={editingRecord?.title}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data SPK...</p>
        </div>
      </div>
    );
  }

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
          onClick={() => navigate("/history")}
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
};

export default EditSPK;