import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StepIndicator } from "@/components/StepIndicator";
import { CriteriaForm } from "@/components/CriteriaForm";
import { AlternativeForm } from "@/components/AlternativeForm";
import { ReviewData } from "@/components/ReviewData";
import { ResultComparison } from "@/components/ResultComparison";
import { useToast } from "@/hooks/use-toast";
import { spkApi, SAWResult, WPResult, CreateSPKData } from "@/lib/api";
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

const transformFormToApi = (
  title: string,
  criteria: Criterion[],
  alternatives: Alternative[]
): CreateSPKData => {
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

const NewSPK = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [sawResults, setSawResults] = useState<SAWResult[]>([]);
  const [wpResults, setWpResults] = useState<WPResult[]>([]);

  const { toast } = useToast();
  const navigate = useNavigate();
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

  const createSPKMutation = useMutation({
    mutationFn: async (data: CreateSPKData) => {
      return await spkApi.create(data);
    },
    onSuccess: async (response) => {
      toast({
        title: "SPK Berhasil Disimpan",
        description: "Data SPK telah disimpan ke database",
      });

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

    const apiData = transformFormToApi(title, criteria, alternatives);
    createSPKMutation.mutate(apiData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CriteriaForm
            criteria={criteria}
            setCriteria={setCriteria}
            onNext={handleNextStep}
            isEditing={false}
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
            onSave={saveToHistory}
            isLoading={createSPKMutation.isPending}
            isEditing={false}
          />
        );
      default:
        return null;
    }
  };

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
};

export default NewSPK;