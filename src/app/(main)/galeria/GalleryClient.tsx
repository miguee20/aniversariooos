"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Film, Plus, Trash2, X, ChevronLeft, ChevronRight, User, Calendar, Download, Pencil, Check } from "lucide-react";
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

  // Estados para edición dentro del Lightbox
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Sincronizar si cambian las memorias iniciales
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

  // Cargar datos de edición al abrir o cambiar de recuerdo
  useEffect(() => {
    if (activeMemory) {
      setEditDescription(activeMemory.description || "");
      setEditDate(activeMemory.memory_date || "");
      setIsEditing(false);
    }
  }, [activeMemoryIndex, activeMemory]);

  // Navegación en el Lightbox
  const handlePrev = useCallback(() => {
    if (activeMemoryIndex === null) return;
    setIsEditing(false);
    setActiveMemoryIndex((prev) => (prev! > 0 ? prev! - 1 : filteredMemories.length - 1));
  }, [activeMemoryIndex, filteredMemories.length]);

  const handleNext = useCallback(() => {
    if (activeMemoryIndex === null) return;
    setIsEditing(false);
    setActiveMemoryIndex((prev) => (prev! < filteredMemories.length - 1 ? prev! + 1 : 0));
  }, [activeMemoryIndex, filteredMemories.length]);

  // Atajos de teclado para el visor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeMemoryIndex === null) return;
      // Si está escribiendo en el textarea, no cerrar con Esc ni navegar con flechas
      if (isEditing) {
        if (e.key === "Escape") setIsEditing(false);
        return;
      }
      if (e.key === "Escape") setActiveMemoryIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMemoryIndex, isEditing, handlePrev, handleNext]);

  // Guardar cambios de edición
  const handleSaveEdit = async () => {
    if (!activeMemory) return;
    setIsSavingEdit(true);
    const toastId = toast.loading("Actualizando recuerdo...");

    try {
      const res = await fetch("/api/memories/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeMemory.id,
          description: editDescription,
          memory_date: editDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar");

      // Actualizar memoria localmente
      setMemories((prev) =>
        prev.map((m) =>
          m.id === activeMemory.id
            ? { ...m, description: editDescription, memory_date: editDate || null }
            : m
        )
      );

      setIsEditing(false);
      toast.success("Recuerdo actualizado correctamente.", { id: toastId });
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "No se pudo actualizar el recuerdo", { id: toastId });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Descargar foto en alta calidad
  const handleDownload = () => {
    if (!activeMemory?.media_url) return;
    // Insertamos fl_attachment para forzar descarga nativa desde Cloudinary
    const downloadUrl = activeMemory.media_url.replace("/upload/", "/upload/fl_attachment/");
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.target = "_blank";
    link.download = `recuerdo_${selectedYear}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Iniciando descarga en alta calidad...");
  };

  // Eliminar un recuerdo (en Supabase y Cloudinary)
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
      toast.success("Recuerdo eliminado por completo.", { id: toastId });
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al eliminar el recuerdo", { id: toastId });
    }
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toast("¿Deseas eliminar este recuerdo permanentemente?", {
      description: "Se borrará tanto de la aplicación como de la nube.",
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

  // Renderizar tarjeta individual
  const renderCard = (memory: any, index: number) => {
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

          {/* Botón borrar en tarjeta: SOLO VISIBLE EN PC AL PASAR EL MOUSE */}
          <button
            onClick={(e) => confirmDelete(e, memory.id)}
            className="hidden md:flex absolute top-3 left-3 p-2 bg-white/90 hover:bg-rose-50 text-gray-500 hover:text-rose-600 shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm pointer-events-none group-hover:pointer-events-auto"
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
  };

  return (
    <div className="animate-in fade-in duration-700 relative pb-16">
      {/* 1. Encabezado Editorial Centrado */}
      <div className="mb-10 md:mb-14 text-center">
        <p className="text-xs font-light tracking-widest uppercase text-gray-400 mb-3">La Colección</p>
        <h2 className="font-serif text-4xl md:text-6xl font-medium mb-4">Nuestra Historia</h2>
        <p className="text-gray-500 font-light text-sm max-w-md mx-auto">
          Cada fotografía, instante y recuerdo de nuestro camino juntos.
        </p>
      </div>

      {/* 2. Pestañas de Años - Centradas y limpias */}
      <div className="flex justify-center items-center gap-10 mb-4 border-b border-gray-200 pb-3">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => {
              setSelectedYear(year);
              setActiveMemoryIndex(null);
            }}
            className={`pb-2 text-sm md:text-base tracking-widest uppercase transition-all relative cursor-pointer ${
              selectedYear === year ? "text-black font-medium" : "text-gray-400 hover:text-black"
            }`}
          >
            {year}
            {selectedYear === year && (
              <span className="absolute bottom-[-13px] left-0 w-full h-[2px] bg-black"></span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Contador Centrado y Discreto */}
      <div className="text-center mb-12">
        <p className="text-[11px] font-light tracking-wider text-gray-400 uppercase">
          {filteredMemories.length === 1
            ? "1 momento guardado en este año"
            : `${filteredMemories.length} momentos guardados en este año`}
        </p>
      </div>

      {/* 4. Grid de Imágenes Inteligente:
          - Si hay 0: Mensaje limpio con botón para subir
          - Si hay 1 o 2: Centrado elegante (sin huecos vacíos gigantes a la derecha)
          - Si hay 3 o más: Masonry completo tipo mosaico editorial */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-200 bg-white/40 max-w-xl mx-auto">
          <p className="text-gray-400 font-light mb-4 text-sm">Aún no hay recuerdos guardados en {selectedYear}.</p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="text-xs uppercase tracking-widest text-black underline hover:text-gray-600 transition-colors cursor-pointer"
          >
            Subir el primer momento de este año
          </button>
        </div>
      ) : filteredMemories.length <= 2 ? (
        <div
          className={`mx-auto grid grid-cols-1 ${
            filteredMemories.length === 2 ? "sm:grid-cols-2 max-w-3xl" : "max-w-md"
          } gap-8 justify-center`}
        >
          {filteredMemories.map((memory, index) => renderCard(memory, index))}
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredMemories.map((memory, index) => renderCard(memory, index))}
        </div>
      )}

      {/* 5. BOTÓN FLOTANTE "AGREGAR RECUERDO" (FAB) */}
      <button
        onClick={() => setIsUploadOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40 bg-black text-white px-5 py-3.5 rounded-full shadow-2xl hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer border border-white/10 group"
        title="Agregar nuevo recuerdo"
      >
        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
        <span className="text-xs uppercase tracking-widest font-light">Agregar recuerdo</span>
      </button>

      {/* 6. VISOR EN PANTALLA COMPLETA (LIGHTBOX CON EDICIÓN Y DESCARGA) */}
      {activeMemory && (
        <div
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200 overflow-y-auto"
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
              className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 p-3 text-gray-400 hover:text-white transition-colors cursor-pointer z-50 rounded-full hover:bg-white/10"
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
              className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 p-3 text-gray-400 hover:text-white transition-colors cursor-pointer z-50 rounded-full hover:bg-white/10"
              title="Siguiente (Flecha derecha)"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}

          {/* Contenido Central */}
          <div
            className="max-w-4xl w-full flex flex-col items-center justify-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[65vh] flex items-center justify-center overflow-hidden mb-6">
              {activeMemory.type === "video" ? (
                <video
                  src={activeMemory.media_url}
                  className="max-h-[65vh] max-w-full object-contain shadow-2xl"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={activeMemory.media_url}
                  alt={activeMemory.description || "Recuerdo en grande"}
                  className="max-h-[65vh] max-w-full object-contain shadow-2xl select-none"
                />
              )}
            </div>

            {/* Metadatos y Acciones */}
            <div className="text-center max-w-xl px-4 w-full">
              {isEditing ? (
                <div className="space-y-4 mb-6 bg-white/5 p-6 border border-white/10 animate-in fade-in">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1 text-left">
                      Descripción / Frase
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Escribe la descripción de este momento..."
                      rows={2}
                      className="w-full bg-white/10 border border-white/20 p-3 text-white font-serif italic text-base focus:outline-none focus:border-white transition-colors placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1 text-left">
                      Fecha del recuerdo (Opcional)
                    </label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 p-2.5 text-white text-xs tracking-wider focus:outline-none focus:border-white transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSavingEdit}
                      className="flex items-center gap-1.5 px-5 py-2 bg-white text-black text-xs uppercase tracking-wider font-medium hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Guardar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {activeMemory.description && (
                    <p className="font-serif italic text-white text-xl md:text-2xl mb-4 leading-relaxed font-light">
                      &ldquo;{activeMemory.description}&rdquo;
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-light tracking-widest uppercase mb-4">
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
                  </div>
                </>
              )}

              {/* Barra de Acciones del Lightbox: Descargar, Editar, Eliminar */}
              {!isEditing && (
                <div className="flex items-center justify-center gap-6 pt-3 border-t border-white/10 text-xs tracking-widest uppercase">
                  {/* Botón Descargar */}
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors cursor-pointer py-1"
                    title="Descargar en máxima calidad"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar</span>
                  </button>

                  {/* Botón Editar Frase */}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors cursor-pointer py-1"
                    title="Editar texto o fecha"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  {/* Botón Eliminar */}
                  <button
                    onClick={(e) => confirmDelete(e, activeMemory.id)}
                    className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer py-1"
                    title="Eliminar este recuerdo permanentemente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              )}

              {/* Indicador de posición (ej: 1 de 2) */}
              {filteredMemories.length > 1 && !isEditing && (
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
