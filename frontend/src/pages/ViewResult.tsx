import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResultComparison } from "@/components/ResultComparison";
import { useToast } from "@/hooks/use-toast";
import { spkApi, SPKRecord } from "@/lib/api";
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
    id: c.id,
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
      id: alt.id,
      name: alt.name,
      values,
    };
  });

  return { criteria, alternatives };
};

const ViewResult = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRecord, setSelectedRecord] = useState<SPKRecord | null>(null);
  const [loading, setLoading] = useState(true);

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
          setSelectedRecord(response.data.spkRecord);
        } else {
          throw new Error("Failed to fetch SPK data");
        }
      } catch (error) {
        toast({
          title: "Gagal Memuat Data",
          description: "Terjadi kesalahan saat memuat detail SPK",
          variant: "destructive",
        });
        navigate("/history");
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id, navigate, toast]);

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

  if (!selectedRecord) {
    return null;
  }

  const { criteria, alternatives } = transformApiToForm(selectedRecord);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {selectedRecord.title}
          </h1>
          <p className="text-slate-600 mt-2">
            Dibuat pada{" "}
            {new Date(selectedRecord.createdAt).toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>

      <ResultComparison
        criteria={criteria}
        alternatives={alternatives}
        sawResults={selectedRecord.sawResults}
        wpResults={selectedRecord.wpResults}
        onPrev={() => navigate("/history")}
        onReset={() => navigate("/dashboard")}
        onSave={() => {}}
        isReadOnly={true}
      />
    </div>
  );
};

export default ViewResult;