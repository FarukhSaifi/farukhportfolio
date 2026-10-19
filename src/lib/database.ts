import type { Collection, Db, ObjectId } from "mongodb";

import {
  APPLE_MUSIC_CONFIG,
  DATABASE_CONFIG,
  ERROR_MESSAGES,
  LOG_MESSAGES,
  SPOTIFY_CONFIG,
  YOUTUBE_MUSIC_CONFIG,
} from "@/lib/constants";
import type {
  ApiResponse,
  AppleMusicCredential,
  MusicLastPlayed,
  MusicServiceId,
  MusicServiceToken,
  ServiceCredential,
  SharedLastPlayedServiceId,
  SimplifiedTrack,
  SpotifyCredential,
  UnifiedMusicCredentials,
  YoutubeMusicCredential,
} from "@/lib/interfaces";
import { getMongoClient } from "@/lib/mongodb-client";
import { SpotifyUtils } from "@/lib/server-utils";

async function getDb(): Promise<Db> {
  try {
    const client = await getMongoClient();
    return client.db(DATABASE_CONFIG.DATABASE_NAME);
  } catch (error) {
    console.error(LOG_MESSAGES.DATABASE.MONGODB_CONNECTION_FAILED, error);
    throw new Error(ERROR_MESSAGES.DATABASE.CONNECTION_FAILED);
  }
}

// =============================================================================
// Last-played (`music_last_played`)
// =============================================================================

async function getMusicLastPlayedCollection(): Promise<Collection<MusicLastPlayed>> {
  const db = await getDb();
  return db.collection(DATABASE_CONFIG.COLLECTIONS.MUSIC_LAST_PLAYED);
}

async function saveMusicLastPlayed(
  service: SharedLastPlayedServiceId,
  track: SimplifiedTrack & { externalId?: string; playedAt?: Date },
): Promise<ApiResponse<MusicLastPlayed>> {
  try {
    const collection = await getMusicLastPlayedCollection();
    const playedAt = track.playedAt ?? new Date();
    const result = await collection.findOneAndUpdate(
      { user_id: DATABASE_CONFIG.USER_IDS.PUBLIC, service },
      {
        $set: {
          user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
          service,
          externalId: track.externalId,
          title: track.title,
          artist: track.artist,
          album: track.album,
          imageUrl: track.imageUrl,
          songUrl: track.songUrl,
          playedAt,
        },
      },
      { upsert: true, returnDocument: "after" },
    );
    return { success: true, data: result ?? undefined };
  } catch (error) {
    console.error(LOG_MESSAGES.DATABASE.saveLastPlayedError(service), error);
    return { success: false, error: ERROR_MESSAGES.DATABASE.SAVE_FAILED };
  }
}

async function getMusicLastPlayed(service: SharedLastPlayedServiceId): Promise<MusicLastPlayed | null> {
  try {
    const collection = await getMusicLastPlayedCollection();
    return await collection.findOne({
      user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
      service,
    });
  } catch (error) {
    console.error(LOG_MESSAGES.DATABASE.fetchLastPlayedError(service), error);
    return null;
  }
}

/** Clear last-played for a service (used on disconnect). */
async function clearMusicLastPlayed(service: SharedLastPlayedServiceId): Promise<ApiResponse> {
  try {
    const collection = await getMusicLastPlayedCollection();
    await collection.deleteOne({ user_id: DATABASE_CONFIG.USER_IDS.PUBLIC, service });
    return { success: true };
  } catch (error) {
    console.error(LOG_MESSAGES.DATABASE.clearLastPlayedError(service), error);
    return { success: false, error: ERROR_MESSAGES.DATABASE.SAVE_FAILED };
  }
}

/**
 * Newest row across music_last_played by playedAt.
 * `excludeServices` skips labeled rows (e.g. About aggregate hides youtube_music).
 */
