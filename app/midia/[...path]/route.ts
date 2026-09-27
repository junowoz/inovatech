import { NextResponse, type NextRequest } from "next/server";

import { getObject } from "@/lib/storage";

export const dynamic = "force-dynamic";

/** Streams a public media object from R2. Backs `NEXT_PUBLIC_MIDIA_URL=/midia/`. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = path.join("/");
  const match =
    /^(?:logo|team|product)\/[a-z0-9-]+\/[a-z0-9_.-]+\.(jpe?g|png|webp)$/i.exec(
      key
    );
  if (!match) return new NextResponse("Not found", { status: 404 });

  const object = await getObject(key);

  if (!object) {
    return new NextResponse("Not found", { status: 404 });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    match[1].toLowerCase() === "png"
      ? "image/png"
      : match[1].toLowerCase() === "webp"
        ? "image/webp"
        : "image/jpeg"
  );
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Content-Security-Policy", "sandbox; default-src 'none'");
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new NextResponse(object.body, { headers });
}
