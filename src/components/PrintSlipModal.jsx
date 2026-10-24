import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { formatDisplayDate, formatINR } from '../utils/dateUtils';
import { ATTENDANCE_TYPES } from '../constants';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PrintSlipModal({ 
  isOpen, 
  onClose, 
  year, 
  monthIndex, 
  records, 
  rates, 
  settings 
}) {
  if (!isOpen) return null;

  // Filter records for the selected month
  const monthRecords = Object.entries(records)
    .filter(([key]) => {
      const [y, m] = key.split('-').map(Number);
      return y === year && (m - 1) === monthIndex;
    })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, item]) => ({
      dateKey,
      ...item,
      wage: rates[item.type] ?? 0
    }));

  let fullDays = 0;
  let halfDays = 0;
  let absentDays = 0;
  let totalEarnings = 0;

  monthRecords.forEach(item => {
    if (item.type === 'FULL') {
      fullDays++;
      totalEarnings += (rates.FULL ?? 500);
    } else if (item.type === 'HALF') {
      halfDays++;
      totalEarnings += (rates.HALF ?? 300);
    } else if (item.type === 'ABSENT') {
      absentDays++;
    }
  });

  const totalWorkedDays = fullDays + halfDays;
  const monthName = MONTH_NAMES[monthIndex];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-sheet" 
        style={{ maxWidth: '680px', maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Actions (hidden on print) */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 className="modal-title" style={{ fontSize: '18px', margin: 0 }}>
              Monthly Attendance & Wage Slip
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--primary-gradient)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Printer size={15} />
              Print / Save PDF
            </button>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Wage Slip Document */}
        <div 
          className="print-slip-area" 
          style={{ 
            background: '#ffffff', 
            color: '#111827', 
            padding: '24px', 
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            fontSize: '13px'
          }}
        >
          {/* Slip Header */}
          <div style={{ borderBottom: '2px solid #374151', paddingBottom: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#111827', fontFamily: 'var(--font-display)' }}>
                  ATTENDANCE & WAGE SLIP
                </h1>
                <p style={{ fontSize: '14px', color: '#4b5563', marginTop: 2, fontWeight: 600 }}>
                  {settings?.companyName || 'Workplace / Employer'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  display: 'inline-block',
                  background: '#f3f4f6', 
                  padding: '4px 10px', 
                  borderRadius: '6px', 
                  fontSize: '13px', 
                  fontWeight: 700 
                }}>
                  {monthName} {year}
                </span>
                <p style={{ fontSize: '11px', color: '#6b7280', marginTop: 4 }}>
                  Generated on {formatDisplayDate(new Date().toISOString().slice(0, 10))}
                </p>
              </div>
            </div>

            {/* Worker Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 14, background: '#f9fafb', padding: '10px 14px', borderRadius: '8px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Worker Name</span>
                <p style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>{settings?.workerName || 'Worker'}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Wage Rate Structure</span>
                <p style={{ fontWeight: 600, fontSize: '12px', margin: 0 }}>
                  Full: ₹{rates.FULL} • Half: ₹{rates.HALF} • Absent: ₹0
                </p>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div style={{ marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #d1d5db' }}>
                  <th style={{ padding: '8px 10px' }}>Date</th>
                  <th style={{ padding: '8px 10px' }}>Attendance Status</th>
                  <th style={{ padding: '8px 10px' }}>Notes / Shift</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Credited (INR)</th>
                </tr>
              </thead>
              <tbody>
                {monthRecords.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
                      No attendance logged for {monthName} {year}.
                    </td>
                  </tr>
                ) : (
                  monthRecords.map((item, idx) => (
                    <tr key={item.dateKey} style={{ borderBottom: '1px solid #f3f4f6', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '7px 10px', fontWeight: 600 }}>
                        {formatDisplayDate(item.dateKey, { includeWeekday: true })}
                      </td>
                      <td style={{ padding: '7px 10px' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '11.5px',
                          color: item.type === 'FULL' ? '#047857' : item.type === 'HALF' ? '#b45309' : '#b91c1c'
                        }}>
                          {ATTENDANCE_TYPES[item.type]?.label}
                        </span>
                      </td>
                      <td style={{ padding: '7px 10px', color: '#4b5563' }}>
                        {item.note || '—'}
                      </td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: item.wage > 0 ? '#047857' : '#6b7280' }}>
                        {formatINR(item.wage)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Calculation Section */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: 16, 
            background: '#f9fafb', 
            border: '1px solid #e5e7eb',
            padding: '16px', 
            borderRadius: '8px' 
          }}>
            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: '#374151' }}>
                Summary of Days
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '12px', color: '#4b5563' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Full Days Worked:</span>
                  <strong>{fullDays} days (@ ₹{rates.FULL})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Half Days Worked:</span>
                  <strong>{halfDays} days (@ ₹{rates.HALF})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Absent / Off Days:</span>
                  <strong>{absentDays} days</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #d1d5db', paddingTop: 4, fontWeight: 700, color: '#111827' }}>
                  <span>Total Days Worked:</span>
                  <span>{totalWorkedDays} Days</span>
                </div>
              </div>
            </div>

            <div style={{ 
              background: '#ecfdf5', 
              border: '1px solid #a7f3d0', 
              borderRadius: '8px', 
              padding: '14px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>
                Total Net Earnings
              </span>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#047857', fontFamily: 'var(--font-display)', margin: '4px 0' }}>
                {formatINR(totalEarnings)}
              </div>
              <span style={{ fontSize: '11px', color: '#047857' }}>
                ({fullDays} × ₹{rates.FULL}) + ({halfDays} × ₹{rates.HALF})
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 30, marginTop: '36px', paddingTop: '16px' }}>
            <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '6px', textAlign: 'center', fontSize: '11px', color: '#4b5563' }}>
              Worker's Signature
            </div>
            <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '6px', textAlign: 'center', fontSize: '11px', color: '#4b5563' }}>
              Authorized Signatory / Employer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
