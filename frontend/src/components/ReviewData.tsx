import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calculator } from "lucide-react";
import { Criterion, Alternative, SAWResult, WPResult } from "@/lib/api";
import { calculateSAW, calculateWP } from "@/utils/calculations";

interface ReviewDataProps {
  criteria: Criterion[];
  alternatives: Alternative[];
  onNext: () => void;
  onPrev: () => void;
  setSawResults: (results: SAWResult[]) => void;
  setWpResults: (results: WPResult[]) => void;
}

export const ReviewData: React.FC<ReviewDataProps> = ({
  criteria,
  alternatives,
  onNext,
  onPrev,
  setSawResults,
  setWpResults,
}) => {
  const handleCalculate = () => {
    console.log("Starting calculations...");
    console.log("Criteria:", criteria);
    console.log("Alternatives:", alternatives);

    const sawResults = calculateSAW(criteria, alternatives);
    const wpResults = calculateWP(criteria, alternatives);

    console.log("SAW Results:", sawResults);
    console.log("WP Results:", wpResults);

    setSawResults(sawResults);
    setWpResults(wpResults);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Review Data Input
        </h2>
        <p className="text-slate-600">
          Periksa kembali data yang telah diinput sebelum melakukan perhitungan
        </p>
      </div>

      {/* Criteria Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Kriteria Penilaian
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-700">
                  No
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">
                  Nama Kriteria
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">
                  Bobot
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">
                  Tipe
                </th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion, index) => (
                <tr key={criterion.id} className="border-b border-slate-100">
                  <td className="py-3 px-4 text-slate-600">{index + 1}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {criterion.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {criterion.weight.toFixed(3)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        criterion.type === "benefit"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {criterion.type === "benefit" ? "Benefit" : "Cost"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Alternatives Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Data Alternatif
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-700">
                  No
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">
                  Nama Alternatif
                </th>
                {criteria.map((criterion) => (
                  <th
                    key={criterion.id}
                    className="text-left py-3 px-4 font-medium text-slate-700"
                  >
                    {criterion.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alternatives.map((alternative, index) => (
                <tr key={alternative.id} className="border-b border-slate-100">
                  <td className="py-3 px-4 text-slate-600">{index + 1}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {alternative.name}
                  </td>
                  {criteria.map((criterion) => (
                    <td key={criterion.id} className="py-3 px-4 text-slate-600">
                      {alternative.values[criterion.id]?.toFixed(2) || "0.00"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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
          onClick={handleCalculate}
          className="px-8 py-2 bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
        >
          <Calculator className="h-4 w-4" />
          <span>Hitung Hasil</span>
        </Button>
      </div>
    </div>
  );
};
