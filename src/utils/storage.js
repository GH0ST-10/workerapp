import { STORAGE_KEYS, DEFAULT_RATES } from '../constants';
import { generateInitialRecords, formatDateKey } from './dateUtils';

// Load attendance records (starts empty with real user data only)
export function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load records from localStorage', err);
    return {};
  }
}

// Save attendance records
export function saveRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save records to localStorage', err);
  }
}

// Load settings
export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const defaults = {
      workerName: '',
      companyName: '',
      rates: { ...DEFAULT_RATES },
      soundEnabled: true,
      monthlyTarget: 15000
    };
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch (err) {
    return {
      workerName: '',
      companyName: '',
      rates: { ...DEFAULT_RATES },
      soundEnabled: true,
      monthlyTarget: 15000
    };
  }
}

// Save settings
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
  }
}

// Download data as JSON
export function exportToJson(records, settings) {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    settings,
    records
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance_backup_${formatDateKey(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Download data as CSV
export function exportToCsv(records, rates) {
  const rows = [['Date', 'Attendance Type', 'Earnings (INR)', 'Notes']];
  
  const sortedDates = Object.keys(records).sort();
  for (const date of sortedDates) {
    const item = records[date];
    const wage = rates[item.type] ?? 0;
    const typeLabel = item.type === 'FULL' ? 'Full Day' : item.type === 'HALF' ? 'Half Day' : 'Absent';
    rows.push([
      date,
      typeLabel,
      wage,
      `"${(item.note || '').replace(/"/g, '""')}"`
    ]);
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const a = document.createElement('a');
  a.href = encodedUri;
  a.download = `attendance_records_${formatDateKey(new Date())}.csv`;
  a.click();
}
