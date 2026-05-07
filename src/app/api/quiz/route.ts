import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createClient();

  // Invoke the Edge Function 'generate-quiz'
  try {
    const { data, error } = await supabase.functions.invoke('generate-quiz', {
      body: {
        lesson_title: body?.lesson_title,
        lesson_description: body?.lesson_description,
        course_name: body?.course_name,
        difficulty_level: body?.difficulty_level,
        lesson_duration_seconds: body?.lesson_duration_seconds
      }
    });

    if (error) {
      console.error("Edge Function error:", error);
      throw error;
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Quiz API Route error:", err);
    // Fallback if Edge Function fails or isn't deployed
    return NextResponse.json({
      error: "Failed to generate quiz via AI",
      questions: [
        {
          question: "When applying the 8pt grid system to a layout, which of the following internal paddings is considered invalid?",
          options: ["15px", "32px", "24px", "16px"],
          correct_index: 0,
          explanation: "In an 8pt grid system, all dimensions must be multiples of 8. 15 is not a multiple of 8."
        }
      ]
    });
  }
}
