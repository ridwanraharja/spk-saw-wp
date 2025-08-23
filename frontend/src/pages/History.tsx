import React from "react";
import { useNavigate } from "react-router-dom";
import { HistoryList } from "@/components/HistoryList";
import { useToast } from "@/hooks/use-toast";
import { spkApi, SPKRecord } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const History = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: spkHistory,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useQuery<SPKRecord[]>({
    queryKey: ["spk-history"],
    queryFn: async () => {
      const response = await spkApi.getAll({ limit: 50 });
      return response.data!.spkRecords;
    },
  });

  const deleteSPKMutation = useMutation({
    mutationFn: async (id: string) => {
      return await spkApi.delete(id);
    },
    onSuccess: () => {
      toast({
        title: "SPK Berhasil Dihapus",
        description: "Data SPK telah dihapus dari database",
      });

      queryClient.invalidateQueries({ queryKey: ["spk-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal Menghapus SPK",
        description: error.message || "Terjadi kesalahan saat menghapus data",
        variant: "destructive",
      });
    },
  });

  const viewResult = async (record: SPKRecord) => {
    try {
      const response = await spkApi.getById(record.id);
      if (response.success && response.data) {
        navigate(`/result/${record.id}`);
      } else {
        throw new Error("Failed to fetch complete data");
      }
    } catch (error) {
      toast({
        title: "Gagal Memuat Data",
        description: "Terjadi kesalahan saat memuat detail SPK",
        variant: "destructive",
      });
    }
  };

  const deleteRecord = (id: string) => {
    deleteSPKMutation.mutate(id);
  };

  const editSPK = async (record: SPKRecord) => {
    navigate(`/edit-spk/${record.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Riwayat SPK
          </h1>
          <p className="text-slate-600 mt-2">
            Lihat dan kelola riwayat analisis SPK Anda
          </p>
        </div>
      </div>

      <HistoryList
        history={spkHistory || []}
        onViewResult={viewResult}
        onDeleteRecord={deleteRecord}
        isLoading={historyLoading}
        isDeleting={deleteSPKMutation.isPending}
        onEditSPK={editSPK}
      />
    </div>
  );
};

export default History;