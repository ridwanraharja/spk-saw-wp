import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  spkApi,
  SPKRecordWithUser,
  AdminSPKResponse,
  ApiResponse,
} from "@/lib/api";

interface AllSPKListProps {
  onViewSPK: (spk: SPKRecordWithUser) => void;
  onEditSPK: (spk: SPKRecordWithUser) => void;
  onDeleteSPK: (id: string) => void;
}

export const AllSPKList: React.FC<AllSPKListProps> = ({
  onViewSPK,
  onEditSPK,
  onDeleteSPK,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [spkToDelete, setSpkToDelete] = useState<SPKRecordWithUser | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch all SPK records for admin with pagination
  const {
    data: spkResponse,
    isLoading,
    error,
  } = useQuery<ApiResponse<AdminSPKResponse>>({
    queryKey: ["all-spk", currentPage, pageSize],
    queryFn: () => spkApi.getAllAdmin({ page: currentPage, limit: pageSize }),
  });

  const spkRecords = spkResponse?.data?.spkRecords || [];
  const pagination = spkResponse?.data?.pagination;

  const deleteSPKMutation = useMutation({
    mutationFn: spkApi.delete,
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "SPK record berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: ["all-spk"] });
      setDeleteDialogOpen(false);
      setSpkToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus SPK record",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (spk: SPKRecordWithUser) => {
    setSpkToDelete(spk);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (spkToDelete) {
      deleteSPKMutation.mutate(spkToDelete.id);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSpkToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    if (!pagination) return [];

    const items = [];
    const { page, totalPages } = pagination;

    // Always show first page
    if (page > 1) {
      items.push(1);
    }

    // Show ellipsis if there's a gap
    if (page > 3) {
      items.push("ellipsis-start");
    }

    // Show pages around current page
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      if (i !== 1 && i !== totalPages) {
        items.push(i);
      }
    }

    // Show ellipsis if there's a gap
    if (page < totalPages - 2) {
      items.push("ellipsis-end");
    }

    // Always show last page
    if (page < totalPages) {
      items.push(totalPages);
    }

    return items;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data SPK...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Semua SPK Records
          </h1>
          <p className="text-slate-600 mt-2">
            Lihat semua SPK records dari semua user dalam sistem
          </p>
        </div>
        {pagination && (
          <div className="text-sm text-slate-500">
            Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
            dari {pagination.total} records
          </div>
        )}
      </div>

      {/* SPK Records Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Kriteria</TableHead>
              <TableHead>Alternatif</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead className="w-[120px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {spkRecords.map((spk: SPKRecordWithUser) => (
              <TableRow
                className="cursor-pointer"
                key={spk.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewSPK(spk);
                }}
              >
                <TableCell className="font-medium">{spk.title}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{spk.user.name}</div>
                    <div className="text-xs text-gray-500">
                      {spk.user.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      spk.user.role === "admin" ? "default" : "secondary"
                    }
                  >
                    {spk.user.role === "admin" ? "Admin" : "User"}
                  </Badge>
                </TableCell>
                <TableCell>{spk.criteria.length} kriteria</TableCell>
                <TableCell>{spk.alternatives.length} alternatif</TableCell>
                <TableCell>{formatDate(spk.createdAt)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* <DropdownMenuItem onClick={() => onViewSPK(spk)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat
                      </DropdownMenuItem> */}
                      <DropdownMenuItem onClick={() => onEditSPK(spk)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(spk)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {spkRecords.length === 0 && (
        <Card className="p-8">
          <div className="text-center">
            <p className="text-gray-500">Belum ada SPK records dalam sistem</p>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className={
                    pagination.page <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {generatePaginationItems().map((item, index) => (
                <PaginationItem key={index}>
                  {item === "ellipsis-start" || item === "ellipsis-end" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(item as number)}
                      isActive={pagination.page === item}
                      className="cursor-pointer"
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className={
                    pagination.page >= pagination.totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus SPK record "{spkToDelete?.title}". Tindakan
              ini tidak dapat dibatalkan dan akan menghapus semua data terkait
              SPK ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
