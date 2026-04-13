import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  
  console.log("Mocked API route received quiz request for:", body?.lesson_title);

  // Return exactly what the Edge Function was mocked to return
  const mockedQuiz = {
    questions: [
      {
        question: "What is the primary function of whitespace in UI design?",
        options: ["A. Distraction", "B. Grouping and focus", "C. Adding color", "D. Decreasing speed"],
        correct_index: 1,
        explanation: "Whitespace provides breathing room and guides the user's eye."
      }
    ]
  };

  return NextResponse.json(mockedQuiz);
}
