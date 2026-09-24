import QRCode from "qrcode";
import { randomBytes, createHash } from "crypto";

export function generateQrToken(): string {
  return randomBytes(24).toString("base64url");
}

export function generateOtpCode(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return String(n).padStart(6, "0");
}

export function hashCode(code: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${code}`).digest("hex");
}

export function otpSalt(): string {
  return randomBytes(8).toString("hex");
}

// H-level EC = 30% damage tolerance, works well even in bad lighting / low print quality.
const DEFAULT_OPTS = {
  errorCorrectionLevel: "H" as const,
  margin: 2,
  width: 768,
  color: { dark: "#0f172a", light: "#ffffff" }, // slate-900 on white
};

export async function qrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, DEFAULT_OPTS);
}

export async function qrPngBuffer(payload: string): Promise<Buffer> {
  return QRCode.toBuffer(payload, DEFAULT_OPTS);
}

/**
 * SVG with a centered emoji "badge" inside the QR quiet zone.
 * H-level EC allows ~30% of the modules to be obscured — a small centered badge
 * (max ~15% of QR area) is safely recoverable.
 */
export async function qrSvgWithBadge(payload: string, badge = "🚌"): Promise<string> {
  const svg = await QRCode.toString(payload, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  // Inject a rounded white square with an emoji badge in the middle.
  // The generated SVG has a viewBox like "0 0 33 33" — center is w/2.
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
  if (!viewBoxMatch) return svg;
  const [, viewBox] = viewBoxMatch;
  const parts = viewBox.split(/\s+/).map(Number);
  const size = parts[2] || 33;
  const cx = size / 2;
  const cy = size / 2;
  const boxSize = size * 0.22;
  const boxX = cx - boxSize / 2;
  const boxY = cy - boxSize / 2;
  const emojiSize = boxSize * 0.7;

  const overlay = `<rect x="${boxX}" y="${boxY}" width="${boxSize}" height="${boxSize}" rx="${boxSize * 0.18}" ry="${boxSize * 0.18}" fill="#ffffff" stroke="#0f172a" stroke-width="0.3"/><text x="${cx}" y="${cy + emojiSize * 0.35}" font-size="${emojiSize}" text-anchor="middle" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif">${badge}</text>`;

  return svg.replace(/<\/svg>/, `${overlay}</svg>`);
}

/** Encode ticket URL so any phone camera can open the ticket page directly. */
export function qrPayloadForBooking(appUrl: string, token: string): string {
  const base = appUrl.replace(/\/$/, "");
  return `${base}/bus/ticket/${encodeURIComponent(token)}`;
}
