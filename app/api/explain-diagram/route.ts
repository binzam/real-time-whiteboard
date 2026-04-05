import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

interface ExplainDiagramRequest {
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
    const body: ExplainDiagramRequest = await req.json();
    const { image, existingShapes } = body;

    const base64Data = image.replace(/^data:image\/(png|jpeg);base64,/, "");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "text/plain",
      },
    });

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/png",
      },
    };
      const systemPrompt = `
        You are an expert systems architect. Analyze the provided architecture/workflow diagram.
        
        To assist you, here is the exact JSON data of the shapes and text currently on the canvas:
        ${JSON.stringify(existingShapes, null, 2)}

        1. Give a concise explanation of what this diagram represents.
        2. Provide 2-3 professional suggestions for improvement, edge cases to handle, or logical next steps.
        Format your response in clean Markdown.
      `;

    const result = await model.generateContent([systemPrompt, imagePart]);
    const responseText = result.response.text();

    return NextResponse.json({ explanation: responseText });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze diagram" },
      { status: 500 },
    );
  }
}
