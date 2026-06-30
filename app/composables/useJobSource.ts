/** Single source of truth for job-source ids → human labels. */
export const SOURCE_LABELS: Record<string, string> = {
  remotive: 'Remotive',
  arbeitnow: 'Arbeitnow',
  habr: 'Habr Career',
  hh: 'HH.ru',
  djinni: 'Djinni',
  linkedin: 'LinkedIn',
  unknown: 'Other',
}

/** Pretty label for a source id; null/unknown → "Other". */
export function sourceLabel(s: string | null): string {
  if (!s) return 'Other'
  return SOURCE_LABELS[s] ?? s
}
