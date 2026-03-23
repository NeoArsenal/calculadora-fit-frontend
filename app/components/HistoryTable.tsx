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
    <Card className="border-gray-800 bg-gray-900/40 backdrop-blur-md shadow-2xl overflow-hidden">
      <CardHeader className="border-b border-gray-800 bg-gray-800/20">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <History className="text-blue-500" size={20} />
          Historial de Progreso
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0"> {/* Quitamos padding para que la tabla llegue a los bordes */}
        <Table>
          <TableHeader className="bg-gray-800/50">
            <TableRow className="hover:bg-transparent border-gray-800">
              <TableHead className="text-gray-400 font-semibold py-4 px-6 text-center">Fecha</TableHead>
              <TableHead className="text-gray-400 font-semibold py-4 text-center">Peso</TableHead>
              <TableHead className="text-gray-400 font-semibold py-4 text-center">Cintura</TableHead>
              <TableHead className="text-right text-gray-400 font-semibold py-4 px-6">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className="border-gray-800 hover:bg-blue-500/5 transition-colors group">
                <TableCell className="py-4 px-6">
                  <div className="flex items-center justify-center gap-2 text-gray-300">
                    <Calendar size={14} className="text-blue-400" />
                    {record.recordDate}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Scale size={14} className="text-gray-500" />
                    <span className="text-blue-400 font-bold">{record.weightKg}</span>
                    <span className="text-xs text-gray-600">kg</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Ruler size={14} className="text-gray-500" />
                    <span className="text-green-400 font-bold">{record.waistCircumferenceCm}</span>
                    <span className="text-xs text-gray-600">cm</span>
                  </div>
                </TableCell>
                <TableCell className="text-right py-4 px-6">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl">¿Confirmar eliminación?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          Esta acción es irreversible. Se borrará el registro del día <span className="text-white font-semibold">{record.recordDate}</span>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 border-none text-white">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(record.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Eliminar de Kallp:
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}