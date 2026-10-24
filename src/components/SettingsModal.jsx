import React, { useState } from 'react';
import { 
  X, 
  User, 
  Save, 
  Volume2, 
  VolumeX, 
  Check,
  Building,
  Target,
  Sparkles
} from 'lucide-react';
import { formatINR } from '../utils/dateUtils';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  onSaveSettings 
}) {
  const [formData, setFormData] = useState({ 
    ...settings,
    rates: settings?.rates || { FULL: 500, HALF: 300, ABSENT: 0 }
  });
  const [statusMsg, setStatusMsg] = useState('');

  React.useEffect(() => {
    if (settings) {
      setFormData({
        ...settings,
        rates: settings.rates || { FULL: 500, HALF: 300, ABSENT: 0 }
      });
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRateChange = (type, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setFormData(prev => ({
      ...prev,
      rates: {
        ...(prev.rates || { FULL: 500, HALF: 300, ABSENT: 0 }),
        [type]: num
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setStatusMsg('Settings & rates updated successfully!');
    setTimeout(() => {
      setStatusMsg('');
      onClose();
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-sheet" 
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-accent)'
            }}>
              <User size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '18px', margin: 0 }}>
                Profile & Settings
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Customize your name, workplace, and preferences
              </span>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Worker Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
              Your Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                value={formData.workerName || ''}
                onChange={(e) => handleChange('workerName', e.target.value)}
                placeholder="e.g. Rahul Sharma"
                style={{ width: '100%', paddingLeft: 34 }}
              />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Appears on your generated monthly salary slips
            </span>
          </div>

          {/* Workplace / Employer */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
              Workplace / Employer Name
            </label>
            <div style={{ position: 'relative' }}>
              <Building size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                value={formData.companyName || ''}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="e.g. Apex Construction / Store"
                style={{ width: '100%', paddingLeft: 34 }}
              />
            </div>
          </div>

          {/* Monthly Target */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
              Monthly Earning Target
            </label>
            <div style={{ position: 'relative' }}>
              <Target size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="number" 
                min="1000"
                step="500"
                value={formData.monthlyTarget || 15000}
                onChange={(e) => handleChange('monthlyTarget', parseInt(e.target.value, 10) || 15000)}
                style={{ width: '100%', paddingLeft: 34 }}
              />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Target goal shown on your dashboard progress bar
            </span>
          </div>

          {/* Audio Chime Feedback Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 14px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {formData.soundEnabled ? <Volume2 size={18} color="var(--primary-accent)" /> : <VolumeX size={18} color="var(--text-muted)" />}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Audio Sound Effects</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Play subtle chime when attendance is logged</div>
              </div>
            </div>
            <input 
              type="checkbox"
              checked={formData.soundEnabled ?? true}
              onChange={(e) => handleChange('soundEnabled', e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
          </div>

          {/* Editable Daily Wage Rates */}
          <div style={{
            background: 'var(--bg-input)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Daily Wage Rates (₹)
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Absent = ₹0
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Full Day Rate (₹)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--color-full)' }}>₹</span>
                  <input 
                    type="number"
                    min="0"
                    step="50"
                    value={formData.rates?.FULL ?? 500}
                    onChange={(e) => handleRateChange('FULL', e.target.value)}
                    style={{ width: '100%', paddingLeft: 24, fontWeight: 700, fontSize: '13.5px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Half Day Rate (₹)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--color-half)' }}>₹</span>
                  <input 
                    type="number"
                    min="0"
                    step="50"
                    value={formData.rates?.HALF ?? 300}
                    onChange={(e) => handleRateChange('HALF', e.target.value)}
                    style={{ width: '100%', paddingLeft: 24, fontWeight: 700, fontSize: '13.5px' }}
                    required
                  />
                </div>
              </div>
            </div>

            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Change daily rates anytime. All calculations and slips will automatically use these rates.
            </span>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            {statusMsg && (
              <span style={{ fontSize: '12.5px', color: 'var(--color-full)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Check size={16} />
                {statusMsg}
              </span>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-gradient)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: 'var(--shadow-md)',
                cursor: 'pointer'
              }}
            >
              <Save size={16} />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
