import flagOfIsrael from '/images/Flag_of_Israel.svg'
import flagOfBrazil from '/images/Flag_of_Brazil.svg'

export interface LanguageInfo {
  code: string
  fullName: string
  flagUrl: string
}

export const hebrew: LanguageInfo = {
  code: 'he',
  fullName: 'Hebrew',
  flagUrl: flagOfIsrael
}

export const brazilianPortuguese: LanguageInfo = {
  code: 'pt',
  fullName: 'Portuguese',
  flagUrl: flagOfBrazil
}