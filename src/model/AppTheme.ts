import {BrandVariants, createLightTheme, teamsLightTheme, Theme} from '@fluentui/react-components';

/**
 * A colour scheme for the whole app. The Wada schemes come from Sanzo Wada's
 * "A Dictionary of Color Combinations" (colors.bible), by combination number.
 */
export interface AppTheme {
  id: string;
  name: string;
  /** Page background behind the cards. */
  page: string;
  /** Hover glow, selected tab, title of a hovered card. */
  accent: string;
  /** Opacity of the hover glow in percent; a dark accent needs more to show. Default 35. */
  glow?: number;
  /** A deck's study progress: its badge and the bar under its image. */
  progress: string;
  /** Colours shown in the chooser, the combination as Wada printed it. */
  swatches: string[];
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

/**
 * A Wada scheme: a light Fluent theme in the accent, with the text in the ink
 * and the subtle fills (e.g. the card placeholder) tinted from the page colour.
 */
function wada(id: string, name: string, swatches: string[],
              colours: {page: string, accent: string, ink: string, muted: string, progress: string, glow?: number}): AppTheme {
  const {page, accent, ink, muted, progress, glow} = colours;
  return {
    id, name, page, accent, glow, progress, swatches,
    fluent: {
      ...createLightTheme(brandRamp(accent)),
      colorNeutralForeground1: ink,
      colorNeutralForeground2: muted,
      colorNeutralForeground3: muted,
      colorNeutralBackground3: mix(page, ink, 0.06),
    },
  };
}

// Wada 151: Sulpher Yellow, Yellow Orange, Vandar Poel's Blue.
const harbour = wada('harbour', 'Harbour · Wada 151', ['#f5ecc2', '#f99d1b', '#064f6e'],
  {page: '#faf6e2', accent: '#064f6e', ink: '#0b3548', muted: '#47606b', progress: '#f99d1b', glow: 65});

export const appThemes: AppTheme[] = [
  {
    id: 'default', name: 'Default',
    page: '#ffffff', accent: '#646cff', progress: '#6264a7', swatches: ['#6264a7', '#646cff'],
    fluent: teamsLightTheme,
  },
  // Wada 325: Eugenia Red, Naples Yellow, Yellow Ocher, Deep Slate Green.
  wada('book', 'Book · Wada 325', ['#da525d', '#fbe6a0', '#e2b540', '#112f2c'],
    {page: '#fdf7e4', accent: '#da525d', ink: '#112f2c', muted: '#4d5e5a', progress: '#e2b540'}),
  harbour,
  // Wada 343: Burnt Sienna, Ivory Buff, Deep Grayish Olive, Vandar Poel's Blue.
  wada('earth', 'Earth · Wada 343', ['#ae5224', '#ebd3a2', '#635a3a', '#064f6e'],
    {page: '#f8f0de', accent: '#ae5224', ink: '#0b3a50', muted: '#635a3a', progress: '#635a3a'}),
  // Wada 321: Light Brown Drab, Sulpher Yellow, Deep Slate Olive, Salvia Blue (darkened to read as text).
  wada('quiet', 'Quiet · Wada 321', ['#b59392', '#f5ecc2', '#253122', '#97acc8'],
    {page: '#f9f5e4', accent: '#5f7aa0', ink: '#253122', muted: '#5a6457', progress: '#b59392'}),
];

/** The scheme the app starts with: Harbour, not inverted. */
export const defaultTheme: AppTheme = harbour;

/**
 * The theme with page and cards swapped: a white page, and the scheme's page
 * colour on the cards and other surfaces. A white-page theme stays as it is.
 */
export function invert(theme: AppTheme): AppTheme {
  const ink = theme.fluent.colorNeutralForeground1;
  return {
    ...theme,
    page: '#ffffff',
    fluent: {
      ...theme.fluent,
      colorNeutralBackground1: theme.page,
      colorNeutralBackground1Hover: mix(theme.page, ink, 0.03),
      colorNeutralBackground1Pressed: mix(theme.page, ink, 0.05),
      colorNeutralBackground1Selected: mix(theme.page, ink, 0.05),
    },
  };
}
