
import React from 'react';
import { Criterion, Alternative, SAWResult, WPResult } from '@/pages/Index';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RankingAnalysisProps {
  criteria: Criterion[];
  alternatives: Alternative[];
  sawResults: SAWResult[];
  wpResults: WPResult[];
  method: 'SAW' | 'WP';
}

export const RankingAnalysis: React.FC<RankingAnalysisProps> = ({
  criteria,
  alternatives,
  sawResults,
  wpResults,
  method
}) => {
  const results = method === 'SAW' ? sawResults : wpResults;

  const getAlternativeAnalysis = (alternativeId: string) => {
    const alternative = alternatives.find(alt => alt.id === alternativeId);
    const result = results.find(r => r.alternativeId === alternativeId);
    
    if (!alternative || !result) return null;

    // Analyze performance in each criterion
    const criteriaAnalysis = criteria.map(criterion => {
      const value = alternative.values[criterion.id] || 0;
      const allValues = alternatives.map(alt => alt.values[criterion.id] || 0);
      const maxValue = Math.max(...allValues);
      const minValue = Math.min(...allValues);
      const avgValue = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
      
      let performance: 'excellent' | 'good' | 'average' | 'poor';
      let icon;
      let color;

      if (criterion.type === 'benefit') {
        if (value >= maxValue * 0.9) {
          performance = 'excellent';
          icon = <TrendingUp className="h-4 w-4" />;
          color = 'bg-green-100 text-green-800';
        } else if (value >= avgValue) {
          performance = 'good';
          icon = <TrendingUp className="h-4 w-4" />;
          color = 'bg-blue-100 text-blue-800';
        } else if (value >= minValue * 1.1) {
          performance = 'average';
          icon = <Minus className="h-4 w-4" />;
          color = 'bg-yellow-100 text-yellow-800';
        } else {
          performance = 'poor';
          icon = <TrendingDown className="h-4 w-4" />;
          color = 'bg-red-100 text-red-800';
        }
      } else {
        // For cost criteria, lower is better
        if (value <= minValue * 1.1) {
          performance = 'excellent';
          icon = <TrendingUp className="h-4 w-4" />;
          color = 'bg-green-100 text-green-800';
        } else if (value <= avgValue) {
          performance = 'good';
          icon = <TrendingUp className="h-4 w-4" />;
          color = 'bg-blue-100 text-blue-800';
        } else if (value <= maxValue * 0.9) {
          performance = 'average';
          icon = <Minus className="h-4 w-4" />;
          color = 'bg-yellow-100 text-yellow-800';
        } else {
          performance = 'poor';
          icon = <TrendingDown className="h-4 w-4" />;
          color = 'bg-red-100 text-red-800';
        }
      }

      return {
        criterion,
        value,
        performance,
        icon,
        color,
        weight: criterion.weight,
        isHighest: value === maxValue,
        isLowest: value === minValue
      };
    });

    // Find strongest and weakest points
    const strengths = criteriaAnalysis.filter(c => 
      c.performance === 'excellent' || (c.performance === 'good' && c.weight > 0.15)
    );
    
    const weaknesses = criteriaAnalysis.filter(c => 
      c.performance === 'poor' || (c.performance === 'average' && c.weight > 0.15)
    );

    return {
      alternative,
      result,
      criteriaAnalysis,
      strengths,
      weaknesses
    };
  };

  const getPerformanceText = (performance: string, criterionType: string) => {
    if (criterionType === 'benefit') {
      switch (performance) {
        case 'excellent': return 'Sangat Tinggi';
        case 'good': return 'Tinggi';
        case 'average': return 'Sedang';
        case 'poor': return 'Rendah';
        default: return 'Sedang';
      }
    } else {
      switch (performance) {
        case 'excellent': return 'Sangat Rendah';
        case 'good': return 'Rendah';
        case 'average': return 'Sedang';
        case 'poor': return 'Tinggi';
        default: return 'Sedang';
      }
    }
  };

  const getRankingReason = (rank: number) => {
    switch (rank) {
      case 1: return 'Peringkat 1 karena memiliki skor tertinggi';
      case 2: return 'Peringkat 2 dengan skor yang baik';
      case 3: return 'Peringkat 3 dengan skor cukup baik';
      default: return `Peringkat ${rank} dengan skor yang perlu ditingkatkan`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Analisis Ranking - Metode {method}
        </h3>
        <p className="text-sm text-slate-600">
          Analisis detail mengapa setiap alternatif mendapat peringkat tersebut
        </p>
      </div>

      <div className="space-y-4">
        {results.map((result) => {
          const analysis = getAlternativeAnalysis(result.alternativeId);
          if (!analysis) return null;

          return (
            <Card key={result.alternativeId} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">
                    {analysis.alternative.name}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {getRankingReason(result.rank)} (Skor: {result.score.toFixed(4)})
                  </p>
                </div>
                <Badge variant="outline" className="font-semibold">
                  Rank #{result.rank}
                </Badge>
              </div>

              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-slate-700 mb-2">
                    Kekuatan Utama:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.strengths.map((strength, index) => (
                      <Badge
                        key={index}
                        className={`${strength.color} flex items-center gap-1`}
                      >
                        {strength.icon}
                        {strength.criterion.name}: {getPerformanceText(strength.performance, strength.criterion.type)}
                        {strength.isHighest && ' (Tertinggi)'}
                        {strength.isLowest && strength.criterion.type === 'cost' && ' (Terendah)'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Weaknesses */}
              {analysis.weaknesses.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-slate-700 mb-2">
                    Area yang Perlu Diperbaiki:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.weaknesses.map((weakness, index) => (
                      <Badge
                        key={index}
                        className={`${weakness.color} flex items-center gap-1`}
                      >
                        {weakness.icon}
                        {weakness.criterion.name}: {getPerformanceText(weakness.performance, weakness.criterion.type)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed breakdown */}
              <div className="border-t pt-4">
                <h5 className="text-sm font-medium text-slate-700 mb-3">
                  Detail Penilaian per Kriteria:
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.criteriaAnalysis.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.criterion.name}</span>
                        <Badge variant="outline" className="text-xs">
                          Bobot: {(item.weight * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">{item.value}</span>
                        <Badge className={`${item.color} text-xs flex items-center gap-1`}>
                          {item.icon}
                          {getPerformanceText(item.performance, item.criterion.type)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
