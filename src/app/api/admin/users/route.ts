import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";

const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase admin configuration is missing.");
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

const checkAdmin = async () => {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return false;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return !error && String(profile?.role || "").toLowerCase() === "admin";
};

// POST: Create a new Auth user and its LMS profile.
export async function POST(req: Request) {
  let supabaseAdmin: ReturnType<typeof getAdminClient> | null = null;
  let newlyCreatedUserId: string | null = null;

  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const requestedRole = typeof body?.role === "string" ? body.role.trim().toLowerCase() : "";
    const learningPath = typeof body?.learning_path === "string" && body.learning_path
      ? body.learning_path
      : null;
    const assignedGroups = Array.isArray(body?.assigned_course_groups)
      ? body.assigned_course_groups.filter((value: unknown): value is string => typeof value === "string")
      : [];

    if (!name || name.length > 150) {
      return NextResponse.json({ error: "Enter a valid name (150 characters or fewer)." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!["student", "instructor"].includes(requestedRole)) {
      return NextResponse.json({ error: "Choose Student or Instructor." }, { status: 400 });
    }

    supabaseAdmin = getAdminClient();
    const temporaryPassword = randomBytes(32).toString("base64url");

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
    });

    if (authError) {
      if (/already registered|already exists|duplicate/i.test(authError.message)) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
      console.error("Admin user Auth creation failed:", {
        message: authError.message,
        code: authError.code,
        status: authError.status,
      });
      return NextResponse.json({ error: "Supabase could not create the account. Check the email and try again." }, { status: 400 });
    }

    newlyCreatedUserId = authData.user.id;

    const profilePayload = {
      user_id: newlyCreatedUserId,
      full_name: name,
      email,
      role: requestedRole === "instructor" ? "admin" : "student",
      cohort_id: requestedRole === "student" ? learningPath : null,
      assigned_course_groups: requestedRole === "student" ? assignedGroups : [],
      assigned_level: requestedRole === "student" && typeof body?.assigned_level === "string"
        ? body.assigned_level
        : null,
    };

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert(profilePayload);

    if (profileError) {
      console.error("Admin user profile insert failed:", {
        userId: newlyCreatedUserId,
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
      });

      // This Auth account was created by this request and has no profile.
      // Remove only this newly-created account to avoid leaving an orphan.
      const { error: cleanupError } = await supabaseAdmin.auth.admin.deleteUser(newlyCreatedUserId);
      if (cleanupError) {
        console.error("Cleanup of newly-created Auth account failed:", {
          userId: newlyCreatedUserId,
          message: cleanupError.message,
          code: cleanupError.code,
        });
      }
      return NextResponse.json(
        { error: "The account was created but its LMS profile could not be saved. The system has attempted to clean up the incomplete account. Please retry or contact support if this continues." },
        { status: 500 },
      );
    }

    const warnings: string[] = [];

    // Course-group enrolment is a separate operation. Use only columns present
    // in the repository schema: student_id and course_id.
    if (requestedRole === "student" && assignedGroups.length > 0) {
      const { data: coursesToEnroll, error: courseLookupError } = await supabaseAdmin
        .from("courses")
        .select("id")
        .in("course_group", assignedGroups);

      if (courseLookupError) {
        console.error("Admin user course-group lookup failed:", {
          userId: newlyCreatedUserId,
          message: courseLookupError.message,
          code: courseLookupError.code,
          details: courseLookupError.details,
        });
        warnings.push("The profile was created, but matching courses could not be loaded. Assign courses from the student drawer.");
      } else if (!coursesToEnroll?.length) {
        warnings.push("The profile was created, but no courses matched the selected course groups. Check course groups in Manage Courses.");
      } else {
        const enrolmentRows = coursesToEnroll.map((course) => ({
          student_id: newlyCreatedUserId,
          course_id: course.id,
        }));
        const { error: enrolmentError } = await supabaseAdmin
          .from("enrollments")
          .upsert(enrolmentRows, {
            onConflict: "student_id,course_id",
            ignoreDuplicates: true,
          });

        if (enrolmentError) {
          console.error("Admin user automatic enrolment failed:", {
            userId: newlyCreatedUserId,
            message: enrolmentError.message,
            code: enrolmentError.code,
            details: enrolmentError.details,
          });
          warnings.push("The profile was created, but automatic course enrolment failed. Assign courses from the student drawer.");
        }
      }
    }

    // Welcome email is best-effort and must not roll back a valid account/profile.
    const { error: welcomeEmailError } = await supabaseAdmin.functions.invoke("send-welcome-email", {
      body: { email, full_name: name, temp_password: temporaryPassword },
    });
    if (welcomeEmailError) {
      console.warn("Welcome email function returned an error:", {
        userId: newlyCreatedUserId,
        message: welcomeEmailError.message,
      });
      warnings.push("The account was created, but the welcome email could not be sent. Please arrange a password reset.");
    }

    return NextResponse.json(
      { success: true, user_id: newlyCreatedUserId, warnings },
      { status: 201 },
    );
  } catch (err) {
    console.error("Admin user creation request failed:", err);
    return NextResponse.json(
      { error: "Unable to create the user. Please check the details and try again." },
      { status: 500 },
    );
  }
}

// DELETE: Retained existing admin deletion behaviour.
export async function DELETE(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    if (!userId) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("Admin user deletion failed:", {
        userId,
        message: deleteError.message,
        code: deleteError.code,
      });
      return NextResponse.json({ error: "Unable to delete this user." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin user deletion request failed:", err);
    return NextResponse.json({ error: "Unable to delete this user." }, { status: 500 });
  }
}
