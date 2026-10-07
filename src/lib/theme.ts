// AD-9: single source of truth for the DESIGN.md tokens. Keys and values are copied verbatim from the
// DESIGN.md frontmatter; src/styles/tokens.css mirrors them and theme.test.ts fails CI on any drift.

export const colors = {
  'surface-base': '#F5F8FB',
  'surface-raised': '#FFFFFF',
  'surface-sunken': '#EBF1F7',
  'ink-primary': '#0F1B2D',
  'ink-secondary': '#4A5A70',
  'ink-disabled': '#9AA7B8',
  'border-hairline': '#DCE5EE',
  accent: '#0B6FB8',
  'accent-pressed': '#095A96',
  danger: '#B3261E',
  success: '#1E7A4C',
  warning: '#8A5A00',
  'surface-base-dark': '#0B1220',
  'surface-raised-dark': '#141B2C',
  'surface-sunken-dark': '#0E1626',
  'ink-primary-dark': '#E8EEF5',
  'ink-secondary-dark': '#9FB0C4',
  'ink-disabled-dark': '#5A6B80',
  'border-hairline-dark': '#232E42',
  'accent-dark': '#5FAEEA',
  'accent-pressed-dark': '#8AC6F0',
  'danger-dark': '#E5847D',
  'success-dark': '#5FCB92',
  'warning-dark': '#D9A441',
  'snowscore-0': '#9AA7B8',
  'snowscore-1': '#8FC1E8',
  'snowscore-2': '#3E8FD0',
  'snowscore-3': '#0B4C8C',
} as const

export const typography = {
  display: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '2.25rem',
    fontWeight: '700',
    lineHeight: '1.15',
  },
  heading: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '1.25rem',
    fontWeight: '600',
    lineHeight: '1.3',
  },
  body: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '1rem',
    fontWeight: '400',
    lineHeight: '1.5',
  },
  meta: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '0.8125rem',
    fontWeight: '500',
    lineHeight: '1.4',
    letterSpacing: '0.01em',
  },
  numeric: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '1rem',
    fontWeight: '600',
    fontFeatureSettings: "'tnum' 1",
  },
} as const

export const rounded = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  full: '9999px',
} as const

export const spacing = {
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '24px',
  '6': '32px',
  '7': '48px',
  gutter: '16px',
} as const
