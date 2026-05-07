import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';

const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseServiceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
};

const checkAdmin = async () => {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return profile?.role === 'admin';
};

// ── POST: Create a new user ──────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, email, role, learning_path, assigned_course_groups, assigned_level } = await req.json();
    const supabaseAdmin = getAdminClient();

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: 'TemporaryPassword123!',
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already exists')) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
      }
      throw authError;
    }

    const userId = authData.user.id;

    // 1. Create Profile
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      user_id: userId,
      full_name: name,
      email: email,
      role: role === 'Instructor' ? 'admin' : 'student',
      cohort_id: learning_path || null,
      assigned_course_groups: assigned_course_groups || [],
      assigned_level: assigned_level || null
    });

    if (profileError) throw profileError;

    // 2. Automate Enrollment if it's a student and groups are assigned
    if (role === 'Student' && assigned_course_groups?.length > 0) {
      const { data: coursesToEnroll } = await supabaseAdmin
        .from('courses')
        .select('id')
        .in('course_group', assigned_course_groups);

      if (coursesToEnroll && coursesToEnroll.length > 0) {
        const enrollments = coursesToEnroll.map(c => ({
          student_id: userId,
          course_id: c.id,
          status: 'active'
        }));
        await supabaseAdmin.from('enrollments').insert(enrollments);
      }
    }

    // 3. Call the welcome email Edge Function (FIX 10F)
    try {
      await supabaseAdmin.functions.invoke('send-welcome-email', {
        body: {
          email: email,
          full_name: name,
          temp_password: 'TemporaryPassword123!', // The password used in createUser
        },
      });
    } catch (emailErr) {
      console.warn('Welcome email failed:', emailErr);
    }

    return NextResponse.json({ success: true, user_id: userId });

  } catch (err: any) {
    console.error("Admin POST Error:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ── DELETE: Remove a user from Auth + profiles cascade ──────────────────────
export async function DELETE(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    if (!userId) return NextResponse.json({ error: 'user_id is required' }, { status: 400 });

    const supabaseAdmin = getAdminClient();

    // Deleting the auth user will cascade-delete the profiles row via FK
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

