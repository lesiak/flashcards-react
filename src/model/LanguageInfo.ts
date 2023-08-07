import flagOfFinland from '/images/Flag_of_Finland.svg'
import flagOfIsrael from '/images/Flag_of_Israel.svg'
import flagOfBrazil from '/images/Flag_of_Brazil.svg'
import flagOfCroatia from '/images/Flag_of_Croatia.svg'

export interface LanguageInfo {
  code: string;
  fullName: string;
  flagUrl: string;
}

export const finnish: LanguageInfo = {
  code: 'fi',
  fullName: 'Finnish',
  flagUrl: flagOfFinland
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

export const croatian: LanguageInfo = {
  code: 'hr',
  fullName: 'Croatian',
  flagUrl: flagOfCroatia
}

export const appLangs = [finnish, hebrew, brazilianPortuguese, croatian];