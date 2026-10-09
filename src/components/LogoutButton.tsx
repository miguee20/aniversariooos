"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-sm font-light text-gray-500 hover:text-black transition-colors"
      title="Cerrar sesión"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden md:inline">Salir</span>
    </button>
  );
}
