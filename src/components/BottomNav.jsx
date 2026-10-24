import React from 'react';
import { LayoutDashboard, CalendarDays, History, FileText } from 'lucide-react';

export default function BottomNav({ currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'history', label: 'History', icon: History },
    { id: 'summary', label: 'Summary', icon: FileText }
  ];

  return (
    <nav className="bottom-nav no-print" aria-label="Mobile Bottom Navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`nav-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => setCurrentTab(tab.id)}
            aria-selected={isActive}
          >
            <Icon size={20} className="nav-tab-icon" strokeWidth={isActive ? 2.5 : 2} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
