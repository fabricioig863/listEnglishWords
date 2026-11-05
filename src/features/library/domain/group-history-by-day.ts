import type { HistoryItem } from './library';

export type HistorySection = { title: string; data: HistoryItem[] };

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function formatDayLabel(date: Date, now: Date): string {
  const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / ONE_DAY_MS);

  if (daysAgo === 0) return 'Hoje';
  if (daysAgo === 1) return 'Ontem';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function groupHistoryByDay(items: HistoryItem[], now = new Date()): HistorySection[] {
  const sections: HistorySection[] = [];

  for (const item of items) {
    const title = formatDayLabel(new Date(item.viewedAt), now);
    const lastSection = sections.at(-1);

    if (lastSection?.title === title) {
      lastSection.data.push(item);
    } else {
      sections.push({ title, data: [item] });
    }
  }

  return sections;
}
