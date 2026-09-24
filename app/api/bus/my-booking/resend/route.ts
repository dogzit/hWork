import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { qrPayloadForBooking, qrPngBuffer } from "@/lib/qr";
import { bookingEmailTemplate, sendMail } from "@/lib/mailer";

function getAppUrl(req: NextRequest): string {
  const explicit = process.env.APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    const userName = req.headers.get("x-user-name");
    if (!userName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await prisma.busBooking.findFirst({
      where: { userName },
      orderBy: { createdAt: "desc" },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Захиалга олдсонгүй" },
        { status: 404 },
      );
    }

    const appUrl = getAppUrl(req);
    const qrPayload = qrPayloadForBooking(appUrl, booking.qrToken);
    const selfHostedQrUrl = `${appUrl}/api/qr/${encodeURIComponent(booking.qrToken)}`;
    const ticketUrl = qrPayload;
    const attachmentBuf = await qrPngBuffer(qrPayload).catch(() => null);

    const status = booking.status === "PENDING" ? "PENDING" : "APPROVED";
    const { subject, html, text } = bookingEmailTemplate({
      seatId: booking.seatId,
      userName: booking.userName,
      qrImageUrl: selfHostedQrUrl,
      qrDataUrl: null,
      ticketUrl,
      status,
    });

    const mailRes = await sendMail({
      to: booking.email,
      subject,
      html,
      text,
      attachments: attachmentBuf
        ? [
            {
              filename: `bus-qr-${booking.seatId}.png`,
              content: attachmentBuf,
            },
          ]
        : undefined,
    });

    if (!mailRes.ok) {
      return NextResponse.json(
        { error: "Email илгээхэд алдаа гарлаа" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      email: booking.email,
      dev: "dev" in mailRes ? mailRes.dev : false,
    });
  } catch (e) {
    console.error("resend booking email error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
