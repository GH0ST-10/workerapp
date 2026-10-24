import React from 'react';
import { 
  Sun, 
  Moon, 
  Settings as SettingsIcon, 
  CalendarDays, 
  LayoutDashboard, 
  History, 
  FileText, 
  LogOut 
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
  const username = user?.email ? user.email.split('@')[0] : 'User';
  const avatarLetter = (user?.email || 'U')[0].toUpperCase();

  return (
    <header className="app-header">
      {/* Brand */}
      <div className="brand-badge" onClick={() => setCurrentTab('dashboard')} style={{ cursor: 'pointer' }}>
        <div className="brand-icon-box">
          <CalendarDays size={20} strokeWidth={2.4} />
        </div>
        <div className="brand-text">
          <h1>WorkTrack</h1>
          <p>Attendance & Pay</p>
        </div>
      </div>

      {/* Desktop Tabs */}
      <nav className="desktop-nav-tabs" aria-label="Desktop Navigation">
        <button
          className={`desktop-tab-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
        >
          <LayoutDashboard size={15} />
          <span>Dashboard</span>
        </button>
        <button
          className={`desktop-tab-btn ${currentTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setCurrentTab('calendar')}
        >
          <CalendarDays size={15} />
          <span>Calendar</span>
        </button>
        <button
          className={`desktop-tab-btn ${currentTab === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentTab('history')}
        >
          <History size={15} />
          <span>History</span>
        </button>
        <button
          className={`desktop-tab-btn ${currentTab === 'summary' ? 'active' : ''}`}
          onClick={() => setCurrentTab('summary')}
        >
          <FileText size={15} />
          <span>Slip</span>
        </button>
      </nav>

      {/* Action Controls & User Account */}
      <div className="header-actions">
        {user && (
          <div 
            className="user-profile-chip" 
            title={`Logged in as ${user.email} (Click to open settings)`}
            onClick={openSettings}
          >
            <div className="user-avatar-circle">
              {avatarLetter}
            </div>
            <span className="user-display-name">
              {username}
            </span>
          </div>
        )}

        <button 
          className="icon-btn" 
          onClick={toggleTheme} 
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button 
          className="icon-btn" 
          onClick={openSettings} 
          title="Profile & Wage Settings"
          aria-label="Open settings"
        >
          <SettingsIcon size={17} />
        </button>

        {user && (
          <button
            className="icon-btn logout-btn"
            onClick={onSignOut}
            title="Sign Out from account"
            aria-label="Sign Out"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
