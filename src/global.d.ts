
enum Language {
  en = 'en',
  pr = 'pr',
}

interface TranslationPair {
  en: string;
  pr: string;
}

interface Problem {
  en: string;
  pr: string;
  showFirst: keyof typeof Language;
  hash: string;
}
