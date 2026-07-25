import { NextResponse, NextRequest } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/models";
import {
  handleAuthorizationV2,
  AuthorizationError,
} from "@/lib/handleAuthorization";
import { incrementAndLogTokenUsage } from "@/lib/incrementAndLogTokenUsage";
import {
  normalizeVisionImage,
  validateVisionImageInput,
} from "@/lib/vision-image";

export const maxDuration = 300; // Vision models can be slower for complex images

export async function POST(request: NextRequest) {
  try {
    const { userId } = await handleAuthorizationV2(request);
    const payload = await request.json();

    const validation = validateVisionImageInput(payload?.image);
    if (validation.ok === false) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }

    const model = getModel();

    const defaultInstruction =
      "Extract all text from the image comprehensively, preserving formatting. Focus only on extracting readable text, not describing visual elements.";
    const responseInstruction = "Respond with only the extracted text.";

    const promptText = payload.instructions?.trim()
      ? `${defaultInstruction} ${payload.instructions} ${responseInstruction}`
      : `${defaultInstruction} ${responseInstruction}`;

    const response = await generateText({
      model: model as any,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            {
              type: "image",
              image: normalizeVisionImage(
                validation.base64,
                validation.mediaType
              ),
            },
          ],
        },
      ],
    });

    const tokens =
      response.usage?.totalTokens ??
      Math.ceil((response.text?.length ?? 0) / 4);

    try {
      await incrementAndLogTokenUsage(userId, tokens);
    } catch (error) {
      console.error("Failed to increment token usage for vision:", error);
    }

    return NextResponse.json({ text: response.text });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      "message" in error
    ) {
      return NextResponse.json(
        { error: (error as { message: string }).message },
        { status: (error as { status?: number }).status || 500 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
