import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Webhook payload standard handler
serve(async (req) => {
  const { record } = await req.json()
  
  // Logic to send welcome email via Resend API using supabase triggered webhook
  console.log("Mock sending welcome email to user:", record?.email)

  return new Response(
    JSON.stringify({ success: true, message: `Welcome email mock payload` }),
    { headers: { "Content-Type": "application/json" } },
  )
})
