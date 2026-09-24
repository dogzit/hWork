import { NextResponse } from "next/server";
import { qrPngBuffer } from "@/lib/qr";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  const png = await qrPngBuffer(token);
  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=604800, immutable",
      "Content-Length": String(png.length),
    },
  });
}
