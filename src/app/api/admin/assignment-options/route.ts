import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

  return !profileError && profile?.role === "admin";
}

export async function GET(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabaseAdmin = getAdminClient();
    const { data: cohorts, error: cohortsError } = await supabaseAdmin
      .from("cohorts")
      .select("id, name")
      .order("name");
    if (cohortsError) throw cohortsError;

    const { data: courses, error: coursesError } = await supabaseAdmin
      .from("courses")
      .select("id, title, course_group")
      .order("title");
    if (coursesError) throw coursesError;

    const courseGroups = Array.from(
      new Set((courses || []).map((course) => course.course_group).filter(Boolean)),
    );

    const studentId = new URL(request.url).searchParams.get("studentId");
    let assignedCourseIds: string[] = [];

    if (studentId) {
      if (!UUID_PATTERN.test(studentId)) {
        return NextResponse.json({ error: "A valid student ID is required." }, { status: 400 });
      }

      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("user_id, role")
        .eq("user_id", studentId)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!profile || String(profile.role).toLowerCase() !== "student") {
        return NextResponse.json({ error: "The selected account is not a student." }, { status: 404 });
      }

      const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
        .from("enrollments")
        .select("course_id")
        .eq("student_id", studentId);
      if (enrollmentsError) throw enrollmentsError;
      assignedCourseIds = (enrollments || []).map((enrollment) => enrollment.course_id);
    }

    return NextResponse.json({
      cohorts: cohorts || [],
      courses: courses || [],
      courseGroups,
      assignedCourseIds,
    });
  } catch (err) {
    console.error("Admin assignment options error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to load cohort and course options." },
      { status: 500 },
    );
  }
}
