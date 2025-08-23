
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Criterion, Alternative } from '@/pages/Index';
import { SubCriteriaGrid } from '@/components/SubCriteriaGrid';
import { useSubCriteria } from '@/hooks/useSubCriteria';

interface AlternativeFormProps {
  criteria: Criterion[];
  alternatives: Alternative[];
  setAlternatives: (alternatives: Alternative[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const AlternativeForm: React.FC<AlternativeFormProps> = ({
  criteria,
  alternatives,
  setAlternatives,
  onNext,
  onPrev,
}) => {
  const addAlternative = () => {
    const newAlternative: Alternative = {
      id: `alternative-${Date.now()}`,
      name: '',
      values: {},
    };
    setAlternatives([...alternatives, newAlternative]);
  };

  const removeAlternative = (id: string) => {
    setAlternatives(alternatives.filter(alternative => alternative.id !== id));
  };

  const updateAlternativeName = (id: string, name: string) => {
    setAlternatives(
      alternatives.map(alternative =>
        alternative.id === id ? { ...alternative, name } : alternative
      )
    );
  };

  const updateAlternativeValue = (alternativeId: string, criterionId: string, value: number) => {
    // Ensure value is within 1-5 range for sub-criteria
    const clampedValue = Math.max(1, Math.min(5, Math.round(value)));
    
    setAlternatives(
      alternatives.map(alternative =>
        alternative.id === alternativeId
          ? {
              ...alternative,
              values: { ...alternative.values, [criterionId]: clampedValue },
            }
          : alternative
      )
    );
  };

  const canProceed = () => {
    return (
      alternatives.length >= 2 &&
      alternatives.every(alternative => 
        alternative.name.trim() !== '' &&
        criteria.every(criterion => 
          alternative.values[criterion.id] !== undefined && 
          alternative.values[criterion.id] >= 1 && 
          alternative.values[criterion.id] <= 5
        )
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Input Alternatif dan Nilai</h2>
        <p className="text-slate-600">
          Masukkan alternatif yang akan dinilai beserta nilai untuk setiap kriteria (skala 1-5)
        </p>
      </div>

      <div className="space-y-6">
        {alternatives.map((alternative, index) => (
          <Card key={alternative.id} className="p-6 border border-slate-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-100 text-emerald-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`alt-name-${alternative.id}`} className="text-sm font-medium">
                      Nama Alternatif
                    </Label>
                    <Input
                      id={`alt-name-${alternative.id}`}
                      placeholder="Contoh: Kandidat A, Produk X, dll"
                      value={alternative.name}
                      onChange={(e) => updateAlternativeName(alternative.id, e.target.value)}
                      className="mt-1 max-w-md"
                    />
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeAlternative(alternative.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {criteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        {criterion.name}
                      </Label>
                      <span className="text-xs text-slate-500">
                        Tipe: {criterion.type === 'benefit' ? 'Benefit' : 'Cost'}
                      </span>
                    </div>
                    
                    {criterion.subCriteria && criterion.subCriteria.length > 0 ? (
                      <SubCriteriaGrid
                        subCriteria={criterion.subCriteria}
                        value={alternative.values[criterion.id] || 0}
                        onValueChange={(value) => updateAlternativeValue(alternative.id, criterion.id, value)}
                        criterionName={criterion.name}
                        alternativeName={alternative.name}
                        size="sm"
                      />
                    ) : (
                      <div className="space-y-2">
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          step="1"
                          placeholder="Pilih nilai 1-5"
                          value={alternative.values[criterion.id] || ''}
                          onChange={(e) => 
                            updateAlternativeValue(
                              alternative.id, 
                              criterion.id, 
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-24"
                        />
                        <p className="text-xs text-slate-500">
                          Masukkan nilai 1-5 (sub-kriteria belum diatur)
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addAlternative}
        className="w-full sm:w-auto flex items-center space-x-2"
      >
        <Plus className="h-4 w-4" />
        <span>Tambah Alternatif</span>
      </Button>

      <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t gap-4">
        <Button
          variant="outline"
          onClick={onPrev}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </Button>

        <Button
          onClick={onNext}
          disabled={!canProceed()}
          className="px-8 py-2 bg-blue-600 hover:bg-blue-700"
        >
          Lanjut ke Review Data
        </Button>
      </div>
    </div>
  );
};
