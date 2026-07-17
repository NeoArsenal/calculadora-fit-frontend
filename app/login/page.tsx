"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { loginUser, registerUser } from '@/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail, User, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegistering && !name)) {
      toast.error("Por favor, completa todos los campos requeridos.");
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistering) {
        // Registrar usuario
        await registerUser({ name, email, password });
        toast.success("¡Registro exitoso! Iniciando sesión...");
      }
      
      // Ya sea que registremos o no, logueamos con las credenciales actuales
      const res = await loginUser({ email, password });
      login(res.token, res.id);
      
      toast.success("¡Bienvenido a Kallp, " + res.username + "!");
      router.push('/');
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "Error al procesar la solicitud.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      {/* Overlay oscuro para resaltar el panel de glassmorphism */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      
      <div className="relative z-10 w-full max-w-md p-8 md:p-10 bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white tracking-tighter">
            Kallp<span className="text-blue-500">:</span>
          </h1>
          <p className="text-gray-300 mt-2 text-sm font-medium">
            {isRegistering ? 'Únete al ecosistema fitness' : 'Bienvenido a tu ecosistema fitness'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegistering && (
            <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
              <Label className="text-white">Nombre de Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  type="text" 
                  placeholder="Tu Nombre" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-white">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                type="email" 
                placeholder="tu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-white">Contraseña</Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide rounded-xl group transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <div className="flex items-center gap-2">
                {isRegistering ? 'Crear mi cuenta' : 'Ingresar a Kallp:'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          {isRegistering ? (
            <>
              ¿Ya tienes una cuenta? <span onClick={() => setIsRegistering(false)} className="text-blue-400 font-semibold hover:text-blue-300 cursor-pointer transition-colors">Inicia Sesión</span>
            </>
          ) : (
            <>
              ¿No tienes una cuenta? <span onClick={() => setIsRegistering(true)} className="text-blue-400 font-semibold hover:text-blue-300 cursor-pointer transition-colors">Solicitar acceso</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
