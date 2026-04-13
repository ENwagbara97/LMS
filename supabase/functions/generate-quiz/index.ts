import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Gemini API integration stub
serve(async (req) => {
  const { lesson_title, lesson_description, course_name, difficulty_level, lesson_duration_seconds } = await req.json()
  
  console.log(`Generating quiz via Gemini for ${lesson_title}`)

  // Mocked successful Gemini JSON response
  const mockedQuiz = {
    questions: [
      {
        question: "What is the primary function of whitespace in UI design?",
        options: ["A. Distraction", "B. Grouping and focus", "C. Adding color", "D. Decreasing speed"],
        correct_index: 1,
        explanation: "Whitespace provides breathing room and guides the user's eye."
      }
    ]
  }

  return new Response(
    JSON.stringify(mockedQuiz),
    { headers: { "Content-Type": "application/json" } },
  )
})