async function getNewestMusicLastPlayed(options?: {
  excludeServices?: readonly SharedLastPlayedServiceId[];
}): Promise<MusicLastPlayed | null> {
  try {
    const collection = await getMusicLastPlayedCollection();
    const filter: Record<string, unknown> = { user_id: DATABASE_CONFIG.USER_IDS.PUBLIC };
    if (options?.excludeServices?.length) {
      filter.service = { $nin: [...options.excludeServices] };
    }
    const newest = await collection.find(filter).sort({ playedAt: -1 }).limit(1).toArray();

    return newest[0] ?? null;
  } catch (error) {
    console.error(LOG_MESSAGES.DATABASE.NEWEST_LAST_PLAYED_ERROR, error);
    return null;
  }
}

// =============================================================================
// Music OAuth credentials — one nested document per user in SERVICE_CREDENTIALS
// =============================================================================

/** Loose collection shape: unified nested docs + legacy flat per-service docs */
type CredentialsCollectionDoc = {
  _id?: ObjectId;
  user_id: number;
  spotify?: MusicServiceToken;
  youtube_music?: MusicServiceToken;
  apple_music?: MusicServiceToken;
  last_updated?: Date;
  /** Legacy flat fields (pre-unified) */
  service?: MusicServiceId;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  is_active?: boolean;
};

async function getCredentialsCollection(): Promise<Collection<CredentialsCollectionDoc>> {
  const db = await getDb();
  return db.collection(DATABASE_CONFIG.COLLECTIONS.SERVICE_CREDENTIALS);
}

/** Legacy SyncApp `credentials` collection (not music OAuth). */
async function getLegacyCredentialsCollection(): Promise<Collection<Record<string, unknown>>> {
  const db = await getDb();
  return db.collection(DATABASE_CONFIG.COLLECTIONS.CREDENTIALS);
}

function toFlatCredential(service: MusicServiceId, token: MusicServiceToken): ServiceCredential {
  return {
    user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
    service,
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_in: token.expires_in,
    token_type: token.token_type,
    is_active: token.is_active,
    last_updated: token.last_updated instanceof Date ? token.last_updated : new Date(token.last_updated),
  };
}

function tokenFromFlatFields(doc: {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  is_active?: boolean;
  last_updated?: Date | string;
  defaultExpiresIn: number;
  defaultTokenType: string;
}): MusicServiceToken | null {
  if (typeof doc.access_token !== "string" || !doc.access_token) {
    return null;
  }
  if (typeof doc.refresh_token !== "string") {
    return null;
  }
  return {
    access_token: doc.access_token,
    refresh_token: doc.refresh_token,
    expires_in: typeof doc.expires_in === "number" ? doc.expires_in : doc.defaultExpiresIn,
    token_type: typeof doc.token_type === "string" ? doc.token_type : doc.defaultTokenType,
    is_active: doc.is_active !== false,
    last_updated:
      doc.last_updated instanceof Date ? doc.last_updated : doc.last_updated ? new Date(doc.last_updated) : new Date(),
  };
}

function defaultsForService(service: MusicServiceId): { defaultExpiresIn: number; defaultTokenType: string } {
  if (service === DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY) {
    return {
      defaultExpiresIn: SPOTIFY_CONFIG.DEFAULT_EXPIRES_IN,
      defaultTokenType: SPOTIFY_CONFIG.DEFAULT_TOKEN_TYPE,
    };
  }
  if (service === DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC) {
    return {
      defaultExpiresIn: YOUTUBE_MUSIC_CONFIG.DEFAULT_EXPIRES_IN,
      defaultTokenType: YOUTUBE_MUSIC_CONFIG.DEFAULT_TOKEN_TYPE,
    };
  }
  return {
    defaultExpiresIn: APPLE_MUSIC_CONFIG.DEFAULT_EXPIRES_IN,
    defaultTokenType: APPLE_MUSIC_CONFIG.DEFAULT_TOKEN_TYPE,
  };
}

/** Find the unified credentials document (nested spotify / youtube_music / apple_music). */
async function findUnifiedCredentialsDoc(): Promise<(UnifiedMusicCredentials & { _id: ObjectId }) | null> {
  const collection = await getCredentialsCollection();
  const doc = await collection.findOne({
    user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
    $or: [{ spotify: { $exists: true } }, { youtube_music: { $exists: true } }, { apple_music: { $exists: true } }],
  });
  if (!doc?._id) {
    return null;
  }
  return doc as UnifiedMusicCredentials & { _id: ObjectId };
}

