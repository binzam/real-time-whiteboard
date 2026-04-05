import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const systemPrompt = `
      You are an expert systems architect and diagram generator. 
      Convert the user's prompt into a logical diagram.
      Return ONLY a JSON object with this exact schema:
      {
        "shapes": [
          { 
            "id": "unique_string_id", 
            "type": "geo", 
            "geo": "rectangle" | "diamond" | "ellipse", 
            "text": "Brief label", 
            "w": 150, 
            "h": 80, 
            "color": "blue" | "light-violet" | "green" | "red" | "orange"
          }
        ],
        "arrows": [
          { "fromId": "id_of_source_shape", "toId": "id_of_target_shape" }
        ]
      }
      CRITICAL DIMENSION RULES:
      - You MUST calculate 'w' (width) dynamically based on the length of the 'text' property.
      - Use this heuristic for width: w = (character count of text * 10) + 50. 
      - Ensure the minimum 'w' is never less than 120.
      - Default 'h' (height) to 80. If the text is longer than 25 characters, increase 'h' to 120 to allow for text wrapping.
      
      Do not include x or y coordinates. Do not use markdown backticks.
    `;

    const result = await model.generateContent([systemPrompt, prompt]);
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json\n?|```/g, "").trim();

    return NextResponse.json(JSON.parse(cleanedText));
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate diagram" },
      { status: 500 },
    );
  }
}
