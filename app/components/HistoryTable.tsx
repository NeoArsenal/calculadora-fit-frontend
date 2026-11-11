"use client";
import { Trash2, Calendar, Scale, Ruler, History } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HistoryTable({ records, onDeleteSuccess }: { records: any[], onDeleteSuccess: () => void }) {
  
  const handleDelete = async (id: number) => {
    // 1. Guardamos la llamada a Spring Boot en una promesa
    const deletePromise = api.deleteRecord(id);

    // 2. Sonner toma el control visual de la eliminación
    toast.promise(deletePromise, {
      loading: 'Eliminando registro del historial...',
      success: 'Registro eliminado. Kallp: ha actualizado tu base de datos correctamente.',
      error: 'Error al eliminar. Verifica que el backend en Spring Boot esté activo.',
    });

    // 3. Ejecutamos la recarga de datos solo si funcionó
    try {
      await deletePromise;
      
      // La promesa fue un éxito (HTTP 200/204), recargamos la tabla
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      // El error visual ya lo manejó Sonner, aquí solo registramos en consola por si acaso
      console.error("Error al eliminar el registro:", error);
    }
  };

  return (
    <Card className="glass-card border-white/10 dark:border-white/10 shadow-2xl overflow-hidden relative group">
      <div className="pointer-events-none absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/15 transition-all duration-500" />
      
      <CardHeader className="border-b border-white/5 bg-white/[0.02] py-4 px-6 relative z-10">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 shadow-inner">
            <History size={18} />
          </div>
          Historial de Progreso
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative z-10">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="hover:bg-transparent border-white/5">
              <TableHead className="text-muted-foreground font-bold text-xs uppercase tracking-wider py-4 px-6 text-center">Fecha</TableHead>
              <TableHead className="text-muted-foreground font-bold text-xs uppercase tracking-wider py-4 text-center">Peso</TableHead>
              <TableHead className="text-muted-foreground font-bold text-xs uppercase tracking-wider py-4 text-center">Cintura</TableHead>
              <TableHead className="text-right text-muted-foreground font-bold text-xs uppercase tracking-wider py-4 px-6">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!records || records.length === 0) ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={4} className="py-12 text-center text-muted-foreground text-xs">
                  Aún no hay registros en tu historial. Registra tu peso diario en el panel izquierdo.
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id} className="border-white/5 hover:bg-blue-500/5 transition-colors duration-150 group">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2 text-foreground/80 font-medium">
                      <Calendar size={14} className="text-blue-400" />
                      {record.recordDate}
                    </div>
                  </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center justify-center gap-1.5 font-semibold">
                    <Scale size={14} className="text-muted-foreground" />
                    <span className="text-blue-400 font-bold text-sm">{record.weightKg}</span>
                    <span className="text-xs text-muted-foreground">kg</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center justify-center gap-1.5 font-semibold">
                    <Ruler size={14} className="text-muted-foreground" />
                    <span className="text-emerald-400 font-bold text-sm">{record.waistCircumferenceCm}</span>
                    <span className="text-xs text-muted-foreground">cm</span>
                  </div>
                </TableCell>
                <TableCell className="text-right py-4 px-6">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-panel border-white/10 text-foreground shadow-2xl rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-bold">¿Confirmar eliminación?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          Esta acción es irreversible. Se borrará el registro del día <span className="text-foreground font-semibold">{record.recordDate}</span>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="bg-white/5 hover:bg-white/10 text-foreground border border-white/10 rounded-xl">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(record.id)}
                          className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-600/20"
                        >
                          Eliminar de Kallp:
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            )))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}