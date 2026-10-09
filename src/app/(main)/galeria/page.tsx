import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import GalleryClient from "./GalleryClient";

async function MemoriesGallery() {
  await connection();

  const supabase = await createClient();

  const { data: memories, error } = await supabase
    .from("memories")
    .select("*")
    .order("memory_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 font-light">Hubo un error cargando los recuerdos.</p>
      </div>
    );
  }

  return <GalleryClient memories={memories || []} />;
}

export default function GaleriaPage() {
  return (
    <Suspense 
      fallback={
        <div className="text-center py-20 animate-in fade-in duration-700">
          <p className="text-gray-400 font-light tracking-widest uppercase text-sm animate-pulse">
            Abriendo la bóveda...
          </p>
        </div>
      }
    >
      <MemoriesGallery />
    </Suspense>
  );
}
