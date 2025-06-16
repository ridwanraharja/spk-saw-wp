
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Criterion, Alternative } from '@/pages/Index';

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
    setAlternatives(
      alternatives.map(alternative =>
        alternative.id === alternativeId
          ? {
              ...alternative,
              values: { ...alternative.values, [criterionId]: value },
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
          alternative.values[criterion.id] > 0
        )
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Input Alternatif dan Nilai</h2>
        <p className="text-slate-600">
          Masukkan alternatif yang akan dinilai beserta nilai untuk setiap kriteria
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {criteria.map((criterion) => (
                  <div key={criterion.id}>
                    <Label 
                      htmlFor={`value-${alternative.id}-${criterion.id}`} 
                      className="text-sm font-medium"
                    >
                      {criterion.name}
                    </Label>
                    <Input
                      id={`value-${alternative.id}-${criterion.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Masukkan nilai"
                      value={alternative.values[criterion.id] || ''}
                      onChange={(e) => 
                        updateAlternativeValue(
                          alternative.id, 
                          criterion.id, 
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Tipe: {criterion.type === 'benefit' ? 'Benefit' : 'Cost'}
                    </p>
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
