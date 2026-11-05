export const libraryKeys = {
  favorites: (userId: string | null) => ['library', 'favorites', userId] as const,
  history: (userId: string | null) => ['library', 'history', userId] as const,
};
