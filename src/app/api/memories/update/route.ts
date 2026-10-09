import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    // 1. Verificar autenticación
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id, description, memory_date } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID del recuerdo requerido" }, { status: 400 });
    }

    // 2. Actualizar en Supabase usando cliente administrativo
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: updateError } = await adminSupabase
      .from("memories")
      .update({
        description: description || null,
        memory_date: memory_date || null,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error al actualizar recuerdo:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error en endpoint de actualización:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
