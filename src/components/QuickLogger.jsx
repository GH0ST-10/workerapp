import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Trash2, 
  Sparkles,
  FileEdit
} from 'lucide-react';
import { ATTENDANCE_TYPES } from '../constants';
import { 
  formatDateKey, 
  parseDateKey, 
  formatDisplayDate, 
  getRelativeDateLabel, 
  formatINR 
} from '../utils/dateUtils';

export default function QuickLogger({ 
  selectedDate, 
  setSelectedDate, 
  records, 
  onSaveAttendance, 
  onDeleteAttendance,
  rates
}) {
  const [note, setNote] = useState('');
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const currentRecord = records[selectedDate];
  const currentType = currentRecord ? currentRecord.type : null;
  const currentWage = currentType ? (rates[currentType] ?? 0) : null;

  // Keep note synchronized with current selected date record
  React.useEffect(() => {
    setNote(records[selectedDate]?.note || '');
  }, [selectedDate, records]);

  // Move date back 1 day
  const handlePrevDay = () => {
    const d = parseDateKey(selectedDate);
    d.setDate(d.getDate() - 1);
    const newKey = formatDateKey(d);
    setSelectedDate(newKey);
  };

  // Move date forward 1 day
  const handleNextDay = () => {
    const d = parseDateKey(selectedDate);
    d.setDate(d.getDate() + 1);
    const newKey = formatDateKey(d);
    setSelectedDate(newKey);
  };

  // Jump to today
  const handleToday = () => {
    const todayKey = formatDateKey(new Date());
    setSelectedDate(todayKey);
  };

  const handleSelectType = (typeKey) => {
    onSaveAttendance(selectedDate, typeKey, note.trim());
  };

  const isToday = selectedDate === formatDateKey(new Date());

  return (
    <section className="glass-card quick-logger-card">
      {/* Logger Card Header */}
      <div className="logger-card-header">
        <div className="logger-title">
          <CalendarIcon size={18} color="var(--primary-accent)" />
          <span>Mark Attendance</span>
        </div>

        {isToday ? (
          <span className="today-badge">
            Today
          </span>
        ) : (
          <button 
            type="button" 
            className="jump-today-btn"
            onClick={handleToday}
            title="Jump to today's date"
          >
            Jump to Today
          </button>
        )}
      </div>

      {/* Unified Date Stepper & Picker Bar */}
      <div className="logger-date-bar">
        <button 
          type="button" 
          className="date-nav-arrow-btn" 
          onClick={handlePrevDay}
          title="Previous Day"
          aria-label="Previous Day"
        >
          <ChevronLeft size={18} />
        </button>

        <label className="date-picker-label" title="Tap to select custom date">
          <CalendarIcon size={15} className="date-picker-icon" />
          <span className="date-picker-text">
            {formatDisplayDate(selectedDate, { includeWeekday: true })}
          </span>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => {
              if (e.target.value) setSelectedDate(e.target.value);
            }}
            className="date-picker-hidden-input"
            id="quick-date-picker-input"
          />
        </label>

        <button 
          type="button" 
          className="date-nav-arrow-btn" 
          onClick={handleNextDay}
          title="Next Day"
          aria-label="Next Day"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Current logged status alert */}
      {currentRecord ? (
        <div className="current-status-banner recorded">
          <div className="status-text-row">
            <span 
              className="dot-indicator" 
              style={{ backgroundColor: ATTENDANCE_TYPES[currentType]?.color || '#94a3b8' }} 
            />
            <span>
              Recorded: <strong style={{ color: ATTENDANCE_TYPES[currentType]?.color }}>{ATTENDANCE_TYPES[currentType]?.label}</strong> ({formatINR(currentWage)})
              {currentRecord.note && <span className="status-note-text"> — "{currentRecord.note}"</span>}
            </span>
          </div>
          <button 
            type="button"
            className="clear-record-btn" 
            onClick={() => onDeleteAttendance(selectedDate)}
            title="Remove record for this date"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        </div>
      ) : (
        <div className="current-status-banner unrecorded">
          <span>Tap an option below to record attendance:</span>
        </div>
      )}

      {/* 3 Large Action Buttons */}
      <div className="attendance-actions-grid">
        {/* Full Day Button */}
        <button
          type="button"
          className={`action-btn full-btn ${currentType === 'FULL' ? 'active' : ''}`}
          onClick={() => handleSelectType('FULL')}
          id="btn-mark-full-day"
        >
          <div className="action-btn-icon">
            <CheckCircle2 size={24} />
          </div>
          <span className="action-btn-title">Full Day</span>
          <span className="action-btn-wage">{formatINR(rates.FULL)}</span>
          {currentType === 'FULL' && (
            <span style={{ fontSize: '10px', opacity: 0.85, fontWeight: 700 }}>✓ ACTIVE</span>
          )}
        </button>

        {/* Half Day Button */}
        <button
          type="button"
          className={`action-btn half-btn ${currentType === 'HALF' ? 'active' : ''}`}
          onClick={() => handleSelectType('HALF')}
          id="btn-mark-half-day"
        >
          <div className="action-btn-icon">
            <Clock size={24} />
          </div>
          <span className="action-btn-title">Half Day</span>
          <span className="action-btn-wage">{formatINR(rates.HALF)}</span>
          {currentType === 'HALF' && (
            <span style={{ fontSize: '10px', opacity: 0.85, fontWeight: 700 }}>✓ ACTIVE</span>
          )}
        </button>

        {/* Absent Button */}
        <button
          type="button"
          className={`action-btn absent-btn ${currentType === 'ABSENT' ? 'active' : ''}`}
          onClick={() => handleSelectType('ABSENT')}
          id="btn-mark-absent"
        >
          <div className="action-btn-icon">
            <XCircle size={24} />
          </div>
          <span className="action-btn-title">Absent</span>
          <span className="action-btn-wage">{formatINR(rates.ABSENT)}</span>
          {currentType === 'ABSENT' && (
            <span style={{ fontSize: '10px', opacity: 0.85, fontWeight: 700 }}>✓ ACTIVE</span>
          )}
        </button>
      </div>

      {/* Optional Note / Shift Description */}
      <div>
        {!isNoteOpen && !currentRecord?.note ? (
          <button
            type="button"
            onClick={() => setIsNoteOpen(true)}
            style={{
              fontSize: '12.5px',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 0'
            }}
          >
            <FileEdit size={14} />
            + Add optional shift note / location
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <input 
              type="text" 
              placeholder="e.g. Overtime, Site A, Heavy rain shift..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
            />
            {currentRecord && (
              <button
                type="button"
                onClick={() => {
                  onSaveAttendance(selectedDate, currentRecord.type, note.trim());
                }}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Save Note
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
