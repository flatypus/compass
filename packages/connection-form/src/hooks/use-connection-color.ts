import { useCallback } from 'react';

type ColorCode = `color${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;

const COLOR_CODES_TO_UI_COLORS_DARK_THEME_MAP: Record<ColorCode, string> = {
  color1: '#00a35c', // green.dark1
  color2: '#71f6ba', // green.light1
  color3: '#016bf8', // blue.base
  color4: '#0498ec', // blue.light1
  color5: '#ffc010', // yellow.base
  color6: '#ff6960', // red.light1
  color7: '#b45af2', // purple.base
  color8: '#f1d4fd', // purple.light2
  color9: '#889397', // gray.base
  color10: '#c1c7c6', // gray.light1
};

const LEGACY_COLORS_TO_COLOR_CODE_MAP: Record<string, ColorCode> = {
  '#00ed64': 'color1',
  '#016bf8': 'color2',
  '#ffc010': 'color3',
  '#db3030': 'color4',
  '#c3e7fe': 'color5',
  '#00684a': 'color6',
  '#db3030': 'color7',
  '#4c2100': 'color8',
  '#5c6c75': 'color9',
  '#c1c7c6': 'color10',
};

export const CONNECTION_COLOR_CODES = Object.keys(
  COLOR_CODES_TO_UI_COLORS_DARK_THEME_MAP
) as ColorCode[];

function isColorCode(hexOrColorCode: string | undefined): boolean {
  return CONNECTION_COLOR_CODES.includes(hexOrColorCode as ColorCode);
}

export function legacyColorsToColorCode(
  hexOrColorCode: string | undefined
): ColorCode | undefined {
  if (!hexOrColorCode) {
    return;
  }

  if (isColorCode(hexOrColorCode)) {
    return hexOrColorCode as ColorCode;
  }

  return LEGACY_COLORS_TO_COLOR_CODE_MAP[hexOrColorCode];
}

export function useConnectionColor(): {
  connectionColorToHex: (colorCode: string | undefined) => string | undefined;
} {
  const colorCodeToHex = useCallback(
    (colorCode: string | undefined): string | undefined => {
      if (!colorCode) {
        return;
      }

      const migratedColor = legacyColorsToColorCode(colorCode);
      if (!migratedColor) {
        return;
      }

      return COLOR_CODES_TO_UI_COLORS_DARK_THEME_MAP[migratedColor];
    },
    []
  );

  return {
    connectionColorToHex: colorCodeToHex,
  };
}
