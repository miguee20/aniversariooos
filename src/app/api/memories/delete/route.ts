import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary con llaves del servidor
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function extractPublicId(url: string): string | null {
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const afterUpload = parts[1];
    // Quitar prefijo de versión tipo v1791515044/
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");
    // Quitar extensión del archivo (.jpg, .mp4, etc.)
    const lastDotIndex = withoutVersion.lastIndexOf(".");
    if (lastDotIndex === -1) return withoutVersion;
    return withoutVersion.substring(0, lastDotIndex);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // 1. Verificar autenticación
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID del recuerdo requerido" }, { status: 400 });
    }

    // 2. Obtener el recuerdo para saber su URL de Cloudinary y tipo
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: memory, error: fetchError } = await adminSupabase
      .from("memories")
      .select("media_url, type")
      .eq("id", id)
      .single();

    if (fetchError || !memory) {
      return NextResponse.json({ error: "Recuerdo no encontrado" }, { status: 404 });
    }

    // 3. Eliminar archivo de Cloudinary si existe media_url
    if (memory.media_url) {
      const publicId = extractPublicId(memory.media_url);
      if (publicId) {
        try {
          const resourceType = memory.type === "video" ? "video" : "image";
          const cloudResult = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
          });
          console.log(`Cloudinary destroy (${publicId}):`, cloudResult);
        } catch (cloudErr) {
          console.error("Error al eliminar archivo en Cloudinary:", cloudErr);
          // Continuamos para no trabar el borrado de la base de datos
        }
      }
    }

    // 4. Eliminar registro en Supabase
    const { error: deleteError } = await adminSupabase
      .from("memories")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error al eliminar recuerdo de Supabase:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error en endpoint de eliminación:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
