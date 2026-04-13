import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lessonId, title, description } = await req.json()

    // SKELETON: Calling Gemini API would happen here
    // const transcript = await callGemini(title, description)
    
    const mockTranscript = [
      { timestamp: "00:00", text: "Welcome to this lesson on Typography and Grids." },
      { timestamp: "02:15", text: "We will start by looking at the 8pt grid system." },
      { timestamp: "05:40", text: "Now, let's discuss line height and letter spacing." },
      { timestamp: "10:12", text: "Finally, we'll implement a responsive grid in Figma." }
    ]

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabaseAdmin
      .from('lessons')
      .update({ transcript_json: mockTranscript })
      .eq('id', lessonId)

    if (error) throw error

    return new Response(JSON.stringify({ success: true, transcript: mockTranscript }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
