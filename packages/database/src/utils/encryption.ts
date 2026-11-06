import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = crypto
  .createHash("sha256")
  .update(process.env.BANK_ENCRYPTION_KEY as string)
  .digest();

const iv = Buffer.alloc(16, 0);

// Encrypt
export const encrypt = (text: string): string => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

// Decrypt
export const decrypt = (text: string): string => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(text, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
