export const Colors = {
  // Dark theme (canonical)
  bg:            '#0D0E10',
  surface:       '#F5F4EF',
  surfaceInk:    '#0D0E10',
  surfaceAlt:    '#141517',
  surfaceAltInk: '#F5F4EF',
  tint:          '#C9B8F5',
  tintInk:       '#1A0F4A',
  ink:           '#F5F4EF',
  ink2:          'rgba(245,244,239,0.62)',
  ink3:          'rgba(245,244,239,0.42)',
  line:          'rgba(245,244,239,0.08)',
  lineStrong:    'rgba(245,244,239,0.16)',
  ok:            '#4CBB73',
  warn:          '#C98A3A',
  err:           '#B5423A',

  // Legacy aliases (backwards compat with existing screens)
  card:          '#F5F4EF',
  cardInk:       '#0D0E10',
  cardAlt:       '#141517',
  cardAltInk:    '#F5F4EF',
  accent:        '#C9B8F5',
  accentInk:     '#1A0F4A',
  muted:         'rgba(13,14,16,0.55)',
  mutedAlt:      'rgba(245,244,239,0.55)',

  // Light theme overrides
  light: {
    bg:            '#F5F4EF',
    surface:       '#FFFFFF',
    surfaceAlt:    '#EEECE6',
    card:          '#FFFFFF',
    cardInk:       '#0D0E10',
    cardAlt:       '#EEECE6',
    cardAltInk:    '#0D0E10',
    ink:           '#0D0E10',
    ink2:          'rgba(13,14,16,0.62)',
    ink3:          'rgba(13,14,16,0.42)',
    line:          'rgba(13,14,16,0.08)',
    lineStrong:    'rgba(13,14,16,0.16)',
    muted:         'rgba(13,14,16,0.50)',
    mutedAlt:      'rgba(13,14,16,0.45)',
  },
} as const;

export const AspectColors: Record<string, string> = {
  facial:    '#E8B4BC',
  physical:  '#D9A876',
  mental:    '#C9B8F5',
  spiritual: '#A8D9B8',
  money:     '#10b981',
  knowledge: '#8A97AD',
};

export const Radii = {
  card:  22,
  hero:  26,
  row:   16,
  pill:  999,
  tile:  14,
  input: 14,
  chip:  999,
} as const;

export const Spacing = {
  xs:    4,
  sm:    8,
  md:    12,
  base:  16,
  lg:    18,
  xl:    22,
  '2xl': 28,
  '3xl': 40,
} as const;

export const FontSize = {
  displayXl: 64,
  displayLg: 42,
  displayMd: 32,
  numXl:     44,
  numMd:     34,
  bodyLg:    15,
  bodyMd:    13,
  label:     11,
  monoSm:    11,
} as const;

export const Fonts = {
  serif:        'InstrumentSerif_400Regular',
  serifItalic:  'InstrumentSerif_400Regular_Italic',
  sans:         'Geist_400Regular',
  sansMedium:   'Geist_500Medium',
  sansSemiBold: 'Geist_600SemiBold',
  sansBold:     'Geist_700Bold',
  mono:         'JetBrainsMono_400Regular',
  monoMedium:   'JetBrainsMono_500Medium',
} as const;

export const Shadows = {
  cardLift: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius:  40,
    elevation:     10,
  },
} as const;