/** Legacy flat docs in the same collection (one doc per service, top-level access_token). */
async function findLegacyFlatServiceDocs(): Promise<CredentialsCollectionDoc[]> {
  const collection = await getCredentialsCollection();
  return collection
    .find({
      user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
      access_token: { $exists: true, $type: "string" },
      spotify: { $exists: false },
      youtube_music: { $exists: false },
      apple_music: { $exists: false },
    })
    .toArray();
}

function resolveLegacyFlatService(doc: CredentialsCollectionDoc): MusicServiceId {
  if (
    doc.service === DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC ||
    doc.service === DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC ||
    doc.service === DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY
  ) {
    return doc.service;
  }
  // Pre-discriminator Spotify rows omitted `service`
  return DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY;
}

async function migrateSpotifyFromSyncAppCredentials(): Promise<MusicServiceToken | null> {
  try {
    const legacy = await getLegacyCredentialsCollection();
    const legacyToken = await legacy.findOne({
      user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
      is_active: true,
      refresh_token: { $exists: true, $type: "string", $ne: "" },
      access_token: { $exists: true, $type: "string", $ne: "" },
    });

    const defaults = defaultsForService(DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY);
    const token = tokenFromFlatFields({
      access_token: typeof legacyToken?.access_token === "string" ? legacyToken.access_token : undefined,
      refresh_token: typeof legacyToken?.refresh_token === "string" ? legacyToken.refresh_token : undefined,
      expires_in: typeof legacyToken?.expires_in === "number" ? legacyToken.expires_in : undefined,
      token_type: typeof legacyToken?.token_type === "string" ? legacyToken.token_type : undefined,
      is_active: true,
      last_updated: legacyToken?.last_updated instanceof Date ? legacyToken.last_updated : undefined,
      ...defaults,
    });
    if (!legacyToken || !token) {
      return null;
    }

    console.log(LOG_MESSAGES.DATABASE.MIGRATE_SPOTIFY_START);
    await legacy.findOneAndUpdate(
      { _id: legacyToken._id },
      {
        $set: {
          is_active: false,
          last_updated: new Date(),
          migrated_to: DATABASE_CONFIG.COLLECTIONS.SERVICE_CREDENTIALS,
        },
      },
    );
    console.log(LOG_MESSAGES.DATABASE.MIGRATE_SPOTIFY_DONE);
    return token;
  } catch (error) {
    console.error(LOG_MESSAGES.DATABASE.MIGRATE_SPOTIFY_ERROR, error);
    return null;
  }
}

async function migrateYoutubeFromLegacyCollection(): Promise<MusicServiceToken | null> {
  try {
    const db = await getDb();
    const legacy = db.collection(DATABASE_CONFIG.COLLECTIONS.YOUTUBE_MUSIC_CREDENTIALS_LEGACY);
    const legacyToken = await legacy.findOne({
      user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
      is_active: true,
      refresh_token: { $exists: true, $type: "string", $ne: "" },
      access_token: { $exists: true, $type: "string", $ne: "" },
    });

    const defaults = defaultsForService(DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC);
    const token = tokenFromFlatFields({
      access_token: typeof legacyToken?.access_token === "string" ? legacyToken.access_token : undefined,
      refresh_token: typeof legacyToken?.refresh_token === "string" ? legacyToken.refresh_token : undefined,
      expires_in: typeof legacyToken?.expires_in === "number" ? legacyToken.expires_in : undefined,
      token_type: typeof legacyToken?.token_type === "string" ? legacyToken.token_type : undefined,
      is_active: true,
      last_updated: legacyToken?.last_updated instanceof Date ? legacyToken.last_updated : undefined,
      ...defaults,
    });
    if (!legacyToken || !token) {
      return null;
    }

    console.log(LOG_MESSAGES.DATABASE.MIGRATE_YOUTUBE_START);
    await legacy.findOneAndUpdate(
      { _id: legacyToken._id },
      {
        $set: {
          is_active: false,
          last_updated: new Date(),
          migrated_to: DATABASE_CONFIG.COLLECTIONS.SERVICE_CREDENTIALS,
        },
      },
    );
    console.log(LOG_MESSAGES.DATABASE.MIGRATE_YOUTUBE_DONE);
    return token;
  } catch (error) {
    console.error(LOG_MESSAGES.DATABASE.MIGRATE_YOUTUBE_ERROR, error);
    return null;
  }
}

