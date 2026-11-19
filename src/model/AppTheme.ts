import {BrandVariants, createLightTheme, Theme} from '@fluentui/react-components';

/**
 * The app's colours: Harbour, combination 151 of Sanzo Wada's "A Dictionary
 * of Color Combinations" (colors.bible): Sulpher Yellow, Yellow Orange and
 * Vandar Poel's Blue.
 */
export interface AppTheme {
  /** Page background behind the cards. */
  page: string;
  /** Hover glow, selected tab, title of a hovered card. */
  accent: string;
  /** Opacity of the hover glow in percent; the dark blue needs a strong one to show. */
  glow: number;
  fluent: Theme;
}

function mix(hex: string, other: string, amount: number): string {
  const channel = (h: string, i: number) => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16);
  return '#' + [0, 1, 2].map((i) =>
    Math.round(channel(hex, i) + (channel(other, i) - channel(hex, i)) * amount).toString(16).padStart(2, '0')).join('');
}

/** Fluent's 16-step brand ramp around `accent`, which becomes step 80: darker below, lighter above. */
function brandRamp(accent: string): BrandVariants {
  const ramp: Record<number, string> = {};
  for (let step = 10; step <= 160; step += 10) {
    const t = (step - 80) / 80;
    ramp[step] = t < 0 ? mix(accent, '#000000', -t * 0.85) : mix(accent, '#ffffff', t * 0.9);
  }
  return ramp as BrandVariants;
}

const page = '#faf6e2';
const accent = '#064f6e';
const ink = '#0b3548';
const muted = '#47606b';

/** A light Fluent theme in the accent, with the text in the ink and the subtle fills (e.g. the card placeholder) tinted from the page. */
export const appTheme: AppTheme = {
  page, accent, glow: 65,
  fluent: {
    ...createLightTheme(brandRamp(accent)),
    colorNeutralForeground1: ink,
    colorNeutralForeground2: muted,
    colorNeutralForeground3: muted,
    colorNeutralBackground3: mix(page, ink, 0.06),
  },
};
