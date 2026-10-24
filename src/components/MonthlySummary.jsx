import React from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Briefcase
} from 'lucide-react';
import { formatINR } from '../utils/dateUtils';
import { ATTENDANCE_TYPES } from '../constants';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthlySummary({ 
  records, 
  rates, 
  onOpenPrintSlip,
  onExportCsv
}) {
  // Group records by 'YYYY-MM'
  const monthlyGroups = {};

  Object.entries(records).forEach(([dateKey, record]) => {
    const [yearStr, monthStr] = dateKey.split('-');
    const groupKey = `${yearStr}-${monthStr}`;

    if (!monthlyGroups[groupKey]) {
      monthlyGroups[groupKey] = {
        groupKey,
        year: parseInt(yearStr, 10),
        monthIndex: parseInt(monthStr, 10) - 1,
        fullDays: 0,
        halfDays: 0,
        absentDays: 0,
        totalEarnings: 0,
        items: []
      };
    }

    const group = monthlyGroups[groupKey];
    group.items.push({ dateKey, ...record });

    if (record.type === 'FULL') {
      group.fullDays++;
      group.totalEarnings += (rates.FULL ?? 500);
    } else if (record.type === 'HALF') {
      group.halfDays++;
      group.totalEarnings += (rates.HALF ?? 300);
    } else if (record.type === 'ABSENT') {
      group.absentDays++;
    }
  });

  // Sort months descending (most recent first)
  const sortedMonths = Object.values(monthlyGroups).sort((a, b) => {
    return b.groupKey.localeCompare(a.groupKey);
  });

  // Overall all-time summary
  let allTimeFull = 0;
  let allTimeHalf = 0;
  let allTimeAbsent = 0;
  let allTimeEarnings = 0;

  sortedMonths.forEach(m => {
    allTimeFull += m.fullDays;
    allTimeHalf += m.halfDays;
    allTimeAbsent += m.absentDays;
    allTimeEarnings += m.totalEarnings;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Overall Lifetime Summary Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Earnings Summary by Month</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Complete record of all working months and accumulated pay
            </p>
          </div>
          <button
            type="button"
            onClick={onExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '12.5px',
              fontWeight: 600,
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        {/* All-time quick stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 10,
          background: 'var(--bg-input)',
          padding: 12,
          borderRadius: 'var(--radius-md)'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Earned</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-full)' }}>{formatINR(allTimeEarnings)}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Full Days</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: ATTENDANCE_TYPES.FULL.color }}>{allTimeFull}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Half Days</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: ATTENDANCE_TYPES.HALF.color }}>{allTimeHalf}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Shifts</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-accent)' }}>{allTimeFull + allTimeHalf}</div>
          </div>
        </div>
      </div>

      {/* Month-by-Month Cards */}
      {sortedMonths.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
          <Calendar size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
          <p>No attendance records logged yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sortedMonths.map((m) => {
            const workedDays = m.fullDays + m.halfDays;
            return (
              <div key={m.groupKey} className="glass-card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      {MONTH_NAMES[m.monthIndex]} {m.year}
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {workedDays} days worked ({m.fullDays} full, {m.halfDays} half, {m.absentDays} absent)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: 'var(--color-full)',
                      fontFamily: 'var(--font-display)',
                      background: 'var(--color-full-bg)',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--color-full-border)'
                    }}>
                      {formatINR(m.totalEarnings)}
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenPrintSlip(m.year, m.monthIndex)}
                      title="Print or view salary slip"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--primary-gradient)',
                        color: '#fff',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <FileText size={14} />
                      Pay Slip
                    </button>
                  </div>
                </div>

                {/* Calculation breakdown row */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 14,
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  paddingTop: 8,
                  borderTop: '1px dashed var(--border-color)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span className="dot-indicator" style={{ backgroundColor: ATTENDANCE_TYPES.FULL.color }} />
                    <span><strong>{m.fullDays}</strong> Full Days × ₹{rates.FULL} = {formatINR(m.fullDays * rates.FULL)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span className="dot-indicator" style={{ backgroundColor: ATTENDANCE_TYPES.HALF.color }} />
                    <span><strong>{m.halfDays}</strong> Half Days × ₹{rates.HALF} = {formatINR(m.halfDays * rates.HALF)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span className="dot-indicator" style={{ backgroundColor: ATTENDANCE_TYPES.ABSENT.color }} />
                    <span><strong>{m.absentDays}</strong> Absent (₹0)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
