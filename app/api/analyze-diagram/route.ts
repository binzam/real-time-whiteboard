import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

interface AnalyzeRequest {
  image: string;
  action: "explain" | "autocomplete";
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
    const body: AnalyzeRequest = await req.json();
    const { image, action, existingShapes } = body;

    const base64Data = image.replace(/^data:image\/(png|jpeg);base64,/, "");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType:
          action === "autocomplete" ? "application/json" : "text/plain",
      },
    });

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/png",
      },
    };

    let systemPrompt = "";

    if (action === "explain") {
      systemPrompt = `
        You are an expert systems architect. Analyze the provided architecture/workflow diagram.
        1. Give a concise explanation of what this diagram represents.
        2. Provide 2-3 professional suggestions for improvement, edge cases to handle, or logical next steps.
        Format your response in clean Markdown.
      `;
    } else {
      systemPrompt = `
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
              "x": number, 
              "y": number, 
              "w": 150, 
              "h": 80, 
              "color": "green" | "orange" | "red"
            }
          ],
          "arrows": [
            { "fromId": "existing_id_or_new_id", "toId": "existing_id_or_new_id" }
          ]
        }
      `;
    }

    const result = await model.generateContent([systemPrompt, imagePart]);
    const responseText = result.response.text();

    if (action === "explain") {
      return NextResponse.json({ explanation: responseText });
    } else {
      const cleanJsonText = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      return NextResponse.json(JSON.parse(cleanJsonText));
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze diagram" },
      { status: 500 },
    );
  }
}
