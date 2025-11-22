import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { SubCriteria } from '@/lib/api';

interface SubCriteriaDisplayProps {
  subCriteria: SubCriteria[];
  criterionName: string;
  onEdit?: () => void;
  showEditButton?: boolean;
}

export const SubCriteriaDisplay: React.FC<SubCriteriaDisplayProps> = ({
  subCriteria,
  criterionName,
  onEdit,
  showEditButton = true,
}) => {
  // Sort by order to ensure proper display
  const sortedSubCriteria = [...subCriteria].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">
          Sub-kriteria: {criterionName}
        </h4>
        {showEditButton && onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-7 px-2"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {sortedSubCriteria.map((item) => (
          <div
            key={item.subCriteriaId}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
          >
            <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
              {item.value}
            </Badge>
            <span className="text-xs text-gray-600 truncate" title={item.label}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};