
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Criterion } from '@/pages/Index';

interface CriteriaFormProps {
  criteria: Criterion[];
  setCriteria: (criteria: Criterion[]) => void;
  onNext: () => void;
}

export const CriteriaForm: React.FC<CriteriaFormProps> = ({
  criteria,
  setCriteria,
  onNext,
}) => {
  const [totalWeight, setTotalWeight] = useState(0);

  useEffect(() => {
    const total = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
    setTotalWeight(total);
  }, [criteria]);

  const addCriterion = () => {
    const newCriterion: Criterion = {
      id: `criterion-${Date.now()}`,
      name: '',
      weight: 0,
      type: 'benefit',
    };
    setCriteria([...criteria, newCriterion]);
  };

  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter(criterion => criterion.id !== id));
  };

  const updateCriterion = (id: string, updates: Partial<Criterion>) => {
    setCriteria(
      criteria.map(criterion =>
        criterion.id === id ? { ...criterion, ...updates } : criterion
      )
    );
  };

  const canProceed = () => {
    return (
      criteria.length >= 2 &&
      criteria.every(criterion => criterion.name.trim() !== '' && criterion.weight > 0) &&
      Math.abs(totalWeight - 1) < 0.001
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Input Kriteria Penilaian</h2>
        <p className="text-slate-600">
          Tentukan kriteria yang akan digunakan untuk penilaian beserta bobotnya
        </p>
      </div>

      <div className="space-y-4">
        {criteria.map((criterion, index) => (
          <Card key={criterion.id} className="p-4 border border-slate-200">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`name-${criterion.id}`} className="text-sm font-medium">
                    Nama Kriteria
                  </Label>
                  <Input
                    id={`name-${criterion.id}`}
                    placeholder="Contoh: Gaji, Pengalaman, dll"
                    value={criterion.name}
                    onChange={(e) => updateCriterion(criterion.id, { name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`weight-${criterion.id}`} className="text-sm font-medium">
                    Bobot (0-1)
                  </Label>
                  <Input
                    id={`weight-${criterion.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    placeholder="0.25"
                    value={criterion.weight || ''}
                    onChange={(e) => updateCriterion(criterion.id, { weight: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`type-${criterion.id}`} className="text-sm font-medium">
                    Tipe Kriteria
                  </Label>
                  <Select
                    value={criterion.type}
                    onValueChange={(value: 'benefit' | 'cost') => 
                      updateCriterion(criterion.id, { type: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="benefit">Benefit (Semakin besar semakin baik)</SelectItem>
                      <SelectItem value="cost">Cost (Semakin kecil semakin baik)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeCriterion(criterion.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Button
          variant="outline"
          onClick={addCriterion}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Kriteria</span>
        </Button>

        <div className="flex items-center space-x-4">
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            Math.abs(totalWeight - 1) < 0.001 
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            Total Bobot: {totalWeight.toFixed(3)}
          </div>
          
          {Math.abs(totalWeight - 1) >= 0.001 && (
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Total bobot harus = 1.000</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <Button
          onClick={onNext}
          disabled={!canProceed()}
          className="px-8 py-2 bg-blue-600 hover:bg-blue-700"
        >
          Lanjut ke Input Alternatif
        </Button>
      </div>
    </div>
  );
};
