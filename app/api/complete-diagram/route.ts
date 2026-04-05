import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

interface CompleteDiagramRequest {
  image: string;
  existingShapes: Array<{
    id: string;
    type: string;
    x: number;
    y: number;
    text?: string;
  }>;
}

export async function POST(req: Request) {
  try {
    const body: CompleteDiagramRequest = await req.json();
    const { image, existingShapes } = body;

    const base64Data = image.replace(/^data:image\/(png|jpeg);base64,/, "");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/png",
      },
    };

    const systemPrompt = `
        You are an expert diagram generator. The user wants to auto-complete their current diagram.
        Attached is an image of the current diagram, and here is the JSON of existing shapes for coordinate context:
        ${JSON.stringify(existingShapes)}
        
        Analyze the flow and logically ADD the next necessary components. 
        IMPORTANT: Position the new shapes logically (e.g., to the right or below the existing shapes) based on the provided X/Y coordinates so they do not overlap.
        
        Return ONLY a JSON object with this exact schema for the NEW elements:
        {
          "shapes": [
            { 
              "id": "unique_string_id", 
              "type": "geo", 
              "geo": "rectangle" | "diamond", 
              "text": "Label", 
              "w": 150, 
              "h": 80, 
              "color": "green" | "orange" | "red"
            }
          ],
          "arrows": [
            { "fromId": "existing_id_or_new_id", "toId": "existing_id_or_new_id" }
          ]
        }
        CRITICAL DIMENSION RULES:
      - You MUST calculate 'w' (width) dynamically based on the length of the 'text' property.
      - Use this heuristic for width: w = (character count of text * 10) + 50. 
      - Ensure the minimum 'w' is never less than 120.
      - Default 'h' (height) to 80. If the text is longer than 25 characters, increase 'h' to 120 to allow for text wrapping.
      
      Do not include x or y coordinates. Do not use markdown backticks.
      `;

    const result = await model.generateContent([systemPrompt, imagePart]);
    const responseText = result.response.text();

    const cleanJsonText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return NextResponse.json(JSON.parse(cleanJsonText));
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to complete diagram" },
      { status: 500 },
    );
  }
}
