import { gemini } from "@/lib/gemini";

export const runtime = "edge";

export async function POST() {
  try {
    const prompt = `
Generate exactly three engaging anonymous questions.

Rules:
- Return ONLY the questions.
- Separate them with ||
- Do not use numbering.
- Keep them friendly.
- Avoid sensitive topics.
`;

    const result = await gemini.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }

          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Failed to generate questions",
      },
      {
        status: 500,
      }
    );
  }
}