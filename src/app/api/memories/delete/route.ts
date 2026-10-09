import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    // 1. Verificar que el usuario que hace la petición esté autenticado
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID del recuerdo requerido" }, { status: 400 });
    }

    // 2. Usar cliente admin para borrar el registro de la tabla
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: deleteError } = await adminSupabase
      .from("memories")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error al eliminar recuerdo:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error en endpoint de eliminación:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
