import type { Accent, WordAudio } from './word-details';

const ACCENT_PRIORITY: (Accent | null)[] = ['US', 'UK', 'AU', null];

export function pickAudio(audios: WordAudio[]): WordAudio | null {
  for (const accent of ACCENT_PRIORITY) {
    const match = audios.find((audio) => audio.accent === accent);
    if (match) return match;
  }

  return null;
}

export function formatSeconds(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;

  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}
