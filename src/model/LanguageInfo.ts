import flagOfFinland from '/images/Flag_of_Finland.svg'
import flagOfSpain from '/images/Flag_of_Spain.svg'
import flagOfBrazil from '/images/Flag_of_Brazil.svg'
import flagOfCroatia from '/images/Flag_of_Croatia.svg'
import flagOfNetherlands from '/images/Flag_of_the_Netherlands.svg'
import flagOfTurkey from '/images/Flag_of_Turkey.svg'
import flagOfIndia from '/images/Flag_of_India.svg'
import flagOfIsrael from '/images/Flag_of_Israel.svg'
import flagOfArmenia from '/images/Flag_of_Armenia.svg'
import flagOfAlbania from '/images/Flag_of_Albania.svg'

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

export const spanish: LanguageInfo = {
  code: 'es',
  fullName: 'Spanish',
  flagUrl: flagOfSpain
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

export const dutch: LanguageInfo = {
  code: 'nl',
  fullName: 'Dutch',
  flagUrl: flagOfNetherlands
}

export const turkish: LanguageInfo = {
  code: 'tr',
  fullName: 'Turkish',
  flagUrl: flagOfTurkey
}

export const hindi: LanguageInfo = {
  code: 'hi',
  fullName: 'Hindi',
  flagUrl: flagOfIndia
}

export const hebrew: LanguageInfo = {
  code: 'he',
  fullName: 'Hebrew',
  flagUrl: flagOfIsrael
}

export const armenian: LanguageInfo = {
  code: 'hy',
  fullName: 'Armenian',
  flagUrl: flagOfArmenia
}

export const albanian: LanguageInfo = {
  code: 'sq',
  fullName: 'Albanian',
  flagUrl: flagOfAlbania
}

export const appLangs = [
  finnish, 
  spanish, 
  brazilianPortuguese, 
  croatian, 
  dutch, 
  turkish, 
  hindi, 
  hebrew,
  armenian,
  albanian
];