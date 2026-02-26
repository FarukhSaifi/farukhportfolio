import { Collection, Db, MongoClient } from "mongodb";
import { DATABASE_CONFIG, ERROR_MESSAGES } from "./constants";
import { ApiResponse, SpotifyCredential } from "./interfaces";
import { EnvironmentUtils, SpotifyUtils } from "./server-utils";

/**
 * Database Service
 *
 * Singleton service for managing MongoDB connections and operations.
 * Handles Spotify credential storage and retrieval with automatic token refresh.
 *
 * @class DatabaseService
 */
class DatabaseService {
  private static instance: DatabaseService;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  /**
   * Get singleton instance of DatabaseService
   *
   * @returns {DatabaseService} Singleton instance
   */
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Connect to MongoDB database
   *
   * @returns {Promise<void>} Connection promise
   * @throws {Error} If connection fails
   */
  async connect(): Promise<void> {
    if (this.client) return;

    try {
      const uri = EnvironmentUtils.getMongodbUri();
      this.client = new MongoClient(uri, DATABASE_CONFIG.CONNECTION_OPTIONS);
      await this.client.connect();
      this.db = this.client.db(DATABASE_CONFIG.DATABASE_NAME);
      console.log("✅ Connected to MongoDB");
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error);
      throw new Error(ERROR_MESSAGES.DATABASE.CONNECTION_FAILED);
    }
  }

  /**
   * Disconnect from MongoDB database
   *
   * @returns {Promise<void>} Disconnection promise
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log("✅ Disconnected from MongoDB");
    }
  }

  /**
   * Ensure database connection is established
   *
   * @returns {Promise<Db>} Database instance
   * @throws {Error} If connection cannot be established
   */
  private async ensureConnection(): Promise<Db> {
    if (!this.db) {
      await this.connect();
    }
    if (!this.db) {
      throw new Error(ERROR_MESSAGES.DATABASE.CONNECTION_FAILED);
    }
    return this.db;
  }

  /**
   * Get credentials collection
   *
   * @returns {Promise<Collection<SpotifyCredential>>} Credentials collection
   */
  async getCredentialsCollection(): Promise<Collection<SpotifyCredential>> {
    const db = await this.ensureConnection();
    return db.collection(DATABASE_CONFIG.COLLECTIONS.CREDENTIALS);
  }

  /**
   * Save Spotify token to database
   *
   * @param {Omit<SpotifyCredential, "last_updated">} credential - Spotify credential data
   * @returns {Promise<ApiResponse>} Save operation result
   */
  async saveSpotifyToken(
    credential: Omit<SpotifyCredential, "last_updated">,
  ): Promise<ApiResponse> {
    try {
      const collection = await this.getCredentialsCollection();

      const result = await collection.findOneAndUpdate(
        { user_id: DATABASE_CONFIG.USER_IDS.PUBLIC },
        {
          $set: {
            ...credential,
            is_active: true,
            last_updated: new Date(),
          },
        },
        {
          upsert: true,
          returnDocument: "after",
        },
      );

      return {
        success: true,
        data: result,
        message: "Spotify token saved successfully",
      };
    } catch (error) {
      console.error("Error saving Spotify token:", error);
      return {
        success: false,
        error: ERROR_MESSAGES.DATABASE.SAVE_FAILED,
      };
    }
  }

  /**
   * Get Spotify token from database with automatic refresh
   *
   * @returns {Promise<ApiResponse<SpotifyCredential>>} Token retrieval result
   */
  async getSpotifyToken(): Promise<ApiResponse<SpotifyCredential>> {
    try {
      const collection = await this.getCredentialsCollection();
      const token = await collection.findOne({
        user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
        is_active: true,
      });

      if (!token) {
        return {
          success: false,
          error: "No active Spotify token found",
        };
      }

      // Check if token is about to expire and refresh if needed
      const now = Date.now();
      const tokenExpiry =
        token.last_updated.getTime() + token.expires_in * 1000;

      if (SpotifyUtils.isTokenAboutToExpire(tokenExpiry, 5)) {
        console.log("🔄 Token is about to expire, refreshing...");

        const refreshResult = await SpotifyUtils.refreshSpotifyToken(
          token.refresh_token,
        );
        if (refreshResult) {
          // Update token in database
          const updatedToken = await collection.findOneAndUpdate(
            { user_id: DATABASE_CONFIG.USER_IDS.PUBLIC },
            {
              $set: {
                access_token: refreshResult.access_token,
                expires_in: refreshResult.expires_in,
                token_type: refreshResult.token_type,
                last_updated: new Date(),
              },
            },
            { returnDocument: "after" },
          );

          if (updatedToken) {
            console.log("✅ Token refreshed successfully");
            return {
              success: true,
              data: updatedToken,
            };
          }
        } else {
          console.error("❌ Failed to refresh token, using existing token");
        }
      }

      return {
        success: true,
        data: token,
      };
    } catch (error) {
      console.error("Error getting Spotify token:", error);
      return {
        success: false,
        error: ERROR_MESSAGES.DATABASE.FETCH_FAILED,
      };
    }
  }

  /**
   * Update Spotify token in database
   *
   * @param {Partial<SpotifyCredential>} updates - Token updates
   * @returns {Promise<ApiResponse>} Update operation result
   */
  async updateSpotifyToken(
    updates: Partial<SpotifyCredential>,
  ): Promise<ApiResponse> {
    try {
      const collection = await this.getCredentialsCollection();

      const result = await collection.findOneAndUpdate(
        { user_id: DATABASE_CONFIG.USER_IDS.PUBLIC },
        {
          $set: {
            ...updates,
            last_updated: new Date(),
          },
        },
        {
          returnDocument: "after",
        },
      );

      if (!result) {
        return {
          success: false,
          error: "Spotify token not found",
        };
      }

      return {
        success: true,
        data: result,
        message: "Spotify token updated successfully",
      };
    } catch (error) {
      console.error("Error updating Spotify token:", error);
      return {
        success: false,
        error: ERROR_MESSAGES.DATABASE.SAVE_FAILED,
      };
    }
  }

  /**
   * Deactivate Spotify token
   *
   * @returns {Promise<ApiResponse>} Deactivation result
   */
  async deactivateSpotifyToken(): Promise<ApiResponse> {
    try {
      const collection = await this.getCredentialsCollection();

      const result = await collection.findOneAndUpdate(
        { user_id: DATABASE_CONFIG.USER_IDS.PUBLIC },
        {
          $set: {
            is_active: false,
            last_updated: new Date(),
          },
        },
        {
          returnDocument: "after",
        },
      );

      return {
        success: true,
        data: result,
        message: "Spotify token deactivated successfully",
      };
    } catch (error) {
      console.error("Error deactivating Spotify token:", error);
      return {
        success: false,
        error: ERROR_MESSAGES.DATABASE.SAVE_FAILED,
      };
    }
  }

  /**
   * Perform database health check
   *
   * @returns {Promise<boolean>} Health check result
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureConnection();
      return true;
    } catch (error) {
      console.error("Database health check failed:", error);
      return false;
    }
  }

  /**
   * Get database statistics
   *
   * @returns {Promise<ApiResponse<any>>} Database statistics
   */
  async getStats(): Promise<ApiResponse<any>> {
    try {
      const db = await this.ensureConnection();
      const stats = await db.stats();

      return {
        success: true,
        data: {
          collections: stats.collections,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize,
          indexes: stats.indexes,
        },
      };
    } catch (error) {
      console.error("Error getting database stats:", error);
      return {
        success: false,
        error: ERROR_MESSAGES.DATABASE.FETCH_FAILED,
      };
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();

// Export class for testing
export { DatabaseService };
