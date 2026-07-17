"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Bot, TrendingUp, Zap, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useApp } from "@/app/context/AppContext";
import * as api from "@/services/api";
import { useRouter } from "next/navigation";

const mockNotifications = [
  {
    id: 1,
    title: "Insight de Kallp AI",
    description: "He notado que tu volumen en pecho ha estado estancado por 2 semanas. Te sugiero ajustar la sobrecarga progresiva.",
    icon: <Bot className="text-purple-500" size={20} />,
    time: "Hace 2 horas",
    actionText: "Ver sugerencias",
    type: "ai"
  },
  {
    id: 2,
    title: "Alerta de Nutrición",
    description: "Tu ingesta de proteínas de ayer quedó 30g por debajo de tu meta. ¡Intenta priorizar pollo o claras de huevo hoy!",
    icon: <Zap className="text-yellow-500" size={20} />,
    time: "Ayer",
    actionText: "Ajustar mi dieta hoy",
    type: "nutrition"
  },
  {
    id: 3,
    title: "¡Nuevo Récord Personal!",
    description: "Rompiste tu récord en Press de Banca con 100kg. ¡Excelente trabajo, sigue así!",
    icon: <TrendingUp className="text-green-500" size={20} />,
    time: "Hace 2 días",
    actionText: "Ver progreso",
    type: "achievement"
  }
];

export default function NotificationDrawer({ customTrigger }: { customTrigger?: (unreadCount: number) => React.ReactNode }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { userProfile, CURRENT_USER_ID } = useApp();
  const router = useRouter();

  // Función para obtener las notificaciones de la base de datos
  const fetchNotifications = async () => {
    if (!CURRENT_USER_ID) return;
    try {
      const data = await api.getUserNotifications(CURRENT_USER_ID);
      setNotifications(data);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    }
  };

  // Se ejecuta cuando el componente se monta o cuando cambia el usuario
  useEffect(() => {
    fetchNotifications();
  }, [CURRENT_USER_ID]);

  const unreadCount = notifications.length;

  const dismissNotification = async (id: number) => {
    try {
      // Elimina la notificación en el backend
      await api.deleteNotification(id);
      // Elimina la notificación visualmente en el frontend
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error descartando notificación:", error);
    }
  };

  const handleActionClick = (type: string, id: number) => {
    // 1. Borramos la notificación (opcional, pero da una mejor experiencia ya que "se resolvió")
    dismissNotification(id);
    
    // 2. Cerramos el drawer
    setIsOpen(false);
    
    // 3. Navegamos al módulo correcto
    if (type === 'ai') router.push('/training');
    else if (type === 'nutrition') router.push('/nutrition');
    else if (type === 'achievement') router.push('/');
  };

  // Función de ayuda para formatear la fecha
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Justo ahora";
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 172800) return "Ayer";
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  };

  // Función de ayuda para renderizar el icono correcto
  const getIconForType = (type: string) => {
    switch (type) {
      case 'ai': return <Bot className="text-purple-500" size={20} />;
      case 'nutrition': return <Zap className="text-yellow-500" size={20} />;
      case 'achievement': return <TrendingUp className="text-green-500" size={20} />;
      default: return <Bell className="text-blue-500" size={20} />;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) fetchNotifications();
    }}>
      <SheetTrigger asChild>
        {customTrigger ? (
          customTrigger(unreadCount)
        ) : (
          <button className="text-blue-600 dark:text-blue-400 p-2 relative hover:bg-blue-50 dark:hover:bg-white/5 rounded-full transition-colors active:scale-95">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-white dark:bg-[#0a0a0b] border-l-0 sm:border-l border-gray-200 dark:border-white/10 p-0 flex flex-col z-50">
        <SheetHeader className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
          <SheetTitle className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            Panel de Inteligencia
            <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full font-bold">
              {unreadCount} nuevas
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
              <Bot size={48} className="mb-4 text-gray-400" />
              <p className="font-semibold text-gray-600 dark:text-gray-300">Todo al día, {userProfile?.name?.split(' ')[0] || 'Atleta'}</p>
              <p className="text-sm text-gray-500 mt-2">Kallp AI está analizando tus datos en segundo plano.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className="relative bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
              >
                <button 
                  onClick={() => dismissNotification(notif.id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={16} />
                </button>
                
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-xl flex-shrink-0 ${
                    notif.type === 'ai' ? 'bg-purple-100 dark:bg-purple-500/10' :
                    notif.type === 'nutrition' ? 'bg-yellow-100 dark:bg-yellow-500/10' :
                    'bg-green-100 dark:bg-green-500/10'
                  }`}>
                    {getIconForType(notif.type)}
                  </div>
                  <div className="flex-1 pr-6">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">{notif.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                      {notif.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-medium">{formatTimeAgo(notif.createdAt)}</span>
                      <button 
                        onClick={() => handleActionClick(notif.type, notif.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors active:scale-95 ${
                        notif.type === 'ai' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/30' :
                        notif.type === 'nutrition' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-500/30' :
                        'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30'
                      }`}>
                        {notif.actionText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
