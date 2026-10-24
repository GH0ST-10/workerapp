/**
 * Date utility helpers for Attendance & Earnings Tracker
 */

// Formats a Date object or timestamp into YYYY-MM-DD
export function formatDateKey(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parses YYYY-MM-DD string into local Date object safely
export function parseDateKey(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return new Date();
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return new Date();
  }
  return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
}

// Formats YYYY-MM-DD to human readable string, e.g. "Sat, 24 Oct 2026"
export function formatDisplayDate(dateStr, options = { includeWeekday: true }) {
  if (!dateStr) return '';
  const d = parseDateKey(dateStr);
  const weekday = options.includeWeekday 
    ? d.toLocaleDateString('en-IN', { weekday: 'short' }) + ', ' 
    : '';
  const day = d.getDate();
  const month = d.toLocaleDateString('en-IN', { month: 'short' });
  const year = d.getFullYear();
  return `${weekday}${day} ${month} ${year}`;
}

// Formats YYYY-MM-DD to relative text: "Today", "Yesterday", "Tomorrow", or "24 Oct"
export function getRelativeDateLabel(dateStr) {
  const today = formatDateKey(new Date());
  if (dateStr === today) return 'Today';
  
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  if (dateStr === formatDateKey(yesterdayDate)) return 'Yesterday';
  
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  if (dateStr === formatDateKey(tomorrowDate)) return 'Tomorrow';
  
  return formatDisplayDate(dateStr, { includeWeekday: true });
}

// Currency formatter for Indian Rupees
export function formatINR(amount = 0) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Gets the days grid for a calendar month (year, month 0-indexed)
// Returns array of { dateKey, dayNumber, isCurrentMonth, isToday, jsDate }
export function getCalendarGrid(year, month) {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const totalDays = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  
  const todayKey = formatDateKey(new Date());
  const grid = [];
  
  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, day);
    grid.push({
      dateKey: formatDateKey(prevDate),
      dayNumber: day,
      isCurrentMonth: false,
      isToday: formatDateKey(prevDate) === todayKey,
      jsDate: prevDate
    });
  }
  
  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const currDate = new Date(year, month, day);
    const dateKey = formatDateKey(currDate);
    grid.push({
      dateKey,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateKey === todayKey,
      jsDate: currDate
    });
  }
  
  // Next month padding to complete row grid (multiples of 7)
  const remainingCells = (7 - (grid.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    const nextDate = new Date(year, month + 1, day);
    grid.push({
      dateKey: formatDateKey(nextDate),
      dayNumber: day,
      isCurrentMonth: false,
      isToday: formatDateKey(nextDate) === todayKey,
      jsDate: nextDate
    });
  }
  
  return grid;
}

// Returns empty records object for clean slate
export function generateInitialRecords() {
  return {};
}
