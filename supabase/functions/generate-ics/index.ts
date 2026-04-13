import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Generate .ics calendar block string
serve(async (req) => {
  const { title, date, durationMinutes } = await req.json()
  
  const icsBody = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${date}
END:VEVENT
END:VCALENDAR`

  return new Response(icsBody, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="kreative_hub_event.ics"`,
    },
  })
})
