import QRCode from "qrcode";
import { randomBytes, createHash } from "crypto";
import { v2 as cloudinary } from "cloudinary";

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

let cloudinaryConfigured = false;
function ensureCloudinary() {
  if (cloudinaryConfigured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  cloudinaryConfigured = true;
}

export async function uploadQrToCloudinary(
  payload: string,
  publicId: string,
): Promise<string | null> {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return null;
  }
  try {
    ensureCloudinary();
    const buf = await qrPngBuffer(payload);
    const dataUri = `data:image/png;base64,${buf.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "bus-qr",
      public_id: publicId,
      overwrite: true,
      resource_type: "image",
    });
    return result.secure_url;
  } catch (e) {
    console.error("[qr] cloudinary upload failed:", e);
    return null;
  }
}