/** Merge leftover flat per-service docs into an existing unified credentials document. */
async function absorbLegacyFlatDocsInto(
  target: UnifiedMusicCredentials & { _id: ObjectId },
): Promise<UnifiedMusicCredentials & { _id: ObjectId }> {
  const collection = await getCredentialsCollection();
  const flats = await findLegacyFlatServiceDocs();
  if (flats.length === 0) {
    return target;
  }

  const $set: Record<string, unknown> = { last_updated: new Date() };
  let changed = false;

  for (const flat of flats) {
    const service = resolveLegacyFlatService(flat);
    if (target[service]) {
      continue;
    }
    const defaults = defaultsForService(service);
    const token = tokenFromFlatFields({ ...flat, ...defaults });
    if (!token) {
      continue;
    }
    $set[service] = token;
    target[service] = token;
    changed = true;
  }

  const flatIds = flats.map((f) => f._id).filter((id): id is ObjectId => Boolean(id));
  if (changed) {
    await collection.findOneAndUpdate({ _id: target._id }, { $set });
  }
  if (flatIds.length > 0) {
    await collection.deleteMany({ _id: { $in: flatIds } });
  }
  return target;
}

/**
 * Ensure a single nested credentials document exists, absorbing legacy flat
 * per-service docs and older collections when needed.
 */
async function ensureUnifiedCredentials(): Promise<(UnifiedMusicCredentials & { _id: ObjectId }) | null> {
  const existing = await findUnifiedCredentialsDoc();
  if (existing) {
    return absorbLegacyFlatDocsInto(existing);
  }

  const collection = await getCredentialsCollection();
  const flats = await findLegacyFlatServiceDocs();
  const merged: UnifiedMusicCredentials = {
    user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
    last_updated: new Date(),
  };

  for (const flat of flats) {
    const service = resolveLegacyFlatService(flat);
    if (merged[service]) {
      continue;
    }
    const defaults = defaultsForService(service);
    const token = tokenFromFlatFields({ ...flat, ...defaults });
    if (token) {
      merged[service] = token;
    }
  }

  if (!merged.spotify) {
    const fromSyncApp = await migrateSpotifyFromSyncAppCredentials();
    if (fromSyncApp) {
      merged.spotify = fromSyncApp;
    }
  }

  if (!merged.youtube_music) {
    const fromYtmLegacy = await migrateYoutubeFromLegacyCollection();
    if (fromYtmLegacy) {
      merged.youtube_music = fromYtmLegacy;
    }
  }

  const hasAny = Boolean(merged.spotify || merged.youtube_music || merged.apple_music);
  if (!hasAny) {
    return null;
  }

  const insert = await collection.insertOne(merged);
  const flatIds = flats.map((f) => f._id).filter((id): id is ObjectId => Boolean(id));
  if (flatIds.length > 0) {
    await collection.deleteMany({ _id: { $in: flatIds } });
  }

  return { ...merged, _id: insert.insertedId };
}

