import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Get users with reminders enabled
  const { data: users } = await supabaseAdmin
    .from('profiles')
    .select('user_id, full_name, email, preferences_json')

  if (!users) return new Response("No users found", { status: 200 })

  const results = []
  const lastWeek = new Date()
  lastWeek.setDate(lastWeek.getDate() - 7)

  for (const user of users) {
    // Check if reminders are enabled in JSON
    const prefs = user.preferences_json as any
    if (!prefs?.reminders) continue;

    // 2. Fetch progress in last 7 days
    const { data: progress } = await supabaseAdmin
      .from('lesson_progress')
      .select('watch_percent, updated_at')
      .eq('student_id', user.user_id)
      .gt('updated_at', lastWeek.toISOString())

    const lessonCount = progress?.length || 0
    let subject = ""
    let body = ""

    if (lessonCount === 0) {
      subject = "We miss you at Kreativhub!"
      body = `Hi ${user.full_name}, jump back into your UI Design journey today. Your next lesson is waiting!`
    } else if (lessonCount >= 5) {
      subject = "You're crushing it! 🚀"
      body = `Hi ${user.full_name}, you completed ${lessonCount} sessions this week. You're among our top learners!`
    } else {
      continue; 
    }

    // 3. Send via Resend (Stubbed for security, requires RESEND_API_KEY)
    const apiKey = Deno.env.get('RESEND_API_KEY')
    if (apiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          from: 'Kreativhub Academy <academy@kreativhub.io>',
          to: user.email,
          subject: subject,
          html: `
            <div style="font-family: sans-serif; padding: 40px; color: #0f172a;">
              <h1 style="font-size: 24px;">${subject}</h1>
              <p style="font-size: 16px; color: #4b5563;">${body}</p>
              <a href="https://lms.kreativhub.io/student" style="display: inline-block; padding: 12px 24px; background: #0f4ff1; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">
                Resume Learning
              </a>
            </div>
          `
        })
      })
      results.push({ user: user.email, sent: res.ok })
    }
  }

  return new Response(
    JSON.stringify({ success: true, results }),
    { headers: { "Content-Type": "application/json" } },
  )
})
