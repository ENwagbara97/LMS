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

    // 1. Call Gemini API
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    const prompt = `Generate a timestamped text transcript for a lesson titled "${title}" with description "${description}". Your transcript should have at least 5 major milestones. Format as a JSON array of objects with "timestamp" (string like "02:15") and "text" (string) fields. Return ONLY the JSON array.`
    
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    })

    const geminiData = await geminiRes.json()
    const aiText = geminiData.candidates[0].content.parts[0].text
    const transcript = JSON.parse(aiText)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabaseAdmin
      .from('lessons')
      .update({ transcript_json: transcript })
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
