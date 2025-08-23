import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SubCriteria } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SubCriteriaGridProps {
  subCriteria: SubCriteria[];
  value: number;
  onValueChange: (value: number) => void;
  criterionName: string;
  alternativeName?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export const SubCriteriaGrid: React.FC<SubCriteriaGridProps> = ({
  subCriteria,
  value,
  onValueChange,
  criterionName,
  alternativeName,
  disabled = false,
  size = "md",
}) => {
  // Sort by order to ensure proper display
  const sortedSubCriteria = [...subCriteria].sort((a, b) => a.order - b.order);

  const sizeClasses = {
    sm: "h-8 text-xs",
    md: "h-10 text-sm",
    lg: "h-12 text-base",
  };

  return (
    <div className="space-y-2">
      {/* {alternativeName && (
        <Label className="text-sm font-medium">
          {criterionName} untuk {alternativeName}
        </Label>
      )} */}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-1">
        {sortedSubCriteria.map((item) => (
          <div key={item.id} className="text-center">
            <Button
              variant={value === item.value ? "default" : "outline"}
              size="sm"
              onClick={() => onValueChange(item.value)}
              disabled={disabled}
              className={cn(
                sizeClasses[size],
                "w-full p-1 flex flex-col gap-0.5 h-fit",
                value === item.value && "bg-primary text-primary-foreground"
              )}
              title={item.label}
            >
              <span className="font-bold">{item.value}</span>
              <span className="text-xs leading-none truncate max-w-full">
                {item.label}
              </span>
            </Button>
          </div>
        ))}
      </div>

      {/* Selected value display */}
      {/* {value && (
        <div className="text-xs text-gray-500 text-center">
          Dipilih:{" "}
          <strong>
            {sortedSubCriteria.find((sc) => sc.value === value)?.label}
          </strong>
        </div>
      )} */}
    </div>
  );
};
