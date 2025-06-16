import React, { useState, useEffect } from 'react';
import { StepIndicator } from '@/components/StepIndicator';
import { CriteriaForm } from '@/components/CriteriaForm';
import { AlternativeForm } from '@/components/AlternativeForm';
import { ReviewData } from '@/components/ReviewData';
import { ResultComparison } from '@/components/ResultComparison';
import { HistoryList } from '@/components/HistoryList';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calculator, BarChart3, PlusCircle, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export interface Criterion {
  id: string;
  name: string;
  weight: number;
  type: 'benefit' | 'cost';
}

export interface Alternative {
  id: string;
  name: string;
  values: { [criterionId: string]: number };
}

export interface SAWResult {
  alternativeId: string;
  score: number;
  rank: number;
}

export interface WPResult {
  alternativeId: string;
  score: number;
  rank: number;
}

export interface SPKRecord {
  id: string;
  title: string;
  createdAt: string;
  criteria: Criterion[];
  alternatives: Alternative[];
  sawResults: SAWResult[];
  wpResults: WPResult[];
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'new-spk' | 'history' | 'view-result'>('dashboard');
  const [currentStep, setCurrentStep] = useState(1);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [sawResults, setSawResults] = useState<SAWResult[]>([]);
  const [wpResults, setWpResults] = useState<WPResult[]>([]);
  const [spkHistory, setSpkHistory] = useState<SPKRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<SPKRecord | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const steps = [
    { number: 1, title: 'Input Kriteria', description: 'Tentukan kriteria dan bobot' },
    { number: 2, title: 'Input Alternatif', description: 'Masukkan alternatif dan nilai' },
    { number: 3, title: 'Review Data', description: 'Periksa data yang diinput' },
    { number: 4, title: 'Hasil Perhitungan', description: 'Perbandingan SAW vs WP' }
  ];

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('spk-history');
    if (savedHistory) {
      setSpkHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setCriteria([]);
    setAlternatives([]);
    setSawResults([]);
    setWpResults([]);
  };

  const saveToHistory = (title: string) => {
    const newRecord: SPKRecord = {
      id: Date.now().toString(),
      title,
      createdAt: new Date().toISOString(),
      criteria,
      alternatives,
      sawResults,
      wpResults
    };

    const updatedHistory = [newRecord, ...spkHistory];
    setSpkHistory(updatedHistory);
    localStorage.setItem('spk-history', JSON.stringify(updatedHistory));
  };

  const viewResult = (record: SPKRecord) => {
    setSelectedRecord(record);
    setCurrentView('view-result');
  };

  const startNewSPK = () => {
    resetForm();
    setCurrentView('new-spk');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CriteriaForm 
            criteria={criteria} 
            setCriteria={setCriteria}
            onNext={handleNextStep}
          />
        );
      case 2:
        return (
          <AlternativeForm 
            criteria={criteria}
            alternatives={alternatives}
            setAlternatives={setAlternatives}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        );
      case 3:
        return (
          <ReviewData 
            criteria={criteria}
            alternatives={alternatives}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            setSawResults={setSawResults}
            setWpResults={setWpResults}
          />
        );
      case 4:
        return (
          <ResultComparison 
            criteria={criteria}
            alternatives={alternatives}
            sawResults={sawResults}
            wpResults={wpResults}
            onPrev={handlePrevStep}
            onReset={resetForm}
            onSave={saveToHistory}
          />
        );
      default:
        return null;
    }
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard Admin</h1>
                <p className="text-slate-600 mt-2">Kelola sistem pendukung keputusan SAW & WP</p>
              </div>
              <Button onClick={startNewSPK} className="flex items-center gap-2 w-full sm:w-auto">
                <PlusCircle className="h-4 w-4" />
                Buat SPK Baru
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Calculator className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Total SPK</h3>
                    <p className="text-2xl font-bold text-blue-600">{spkHistory.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">SPK Bulan Ini</h3>
                    <p className="text-2xl font-bold text-emerald-600">
                      {spkHistory.filter(record => 
                        new Date(record.createdAt).getMonth() === new Date().getMonth()
                      ).length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">SPK Hari Ini</h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {spkHistory.filter(record => 
                        new Date(record.createdAt).toDateString() === new Date().toDateString()
                      ).length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">SPK Terbaru</h2>
              <HistoryList 
                history={spkHistory.slice(0, 5)} 
                onViewResult={viewResult}
                showActions={false}
              />
              {spkHistory.length > 5 && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentView('history')}
                    className="w-full sm:w-auto"
                  >
                    Lihat Semua History
                  </Button>
                </div>
              )}
            </Card>
          </div>
        );

      case 'new-spk':
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Buat SPK Baru</h1>
                <p className="text-slate-600 mt-1">Sistem Pendukung Keputusan SAW & WP</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('dashboard')}
                className="w-full sm:w-auto"
              >
                Kembali ke Dashboard
              </Button>
            </div>

            <StepIndicator steps={steps} currentStep={currentStep} />

            <Card className="bg-white shadow-sm">
              <div className="p-4 sm:p-6 lg:p-8">
                {renderStepContent()}
              </div>
            </Card>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">History SPK</h1>
                <p className="text-slate-600 mt-1">Riwayat semua sistem pendukung keputusan</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('dashboard')}
                className="w-full sm:w-auto"
              >
                Kembali ke Dashboard
              </Button>
            </div>

            <Card className="p-4 sm:p-6">
              <HistoryList 
                history={spkHistory} 
                onViewResult={viewResult}
                showActions={true}
              />
            </Card>
          </div>
        );

      case 'view-result':
        return selectedRecord ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">{selectedRecord.title}</h1>
                <p className="text-slate-600 mt-1 text-sm">
                  Dibuat pada {new Date(selectedRecord.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('history')}
                className="w-full sm:w-auto"
              >
                Kembali ke History
              </Button>
            </div>

            <Card className="bg-white shadow-sm">
              <div className="p-4 sm:p-6 lg:p-8">
                <ResultComparison 
                  criteria={selectedRecord.criteria}
                  alternatives={selectedRecord.alternatives}
                  sawResults={selectedRecord.sawResults}
                  wpResults={selectedRecord.wpResults}
                  onPrev={() => setCurrentView('history')}
                  onReset={() => setCurrentView('dashboard')}
                  isViewMode={true}
                />
              </div>
            </Card>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">SPK Dashboard</h1>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <AdminSidebar 
                currentView={currentView}
                onViewChange={(view) => {
                  setCurrentView(view);
                  setIsMobileMenuOpen(false);
                }}
                totalSPK={spkHistory.length}
                isMobile={true}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar 
            currentView={currentView}
            onViewChange={setCurrentView}
            totalSPK={spkHistory.length}
          />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-hidden">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