async function saveServiceToken(
  service: MusicServiceId,
  credential: Omit<ServiceCredential, "last_updated" | "service">,
): Promise<ApiResponse<ServiceCredential>> {
  try {
    const collection = await getCredentialsCollection();
    const last_updated = new Date();
    const nested: MusicServiceToken = {
      access_token: credential.access_token,
      refresh_token: credential.refresh_token,
      expires_in: credential.expires_in,
      token_type: credential.token_type,
      is_active: true,
      last_updated,
    };

    let unified = await ensureUnifiedCredentials();
    if (unified?._id) {
      const result = await collection.findOneAndUpdate(
        { _id: unified._id },
        { $set: { [service]: nested, last_updated, user_id: DATABASE_CONFIG.USER_IDS.PUBLIC } },
        { returnDocument: "after" },
      );
      const saved = (result?.[service] as MusicServiceToken | undefined) ?? nested;
      return { success: true, data: toFlatCredential(service, saved) };
    }

    const doc: UnifiedMusicCredentials = {
      user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
      [service]: nested,
      last_updated,
    };
    await collection.insertOne(doc);
    // Drop any leftover flat docs for this user
    await collection.deleteMany({
      user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
      access_token: { $exists: true, $type: "string" },
      spotify: { $exists: false },
      youtube_music: { $exists: false },
      apple_music: { $exists: false },
    });
    return { success: true, data: toFlatCredential(service, nested) };
  } catch (error) {
    console.error(LOG_MESSAGES.DATABASE.saveTokenError(service), error);
    return { success: false, error: ERROR_MESSAGES.DATABASE.SAVE_FAILED };
  }
}

async function getNestedServiceToken(service: MusicServiceId): Promise<MusicServiceToken | null> {
  const unified = await ensureUnifiedCredentials();
  const token = unified?.[service];
  if (!token?.access_token) {
    return null;
  }
  if (token.is_active === false) {
    return null;
  }
  return {
    ...token,
    last_updated: token.last_updated instanceof Date ? token.last_updated : new Date(token.last_updated),
  };
}

async function updateActiveAccessToken(
  service: MusicServiceId,
  update: { access_token: string; expires_in: number; token_type: string },
  options: { defaultTokenType: string; noActiveError: string; logError: string },
): Promise<ApiResponse> {
  try {
    const collection = await getCredentialsCollection();
    const unified = await ensureUnifiedCredentials();
    if (!unified?._id || !unified[service]?.is_active) {
      return { success: false, error: options.noActiveError };
    }

    const last_updated = new Date();
    const result = await collection.findOneAndUpdate(
      { _id: unified._id, [`${service}.is_active`]: true },
      {
        $set: {
          [`${service}.access_token`]: update.access_token,
          [`${service}.expires_in`]: update.expires_in,
          [`${service}.token_type`]: update.token_type || options.defaultTokenType,
          [`${service}.last_updated`]: last_updated,
          last_updated,
        },
      },
      { returnDocument: "after" },
    );

    const nested = result?.[service] as MusicServiceToken | undefined;
    if (!nested) {
      return { success: false, error: options.noActiveError };
    }
    return { success: true, data: toFlatCredential(service, nested) };
  } catch (error) {
    console.error(options.logError, error);
    return { success: false, error: ERROR_MESSAGES.DATABASE.SAVE_FAILED };
  }
}

async function deactivateServiceToken(service: MusicServiceId, logError: string): Promise<ApiResponse> {
  try {
    const collection = await getCredentialsCollection();
    const unified = await ensureUnifiedCredentials();
    if (unified?._id) {
      await collection.findOneAndUpdate(
        { _id: unified._id },
        {
          $set: {
            [`${service}.is_active`]: false,
            [`${service}.last_updated`]: new Date(),
            last_updated: new Date(),
          },
        },
      );
    }
    await clearMusicLastPlayed(service);
    return { success: true };
  } catch (error) {
    console.error(logError, error);
    return { success: false, error: ERROR_MESSAGES.DATABASE.SAVE_FAILED };
  }
}

