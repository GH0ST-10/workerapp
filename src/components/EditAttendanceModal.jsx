import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalIcon, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Trash2, 
  Check, 
  FileText 
} from 'lucide-react';
import { ATTENDANCE_TYPES } from '../constants';
import { formatDisplayDate, formatINR } from '../utils/dateUtils';

export default function EditAttendanceModal({ 
  isOpen, 
  onClose, 
  initialDate, 
  records, 
  onSaveAttendance, 
  onDeleteAttendance,
  rates
}) {
  const [date, setDate] = useState(initialDate);
  const [selectedType, setSelectedType] = useState('FULL');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
      const record = records[initialDate];
      if (record) {
        setSelectedType(record.type);
        setNote(record.note || '');
      } else {
        setSelectedType('FULL');
        setNote('');
      }
    }
  }, [initialDate, records, isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentRecord = records[date];

  const handleSave = () => {
    if (!date) return;
    onSaveAttendance(date, selectedType, note.trim());
    onClose();
  };

  const handleDelete = () => {
    if (!date) return;
    if (window.confirm(`Are you sure you want to remove attendance for ${formatDisplayDate(date)}?`)) {
      onDeleteAttendance(date);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-accent)'
            }}>
              <CalIcon size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '18px', margin: 0 }}>
                {currentRecord ? 'Edit Attendance' : 'Log Attendance'}
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {formatDisplayDate(date)}
              </span>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Change Date Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Select Date:
            </label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => {
                const newDate = e.target.value;
                if (!newDate) return;
                setDate(newDate);
                const rec = records[newDate];
                if (rec) {
                  setSelectedType(rec.type);
                  setNote(rec.note || '');
                } else {
                  setNote('');
                }
              }}
              style={{ width: '100%' }}
              required
            />
          </div>

          {/* Attendance Options */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Attendance Status:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {/* Full Day Option */}
              <button
                type="button"
                className={`action-btn full-btn ${selectedType === 'FULL' ? 'active' : ''}`}
                onClick={() => setSelectedType('FULL')}
              >
                <CheckCircle2 size={22} />
                <span className="action-btn-title">Full Day</span>
                <span className="action-btn-wage">{formatINR(rates.FULL)}</span>
              </button>

              {/* Half Day Option */}
              <button
                type="button"
                className={`action-btn half-btn ${selectedType === 'HALF' ? 'active' : ''}`}
                onClick={() => setSelectedType('HALF')}
              >
                <Clock size={22} />
                <span className="action-btn-title">Half Day</span>
                <span className="action-btn-wage">{formatINR(rates.HALF)}</span>
              </button>

              {/* Absent Option */}
              <button
                type="button"
                className={`action-btn absent-btn ${selectedType === 'ABSENT' ? 'active' : ''}`}
                onClick={() => setSelectedType('ABSENT')}
              >
                <XCircle size={22} />
                <span className="action-btn-title">Absent</span>
                <span className="action-btn-wage">{formatINR(rates.ABSENT)}</span>
              </button>
            </div>
          </div>

          {/* Shift / Work Note */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Shift Note (Optional):
            </label>
            <input 
              type="text" 
              placeholder="e.g. Regular shift, Site work, Overtime, Rain..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {currentRecord && (
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-absent-bg)',
                  border: '1px solid var(--color-absent-border)',
                  color: 'var(--color-absent)',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-gradient)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <Check size={18} strokeWidth={2.5} />
              Save Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
