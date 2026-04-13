import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { record, old_record } = await req.json()
  
  if (!old_record) {
    console.log("New project submission. Notifying Admin.");
  } else {
    console.log("Project reviewed. Notifying Student: status =", record?.status);
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } },
  )
})
