import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name = "",
      serviceType = "hotel",
      city = "",
      state = "",
      amenities = [],
      currentDescription = "",
      context = "",
      promptOverride = "",
    } = body;

    let apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const envPath = path.resolve(process.cwd(), ".env");
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, "utf-8");
          const match = content.match(/GEMINI_API_KEY\s*=\s*([^\r\n]+)/);
          if (match && match[1]) apiKey = match[1].trim();
        }
      } catch {}
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "GEMINI_API_KEY is missing. Please add GEMINI_API_KEY to your Vercel Environment Variables.",
        },
        { status: 500 },
      );
    }

    const amenitiesList =
      Array.isArray(amenities) && amenities.length > 0
        ? amenities.map((a: string) => a.replace(/_/g, " ")).join(", ")
        : "";

    let prompt = promptOverride;
    if (!prompt) {
      prompt = `You are a professional hospitality copywriter creating an enticing listing description for a travel & booking platform.
Listing Details:
- Name: "${name || "Our Property"}"
- Category/Type: "${serviceType}"
${city ? `- Location: ${city}${state ? `, ${state}` : ""}` : ""}
${amenitiesList ? `- Key Features & Amenities: ${amenitiesList}` : ""}
${context ? `- Additional Context: ${context}` : ""}
${currentDescription ? `- Existing Draft / Points to build upon: "${currentDescription}"` : ""}

Task: Write a captivating, welcoming, and high-converting description (2-3 paragraphs, around 130-230 words).
Focus on comfort, exceptional experience, unique hospitality, and ambiance.
Requirements:
- Do NOT include markdown headings, bullet points, asterisks, or quotes around the text.
- Do NOT include placeholders like "[Insert Date]" or "[Contact Number]".
- Output pure, ready-to-publish plain text paragraphs.`;
    }

    // Try modern active Gemini models
    const modelsToTry = [
      "gemini-3.8-flash",
      "gemini-2.5-flash-lite",
      "gemini-flash-latest",
    ];
    let generatedText = "";
    let lastError = "";

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2000,
            },
          }),
        });
        clearTimeout(timeoutId);

        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          generatedText = data.candidates[0].content.parts[0].text.trim();
          break;
        } else {
          lastError =
            data.error?.message || `HTTP ${response.status} from ${model}`;
        }
      } catch (err: any) {
        lastError = err.message || "Fetch failed";
      }
    }

    if (!generatedText) {
      return NextResponse.json(
        {
          success: false,
          message: lastError || "Failed to generate description with Gemini.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      description: generatedText,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
