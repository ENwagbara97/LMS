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
    const { lessonId, title } = await req.json()

    // SKELETON: Calling Gemini API would happen here
    // const resources = await callGemini(title)
    
    const mockResources = [
      { title: "The 8pt Grid Guide", url: "https://spec.fm/specifics/8-pt-grid", type: "article", source: "Spec.fm" },
      { title: "Grid System Cheat Sheet", url: "#", type: "pdf", source: "Design Course" },
      { title: "Layout Grid Calculator", url: "https://gridcalc.com", type: "tool", source: "External Tool" },
      { title: "Typography Scale Theory", url: "https://type-scale.com", type: "article", source: "Jeremy Church" },
      { title: "Spacing in Design Systems", url: "https://medium.com", type: "video", source: "Medium" }
    ]

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabaseAdmin
      .from('lessons')
      .update({ ai_resources_json: mockResources })
      .eq('id', lessonId)

    if (error) throw error

    return new Response(JSON.stringify({ success: true, resources: mockResources }), {
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