async function bootstrapFromEnvRefreshToken(): Promise<ApiResponse<SpotifyCredential>> {
  const envRefreshToken = process.env.SPOTIFY_REFRESH_TOKEN?.trim();
  if (!envRefreshToken) {
    return { success: false, error: ERROR_MESSAGES.SPOTIFY.NO_ACTIVE_TOKEN };
  }

  console.log(LOG_MESSAGES.DATABASE.BOOTSTRAP_SPOTIFY_REFRESH);
  const refreshResult = await SpotifyUtils.refreshSpotifyToken(envRefreshToken);
  if (!refreshResult) {
    return { success: false, error: ERROR_MESSAGES.SPOTIFY.TOKEN_EXPIRED };
  }

  const saveResult = await saveSpotifyToken({
    user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
    access_token: refreshResult.access_token,
    refresh_token: envRefreshToken,
    expires_in: refreshResult.expires_in,
    token_type: refreshResult.token_type,
    is_active: true,
  });

  if (!saveResult.success || !saveResult.data) {
    return {
      success: false,
      error: saveResult.error || ERROR_MESSAGES.DATABASE.SAVE_FAILED,
    };
  }

  return {
    success: true,
    data: saveResult.data as SpotifyCredential,
    message: "Spotify token bootstrapped from environment",
  };
}

// --- Spotify ---

async function saveSpotifyToken(credential: Omit<SpotifyCredential, "last_updated" | "service">): Promise<ApiResponse> {
  const result = await saveServiceToken(DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY, credential);
  if (!result.success) {
    return { success: false, error: result.error || ERROR_MESSAGES.DATABASE.SAVE_FAILED };
  }
  return {
    success: true,
    data: result.data,
    message: "Spotify token saved successfully",
  };
}

/** Public-safe connection check — never returns token values. */
async function isSpotifyConnected(): Promise<boolean> {
  try {
    const token = await getNestedServiceToken(DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY);
    if (token?.refresh_token) {
      return true;
    }

    const legacy = await getLegacyCredentialsCollection();
    const legacyActive = await legacy.findOne(
      {
        user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
        is_active: true,
        refresh_token: { $exists: true, $type: "string", $ne: "" },
      },
      { projection: { _id: 1 } },
    );
    if (legacyActive) {
      return true;
    }

    return Boolean(process.env.SPOTIFY_REFRESH_TOKEN?.trim());
  } catch (error) {
    console.error(LOG_MESSAGES.DATABASE.SPOTIFY_CONNECTION_STATUS_ERROR, error);
    return false;
  }
}

/** Get Spotify token from database with automatic refresh. */
async function getSpotifyToken(): Promise<ApiResponse<SpotifyCredential>> {
  try {
    let token = await getNestedServiceToken(DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY);

    if (!token) {
      const bootstrapped = await bootstrapFromEnvRefreshToken();
      if (!bootstrapped.success || !bootstrapped.data) {
        return {
          success: false,
          error: bootstrapped.error || ERROR_MESSAGES.SPOTIFY.NO_ACTIVE_TOKEN,
        };
      }
      return { success: true, data: bootstrapped.data };
    }

    const lastUpdated = token.last_updated instanceof Date ? token.last_updated : new Date(token.last_updated);
    const tokenExpiry = lastUpdated.getTime() + token.expires_in * 1000;

    if (SpotifyUtils.isTokenAboutToExpire(tokenExpiry, 5)) {
      console.log(LOG_MESSAGES.DATABASE.TOKEN_ABOUT_TO_EXPIRE);

      const refreshResult = await SpotifyUtils.refreshSpotifyToken(token.refresh_token);
      if (refreshResult) {
        const updateResult = await updateActiveAccessToken(
          DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY,
          {
            access_token: refreshResult.access_token,
            expires_in: refreshResult.expires_in,
            token_type: refreshResult.token_type,
          },
          {
            defaultTokenType: SPOTIFY_CONFIG.DEFAULT_TOKEN_TYPE,
            noActiveError: ERROR_MESSAGES.SPOTIFY.NO_ACTIVE_TOKEN,
            logError: LOG_MESSAGES.DATABASE.UPDATE_SPOTIFY_TOKEN_ERROR,
          },
        );
        if (updateResult.success && updateResult.data) {
          console.log(LOG_MESSAGES.DATABASE.TOKEN_REFRESHED);
          return { success: true, data: updateResult.data as SpotifyCredential };
        }
      } else if (SpotifyUtils.isTokenExpired(tokenExpiry)) {
        console.error(LOG_MESSAGES.DATABASE.TOKEN_EXPIRED_REFRESH_FAILED);
        return {
          success: false,
          error: ERROR_MESSAGES.SPOTIFY.TOKEN_EXPIRED,
        };
      } else {
        console.error(LOG_MESSAGES.DATABASE.TOKEN_REFRESH_FAILED_USING_EXISTING);
      }
    }

    return {
      success: true,
      data: toFlatCredential(DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY, token),
    };
  } catch (error) {
    console.error(LOG_MESSAGES.DATABASE.GET_SPOTIFY_TOKEN_ERROR, error);
    return {
      success: false,
      error: ERROR_MESSAGES.DATABASE.FETCH_FAILED,
    };
  }
}

