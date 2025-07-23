import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Calendar,
  BarChart3,
  Trash2,
  Loader2,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import { SPKRecord } from "@/lib/api";

interface HistoryListProps {
  history: SPKRecord[];
  onViewResult: (record: SPKRecord) => void;
  onDeleteRecord?: (id: string) => void;
  isLoading?: boolean;
  isDeleting?: boolean;
  showActions?: boolean;
  onEditSPK?: (record: SPKRecord) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onViewResult,
  onDeleteRecord,
  onEditSPK,
  isLoading = false,
  isDeleting = false,
  showActions = true,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8 sm:py-12">
        <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 mx-auto mb-4 animate-spin" />
        <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">
          Memuat data...
        </h3>
        <p className="text-sm text-slate-500">Mengambil riwayat SPK Anda</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">
          Belum ada SPK
        </h3>
        <p className="text-sm text-slate-500">Mulai buat SPK pertama Anda</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {history.map((record) => (
        <Card
          onClick={(e) => {
            e.stopPropagation();
            onViewResult(record);
          }}
          key={record.id}
          className="p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                  {record.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {record.criteria.length} Kriteria
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {record.alternatives.length} Alternatif
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>
                  {new Date(record.createdAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEditSPK && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditSPK(record);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDeleteRecord && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRecord(record.id);
                      }}
                      className="text-red-600"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      {isDeleting ? "Menghapus..." : "Hapus"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
