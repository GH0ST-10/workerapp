import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { formatDateKey, formatINR, formatDisplayDate } from './utils/dateUtils';
import { playEarnSound } from './utils/audio';
import { ATTENDANCE_TYPES, STORAGE_KEYS, DEFAULT_RATES } from './constants';
import { 
  supabase,
  getCurrentSession, 
  signOutUser, 
  fetchUserAttendance, 
  upsertAttendanceRecord, 
  deleteAttendanceRecord, 
  fetchUserSettings, 
  upsertUserSettings
} from './utils/supabaseClient';

import Header from './components/Header';
import QuickLogger from './components/QuickLogger';
import DashboardStats from './components/DashboardStats';
import AttendanceCalendar from './components/AttendanceCalendar';
import EditAttendanceModal from './components/EditAttendanceModal';
import MonthlySummary from './components/MonthlySummary';
import RecentActivity from './components/RecentActivity';
import PrintSlipModal from './components/PrintSlipModal';
import SettingsModal from './components/SettingsModal';
import AuthScreen from './components/AuthScreen';
import BottomNav from './components/BottomNav';
import { exportToCsv } from './utils/storage';

export default function App() {
  // Session / Auth State
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // App Data (Loaded directly from user's account)
  const [records, setRecords] = useState({});
  const [settings, setSettings] = useState({
    workerName: '',
    companyName: '',
    rates: { ...DEFAULT_RATES },
    soundEnabled: true,
    monthlyTarget: 15000
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  });

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));
  
  // Calendar month state
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());

  // Dashboard filter scope ('month' or 'all')
  const [dashboardScope, setDashboardScope] = useState('month');

  // Modals state
  const [editModal, setEditModal] = useState({ isOpen: false, date: '' });
  const [printSlipModal, setPrintSlipModal] = useState({ 
    isOpen: false, 
    year: new Date().getFullYear(), 
    monthIndex: new Date().getMonth() 
  });
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ message: '', visible: false });

  // Show Toast helper
  const showToast = useCallback((msg) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => {
      setToast({ message: '', visible: false });
    }, 2800);
  }, []);

  // Sync theme attribute with DOM and LocalStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Load account data from database
  const loadUserData = useCallback(async (activeUser) => {
    if (!activeUser) return;
    try {
      // 1. Fetch user settings
      const cloudSettings = await fetchUserSettings(activeUser.id);
      if (cloudSettings) {
        setSettings(prev => ({ ...prev, ...cloudSettings }));
        if (cloudSettings.theme) {
          setTheme(cloudSettings.theme);
        }
      }

      // 2. Fetch user attendance records
      const cloudRecords = await fetchUserAttendance(activeUser.id);
      setRecords(cloudRecords || {});
    } catch (err) {
      console.error('Failed to load user account data:', err);
      showToast('⚠️ Could not load attendance records from account.');
    }
  }, [showToast]);

  // Initial Auth Check and Auth Listener
  useEffect(() => {
    if (!supabase) {
      setAuthChecking(false);
      return;
    }

    // Check existing session on boot
    getCurrentSession().then(({ data }) => {
      const activeUser = data?.session?.user || null;
      setUser(activeUser);
      if (activeUser) {
        loadUserData(activeUser);
      }
      setAuthChecking(false);
    }).catch(() => {
      setAuthChecking(false);
    });

    // Listen to login/logout events
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const activeUser = session?.user || null;
      setUser(activeUser);

      if (event === 'SIGNED_IN' && activeUser) {
        loadUserData(activeUser);
        showToast(`Signed in as ${activeUser.email}`);
      } else if (event === 'SIGNED_OUT') {
        setRecords({});
        showToast('Signed out successfully.');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [loadUserData, showToast]);

  // Trigger celebration confetti
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#6366f1']
      });
    } catch (e) {
      // Ignore if confetti not supported
    }
  }, []);

  // Save / Update Attendance in Database
  const handleSaveAttendance = useCallback(async (dateKey, typeKey, note = '') => {
    if (!user) return;

    // Optimistic UI update
    setRecords(prev => ({
      ...prev,
      [dateKey]: {
        type: typeKey,
        date: dateKey,
        note: note || '',
        updatedAt: new Date().toISOString()
      }
    }));

    try {
      await upsertAttendanceRecord(user.id, dateKey, typeKey, note);
    } catch (err) {
      console.error('Failed to save attendance record:', err);
      showToast('⚠️ Failed to save record to cloud.');
    }

    // Audio & Confetti Feedback
    if (settings.soundEnabled) {
      playEarnSound(typeKey);
    }
    if (typeKey === 'FULL' || typeKey === 'HALF') {
      triggerConfetti();
    }

    const wage = settings.rates[typeKey] ?? 0;
    const label = ATTENDANCE_TYPES[typeKey]?.label || typeKey;
    showToast(`✓ ${label} recorded for ${formatDisplayDate(dateKey, { includeWeekday: false })} (+${formatINR(wage)})`);
  }, [user, settings, showToast, triggerConfetti]);

  // Delete Attendance Record from Database
  const handleDeleteAttendance = useCallback(async (dateKey) => {
    if (!user) return;

    // Optimistic UI update
    setRecords(prev => {
      const updated = { ...prev };
      delete updated[dateKey];
      return updated;
    });

    try {
      await deleteAttendanceRecord(user.id, dateKey);
    } catch (err) {
      console.error('Failed to delete attendance record:', err);
      showToast('⚠️ Failed to delete record from cloud.');
    }

    showToast(`Attendance removed for ${formatDisplayDate(dateKey, { includeWeekday: false })}`);
  }, [user, showToast]);

  // Update Settings in Database
  const handleUpdateSettings = useCallback(async (newSettings) => {
    setSettings(newSettings);
    if (!user) return;

    try {
      await upsertUserSettings(user.id, newSettings);
      showToast('Profile settings saved to your account.');
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  }, [user, showToast]);

  // Sign out user
  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out from your account?')) {
      await signOutUser();
      setUser(null);
      setRecords({});
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (user) {
      handleUpdateSettings({ ...settings, theme: nextTheme });
    }
  };

  const rates = settings.rates || { FULL: 500, HALF: 300, ABSENT: 0 };

  // 1. Initial Session Loading Screen
  if (authChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-sans)',
        fontSize: '14px',
        fontWeight: 600
      }}>
        <span>Loading WorkTrack...</span>
      </div>
    );
  }

  // 2. Unauthenticated: Show Login / Sign Up Screen
  if (!user) {
    return (
      <AuthScreen 
        onAuthSuccess={(authUser) => {
          setUser(authUser);
          loadUserData(authUser);
        }} 
      />
    );
  }

  // 3. Authenticated: Render Main Attendance Tracker App
  return (
    <div className="app-container">
      {/* App Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        theme={theme}
        toggleTheme={toggleTheme}
        openSettings={() => setSettingsModalOpen(true)}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Main Tab Content */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Tab 1: Dashboard View */}
        {currentTab === 'dashboard' && (
          <>
            {/* Quick Daily Attendance Logger */}
            <QuickLogger
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              records={records}
              onSaveAttendance={handleSaveAttendance}
              onDeleteAttendance={handleDeleteAttendance}
              rates={rates}
            />

            {/* Dashboard Overview Cards */}
            <DashboardStats
              records={records}
              currentYear={calendarYear}
              currentMonth={calendarMonth}
              selectedScope={dashboardScope}
              setSelectedScope={setDashboardScope}
              rates={rates}
              settings={settings}
            />

            {/* Embedded Calendar Preview */}
            <AttendanceCalendar
              currentYear={calendarYear}
              currentMonth={calendarMonth}
              onChangeMonth={(y, m) => {
                setCalendarYear(y);
                setCalendarMonth(m);
              }}
              records={records}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onOpenEditModal={(date) => setEditModal({ isOpen: true, date })}
              rates={rates}
            />
          </>
        )}

        {/* Tab 2: Calendar Dedicated View */}
        {currentTab === 'calendar' && (
          <>
            <QuickLogger
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              records={records}
              onSaveAttendance={handleSaveAttendance}
              onDeleteAttendance={handleDeleteAttendance}
              rates={rates}
            />

            <AttendanceCalendar
              currentYear={calendarYear}
              currentMonth={calendarMonth}
              onChangeMonth={(y, m) => {
                setCalendarYear(y);
                setCalendarMonth(m);
              }}
              records={records}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onOpenEditModal={(date) => setEditModal({ isOpen: true, date })}
              rates={rates}
            />
          </>
        )}

        {/* Tab 3: History & Recent Logs View */}
        {currentTab === 'history' && (
          <RecentActivity
            records={records}
            rates={rates}
            onEditRecord={(date) => setEditModal({ isOpen: true, date })}
            onDeleteRecord={handleDeleteAttendance}
          />
        )}

        {/* Tab 4: Summary & Pay Slip View */}
        {currentTab === 'summary' && (
          <MonthlySummary
            records={records}
            rates={rates}
            onOpenPrintSlip={(year, monthIndex) => {
              setPrintSlipModal({ isOpen: true, year, monthIndex });
            }}
            onExportCsv={() => exportToCsv(records, rates)}
          />
        )}
      </main>

      {/* Edit Attendance Modal */}
      <EditAttendanceModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, date: '' })}
        initialDate={editModal.date}
        records={records}
        onSaveAttendance={handleSaveAttendance}
        onDeleteAttendance={handleDeleteAttendance}
        rates={rates}
      />

      {/* Printable Monthly Wage Slip Modal */}
      <PrintSlipModal
        isOpen={printSlipModal.isOpen}
        onClose={() => setPrintSlipModal({ isOpen: false, year: 2026, monthIndex: 9 })}
        year={printSlipModal.year}
        monthIndex={printSlipModal.monthIndex}
        records={records}
        rates={rates}
        settings={settings}
      />

      {/* Minimal Profile Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleUpdateSettings}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Toast Alert Message */}
      {toast.visible && (
        <div className="toast-container" role="status" aria-live="polite">
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
