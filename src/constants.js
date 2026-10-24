export const ATTENDANCE_TYPES = {
  FULL: {
    id: 'FULL',
    label: 'Full Day',
    shortLabel: 'Full',
    defaultWage: 500,
    color: '#10b981', // vibrant emerald
    lightBg: '#ecfdf5',
    lightBorder: '#6ee7b7',
    darkBg: 'rgba(16, 185, 129, 0.15)',
    darkBorder: 'rgba(16, 185, 129, 0.35)',
    badgeClass: 'badge-full',
    description: 'Full Day worked (₹500 credited)'
  },
  HALF: {
    id: 'HALF',
    label: 'Half Day',
    shortLabel: 'Half',
    defaultWage: 300,
    color: '#f59e0b', // warm amber
    lightBg: '#fffbeb',
    lightBorder: '#fcd34d',
    darkBg: 'rgba(245, 158, 11, 0.15)',
    darkBorder: 'rgba(245, 158, 11, 0.35)',
    badgeClass: 'badge-half',
    description: 'Half Day worked (₹300 credited)'
  },
  ABSENT: {
    id: 'ABSENT',
    label: 'Absent',
    shortLabel: 'Absent',
    defaultWage: 0,
    color: '#f43f5e', // coral rose
    lightBg: '#fff1f2',
    lightBorder: '#fda4af',
    darkBg: 'rgba(244, 63, 94, 0.15)',
    darkBorder: 'rgba(244, 63, 94, 0.35)',
    badgeClass: 'badge-absent',
    description: 'Absent / Day Off (₹0 credited)'
  }
};

export const DEFAULT_RATES = {
  FULL: 500,
  HALF: 300,
  ABSENT: 0
};

export const STORAGE_KEYS = {
  RECORDS: 'worktrack_attendance_records_v2',
  SETTINGS: 'worktrack_settings_v2',
  THEME: 'worktrack_theme_v1'
};
