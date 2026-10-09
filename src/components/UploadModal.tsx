"use client";
import { useState } from "react";
import { X, Image as ImageIcon, Film, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    // Mostramos un toast de carga que luego actualizaremos
    const toastId = toast.loading("Guardando recuerdo en la bóveda...");

    try {
      let fileToUpload = file;
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      // Comprimir solo si es imagen
      if (isImage) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        fileToUpload = await imageCompression(file, options);
      }

      // 1. Obtener los parámetros a firmar
      const timestamp = Math.round(new Date().getTime() / 1000);
      const paramsToSign = {
        timestamp: timestamp,
      };

      // 2. Firmar con nuestra API
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paramsToSign }),
      });
      const { signature } = await signRes.json();

      // 3. Subir a Cloudinary directamente desde el cliente
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;
      
      const cloudRes = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });
      const cloudData = await cloudRes.json();
      
      if (!cloudRes.ok) throw new Error(cloudData.error?.message || "Error al subir media");

      const mediaUrl = cloudData.secure_url;

      // 4. Guardar en Supabase
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { error: dbError } = await supabase
        .from("memories")
        .insert({
          media_url: mediaUrl,
          description: description || null,
          memory_date: date || null,
          type: isVideo ? 'video' : 'photo',
          author_id: user.id
        });

      if (dbError) throw dbError;

      toast.success("¡Recuerdo guardado para siempre!", { id: toastId });
      
      onSuccess?.();
      onClose();
      setFile(null);
      setDescription("");
      setDate("");
    } catch (error) {
      console.error(error);
      toast.error("Hubo un error al guardar el recuerdo.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md p-8 border border-gray-200 relative shadow-2xl">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-serif text-2xl mb-6 font-medium">Nuevo Recuerdo</h3>

        {/* Zona de archivo */}
        <div className="mb-6">
          <label className="block text-xs font-light tracking-widest uppercase text-gray-400 mb-2">
            Foto o Video
          </label>
          <div className="border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50/50 relative">
            <input 
              type="file" 
              accept="image/*,video/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {file ? (
              <div className="flex items-center gap-2 text-black pointer-events-none">
                {file.type.startsWith("video/") ? <Film className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
              </div>
            ) : (
              <div className="text-gray-400 pointer-events-none">
                <ImageIcon className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <span className="text-sm font-light">Toca para seleccionar</span>
              </div>
            )}
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-6">
          <label className="block text-xs font-light tracking-widest uppercase text-gray-400 mb-2">
            Descripción <span className="lowercase normal-case text-gray-300 italic">(Opcional)</span>
          </label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading}
            className="w-full border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors resize-none h-24"
            placeholder="¿Qué estaba pasando aquí...?"
          />
        </div>

        {/* Fecha opcional */}
        <div className="mb-8">
          <label className="block text-xs font-light tracking-widest uppercase text-gray-400 mb-2">
            Fecha exacta <span className="lowercase normal-case text-gray-300 italic">(Opcional)</span>
          </label>
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isUploading}
            className="w-full border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors"
          />
        </div>

        {/* Botón de subida */}
        <button 
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full py-4 bg-black text-white hover:bg-gray-800 transition-colors disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2 text-sm tracking-wide"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando...
            </>
          ) : (
            "Guardar en nuestro espacio"
          )}
        </button>
      </div>
    </div>
  );
}
