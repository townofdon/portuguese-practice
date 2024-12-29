interface TranslationPair {
  pr: string,
  en: string,
}

declare module '*/conjugation-ver-vir.yaml' {
  const data: {
    ver: {
      present: TranslationPair[],
      imperfect: TranslationPair[],
      preterite: TranslationPair[],
      presentPerfect: TranslationPair[],
      future: TranslationPair[],
    }
    vir: {
      present: TranslationPair[],
      imperfect: TranslationPair[],
      preterite: TranslationPair[],
      presentPerfect: TranslationPair[],
      future: TranslationPair[],
    }
  }
  export default data
}

declare module '*/weak-phrases.yaml' {
  const data: TranslationPair[]
  export default data
}

declare module '*/vocab.yaml' {
  const data: TranslationPair[]
  export default data
}

declare module '*.yml' {
  const data: Record<string, unknown>
  export default data
}