async function updateSpotifyToken(updates: Partial<SpotifyCredential>): Promise<ApiResponse> {
  try {
    const collection = await getCredentialsCollection();
    const unified = await ensureUnifiedCredentials();
    if (!unified?._id || !unified.spotify) {
      return { success: false, error: "Spotify token not found" };
    }

    const last_updated = new Date();
    const $set: Record<string, unknown> = { last_updated };
    if (updates.access_token !== undefined) $set["spotify.access_token"] = updates.access_token;
    if (updates.refresh_token !== undefined) $set["spotify.refresh_token"] = updates.refresh_token;
    if (updates.expires_in !== undefined) $set["spotify.expires_in"] = updates.expires_in;
    if (updates.token_type !== undefined) $set["spotify.token_type"] = updates.token_type;
    if (updates.is_active !== undefined) $set["spotify.is_active"] = updates.is_active;
    $set["spotify.last_updated"] = last_updated;

    const result = await collection.findOneAndUpdate({ _id: unified._id }, { $set }, { returnDocument: "after" });
    const nested = result?.spotify as MusicServiceToken | undefined;
    if (!nested) {
      return { success: false, error: "Spotify token not found" };
    }

    return {
      success: true,
      data: toFlatCredential(DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY, nested),
      message: "Spotify token updated successfully",
    };
  } catch (error) {
    console.error(LOG_MESSAGES.DATABASE.UPDATE_SPOTIFY_TOKEN_ERROR, error);
    return {
      success: false,
      error: ERROR_MESSAGES.DATABASE.SAVE_FAILED,
    };
  }
}

async function deactivateSpotifyToken(): Promise<ApiResponse> {
  return deactivateServiceToken(
    DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY,
    LOG_MESSAGES.DATABASE.DEACTIVATE_SPOTIFY_TOKEN_ERROR,
  );
}

// --- YouTube Music ---

async function saveYoutubeMusicToken(
  tokenData: Omit<YoutubeMusicCredential, "last_updated" | "service"> & { last_updated?: Date },
): Promise<ApiResponse<YoutubeMusicCredential>> {
  return saveServiceToken(DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC, {
    user_id: tokenData.user_id,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_in: tokenData.expires_in,
    token_type: tokenData.token_type,
    is_active: tokenData.is_active,
  });
}

async function getYoutubeMusicToken(): Promise<ApiResponse<YoutubeMusicCredential>> {
  try {
    let token = await getNestedServiceToken(DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC);
    if (!token) {
      // ensureUnified already tried legacy; try once more from dedicated collection
      const migrated = await migrateYoutubeFromLegacyCollection();
      if (migrated) {
        const saved = await saveServiceToken(DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC, {
          user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
          ...migrated,
        });
        if (saved.success && saved.data) {
          return { success: true, data: saved.data };
        }
      }
      return { success: false, error: ERROR_MESSAGES.YOUTUBE_MUSIC.NO_ACTIVE_TOKEN };
    }
    return { success: true, data: toFlatCredential(DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC, token) };
  } catch (error) {
    console.error(LOG_MESSAGES.DATABASE.GET_YOUTUBE_TOKEN_ERROR, error);
    return { success: false, error: ERROR_MESSAGES.DATABASE.FETCH_FAILED };
  }
}

