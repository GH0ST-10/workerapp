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

  // Move date back 1 day
  const handlePrevDay = () => {
    const d = parseDateKey(selectedDate);
    d.setDate(d.getDate() - 1);
    const newKey = formatDateKey(d);
    setSelectedDate(newKey);
    if (records[newKey]?.note) {
      setNote(records[newKey].note);
    } else {
      setNote('');
    }
  };

  // Move date forward 1 day
  const handleNextDay = () => {
    const d = parseDateKey(selectedDate);
    d.setDate(d.getDate() + 1);
    const newKey = formatDateKey(d);
    setSelectedDate(newKey);
    if (records[newKey]?.note) {
      setNote(records[newKey].note);
    } else {
      setNote('');
    }
  };

  // Jump to today
  const handleToday = () => {
    const todayKey = formatDateKey(new Date());
    setSelectedDate(todayKey);
    if (records[todayKey]?.note) {
      setNote(records[todayKey].note);
    } else {
      setNote('');
    }
  };

  const handleSelectType = (typeKey) => {
    onSaveAttendance(selectedDate, typeKey, note || currentRecord?.note || '');
  };

  const isToday = selectedDate === formatDateKey(new Date());

  return (
    <section className="glass-card quick-logger-card">
      <div className="logger-header">
        <div className="logger-title">
          <CalendarIcon size={18} color="var(--primary-accent)" />
          <span>Mark Daily Attendance</span>
        </div>

        {/* Date stepper */}
        <div className="date-stepper">
          <button 
            type="button" 
            className="date-stepper-btn" 
            onClick={handlePrevDay}
            title="Previous Day"
            aria-label="Previous Day"
          >
            <ChevronLeft size={16} />
          </button>

          <label className="date-stepper-display" title="Click to pick a custom date">
            <span>{getRelativeDateLabel(selectedDate)}</span>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => {
                if (e.target.value) setSelectedDate(e.target.value);
              }}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
              id="quick-date-picker-input"
            />
          </label>

          <button 
            type="button" 
            className="date-stepper-btn" 
            onClick={handleNextDay}
            title="Next Day"
            aria-label="Next Day"
          >
            <ChevronRight size={16} />
          </button>

          {!isToday && (
            <button 
              type="button" 
              onClick={handleToday}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--primary-accent)',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.1)'
              }}
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Date banner with input helper */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <div>
          <strong>{formatDisplayDate(selectedDate, { includeWeekday: true })}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) setSelectedDate(e.target.value);
            }}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              borderRadius: '6px'
            }}
          />
        </div>
      </div>

      {/* Current logged status alert if present */}
      {currentRecord ? (
        <div className="current-status-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span 
              className="dot-indicator" 
              style={{ backgroundColor: ATTENDANCE_TYPES[currentType]?.color || '#94a3b8' }} 
            />
            <span>
              Recorded: <strong>{ATTENDANCE_TYPES[currentType]?.label}</strong> ({formatINR(currentWage)} credited)
              {currentRecord.note && <span style={{ opacity: 0.8, fontStyle: 'italic' }}> — "{currentRecord.note}"</span>}
            </span>
          </div>
          <button 
            className="clear-record-btn" 
            onClick={() => onDeleteAttendance(selectedDate)}
            title="Remove record for this date"
          >
            <Trash2 size={13} style={{ verticalAlign: 'middle', marginRight: 2 }} />
            Clear
          </button>
        </div>
      ) : (
        <div className="current-status-banner" style={{ color: 'var(--text-muted)' }}>
          <span>No attendance recorded yet for this date. Select an option below:</span>
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
              value={note || currentRecord?.note || ''}
              onChange={(e) => setNote(e.target.value)}
              style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
            />
            {currentRecord && (
              <button
                type="button"
                onClick={() => {
                  onSaveAttendance(selectedDate, currentRecord.type, note);
                }}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 12px',
                  fontSize: '12px',
                  fontWeight: 600
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
