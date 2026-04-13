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
    // const overview = await callGemini(title, description)
    
    const mockOverview = "In this comprehensive lesson, we delve into the core principles of Typography layouts and the 8pt Grid system. You will learn how to maintain visual consistency across your interfaces by applying mathematical spacing rules. By the end of this session, you'll be able to create clean, professional-grade layouts that align perfectly to standard design grids."

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabaseAdmin
      .from('lessons')
      .update({ ai_overview: mockOverview })
      .eq('id', lessonId)

    if (error) throw error

    return new Response(JSON.stringify({ success: true, overview: mockOverview }), {
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
