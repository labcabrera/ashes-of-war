import enDescriptions from './en/descriptions.json';
import esDescriptions from './es/descriptions.json';

type DescriptionLanguage = 'en' | 'es';
type DescriptionSection = 'types' | 'units' | 'weapons';
type DescriptionCatalog = {
  _version: number;
  types: Record<string, string>;
  units: Record<string, string>;
  weapons: Record<string, string>;
};

const descriptionsByLanguage: Record<DescriptionLanguage, DescriptionCatalog> = {
  en: enDescriptions,
  es: esDescriptions,
};

function currentLanguage(language: string | undefined): DescriptionLanguage {
  return language?.startsWith('es') ? 'es' : 'en';
}

function fallbackLanguages(language: string | undefined): DescriptionLanguage[] {
  const selectedLanguage = currentLanguage(language);
  return Array.from(new Set<DescriptionLanguage>([selectedLanguage, 'en', 'es']));
}

export function getDescription(section: DescriptionSection, key: string, language: string | undefined) {
  for (const fallbackLanguage of fallbackLanguages(language)) {
    const description = descriptionsByLanguage[fallbackLanguage][section][key];

    if (description) {
      return description;
    }
  }

  return undefined;
}
