"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const toastId = toast.loading("Verificando identidad...");
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Correo o contraseña incorrectos.", { id: toastId });
      setIsLoading(false);
    } else {
      toast.success("¡Bienvenido al espacio!", { id: toastId });
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full bg-white p-10 border border-gray-200 shadow-2xl hover-lift animate-in fade-in duration-700">
        
        <div className="text-center mb-10">
          <p className="text-xs font-light tracking-widest uppercase text-gray-400 mb-4">Privado y Seguro</p>
          <h1 className="font-serif text-4xl mb-3 font-medium">Nuestro Espacio</h1>
          <p className="font-serif italic text-gray-500">Álbum de Migue y Dani.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-light tracking-widest uppercase text-gray-400 mb-2">
              Correo Electrónico
            </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full border-b border-gray-200 py-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-transparent"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-light tracking-widest uppercase text-gray-400 mb-2">
              Contraseña
            </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full border-b border-gray-200 py-3 text-sm font-light focus:outline-none focus:border-black transition-colors bg-transparent"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full py-4 mt-4 bg-black text-white hover:bg-gray-800 transition-colors disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2 text-sm tracking-wide"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Abrir el álbum"
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            Solo acceso autorizado
          </p>
        </div>

      </div>
    </div>
  );
}
