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

export async function qrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

export async function qrPngBuffer(payload: string): Promise<Buffer> {
  return QRCode.toBuffer(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
    color: { dark: "#000000", light: "#ffffff" },
  });
}
