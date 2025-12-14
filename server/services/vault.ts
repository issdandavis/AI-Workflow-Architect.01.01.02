import crypto from "crypto";
import { storage } from "../storage";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT = "ai-orchestration-vault-v1";

function getEncryptionKey(): Buffer {
  const masterSecret = process.env.SESSION_SECRET;
  if (!masterSecret) {
    throw new Error("SESSION_SECRET is required for credential encryption");
  }
  return crypto.pbkdf2Sync(masterSecret, SALT, 100000, KEY_LENGTH, "sha512");
}

export function encryptCredential(plaintext: string): {
  encryptedKey: string;
  iv: string;
  authTag: string;
} {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  return {
    encryptedKey: encrypted,
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

export function decryptCredential(
  encryptedKey: string,
  iv: string,
  authTag: string
): string {
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(authTag, "base64"));

  let decrypted = decipher.update(encryptedKey, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export interface ProviderConfig {
  name: string;
  label: string;
  keyPrefix: string;
  testEndpoint?: string;
}

export const SUPPORTED_PROVIDERS: ProviderConfig[] = [
  { name: "openai", label: "OpenAI", keyPrefix: "sk-" },
  { name: "anthropic", label: "Anthropic", keyPrefix: "sk-ant-" },
  { name: "perplexity", label: "Perplexity", keyPrefix: "pplx-" },
  { name: "xai", label: "xAI / Grok", keyPrefix: "xai-" },
  { name: "github", label: "GitHub", keyPrefix: "ghp_" },
  { name: "google", label: "Google AI", keyPrefix: "AI" },
];

export async function storeUserCredential(
  userId: string,
  provider: string,
  apiKey: string,
  label?: string
): Promise<{ id: string; provider: string; label: string | null }> {
  const { encryptedKey, iv, authTag } = encryptCredential(apiKey);

  const existingCreds = await storage.getUserCredentialsByProvider(userId, provider);
  if (existingCreds) {
    const updated = await storage.updateUserCredential(existingCreds.id, {
      encryptedKey,
      iv,
      authTag,
      label: label || existingCreds.label,
    });
    return { id: updated.id, provider: updated.provider, label: updated.label };
  }

  const credential = await storage.createUserCredential({
    userId,
    provider,
    encryptedKey,
    iv,
    authTag,
    label: label || null,
  });

  return { id: credential.id, provider: credential.provider, label: credential.label };
}

export async function getUserCredential(
  userId: string,
  provider: string
): Promise<string | null> {
  const credential = await storage.getUserCredentialsByProvider(userId, provider);
  if (!credential) {
    return null;
  }

  const decrypted = decryptCredential(
    credential.encryptedKey,
    credential.iv,
    credential.authTag
  );

  await storage.updateCredentialLastUsed(credential.id);

  return decrypted;
}

export async function listUserCredentials(
  userId: string
): Promise<Array<{ id: string; provider: string; label: string | null; lastUsedAt: Date | null; createdAt: Date }>> {
  const credentials = await storage.getUserCredentials(userId);
  return credentials.map((c) => ({
    id: c.id,
    provider: c.provider,
    label: c.label,
    lastUsedAt: c.lastUsedAt,
    createdAt: c.createdAt,
  }));
}

export async function deleteUserCredential(
  userId: string,
  credentialId: string
): Promise<boolean> {
  const credential = await storage.getUserCredentialById(credentialId);
  if (!credential || credential.userId !== userId) {
    return false;
  }
  await storage.deleteUserCredential(credentialId);
  return true;
}

export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) {
    return "****";
  }
  return apiKey.slice(0, 4) + "****" + apiKey.slice(-4);
}

export function validateApiKeyFormat(provider: string, apiKey: string): boolean {
  const config = SUPPORTED_PROVIDERS.find((p) => p.name === provider);
  if (!config) {
    return apiKey.length >= 10;
  }
  return apiKey.startsWith(config.keyPrefix) && apiKey.length >= 10;
}
