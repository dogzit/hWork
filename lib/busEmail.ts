import { bookingEmailTemplate, sendMail } from "@/lib/mailer";
import { qrPayloadForBooking, qrPngBuffer } from "@/lib/qr";

export function getAppUrlFromRequest(req: {
  headers: { get(name: string): string | null };
}): string {
  const explicit = process.env.APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

/** Build + send a booking confirmation email for a given booking. */
export async function sendBookingEmail(args: {
  appUrl: string;
  to: string;
  seatId: string;
  userName: string;
  qrToken: string;
  status: "APPROVED" | "PENDING";
}) {
  const qrPayload = qrPayloadForBooking(args.appUrl, args.qrToken);
  const selfHostedQrUrl = `${args.appUrl}/api/qr/${encodeURIComponent(args.qrToken)}`;
  const ticketUrl = qrPayload;
  const attachmentBuf = await qrPngBuffer(qrPayload).catch(() => null);

  const { subject, html, text } = bookingEmailTemplate({
    seatId: args.seatId,
    userName: args.userName,
    qrImageUrl: selfHostedQrUrl,
    qrDataUrl: null,
    ticketUrl,
    status: args.status,
  });

  return sendMail({
    to: args.to,
    subject,
    html,
    text,
    attachments: attachmentBuf
      ? [
          {
            filename: `bus-qr-${args.seatId}.png`,
            content: attachmentBuf,
          },
        ]
      : undefined,
  });
}
