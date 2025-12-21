export const theme = {
  colors: {
    // Primary Colors
    primary: {
      green: '#0ECB81',
      red: '#F6465D',
      yellow: '#F0B90B',
      yellowBright: '#FCD535',
    },

    // Background Colors (Dark Theme)
    background: {
      primary: '#161A1E',
      secondary: '#1E2329',
      tertiary: '#1E2026',
      card: '#181A20',
      elevated: '#23282D',
      dark: '#252930',
      panel: '#2B2F36',
      panelLight: '#3A3F46',
    },

    // Text Colors
    text: {
      primary: '#EAECEF',
      secondary: '#B7BDC6',
      tertiary: '#848E9C',
      muted: '#76808F',
      disabled: '#474D57',
      dark: '#C1C6CD',
    },

    // Border Colors
    border: {
      primary: '#2B3139',
      secondary: '#3D4653',
      muted: '#5E6673',
    },

    // Accent Colors
    accent: {
      cyan: '#74FCFD',
      magenta: '#EA3DF7',
      orange: '#F19C38',
    },

    // Status Colors with Opacity
    status: {
      green: {
        solid: '#0ECB81',
        light: 'rgba(14, 203, 129, 0.15)', 
        lightest: 'rgba(14, 203, 129, 0.10)', 
      },
      red: {
        solid: '#F6465D',
        light: 'rgba(246, 70, 93, 0.15)', 
        lightest: 'rgba(246, 70, 93, 0.10)', 
      },
      yellow: {
        solid: '#FCD535',
        light: 'rgba(252, 213, 53, 0.70)', 
      },
      cyan: {
        light: 'rgba(116, 252, 253, 0.70)', 
      },
      magenta: {
        light: 'rgba(234, 61, 247, 0.70)',
      },
      orange: {
        light: 'rgba(241, 156, 56, 0.70)', 
      },
    },

    // Utility Colors
    white: '#FFFFFF',
    black: '#000000',
    
    // Special Colors
    brown: {
      dark: '#3C2601',
      olive: '#36321D',
    },

    // Panel with Opacity
    panel: {
      solid: '#2B2F36',
      opaque90: 'rgba(43, 47, 54, 0.90)',
      opaque80: 'rgba(43, 47, 54, 0.80)',
      opaque50: 'rgba(58, 63, 70, 0.50)',
    },
  },

  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  },
} as const;

export type Theme = typeof theme;
