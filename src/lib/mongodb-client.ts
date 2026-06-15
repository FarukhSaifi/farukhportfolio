import { MongoClient, type MongoClientOptions } from "mongodb";

import { DATABASE_CONFIG } from "./constants";
import { EnvironmentUtils } from "./server-utils";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const TRANSIENT_CONNECTION_ERROR_CODES = new Set([
  "ETIMEOUT",
  "ENOTFOUND",
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "MongoServerSelectionError",
  "MongoNetworkError",
]);

function isTransientConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as { code?: string; name?: string; cause?: unknown };
  if (err.code && TRANSIENT_CONNECTION_ERROR_CODES.has(err.code)) return true;
  if (err.name && TRANSIENT_CONNECTION_ERROR_CODES.has(err.name)) return true;
  if (err.cause) return isTransientConnectionError(err.cause);

  return false;
}

function getConnectionOptions(): MongoClientOptions {
  return { ...DATABASE_CONFIG.CONNECTION_OPTIONS };
}

async function connectWithRetry(): Promise<MongoClient> {
  const uri = EnvironmentUtils.getMongodbUri();
  const { MAX_ATTEMPTS, BASE_DELAY_MS } = DATABASE_CONFIG.CONNECT_RETRY;
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const client = new MongoClient(uri, getConnectionOptions());

    try {
      await client.connect();
      return client;
    } catch (error) {
      lastError = error;
      await client.close().catch(() => undefined);

      const canRetry = attempt < MAX_ATTEMPTS && isTransientConnectionError(error);
      if (!canRetry) break;

      const delayMs = BASE_DELAY_MS * 2 ** (attempt - 1);
      console.warn(`MongoDB connect attempt ${attempt}/${MAX_ATTEMPTS} failed, retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

function resetCachedClientPromise(): void {
  global._mongoClientPromise = undefined;
}

/**
 * Returns a cached MongoClient promise for the current serverless instance.
 * Reuses connections across warm invocations (Vercel) and HMR reloads (dev).
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connectWithRetry().catch((error) => {
      resetCachedClientPromise();
      throw error;
    });
  }

  try {
    return await global._mongoClientPromise;
  } catch (error) {
    resetCachedClientPromise();
    throw error;
  }
}
