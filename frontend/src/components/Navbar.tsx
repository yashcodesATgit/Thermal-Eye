import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Flame, Map as MapIcon, Home, LayoutGrid, BarChart2, FileText, ChevronDown, CalendarDays, Check } from 'lucide-react';
import { useMapStore } from '../store/mapStore';

interface NavItem {
  label: string;
  path: string;
  Icon: React.ElementType;
}

const AVAILABLE_DATES = [
  { label: '20 Aug 2026', isoDate: '2026-08-20' },
  { label: '21 Aug 2026', isoDate: '2026-08-21' },
  { label: '22 Aug 2026', isoDate: '2026-08-22' },
  { label: '23 Aug 2026', isoDate: '2026-08-23' },
  { label: '24 Aug 2026', isoDate: '2026-08-24' },
  { label: '25 Aug 2026', isoDate: '2026-08-25' },
  { label: '26 Aug 2026', isoDate: '2026-08-26', isToday: true },
];

function formatDateDisplay(isoDate: string): string {
  const match = AVAILABLE_DATES.find((d) => d.isoDate === isoDate);
  if (match) return match.label;
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return '26 Aug 2026';
  return `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
}

export default function Navbar(): React.JSX.Element {
  const selectedDate = useMapStore((s) => s.selectedDate);
  const setSelectedDate = useMapStore((s) => s.setSelectedDate);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const navItems: NavItem[] = [
    { label: 'Live Map', path: '/', Icon: MapIcon },
    { label: 'Incidents', path: '/incidents', Icon: Home },
    { label: 'Facilities', path: '/facilities', Icon: LayoutGrid },
    { label: 'Analytics', path: '/analytics', Icon: BarChart2 },
    { label: 'Reports', path: '/reports', Icon: FileText },
  ];

  // Close date picker on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen]);

  const handleSelectDate = (isoDate: string) => {
    setSelectedDate(isoDate);
    setIsDatePickerOpen(false);
  };

  return (
    <header
      className="relative z-30 w-full flex items-center justify-between select-none shrink-0"
      style={{
        height: 56,
        backgroundColor: '#0D1117',
        borderBottom: '1px solid #1e293b',
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 32,
            height: 32,
            backgroundColor: 'rgba(255,68,68,0.1)',
            border: '1px solid rgba(255,68,68,0.25)',
          }}
        >
          <Flame style={{ width: 16, height: 16, color: '#FF4444' }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '0.08em' }}>
          <span style={{ color: '#E8EDF5' }}>THERMAL</span>
          <span style={{ color: '#FF4444' }}>WATCH</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex items-center" style={{ gap: 2 }}>
        {navItems.map((item) => {
          const ItemIcon = item.Icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 transition-colors ${
                  isActive ? 'tw-nav-active' : 'tw-nav-idle'
                }`
              }
              style={({ isActive }) => ({
                padding: '6px 12px',
                borderRadius: isActive ? 0 : 6,
                borderBottom: isActive ? '2px solid #2D7DD2' : '2px solid transparent',
                paddingBottom: isActive ? 4 : 6,
                color: isActive ? '#2D7DD2' : '#8B9BB4',
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
              })}
            >
              <ItemIcon style={{ width: 14, height: 14 }} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-2 relative">
        {/* Date Selector Dropdown Button */}
        <div className="relative" ref={datePickerRef}>
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="hidden sm:flex items-center gap-1.5 transition-colors cursor-pointer"
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              backgroundColor: '#111827',
              border: isDatePickerOpen ? '1px solid #2D7DD2' : '1px solid #1e293b',
              color: '#8B9BB4',
              fontSize: 12,
            }}
          >
            <CalendarDays style={{ width: 13, height: 13, color: '#2D7DD2' }} />
            <span style={{ fontFamily: 'monospace', fontWeight: 500, color: '#E8EDF5' }}>
              {formatDateDisplay(selectedDate)}
            </span>
            <ChevronDown style={{ width: 12, height: 12, color: '#6B7280' }} />
          </button>

          {/* Date Picker Popover */}
          {isDatePickerOpen && (
            <div
              className="absolute right-0 top-full mt-1 z-50 rounded-lg shadow-2xl overflow-hidden py-1"
              style={{
                width: 180,
                backgroundColor: '#111827',
                border: '1px solid #1e293b',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
              }}
            >
              <div
                className="px-3 py-1.5 border-b border-[#1e293b] text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center justify-between"
              >
                <span>SELECT DATE</span>
                <span className="text-[9px] text-[#2D7DD2] font-mono">GUJARAT</span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {AVAILABLE_DATES.map((item) => {
                  const isSelected = item.isoDate === selectedDate;
                  return (
                    <button
                      key={item.isoDate}
                      type="button"
                      onClick={() => handleSelectDate(item.isoDate)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-[#1E2D45] transition-colors"
                      style={{
                        backgroundColor: isSelected ? 'rgba(45,125,210,0.15)' : 'transparent',
                        color: isSelected ? '#2D7DD2' : '#E8EDF5',
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      <span className="font-mono text-[11px]">{item.label}</span>
                      {isSelected && <Check style={{ width: 12, height: 12, color: '#2D7DD2' }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>



        {/* User */}
        <button
          type="button"
          className="flex items-center gap-1.5 transition-colors"
          style={{
            padding: '4px 8px',
            borderRadius: 6,
            backgroundColor: 'transparent',
          }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 26,
              height: 26,
              backgroundColor: '#2D7DD2',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            Y
          </div>
          <span className="hidden sm:block" style={{ fontSize: 12, fontWeight: 500, color: '#E8EDF5' }}>
            Yash Pandey
          </span>
          <ChevronDown style={{ width: 12, height: 12, color: '#6B7280' }} />
        </button>
      </div>
    </header>
  );
}
