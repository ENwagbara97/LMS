import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Supabase admin configuration is missing.");

  return createSupabaseAdmin(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function isAdmin() {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return false;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return !profileError && String(profile?.role || "").toLowerCase() === "admin";
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("cohorts")
      .select("id, name, start_date, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      { cohorts: data || [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("Admin cohort list error:", err);
    return NextResponse.json(
      { error: "Unable to load cohorts. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "Enter a cohort name." }, { status: 400 });
    }
    if (name.length > 100) {
      return NextResponse.json({ error: "Cohort names must be 100 characters or fewer." }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("cohorts")
      .select("id, name");
    if (lookupError) throw lookupError;

    const duplicate = (existing || []).some(
      (cohort) => String(cohort.name || "").trim().toLocaleLowerCase() === name.toLocaleLowerCase(),
    );
    if (duplicate) {
      return NextResponse.json(
        { error: "A cohort with that name already exists." },
        { status: 409 },
      );
    }

    const { data: cohort, error: insertError } = await supabaseAdmin
      .from("cohorts")
      .insert({ name })
      .select("id, name, start_date, created_at")
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ cohort }, { status: 201 });
  } catch (err) {
    console.error("Admin cohort creation error:", err);
    return NextResponse.json(
      { error: "Unable to create this cohort. Please try again." },
      { status: 500 },
    );
  }
}
