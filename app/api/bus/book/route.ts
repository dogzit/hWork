import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrToken, qrPayloadForBooking, qrPngBuffer } from "@/lib/qr";
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

function isValidEmail(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) &&
    v.length <= 254
  );
}

export async function POST(req: NextRequest) {
  try {
    const userName = req.headers.get("x-user-name");
    if (!userName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const seatId = (body as { seatId?: unknown }).seatId;
    const emailRaw = (body as { email?: unknown }).email;

    if (!seatId || typeof seatId !== "string") {
      return NextResponse.json(
        { error: "seatId шаардлагатай" },
        { status: 400 },
      );
    }
    if (!isValidEmail(emailRaw)) {
      return NextResponse.json(
        { error: "Хүчинтэй email оруулна уу" },
        { status: 400 },
      );
    }

    const email = emailRaw.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { name: userName } });
    if (!user) {
      return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 });
    }

    const currentUserEmail = user.email?.toLowerCase() ?? null;
    if (!currentUserEmail || currentUserEmail !== email) {
      return NextResponse.json(
        {
          error: "EMAIL_NOT_VERIFIED",
          message: "Энэ email-ийг эхлээд OTP-ээр баталгаажуулна уу",
        },
        { status: 403 },
      );
    }

    const layout = await prisma.busLayout.findUnique({ where: { seatId } });
    if (!layout) {
      return NextResponse.json({ error: "Ийм суудал байхгүй" }, { status: 404 });
    }

    const status = layout.isPremium ? "PENDING" : "APPROVED";
    const qrToken = generateQrToken();

    let booking;
    try {
      booking = await prisma.$transaction(async (tx) => {
        const existing = await tx.busBooking.findUnique({ where: { seatId } });
        if (existing && existing.userName !== userName) {
          throw new Error("SEAT_TAKEN");
        }

        // 1 хүн 1 суудал: өөр суудал аль хэдийн захиалсан бол зөвшөөрөхгүй
        const ownBooking = await tx.busBooking.findFirst({
          where: { userName, NOT: { seatId } },
        });
        if (ownBooking) {
          throw new Error("ALREADY_BOOKED");
        }

        return tx.busBooking.upsert({
          where: { seatId },
          update: { email, status, qrToken },
          create: {
            seatId,
            userName,
            email,
            status,
            qrToken,
          },
        });
      });
    } catch (err) {
      if (err instanceof Error && err.message === "SEAT_TAKEN") {
        return NextResponse.json(
          { error: "Энэ суудал захиалагдсан байна" },
          { status: 409 },
        );
      }
      if (err instanceof Error && err.message === "ALREADY_BOOKED") {
        return NextResponse.json(
          {
            error:
              "Та аль хэдийн нэг суудал захиалсан байна. Шинээр захиалахын тулд өмнөх захиалгаа цуцлаа уу.",
            code: "ALREADY_BOOKED",
          },
          { status: 409 },
        );
      }
      throw err;
    }

    const appUrl = getAppUrl(req);
    const qrPayload = qrPayloadForBooking(appUrl, booking.qrToken);
    const selfHostedQrUrl = `${appUrl}/api/qr/${encodeURIComponent(booking.qrToken)}`;
    const ticketUrl = qrPayload;

    const attachmentBuf = await qrPngBuffer(qrPayload).catch(() => null);

    const { subject, html, text } = bookingEmailTemplate({
      seatId: booking.seatId,
      userName: booking.userName,
      qrImageUrl: selfHostedQrUrl,
      qrDataUrl: null,
      ticketUrl,
      status: status as "APPROVED" | "PENDING",
    });

    const mailRes = await sendMail({
      to: email,
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

    return NextResponse.json({
      success: true,
      booking: {
        seatId: booking.seatId,
        status: booking.status,
      },
      email: {
        sent: mailRes.ok,
        dev: mailRes.ok && "dev" in mailRes ? mailRes.dev : false,
      },
    });
  } catch (error) {
    console.error("Bus book error:", error);
    return NextResponse.json(
      { error: "Захиалга үүсгэхэд алдаа гарлаа" },
      { status: 500 },
    );
  }
}
