import { NextRequest, NextResponse } from "next/server";
import { qrPayloadForBooking, qrPngBuffer } from "@/lib/qr";

function getAppUrl(req: NextRequest): string {
  const explicit = process.env.APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  const payload = qrPayloadForBooking(getAppUrl(req), token);
  const png = await qrPngBuffer(payload);
  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=604800, immutable",
      "Content-Length": String(png.length),
    },
  });
}
