import axios from "axios";

const uniquePush = (values: string[], seen: Set<string>, candidate?: string | null) => {
  const trimmed = candidate?.trim();
  if (!trimmed || seen.has(trimmed)) return;
  seen.add(trimmed);
  values.push(trimmed);
};

export const sanitizeForSpotify = (value: string | null | undefined): string =>
  (value ?? "")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’'`"]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export const buildSpotifyFilter = (
  field: string,
  value: string | null | undefined
): string | null => {
  const sanitized = sanitizeForSpotify(value);
  if (!sanitized) return null;
  const needsQuotes = sanitized.includes(" ");
  return `${field}:${needsQuotes ? `"${sanitized}"` : sanitized}`;
};

export const buildAlbumQueryCandidates = (
  albumName: string | null | undefined,
  artistName: string | null | undefined
): string[] => {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const albumFilter = buildSpotifyFilter("album", albumName);
  const artistFilter = buildSpotifyFilter("artist", artistName);
  const normalizedAlbum = sanitizeForSpotify(albumName);
  const normalizedArtist = sanitizeForSpotify(artistName);

  uniquePush(candidates, seen, [albumFilter, artistFilter].filter(Boolean).join(" ").trim());
  uniquePush(candidates, seen, albumFilter);
  uniquePush(candidates, seen, artistFilter);

  if (artistFilter && normalizedAlbum) {
    uniquePush(candidates, seen, `${artistFilter} "${normalizedAlbum}"`);
  }

  if (normalizedAlbum && normalizedArtist) {
    uniquePush(candidates, seen, `"${normalizedAlbum}" "${normalizedArtist}"`);
    uniquePush(candidates, seen, `${normalizedAlbum} ${normalizedArtist}`);
  }

  if (normalizedAlbum) {
    uniquePush(candidates, seen, `"${normalizedAlbum}"`);
    uniquePush(candidates, seen, normalizedAlbum);
  }

  return candidates;
};

export const buildArtistQueryCandidates = (
  artistName: string | null | undefined
): string[] => {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const artistFilter = buildSpotifyFilter("artist", artistName);
  const normalizedArtist = sanitizeForSpotify(artistName);

  uniquePush(candidates, seen, artistFilter);
  if (normalizedArtist) {
    uniquePush(candidates, seen, `"${normalizedArtist}"`);
    uniquePush(candidates, seen, normalizedArtist);
  }

  return candidates;
};

export const searchSpotifyAlbum = async (
  token: string,
  albumName: string | null | undefined,
  artistName: string | null | undefined
): Promise<any | null> => {
  const queries = buildAlbumQueryCandidates(albumName, artistName);

  for (const query of queries) {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.albums.items.length > 0) {
        return response.data.albums.items[0];
      }
    } catch (error) {
      console.error(`Spotify album search failed for query "${query}":`, error);
    }
  }

  return null;
};

export const searchSpotifyArtist = async (
  token: string,
  artistName: string | null | undefined
): Promise<any | null> => {
  const queries = buildArtistQueryCandidates(artistName);

  for (const query of queries) {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.artists.items.length > 0) {
        return response.data.artists.items[0];
      }
    } catch (error) {
      console.error(`Spotify artist search failed for query "${query}":`, error);
    }
  }

  return null;
};
