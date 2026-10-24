import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  XCircle,
  FileText
} from 'lucide-react';
import { ATTENDANCE_TYPES } from '../constants';
import { formatDisplayDate, formatINR } from '../utils/dateUtils';

export default function RecentActivity({ 
  records, 
  rates, 
  onEditRecord, 
  onDeleteRecord 
}) {
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Sort records descending by date
  const sortedEntries = Object.entries(records)
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([dateKey, record]) => ({
      dateKey,
      ...record,
      wage: rates[record.type] ?? 0
    }));

  const filteredEntries = sortedEntries.filter((item) => {
    if (filterType !== 'ALL' && item.type !== filterType) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchDate = item.dateKey.toLowerCase().includes(term);
      const matchNote = item.note ? item.note.toLowerCase().includes(term) : false;
      const matchLabel = ATTENDANCE_TYPES[item.type]?.label.toLowerCase().includes(term);
      return matchDate || matchNote || matchLabel;
    }
    return true;
  });

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={18} color="var(--primary-accent)" />
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Attendance Log & History</h2>
        </div>
        <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          {filteredEntries.length} of {sortedEntries.length} records
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search date or note..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: 34, fontSize: '13px' }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`desktop-tab-btn ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            All
          </button>
          <button
            type="button"
            className={`desktop-tab-btn ${filterType === 'FULL' ? 'active' : ''}`}
            onClick={() => setFilterType('FULL')}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Full Day
          </button>
          <button
            type="button"
            className={`desktop-tab-btn ${filterType === 'HALF' ? 'active' : ''}`}
            onClick={() => setFilterType('HALF')}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Half Day
          </button>
          <button
            type="button"
            className={`desktop-tab-btn ${filterType === 'ABSENT' ? 'active' : ''}`}
            onClick={() => setFilterType('ABSENT')}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Absent
          </button>
        </div>
      </div>

      {/* List of Entries */}
      {filteredEntries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)' }}>
          <FileText size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
          <p>No attendance records match your filter.</p>
        </div>
      ) : (
        <div className="history-list">
          {filteredEntries.map((item) => {
            const config = ATTENDANCE_TYPES[item.type] || ATTENDANCE_TYPES.FULL;
            return (
              <div key={item.dateKey} className="history-item">
                <div className="history-left">
                  <div 
                    className="history-badge-icon" 
                    style={{ 
                      backgroundColor: config.lightBg,
                      color: config.color,
                      border: `1px solid ${config.lightBorder}` 
                    }}
                  >
                    {item.type === 'FULL' && <CheckCircle2 size={20} />}
                    {item.type === 'HALF' && <Clock size={20} />}
                    {item.type === 'ABSENT' && <XCircle size={20} />}
                  </div>

                  <div className="history-details">
                    <span className="history-date">
                      {formatDisplayDate(item.dateKey, { includeWeekday: true })}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: config.color }}>
                      {config.label}
                      {item.note && (
                        <span className="history-note"> • {item.note}</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="history-right">
                  <div className="history-wage" style={{ color: item.wage > 0 ? 'var(--color-full)' : 'var(--text-muted)' }}>
                    +{formatINR(item.wage)}
                  </div>

                  <div className="history-actions">
                    <button
                      type="button"
                      onClick={() => onEditRecord(item.dateKey)}
                      title="Edit this record"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'var(--bg-input)',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Edit3 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete attendance for ${formatDisplayDate(item.dateKey)}?`)) {
                          onDeleteRecord(item.dateKey);
                        }
                      }}
                      title="Delete this record"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'var(--color-absent-bg)',
                        color: 'var(--color-absent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
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