async function isYoutubeMusicConnected(): Promise<boolean> {
  try {
    const token = await getNestedServiceToken(DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC);
    if (token?.refresh_token) {
      return true;
    }
    const migrated = await migrateYoutubeFromLegacyCollection();
    if (!migrated?.refresh_token) {
      return false;
    }
    const saved = await saveServiceToken(DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC, {
      user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
      ...migrated,
    });
    return Boolean(saved.success);
  } catch (error) {
    console.error(LOG_MESSAGES.DATABASE.YOUTUBE_CONNECTION_STATUS_ERROR, error);
    return false;
  }
}

async function updateYoutubeMusicToken(update: {
  access_token: string;
  expires_in: number;
  token_type: string;
}): Promise<ApiResponse> {
  return updateActiveAccessToken(DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC, update, {
    defaultTokenType: YOUTUBE_MUSIC_CONFIG.DEFAULT_TOKEN_TYPE,
    noActiveError: ERROR_MESSAGES.YOUTUBE_MUSIC.NO_ACTIVE_TOKEN,
    logError: LOG_MESSAGES.DATABASE.UPDATE_YOUTUBE_TOKEN_ERROR,
  });
}

async function deactivateYoutubeMusicToken(): Promise<ApiResponse> {
  return deactivateServiceToken(
    DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC,
    LOG_MESSAGES.DATABASE.DEACTIVATE_YOUTUBE_TOKEN_ERROR,
  );
}

// --- Apple Music ---

async function saveAppleMusicToken(
  tokenData: Omit<AppleMusicCredential, "last_updated" | "service"> & { last_updated?: Date },
): Promise<ApiResponse<AppleMusicCredential>> {
  return saveServiceToken(DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC, {
    user_id: tokenData.user_id,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_in: tokenData.expires_in,
    token_type: tokenData.token_type,
    is_active: tokenData.is_active,
  });
}

async function getAppleMusicToken(): Promise<ApiResponse<AppleMusicCredential>> {
  try {
    const token = await getNestedServiceToken(DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC);
    if (!token) {
      return { success: false, error: ERROR_MESSAGES.APPLE_MUSIC.NO_ACTIVE_TOKEN };
    }
    return { success: true, data: toFlatCredential(DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC, token) };
  } catch (error) {
    console.error(LOG_MESSAGES.DATABASE.GET_APPLE_TOKEN_ERROR, error);
    return { success: false, error: ERROR_MESSAGES.DATABASE.FETCH_FAILED };
  }
}

async function isAppleMusicConnected(): Promise<boolean> {
  try {
    const token = await getNestedServiceToken(DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC);
    return Boolean(token?.access_token);
  } catch (error) {
    console.error(LOG_MESSAGES.DATABASE.APPLE_CONNECTION_STATUS_ERROR, error);
    return false;
  }
}

async function updateAppleMusicToken(update: {
  access_token: string;
  expires_in: number;
  token_type: string;
}): Promise<ApiResponse> {
  return updateActiveAccessToken(DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC, update, {
    defaultTokenType: APPLE_MUSIC_CONFIG.DEFAULT_TOKEN_TYPE,
    noActiveError: ERROR_MESSAGES.APPLE_MUSIC.NO_ACTIVE_TOKEN,
    logError: LOG_MESSAGES.DATABASE.UPDATE_APPLE_TOKEN_ERROR,
  });
}

async function deactivateAppleMusicToken(): Promise<ApiResponse> {
  return deactivateServiceToken(
    DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC,
    LOG_MESSAGES.DATABASE.DEACTIVATE_APPLE_TOKEN_ERROR,
  );
}

// =============================================================================
// Public facade
// =============================================================================

export const databaseService = {
  saveSpotifyToken,
  getSpotifyToken,
  isSpotifyConnected,
  updateSpotifyToken,
  deactivateSpotifyToken,

  saveYoutubeMusicToken,
  getYoutubeMusicToken,
  isYoutubeMusicConnected,
  updateYoutubeMusicToken,
  deactivateYoutubeMusicToken,

  saveAppleMusicToken,
  getAppleMusicToken,
  isAppleMusicConnected,
  updateAppleMusicToken,
  deactivateAppleMusicToken,

  saveMusicLastPlayed,
  getMusicLastPlayed,
  getNewestMusicLastPlayed,
};
