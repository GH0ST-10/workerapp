import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalIcon,
  Plus
} from 'lucide-react';
import { getCalendarGrid, formatDateKey, formatINR } from '../utils/dateUtils';
import { ATTENDANCE_TYPES } from '../constants';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AttendanceCalendar({ 
  currentYear, 
  currentMonth, 
  onChangeMonth, 
  records, 
  selectedDate, 
  onSelectDate, 
  onOpenEditModal,
  rates
}) {
  const grid = getCalendarGrid(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      onChangeMonth(currentYear - 1, 11);
    } else {
      onChangeMonth(currentYear, currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      onChangeMonth(currentYear + 1, 0);
    } else {
      onChangeMonth(currentYear, currentMonth + 1);
    }
  };

  const handleTodayMonth = () => {
    const today = new Date();
    onChangeMonth(today.getFullYear(), today.getMonth());
    onSelectDate(formatDateKey(today));
  };

  // Monthly stats for the calendar banner
  let monthEarnings = 0;
  let monthWorkDays = 0;
  Object.entries(records).forEach(([key, record]) => {
    const [y, m] = key.split('-').map(Number);
    if (y === currentYear && (m - 1) === currentMonth) {
      const wage = rates[record.type] ?? 0;
      monthEarnings += wage;
      if (record.type === 'FULL' || record.type === 'HALF') {
        monthWorkDays++;
      }
    }
  });

  return (
    <section className="glass-card calendar-card">
      {/* Calendar Header with Navigation */}
      <div className="calendar-header">
        <div className="calendar-title-nav">
          <button 
            type="button" 
            className="cal-nav-btn" 
            onClick={handlePrevMonth}
            title="Previous Month"
            aria-label="Previous Month"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="calendar-month-text">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>

          <button 
            type="button" 
            className="cal-nav-btn" 
            onClick={handleNextMonth}
            title="Next Month"
            aria-label="Next Month"
          >
            <ChevronRight size={18} />
          </button>

          <button
            type="button"
            onClick={handleTodayMonth}
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--primary-accent)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              marginLeft: 4
            }}
          >
            Today
          </button>
        </div>

        {/* Monthly quick badge */}
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          background: 'var(--bg-input)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          gap: 8
        }}>
          <span><strong>{monthWorkDays}</strong> shifts</span>
          <span>•</span>
          <span style={{ color: 'var(--color-full)' }}><strong>{formatINR(monthEarnings)}</strong></span>
        </div>
      </div>

      {/* Color Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: ATTENDANCE_TYPES.FULL.color }} />
          <span>Full Day ({formatINR(rates.FULL)})</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: ATTENDANCE_TYPES.HALF.color }} />
          <span>Half Day ({formatINR(rates.HALF)})</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: ATTENDANCE_TYPES.ABSENT.color }} />
          <span>Absent ({formatINR(rates.ABSENT)})</span>
        </div>
      </div>

      {/* Weekday Column Headers */}
      <div className="calendar-weekdays">
        {WEEKDAYS.map((day, i) => (
          <div key={day} style={{ color: i === 0 ? 'var(--color-absent)' : 'inherit' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid of Day Cells */}
      <div className="calendar-grid">
        {grid.map((cell) => {
          const record = records[cell.dateKey];
          const type = record ? record.type : null;
          const isSelected = cell.dateKey === selectedDate;
          const wage = type ? (rates[type] ?? 0) : null;

          return (
            <div
              key={cell.dateKey}
              className={`cal-day-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${cell.isToday ? 'is-today' : ''} ${isSelected ? 'selected-date' : ''}`}
              onClick={() => {
                onSelectDate(cell.dateKey);
                onOpenEditModal(cell.dateKey);
              }}
              title={`${cell.dateKey}: ${type ? ATTENDANCE_TYPES[type].label : 'No attendance'}. Click to edit.`}
            >
              {/* Day Number */}
              <div className="cal-day-number">
                {cell.dayNumber}
              </div>

              {/* Status Badge if logged */}
              {type ? (
                <div className={`cal-day-badge ${type.toLowerCase()}`}>
                  <span style={{ textTransform: 'uppercase', fontSize: '9px', letterSpacing: '0.3px' }}>
                    {ATTENDANCE_TYPES[type].shortLabel}
                  </span>
                  <span className="cal-badge-amount">
                    {formatINR(wage)}
                  </span>
                </div>
              ) : cell.isCurrentMonth ? (
                <div style={{ opacity: 0.25, fontSize: '10px' }}>
                  <Plus size={12} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
