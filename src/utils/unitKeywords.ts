/**
 * Presentation helpers for dynamic unit rule keywords.
 */
import type { UnitKeyword } from '../types/unit';

type Translate = (key: string, options?: Record<string, unknown>) => string;

export function formatUnitKeyword(keyword: UnitKeyword, t: Translate): string {
  const hqMatch = /^hq-(\d+)$/.exec(keyword);
  if (hqMatch) {
    return t('units.keywords.hqWithValue', { value: hqMatch[1] });
  }

  const sectionCommandMatch = /^section-command-(\d+)-(\d+)$/.exec(keyword);
  if (sectionCommandMatch) {
    return t('units.keywords.sectionCommand', {
      command: sectionCommandMatch[1],
      radius: sectionCommandMatch[2],
    });
  }

  return t(`units.keywords.${keyword}`, { defaultValue: keyword });
}
