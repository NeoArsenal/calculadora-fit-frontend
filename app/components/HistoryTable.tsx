"use client";

import { Trash2, Calendar, Scale, Ruler, History, Plus } from "lucide-react";
import { toast } from "sonner";
import * as api from '../../services/api';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function HistoryTable({ 
  records, 
  onDeleteSuccess,
  onOpenRecordModal
}: { 
  records: any[]; 
  onDeleteSuccess: () => void;
  onOpenRecordModal?: () => void;
}) {
  
  const handleDelete = async (id: number) => {
    const deletePromise = api.deleteRecord(id);

    toast.promise(deletePromise, {
      loading: 'Eliminando registro del historial...',
      success: 'Registro eliminado correctamente.',
      error: 'Error al eliminar el registro.',
    });

    try {
      await deletePromise;
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (error) {
      console.error("Error al eliminar el registro:", error);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <History size={16} />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-foreground tracking-tight">
              Registro Histórico de Pesajes
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Gestiona tus mediciones guardadas
            </p>
          </div>
        </div>

        {onOpenRecordModal && (
          <button
            onClick={onOpenRecordModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all active:scale-95"
          >
            <Plus size={14} /> Nuevo
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-border dark:border-white/10 overflow-hidden bg-muted/20 dark:bg-white/[0.01]">
        <Table>
          <TableHeader className="bg-muted/50 dark:bg-white/[0.03]">
            <TableRow className="hover:bg-transparent border-border dark:border-white/5">
              <TableHead className="text-muted-foreground font-bold text-[11px] uppercase tracking-wider py-3.5 px-4 text-center">Fecha</TableHead>
              <TableHead className="text-muted-foreground font-bold text-[11px] uppercase tracking-wider py-3.5 text-center">Peso</TableHead>
              <TableHead className="text-muted-foreground font-bold text-[11px] uppercase tracking-wider py-3.5 text-center">Cintura</TableHead>
              <TableHead className="text-right text-muted-foreground font-bold text-[11px] uppercase tracking-wider py-3.5 px-4">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!records || records.length === 0) ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={4} className="py-12 text-center text-muted-foreground text-xs">
                  Aún no hay registros guardados. Haz clic en "+ Registrar Pesaje" para empezar.
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id} className="border-border dark:border-white/5 hover:bg-muted/40 dark:hover:bg-white/[0.03] transition-colors">
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-2 text-foreground font-medium text-xs md:text-sm">
                      <Calendar size={14} className="text-blue-500 dark:text-blue-400" />
                      {record.recordDate}
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center justify-center gap-1 font-semibold">
                      <Scale size={13} className="text-muted-foreground" />
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm tabular-nums">{record.weightKg}</span>
                      <span className="text-[11px] text-muted-foreground">kg</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center justify-center gap-1 font-semibold">
                      <Ruler size={13} className="text-muted-foreground" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm tabular-nums">{record.waistCircumferenceCm}</span>
                      <span className="text-[11px] text-muted-foreground">cm</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-3.5 px-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card dark:bg-[#121214] border border-border dark:border-white/10 text-foreground shadow-2xl rounded-3xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-lg font-bold">¿Confirmar eliminación?</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground text-xs">
                            Se eliminará el registro biométrico del día <span className="text-foreground font-semibold">{record.recordDate}</span>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2">
                          <AlertDialogCancel className="bg-muted dark:bg-white/5 hover:bg-accent text-foreground border border-border dark:border-white/10 rounded-xl text-xs font-bold">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(record.id)}
                            className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
