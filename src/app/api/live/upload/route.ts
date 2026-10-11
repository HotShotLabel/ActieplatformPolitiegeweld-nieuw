/* Geeft de telefoon van de uitzender toestemming om de opname rechtstreeks
   naar de opslag te sturen (grote bestanden, zonder omweg via de server). */

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const uitkomst = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("uitzendingen/")) {
          throw new Error("Onbekende bestemming.");
        }
        return {
          allowedContentTypes: [
            "video/webm",
            "video/mp4",
            "video/webm;codecs=vp8,opus",
            "video/webm;codecs=vp9,opus",
            "video/mp4;codecs=avc1",
          ],
          maximumSizeInBytes: 2 * 1024 * 1024 * 1024, // 2 GB
          addRandomSuffix: true,
          validUntil: Date.now() + 3 * 60 * 60 * 1000,
        };
      },
    });
    return Response.json(uitkomst);
  } catch (fout) {
    return Response.json(
      { error: (fout as Error).message },
      { status: 400 }
    );
  }
}
