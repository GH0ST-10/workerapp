import React from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Briefcase, 
  Target,
  Sparkles 
} from 'lucide-react';
import { formatINR } from '../utils/dateUtils';
import { ATTENDANCE_TYPES } from '../constants';

export default function DashboardStats({ 
  records, 
  currentYear, 
  currentMonth, 
  selectedScope, 
  setSelectedScope, 
  rates,
  settings
}) {
  // Filter records based on selectedScope ('month' or 'all')
  const recordList = Object.entries(records).filter(([dateKey]) => {
    if (selectedScope === 'all') return true;
    const [year, month] = dateKey.split('-').map(Number);
    return year === currentYear && (month - 1) === currentMonth;
  });

  // Calculate statistics
  let fullDaysCount = 0;
  let halfDaysCount = 0;
  let absentDaysCount = 0;

  for (const [, item] of recordList) {
    if (item.type === 'FULL') fullDaysCount++;
    else if (item.type === 'HALF') halfDaysCount++;
    else if (item.type === 'ABSENT') absentDaysCount++;
  }

  const fullWage = rates.FULL ?? 500;
  const halfWage = rates.HALF ?? 300;

  const fullDaysEarnings = fullDaysCount * fullWage;
  const halfDaysEarnings = halfDaysCount * halfWage;
  const totalEarnings = fullDaysEarnings + halfDaysEarnings;

  const totalDaysWorked = fullDaysCount + halfDaysCount;
  const totalLoggedRecords = fullDaysCount + halfDaysCount + absentDaysCount;

  const avgPerWorkingDay = totalDaysWorked > 0 ? Math.round(totalEarnings / totalDaysWorked) : 0;

  const monthlyTarget = settings?.monthlyTarget || 15000;
  const targetPercent = Math.min(Math.round((totalEarnings / monthlyTarget) * 100), 100);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hero Earnings Card */}
      <div className="hero-earnings-card">
        <div className="hero-glow-blob" />

        <div className="hero-top-row">
          <div className="hero-title-tag">
            <TrendingUp size={14} />
            <span>Total Earnings</span>
          </div>

          {/* Scope Selector */}
          <select 
            className="hero-month-select"
            value={selectedScope}
            onChange={(e) => setSelectedScope(e.target.value)}
            aria-label="Filter dashboard scope"
          >
            <option value="month">{monthNames[currentMonth]} {currentYear}</option>
            <option value="all">All-Time Total</option>
          </select>
        </div>

        {/* Big Amount */}
        <div className="hero-amount-display">
          <span className="hero-currency-symbol">₹</span>
          <span className="hero-amount-number">{totalEarnings.toLocaleString('en-IN')}</span>
        </div>

        {/* Goal progress bar */}
        {selectedScope === 'month' && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#c7d2fe', marginBottom: 4 }}>
              <span>Monthly Target: {formatINR(monthlyTarget)}</span>
              <span><strong>{targetPercent}%</strong> Achieved</span>
            </div>
            <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 10, overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${targetPercent}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #34d399, #10b981)',
                  borderRadius: 10,
                  transition: 'width 0.4s ease'
                }} 
              />
            </div>
          </div>
        )}

        {/* Calculation Formula Transparency */}
        <div className="hero-formula-hint">
          <div className="hero-formula-item">
            <span className="dot-indicator" style={{ backgroundColor: ATTENDANCE_TYPES.FULL.color }} />
            <span>{fullDaysCount} Full ({formatINR(fullDaysEarnings)})</span>
          </div>
          <div className="hero-formula-item">
            <span className="dot-indicator" style={{ backgroundColor: ATTENDANCE_TYPES.HALF.color }} />
            <span>{halfDaysCount} Half ({formatINR(halfDaysEarnings)})</span>
          </div>
          <div className="hero-formula-item" style={{ opacity: 0.85 }}>
            <span className="dot-indicator" style={{ backgroundColor: ATTENDANCE_TYPES.ABSENT.color }} />
            <span>{absentDaysCount} Absent (₹0)</span>
          </div>
        </div>
      </div>

      {/* 4-Stat Metric Cards Grid */}
      <div className="stats-grid">
        {/* Full Days Card */}
        <div className="stat-card" style={{ borderLeft: `4px solid ${ATTENDANCE_TYPES.FULL.color}` }}>
          <div className="stat-card-header">
            <span>Full Days</span>
            <CheckCircle2 size={16} color={ATTENDANCE_TYPES.FULL.color} />
          </div>
          <div className="stat-card-value" style={{ color: ATTENDANCE_TYPES.FULL.color }}>
            {fullDaysCount}
          </div>
          <div className="stat-card-sub">
            {formatINR(fullDaysEarnings)} (@ ₹{fullWage}/day)
          </div>
        </div>

        {/* Half Days Card */}
        <div className="stat-card" style={{ borderLeft: `4px solid ${ATTENDANCE_TYPES.HALF.color}` }}>
          <div className="stat-card-header">
            <span>Half Days</span>
            <Clock size={16} color={ATTENDANCE_TYPES.HALF.color} />
          </div>
          <div className="stat-card-value" style={{ color: ATTENDANCE_TYPES.HALF.color }}>
            {halfDaysCount}
          </div>
          <div className="stat-card-sub">
            {formatINR(halfDaysEarnings)} (@ ₹{halfWage}/day)
          </div>
        </div>

        {/* Absent Days Card */}
        <div className="stat-card" style={{ borderLeft: `4px solid ${ATTENDANCE_TYPES.ABSENT.color}` }}>
          <div className="stat-card-header">
            <span>Absent Days</span>
            <XCircle size={16} color={ATTENDANCE_TYPES.ABSENT.color} />
          </div>
          <div className="stat-card-value" style={{ color: ATTENDANCE_TYPES.ABSENT.color }}>
            {absentDaysCount}
          </div>
          <div className="stat-card-sub">
            ₹0 credited
          </div>
        </div>

        {/* Total Days Worked Card */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary-accent)' }}>
          <div className="stat-card-header">
            <span>Days Worked</span>
            <Briefcase size={16} color="var(--primary-accent)" />
          </div>
          <div className="stat-card-value" style={{ color: 'var(--primary-accent)' }}>
            {totalDaysWorked}
          </div>
          <div className="stat-card-sub">
            Avg: {formatINR(avgPerWorkingDay)}/day
          </div>
        </div>
      </div>
    </div>
  );
}
