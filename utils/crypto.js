import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // AES-GCM recommended IV length

const getKey = () => {
    const rawKey = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
    if (!rawKey) {
        throw new Error("ENCRYPTION_KEY (or NEXTAUTH_SECRET) is required for encryption.");
    }
    return crypto.createHash("sha256").update(rawKey).digest(); // 32-byte key
};

export const encrypt = (plainText = "") => {
    if (!plainText) {
        return "";
    }
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return [
        iv.toString("base64"),
        authTag.toString("base64"),
        encrypted.toString("base64"),
    ].join(":");
};

export const decrypt = (encryptedText = "") => {
    if (!encryptedText) {
        return "";
    }

    const [ivPart, tagPart, dataPart] = encryptedText.split(":");
    if (!ivPart || !tagPart || !dataPart) {
        throw new Error("Invalid encrypted payload.");
    }

    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivPart, "base64"));
    decipher.setAuthTag(Buffer.from(tagPart, "base64"));
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(dataPart, "base64")),
        decipher.final(),
    ]);
    return decrypted.toString("utf8");
};

