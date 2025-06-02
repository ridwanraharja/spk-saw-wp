import React from "react";
import { twMerge } from "tailwind-merge";
import type { IconType } from "react-icons";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  changeType: "increase" | "decrease";
  icon: IconType;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  className,
}) => {
  const formattedValue = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

  const formattedChange = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(change) / 100);

  return (
    <div
      className={twMerge(
        "bg-white rounded-lg shadow p-6",
        "border border-gray-200",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="ml-4 text-sm font-medium text-gray-500">{title}</h3>
        </div>
        <div
          className={`flex items-center ${
            changeType === "increase" ? "text-green-600" : "text-red-600"
          }`}
        >
          {changeType === "increase" ? (
            <FiArrowUp className="w-4 h-4 mr-1" />
          ) : (
            <FiArrowDown className="w-4 h-4 mr-1" />
          )}
          <span className="text-sm font-medium">{formattedChange}</span>
        </div>
      </div>
      <p className="mt-4 text-3xl font-semibold text-gray-900">
        {formattedValue}
      </p>
    </div>
  );
};
