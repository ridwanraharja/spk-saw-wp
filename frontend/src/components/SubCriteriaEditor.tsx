import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Save, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SubCriteria, subCriteriaApi } from "@/lib/api";

interface SubCriteriaEditorProps {
  criterionId: string;
  criterionName: string;
  initialSubCriteria?: SubCriteria[] | SubCriteriaForm[];
  onSave?: (subCriteria: SubCriteria[]) => void;
  onCancel?: () => void;
  isNewCriterion?: boolean; // Flag untuk distinguish create vs edit mode
}

interface SubCriteriaForm {
  label: string;
  value: number;
  order: number;
}

export const SubCriteriaEditor: React.FC<SubCriteriaEditorProps> = ({
  criterionId,
  criterionName,
  initialSubCriteria,
  onSave,
  onCancel,
  isNewCriterion = false,
}) => {
  const [subCriteria, setSubCriteria] = useState<SubCriteriaForm[]>([
    { label: "Sangat Rendah", value: 1, order: 1 },
    { label: "Rendah", value: 2, order: 2 },
    { label: "Sedang", value: 3, order: 3 },
    { label: "Tinggi", value: 4, order: 4 },
    { label: "Sangat Tinggi", value: 5, order: 5 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load existing sub-criteria on mount
  useEffect(() => {
    if (initialSubCriteria && initialSubCriteria.length > 0) {
      // Use provided initial sub-criteria
      const formattedSubCriteria = initialSubCriteria.map((sc) => ({
        label: sc.label,
        value: sc.value,
        order: sc.order,
      }));
      setSubCriteria(formattedSubCriteria);
      setHasChanges(false);
    } else if (!isNewCriterion) {
      // Only load from API if not a new criterion
      loadSubCriteria();
    }
    // For new criteria, keep the default values initialized in useState
  }, [criterionId, initialSubCriteria, isNewCriterion]);

  const loadSubCriteria = async () => {
    try {
      setLoading(true);
      const response = await subCriteriaApi.getSubCriteria(criterionId);
      if (response.success && response.data) {
        const loadedSubCriteria = response.data.subCriteria.map((sc) => ({
          label: sc.label,
          value: sc.value,
          order: sc.order,
        }));
        setSubCriteria(loadedSubCriteria);
        setHasChanges(false);
      }
    } catch (err) {
      // If criterion not found or no sub-criteria, use defaults
      console.warn("Could not load sub-criteria, using defaults");
      setHasChanges(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLabelChange = (index: number, value: string) => {
    setSubCriteria((prev) =>
      prev.map((item, i) => (i === index ? { ...item, label: value } : item))
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate labels
      const emptyLabels = subCriteria.filter((sc) => !sc.label.trim());
      if (emptyLabels.length > 0) {
        setError("Semua label harus diisi");
        return;
      }

      if (isNewCriterion) {
        // For new criteria, just save to state without API call
        const formattedSubCriteria: SubCriteria[] = subCriteria.map((sc) => ({
          subCriteriaId: `temp-${sc.value}`,
          criterionId: criterionId,
          label: sc.label,
          value: sc.value,
          order: sc.order,
        }));

        setHasChanges(false);
        if (onSave) {
          onSave(formattedSubCriteria);
        }
      } else {
        // For existing criteria, save to API
        const response = await subCriteriaApi.updateSubCriteria(
          criterionId,
          subCriteria
        );

        if (response.success && response.data) {
          setHasChanges(false);
          if (onSave) {
            onSave(response.data.subCriteria);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan sub-kriteria");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      const response = await subCriteriaApi.getDefaultTemplate();
      if (response.success && response.data) {
        setSubCriteria(response.data.subCriteria);
        setHasChanges(true);
      }
    } catch (err) {
      console.warn("Could not load default template");
      // Reset to hardcoded defaults
      setSubCriteria([
        { label: "Sangat Rendah", value: 1, order: 1 },
        { label: "Rendah", value: 2, order: 2 },
        { label: "Sedang", value: 3, order: 3 },
        { label: "Tinggi", value: 4, order: 4 },
        { label: "Sangat Tinggi", value: 5, order: 5 },
      ]);
      setHasChanges(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Edit Sub-Kriteria</CardTitle>
        <CardDescription>
          Atur label untuk skala penilaian 1-5 pada kriteria:{" "}
          <strong>{criterionName}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {subCriteria.map((item, index) => (
            <div key={item.value} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {item.value}
              </div>
              <div className="flex-1">
                <Label htmlFor={`label-${item.value}`} className="sr-only">
                  Label untuk nilai {item.value}
                </Label>
                <Input
                  id={`label-${item.value}`}
                  value={item.label}
                  onChange={(e) => handleLabelChange(index, e.target.value)}
                  placeholder={`Label untuk nilai ${item.value}`}
                  disabled={loading}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={loading}
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Default
          </Button>

          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Batal
            </Button>
          )}

          <Button onClick={handleSave} disabled={loading || !hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
