import React from 'react';
import { 
  Sun, 
  Moon, 
  Settings as SettingsIcon, 
  CalendarDays, 
  LayoutDashboard, 
  History, 
  FileText,
  LogOut,
  User
} from 'lucide-react';

export default function Header({ 
  currentTab, 
  setCurrentTab, 
  theme, 
  toggleTheme, 
  openSettings,
  user,
  onSignOut
}) {
  return (
    <header className="app-header">
      <div className="brand-badge">
        <div className="brand-icon-box">
          <CalendarDays size={22} strokeWidth={2.4} />
        </div>
        <div className="brand-text">
          <h1>WorkTrack</h1>
          <p>Attendance & Earnings</p>
        </div>
      </div>

      {/* Desktop Tabs */}
      <nav className="desktop-nav-tabs" aria-label="Desktop Navigation">
        <button
          className={`desktop-tab-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <LayoutDashboard size={16} />
            Dashboard
          </span>
        </button>
        <button
          className={`desktop-tab-btn ${currentTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setCurrentTab('calendar')}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CalendarDays size={16} />
            Calendar
          </span>
        </button>
        <button
          className={`desktop-tab-btn ${currentTab === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentTab('history')}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <History size={16} />
            History
          </span>
        </button>
        <button
          className={`desktop-tab-btn ${currentTab === 'summary' ? 'active' : ''}`}
          onClick={() => setCurrentTab('summary')}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FileText size={16} />
            Summary & Slip
          </span>
        </button>
      </nav>

      {/* Header Action Buttons & User Profile */}
      <div className="header-actions">
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '12px',
                fontWeight: 600
              }}
              title={`Logged in as ${user.email}`}
            >
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'var(--primary-accent)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 800
              }}>
                {(user.email || 'U')[0].toUpperCase()}
              </div>
              <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email?.split('@')[0]}
              </span>
            </div>

            <button
              className="icon-btn"
              onClick={onSignOut}
              title="Sign Out from account"
              aria-label="Sign Out"
              style={{ width: 34, height: 34, color: 'var(--color-absent)' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}

        <button 
          className="icon-btn" 
          onClick={toggleTheme} 
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button 
          className="icon-btn" 
          onClick={openSettings} 
          title="Profile & Settings"
          aria-label="Open settings"
        >
          <SettingsIcon size={18} />
        </button>
      </div>
    </header>
  );
}
