/**
 * Platform types supported by DropTimer
 */
export type Platform = 'Steam' | 'PlayStation' | 'Xbox' | 'Switch' | 'PC';

/**
 * Game data model
 * Represents a video game with its release information
 */
export interface Game {
  /** Unique identifier for the game (used in URLs) */
  slug: string;
  /** Display name of the game */
  name: string;
  /** List of platforms where the game will be released */
  platforms: Platform[];
  /** ISO 8601 date string for the release date */
  releaseDate: string;
  /** URL or path to the game's cover image */
  image: string;
  /** Short description of the game */
  description: string;
}

