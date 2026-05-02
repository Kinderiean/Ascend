import { useStore } from './store';
import { Colors } from '../theme/tokens';

export interface DynamicColors {
  bg: string;
  // Light surface (cream card)
  card: string; cardInk: string;
  surface: string; surfaceInk: string;
  // Dark surface
  cardAlt: string; cardAltInk: string;
  surfaceAlt: string; surfaceAltInk: string;
  // Accent / tint
  accent: string; accentInk: string;
  tint: string; tintInk: string;
  // Ink scale
  ink: string; ink2: string; ink3: string;
  // Borders
  line: string; lineStrong: string;
  // Muted
  muted: string; mutedAlt: string;
  // Status
  ok: string; warn: string; err: string;
}

export function useColors(): DynamicColors {
  const theme = useStore(s => s.theme);

  if (theme === 'light') {
    const l = Colors.light;
    return {
      bg:            l.bg,
      card:          l.card,
      cardInk:       l.cardInk,
      surface:       l.surface,
      surfaceInk:    l.cardInk,
      cardAlt:       l.cardAlt,
      cardAltInk:    l.cardAltInk,
      surfaceAlt:    l.surfaceAlt,
      surfaceAltInk: l.cardAltInk,
      accent:        Colors.accent,
      accentInk:     Colors.accentInk,
      tint:          Colors.tint,
      tintInk:       Colors.tintInk,
      ink:           l.ink,
      ink2:          l.ink2,
      ink3:          l.ink3,
      line:          l.line,
      lineStrong:    l.lineStrong,
      muted:         l.muted,
      mutedAlt:      l.mutedAlt,
      ok:            Colors.ok,
      warn:          Colors.warn,
      err:           Colors.err,
    };
  }

  return {
    bg:            Colors.bg,
    card:          Colors.card,
    cardInk:       Colors.cardInk,
    surface:       Colors.surface,
    surfaceInk:    Colors.surfaceInk,
    cardAlt:       Colors.cardAlt,
    cardAltInk:    Colors.cardAltInk,
    surfaceAlt:    Colors.surfaceAlt,
    surfaceAltInk: Colors.surfaceAltInk,
    accent:        Colors.accent,
    accentInk:     Colors.accentInk,
    tint:          Colors.tint,
    tintInk:       Colors.tintInk,
    ink:           Colors.ink,
    ink2:          Colors.ink2,
    ink3:          Colors.ink3,
    line:          Colors.line,
    lineStrong:    Colors.lineStrong,
    muted:         Colors.muted,
    mutedAlt:      Colors.mutedAlt,
    ok:            Colors.ok,
    warn:          Colors.warn,
    err:           Colors.err,
  };
}
