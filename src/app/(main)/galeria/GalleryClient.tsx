"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Film, Plus, Trash2, X, ChevronLeft, ChevronRight, User, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import UploadModal from "@/components/UploadModal";

// Mapeo de usuarios para mostrar nombres reales
const AUTHOR_NAMES: Record<string, string> = {
  "f5f15b40-22ab-4f54-a3ee-2f899e4e2cd4": "Dani",
  "d17f157d-0299-48f4-a759-a4bed361b613": "Migue",
};

function getAuthorName(authorId: string): string {
  return AUTHOR_NAMES[authorId] || "Nosotros";
}

export default function GalleryClient({ memories: initialMemories }: { memories: any[] }) {
  const router = useRouter();
  const [memories, setMemories] = useState<any[]>(initialMemories);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeMemoryIndex, setActiveMemoryIndex] = useState<number | null>(null);

  // Sincronizar si initialMemories cambia
  useEffect(() => {
    setMemories(initialMemories);
  }, [initialMemories]);

  // Extraer los años únicos (2025, 2026, etc.) a partir de las fechas
  const years = useMemo(() => {
    const yearsSet = new Set<string>();
    memories.forEach((mem) => {
      const d = mem.memory_date ? new Date(mem.memory_date + "T12:00:00Z") : new Date(mem.created_at);
      yearsSet.add(d.getFullYear().toString());
    });
    
    if (yearsSet.size === 0) yearsSet.add(new Date().getFullYear().toString());

    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [memories]);

  const [selectedYear, setSelectedYear] = useState<string>(years[0] || "2026");

  // Filtrar la galería por el año actual
  const filteredMemories = useMemo(() => {
    return memories.filter((mem) => {
      const d = mem.memory_date ? new Date(mem.memory_date + "T12:00:00Z") : new Date(mem.created_at);
      return d.getFullYear().toString() === selectedYear;
    });
  }, [memories, selectedYear]);

  // Recuerdo actualmente abierto en el Lightbox
  const activeMemory = activeMemoryIndex !== null ? filteredMemories[activeMemoryIndex] : null;

  // Navegación en el Lightbox
  const handlePrev = useCallback(() => {
    if (activeMemoryIndex === null) return;
    setActiveMemoryIndex((prev) => (prev! > 0 ? prev! - 1 : filteredMemories.length - 1));
  }, [activeMemoryIndex, filteredMemories.length]);

  const handleNext = useCallback(() => {
    if (activeMemoryIndex === null) return;
    setActiveMemoryIndex((prev) => (prev! < filteredMemories.length - 1 ? prev! + 1 : 0));
  }, [activeMemoryIndex, filteredMemories.length]);

  // Atajos de teclado para el visor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeMemoryIndex === null) return;
      if (e.key === "Escape") setActiveMemoryIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMemoryIndex, handlePrev, handleNext]);

  // Eliminar un recuerdo
  const executeDelete = async (id: string) => {
    const toastId = toast.loading("Eliminando recuerdo...");
    try {
      const res = await fetch("/api/memories/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo eliminar");

      // Actualizar estado local
      setMemories((prev) => prev.filter((m) => m.id !== id));
      setActiveMemoryIndex(null);
      toast.success("Recuerdo eliminado de la galería.", { id: toastId });
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al eliminar el recuerdo", { id: toastId });
    }
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toast("¿Seguro que deseas eliminar este recuerdo?", {
      action: {
        label: "Eliminar",
        onClick: () => executeDelete(id),
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
    });
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* Encabezado Principal */}
      <div className="mb-10 md:mb-14 text-center">
        <p className="text-xs font-light tracking-widest uppercase text-gray-400 mb-3">La Colección</p>
        <h2 className="font-serif text-4xl md:text-6xl font-medium mb-4">Nuestra Historia</h2>
        <p className="text-gray-500 font-light text-sm max-w-md mx-auto">
          Cada fotografía, instante y recuerdo de nuestro camino juntos.
        </p>
      </div>

      {/* Barra de Acciones: Pestañas de Años + Botón Agregar Recuerdo */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-4 border-b border-gray-200 pb-4">
        {/* Pestañas de Años */}
        <div className="flex items-center gap-8 overflow-x-auto w-full sm:w-auto">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => {
                setSelectedYear(year);
                setActiveMemoryIndex(null);
              }}
              className={`pb-2 text-sm tracking-widest uppercase transition-all relative whitespace-nowrap cursor-pointer ${
                selectedYear === year ? "text-black font-medium" : "text-gray-400 hover:text-black"
              }`}
            >
              {year}
              {selectedYear === year && (
                <span className="absolute bottom-[-17px] left-0 w-full h-[2px] bg-black"></span>
              )}
            </button>
          ))}
        </div>

        {/* Botón Nuevo Recuerdo */}
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs uppercase tracking-widest hover:bg-neutral-800 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar recuerdo</span>
        </button>
      </div>

      {/* Contador sutil */}
      <div className="text-left mb-10">
        <p className="text-[11px] font-light tracking-wider text-gray-400 uppercase">
          {filteredMemories.length === 1
            ? "1 momento guardado en este año"
            : `${filteredMemories.length} momentos guardados en este año`}
        </p>
      </div>

      {/* Grid de Imágenes (Masonry) */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-200 bg-white/40">
          <p className="text-gray-400 font-light mb-4">Aún no hay recuerdos guardados en {selectedYear}.</p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="text-xs uppercase tracking-widest text-black underline hover:text-gray-600 transition-colors cursor-pointer"
          >
            Subir el primer momento de este año
          </button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredMemories.map((memory, index) => {
            const displayDate = memory.memory_date
              ? new Date(memory.memory_date + "T12:00:00Z")
              : new Date(memory.created_at);

            const authorName = getAuthorName(memory.author_id);

            return (
              <div
                key={memory.id}
                onClick={() => setActiveMemoryIndex(index)}
                className="break-inside-avoid bg-white border border-gray-200/80 p-3 hover-lift group relative cursor-pointer transition-all duration-300"
              >
                {/* Media Container */}
                <div className="relative bg-gray-100 overflow-hidden group">
                  {memory.type === "video" ? (
                    <>
                      <video
                        src={memory.media_url}
                        className="w-full h-auto object-cover max-h-[500px]"
                        preload="metadata"
                      />
                      <div className="absolute top-3 right-3 bg-black/60 p-2 backdrop-blur-md">
                        <Film className="w-4 h-4 text-white" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={memory.media_url}
                      alt={memory.description || "Recuerdo"}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}

                  {/* Botón flotante para borrar en hover */}
                  <button
                    onClick={(e) => confirmDelete(e, memory.id)}
                    className="absolute top-3 left-3 p-2 bg-white/90 hover:bg-rose-50 text-gray-500 hover:text-rose-600 shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"
                    title="Eliminar recuerdo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Pie del recuerdo */}
                <div className="pt-5 pb-2 px-2">
                  {memory.description && (
                    <p className="font-serif italic text-gray-800 text-lg mb-3 leading-relaxed">
                      &ldquo;{memory.description}&rdquo;
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-3 border-t border-gray-100">
                    <span className="tracking-widest uppercase">
                      {format(displayDate, "d 'de' MMMM, yyyy", { locale: es })}
                    </span>
                    <span className="font-medium text-gray-600 bg-gray-50 px-2 py-0.5 border border-gray-200/60">
                      Por {authorName}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. VISOR EN PANTALLA COMPLETA (LIGHTBOX) */}
      {activeMemory && (
        <div
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setActiveMemoryIndex(null)}
        >
          {/* Botón Cerrar */}
          <button
            onClick={() => setActiveMemoryIndex(null)}
            className="absolute top-6 right-6 p-2.5 text-gray-400 hover:text-white transition-colors cursor-pointer z-50 rounded-full hover:bg-white/10"
            title="Cerrar (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Botón Anterior */}
          {filteredMemories.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 text-gray-400 hover:text-white transition-colors cursor-pointer z-50 rounded-full hover:bg-white/10"
              title="Anterior (Flecha izquierda)"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          {/* Botón Siguiente */}
          {filteredMemories.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 text-gray-400 hover:text-white transition-colors cursor-pointer z-50 rounded-full hover:bg-white/10"
              title="Siguiente (Flecha derecha)"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}

          {/* Contenido Central */}
          <div
            className="max-w-5xl w-full flex flex-col items-center justify-center max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[70vh] flex items-center justify-center overflow-hidden mb-6">
              {activeMemory.type === "video" ? (
                <video
                  src={activeMemory.media_url}
                  className="max-h-[70vh] max-w-full object-contain shadow-2xl"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={activeMemory.media_url}
                  alt={activeMemory.description || "Recuerdo en grande"}
                  className="max-h-[70vh] max-w-full object-contain shadow-2xl select-none"
                />
              )}
            </div>

            {/* Metadatos en el visor */}
            <div className="text-center max-w-2xl px-4 w-full">
              {activeMemory.description && (
                <p className="font-serif italic text-white text-xl md:text-2xl mb-4 leading-relaxed font-light">
                  &ldquo;{activeMemory.description}&rdquo;
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-light tracking-widest uppercase">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(
                    activeMemory.memory_date
                      ? new Date(activeMemory.memory_date + "T12:00:00Z")
                      : new Date(activeMemory.created_at),
                    "d 'de' MMMM, yyyy",
                    { locale: es }
                  )}
                </span>

                <span className="flex items-center gap-1.5 text-gray-300">
                  <User className="w-3.5 h-3.5" />
                  Subido por {getAuthorName(activeMemory.author_id)}
                </span>

                <button
                  onClick={(e) => confirmDelete(e, activeMemory.id)}
                  className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer ml-4"
                  title="Eliminar este recuerdo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>

              {/* Indicador de posición (ej: 1 de 5) */}
              {filteredMemories.length > 1 && (
                <p className="text-[10px] text-gray-500 mt-4 tracking-widest uppercase">
                  {activeMemoryIndex! + 1} de {filteredMemories.length}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Subida reutilizable */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
