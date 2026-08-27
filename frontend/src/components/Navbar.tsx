import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Flame,
  Map as MapIcon,
  Home,
  LayoutGrid,
  BarChart2,
  FileText,
  Bot,
  ChevronDown,
  CalendarDays,
  Check,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Bell,
} from 'lucide-react';
import { useMapStore } from '../store/mapStore';
import { useAlertsQuery } from '../services/queries/useAlertsQuery';
import type { AlertSeverity } from '../types/alert';

interface NavItem {
  label: string;
  path: string;
  Icon: React.ElementType;
  badge?: string;
}

const AVAILABLE_DATES = (() => {
  const dates = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const isoDate = d.toISOString().slice(0, 10);
    const label = `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
    dates.push({ label, isoDate, isToday: i === 0 });
  }
  return dates;
})();

function formatDateDisplay(isoDate: string): string {
  const match = AVAILABLE_DATES.find((d) => d.isoDate === isoDate);
  if (match) return match.label;
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) {
    const now = new Date();
    return `${now.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()}`;
  }
  return `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
}

export default function Navbar(): React.JSX.Element {
  const selectedDate = useMapStore((s) => s.selectedDate);
  const setSelectedDate = useMapStore((s) => s.setSelectedDate);
  const selectHotspot = useMapStore((s) => s.selectHotspot);
  const selectFacility = useMapStore((s) => s.selectFacility);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  const { data: alerts, isLoading: alertsLoading } = useAlertsQuery();
  const unackCount = alerts?.filter((a) => !a.acknowledged).length ?? alerts?.length ?? 6;

  const navItems: NavItem[] = [
    { label: 'Live Map', path: '/', Icon: MapIcon },
    { label: 'Incidents', path: '/incidents', Icon: Home },
    { label: 'Facilities', path: '/facilities', Icon: LayoutGrid },
    { label: 'Analytics', path: '/analytics', Icon: BarChart2 },
    { label: 'Reports', path: '/reports', Icon: FileText },
    { label: 'AI Assistant', path: '/analytics', Icon: Bot, badge: 'Beta' },
  ];

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectDate = (isoDate: string) => {
    setSelectedDate(isoDate);
    setIsDatePickerOpen(false);
  };

  const handleAlertClick = (hotspotId?: string, facilityId?: string) => {
    if (hotspotId) selectHotspot(hotspotId);
    else if (facilityId) selectFacility(facilityId);
    setIsAlertsOpen(false);
  };

  const getAlertIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-3.5 h-3.5 text-[#FF4444] shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#F97316] shrink-0" />;
      case 'info':
        return <Info className="w-3.5 h-3.5 text-[#2D7DD2] shrink-0" />;
    }
  };

  return (
    <header className="relative z-40 w-full flex items-center justify-between select-none shrink-0 bg-[#0A0E17] border-b border-[#1e293b] px-4 h-12">
      {/* Brand Branding */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center rounded-lg w-7 h-7 bg-[rgba(255,68,68,0.12)] border border-[rgba(255,68,68,0.3)]">
          <Flame className="w-4 h-4 text-[#FF4444]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xs tracking-wider text-[#E8EDF5] leading-none">
            THERMAL<span className="text-[#FF4444]">WATCH</span>
          </span>
          <span className="text-[8px] text-[#6B7280] font-mono tracking-tight">
            AI-POWERED GEOSPATIAL THERMAL INTELLIGENCE
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="hidden lg:flex items-center gap-1">
        {navItems.map((item) => {
          const ItemIcon = item.Icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'text-[#2D7DD2] border-b-2 border-[#2D7DD2] bg-[rgba(45,125,210,0.08)]'
                    : 'text-[#8B9BB4] hover:text-[#E8EDF5] hover:bg-[#111827]'
                }`
              }
            >
              <ItemIcon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#2D7DD2] text-white font-bold ml-0.5">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Navbar Alert Pill Button & Popover */}
        <div className="relative" ref={alertsRef}>
          <button
            type="button"
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[rgba(220,38,38,0.15)] border border-[rgba(220,38,38,0.4)] text-[#FF4444] hover:bg-[rgba(220,38,38,0.25)] transition-all cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-[#FF4444] animate-pulse" />
            <span>{unackCount} Alerts</span>
          </button>

          {/* Alert Dropdown Popover */}
          {isAlertsOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 z-50 w-80 rounded-xl bg-[#111827] border border-[#1e293b] shadow-2xl overflow-hidden py-1"
              style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.9)' }}
            >
              <div className="px-3.5 py-2 border-b border-[#1e293b] flex items-center justify-between bg-[#0F1623]">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-[#FF4444]" />
                  <span className="text-[11px] font-bold text-[#E8EDF5] tracking-wider uppercase">
                    ACTIVE ALERTS
                  </span>
                  <span className="text-[9px] bg-[#FF4444] text-white px-1.5 py-0.2 rounded-full font-bold">
                    {unackCount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAlertsOpen(false)}
                  className="text-[#6B7280] hover:text-[#E8EDF5] p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
                {alertsLoading && (
                  <p className="text-center text-[#6B7280] text-xs py-4">Loading active alerts...</p>
                )}
                {!alertsLoading && (!alerts || alerts.length === 0) && (
                  <p className="text-center text-[#6B7280] text-xs py-4">No active thermal alerts.</p>
                )}
                {alerts?.map((alert) => {
                  const d = new Date(alert.timestamp);
                  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <button
                      key={alert.id}
                      type="button"
                      onClick={() => handleAlertClick(alert.hotspotId, alert.facilityId)}
                      className="w-full text-left p-2.5 rounded-lg bg-[#0D131F] border border-[#1e293b] hover:border-[#2D7DD2] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5">
                          {getAlertIcon(alert.severity)}
                          <span className="text-[11px] font-semibold text-[#E8EDF5]">
                            {alert.title}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-[#6B7280]">{time}</span>
                      </div>
                      <p className="text-[10px] text-[#9CA3AF] line-clamp-2 pl-5">
                        {alert.message}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Date Selector Dropdown Button */}
        <div className="relative" ref={datePickerRef}>
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#111827] border border-[#1e293b] text-[#8B9BB4] hover:text-[#E8EDF5] transition-colors cursor-pointer"
          >
            <CalendarDays className="w-3.5 h-3.5 text-[#2D7DD2]" />
            <span className="font-mono text-[11px] font-semibold text-[#E8EDF5]">
              {formatDateDisplay(selectedDate)}
            </span>
            <ChevronDown className="w-3 h-3 text-[#6B7280]" />
          </button>

          {/* Date Picker Popover */}
          {isDatePickerOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 z-50 w-44 rounded-xl bg-[#111827] border border-[#1e293b] shadow-2xl overflow-hidden py-1"
              style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}
            >
              <div className="px-3 py-1.5 border-b border-[#1e293b] text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center justify-between">
                <span>SELECT DATE</span>
                <span className="text-[9px] text-[#2D7DD2] font-mono">INDIA</span>
              </div>
              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                {AVAILABLE_DATES.map((item) => {
                  const isSelected = item.isoDate === selectedDate;
                  return (
                    <button
                      key={item.isoDate}
                      type="button"
                      onClick={() => handleSelectDate(item.isoDate)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-[#1E2D45] transition-colors cursor-pointer"
                      style={{
                        backgroundColor: isSelected ? 'rgba(45,125,210,0.15)' : 'transparent',
                        color: isSelected ? '#2D7DD2' : '#E8EDF5',
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      <span className="font-mono text-[11px]">{item.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#2D7DD2]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-1 border-l border-[#1e293b]">
          <div className="flex items-center justify-center rounded-full w-6 h-6 bg-[#2D7DD2] text-white font-bold text-[11px]">
            Y
          </div>
          <span className="hidden md:block text-xs font-medium text-[#E8EDF5]">
            Yash Pandey
          </span>
        </div>
      </div>
    </header>
  );
}
