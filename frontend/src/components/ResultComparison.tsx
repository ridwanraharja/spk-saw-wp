import React, { useState } from 'react';
import { Criterion, Alternative, SAWResult, WPResult } from '@/pages/Index';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, Medal, Award, Save, ArrowLeft, RotateCcw, Info } from 'lucide-react';
import { RankingAnalysis } from './RankingAnalysis';

interface ResultComparisonProps {
  criteria: Criterion[];
  alternatives: Alternative[];
  sawResults: SAWResult[];
  wpResults: WPResult[];
  onPrev: () => void;
  onReset: () => void;
  onSave?: (title: string) => void;
  isViewMode?: boolean;
}

export const ResultComparison: React.FC<ResultComparisonProps> = ({
  criteria,
  alternatives,
  sawResults,
  wpResults,
  onPrev,
  onReset,
  onSave,
  isViewMode = false
}) => {
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const chartData = alternatives.map(alt => {
    const sawScore = sawResults.find(r => r.alternativeId === alt.id)?.score || 0;
    const wpScore = wpResults.find(r => r.alternativeId === alt.id)?.score || 0;
    
    return {
      name: alt.name,
      SAW: Number(sawScore.toFixed(4)),
      WP: Number(wpScore.toFixed(4))
    };
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-slate-500">#{rank}</span>;
    }
  };

  const handleSave = () => {
    if (saveTitle.trim() && onSave) {
      onSave(saveTitle.trim());
      setShowSaveDialog(false);
      setSaveTitle('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Hasil Perbandingan</h2>
          <p className="text-slate-600 mt-1">Perbandingan metode SAW vs WP dengan analisis ranking</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onPrev}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          {!isViewMode && (
            <>
              <Button variant="outline" onClick={onReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={() => setShowSaveDialog(true)}>
                <Save className="h-4 w-4 mr-2" />
                Simpan Hasil
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="space-y-4">
            <div>
              <Label htmlFor="save-title">Judul SPK</Label>
              <Input
                id="save-title"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Masukkan judul untuk SPK ini..."
                className="mt-1"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={!saveTitle.trim()}>
                Simpan
              </Button>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Batal
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="results">Hasil & Grafik</TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Analisis Ranking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-6">
          {/* Visualization Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Grafik Perbandingan Skor</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="SAW" fill="#3b82f6" name="Metode SAW" />
                  <Bar dataKey="WP" fill="#10b981" name="Metode WP" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Results Comparison Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SAW Results */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Hasil Metode SAW
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Alternatif</TableHead>
                    <TableHead>Skor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sawResults.map((result) => {
                    const alternative = alternatives.find(alt => alt.id === result.alternativeId);
                    return (
                      <TableRow key={result.alternativeId}>
                        <TableCell className="flex items-center gap-2">
                          {getRankIcon(result.rank)}
                        </TableCell>
                        <TableCell className="font-medium">{alternative?.name}</TableCell>
                        <TableCell>{result.score.toFixed(4)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>

            {/* WP Results */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                Hasil Metode WP
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Alternatif</TableHead>
                    <TableHead>Skor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wpResults.map((result) => {
                    const alternative = alternatives.find(alt => alt.id === result.alternativeId);
                    return (
                      <TableRow key={result.alternativeId}>
                        <TableCell className="flex items-center gap-2">
                          {getRankIcon(result.rank)}
                        </TableCell>
                        <TableCell className="font-medium">{alternative?.name}</TableCell>
                        <TableCell>{result.score.toFixed(4)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Winner Comparison */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Perbandingan Pemenang</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Pemenang SAW</h4>
                <p className="text-xl font-bold text-blue-700">
                  {alternatives.find(alt => alt.id === sawResults.find(r => r.rank === 1)?.alternativeId)?.name}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Skor: {sawResults.find(r => r.rank === 1)?.score.toFixed(4)}
                </p>
              </div>
              <div className="text-center p-6 bg-emerald-50 rounded-lg">
                <Trophy className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-emerald-900 mb-2">Pemenang WP</h4>
                <p className="text-xl font-bold text-emerald-700">
                  {alternatives.find(alt => alt.id === wpResults.find(r => r.rank === 1)?.alternativeId)?.name}
                </p>
                <p className="text-sm text-emerald-600 mt-1">
                  Skor: {wpResults.find(r => r.rank === 1)?.score.toFixed(4)}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <RankingAnalysis
              criteria={criteria}
              alternatives={alternatives}
              sawResults={sawResults}
              wpResults={wpResults}
              method="SAW"
            />
            <RankingAnalysis
              criteria={criteria}
              alternatives={alternatives}
              sawResults={sawResults}
              wpResults={wpResults}
              method="WP"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
