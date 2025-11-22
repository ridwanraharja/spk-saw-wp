import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SubCriteria } from '@/lib/api';

interface SubCriteriaSelectorProps {
  subCriteria: SubCriteria[];
  value: number;
  onValueChange: (value: number) => void;
  criterionName: string;
  alternativeName: string;
  disabled?: boolean;
}

export const SubCriteriaSelector: React.FC<SubCriteriaSelectorProps> = ({
  subCriteria,
  value,
  onValueChange,
  criterionName,
  alternativeName,
  disabled = false,
}) => {
  // Sort by order to ensure proper display
  const sortedSubCriteria = [...subCriteria].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        {criterionName} untuk {alternativeName}
      </Label>
      
      <RadioGroup
        value={value.toString()}
        onValueChange={(val) => onValueChange(parseInt(val))}
        disabled={disabled}
        className="grid grid-cols-1 gap-2"
      >
        {sortedSubCriteria.map((item) => (
          <div key={item.subCriteriaId} className="flex items-center space-x-2">
            <RadioGroupItem
              value={item.value.toString()}
              id={`${criterionName}-${alternativeName}-${item.value}`}
              disabled={disabled}
            />
            <Label
              htmlFor={`${criterionName}-${alternativeName}-${item.value}`}
              className="flex items-center gap-2 cursor-pointer text-sm"
            >
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                {item.value}
              </span>
              <span>{item.label}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};