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

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return !error && profile?.role === "admin";
}

async function getStudentProfile(supabaseAdmin: ReturnType<typeof getAdminClient>, userId: string) {
  return supabaseAdmin
    .from("profiles")
    .select("user_id, role")
    .eq("user_id", userId)
    .maybeSingle();
}

type RouteContext = { params: Promise<{ id: string }> };

// PATCH: Change the cohort attached to an existing student profile.
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json({ error: "A valid user ID is required." }, { status: 400 });
    }

    const body = await request.json();
    const cohortId = body?.cohortId;
    if (cohortId !== null && (typeof cohortId !== "string" || !UUID_PATTERN.test(cohortId))) {
      return NextResponse.json({ error: "A valid cohort ID or null is required." }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    const { data: profile, error: profileError } = await getStudentProfile(supabaseAdmin, id);
    if (profileError) throw profileError;
    if (!profile) return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (profile.role !== "student") {
      return NextResponse.json({ error: "Only student accounts can be assigned to a cohort." }, { status: 400 });
    }

    if (cohortId) {
      const { data: cohort, error: cohortError } = await supabaseAdmin
        .from("cohorts")
        .select("id")
        .eq("id", cohortId)
        .maybeSingle();
      if (cohortError) throw cohortError;
      if (!cohort) return NextResponse.json({ error: "The selected cohort does not exist." }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ cohort_id: cohortId })
      .eq("user_id", id)
      .select("user_id, cohort_id")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, profile: data });
  } catch (err) {
    console.error("Admin cohort assignment error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to update the student's cohort." },
      { status: 500 },
    );
  }
}

// POST: Enrol an existing student in a course without disturbing existing learning data.
export async function POST(request: Request, { params }: RouteContext) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json({ error: "A valid user ID is required." }, { status: 400 });
    }

    const body = await request.json();
    const courseId = body?.courseId;
    if (typeof courseId !== "string" || !UUID_PATTERN.test(courseId)) {
      return NextResponse.json({ error: "A valid course ID is required." }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    const { data: profile, error: profileError } = await getStudentProfile(supabaseAdmin, id);
    if (profileError) throw profileError;
    if (!profile) return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (profile.role !== "student") {
      return NextResponse.json({ error: "Only student accounts can be enrolled in courses." }, { status: 400 });
    }

    const { data: course, error: courseError } = await supabaseAdmin
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .maybeSingle();
    if (courseError) throw courseError;
    if (!course) return NextResponse.json({ error: "The selected course does not exist." }, { status: 404 });

    // The unique student/course constraint makes this safe against duplicate requests.
    // ignoreDuplicates prevents an existing enrolment (and its completion state) being overwritten.
    const { error: enrollmentError } = await supabaseAdmin
      .from("enrollments")
      .upsert(
        { student_id: id, course_id: courseId },
        { onConflict: "student_id,course_id", ignoreDuplicates: true },
      );
    if (enrollmentError) throw enrollmentError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin course assignment error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to enrol the student in this course." },
      { status: 500 },
    );
  }
}
