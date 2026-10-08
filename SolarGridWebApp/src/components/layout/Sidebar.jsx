import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmModal from '../common/LogoutConfirmModal';
import {
  DashboardIcon,
  UsersIcon,
  ProsumerIcon,
  NodeIcon,
  BookingIcon,
  LogoutIcon,
  SunIcon,
  CloseIcon,
} from '../common/Icons';

const backofficeLinks = [
  { to: '/backoffice/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/backoffice/users', label: 'Users', icon: UsersIcon },
  { to: '/backoffice/prosumers', label: 'Prosumers', icon: ProsumerIcon },
  { to: '/backoffice/nodes', label: 'Microgrid Nodes', icon: NodeIcon },
  { to: '/backoffice/reservations', label: 'Reservations', icon: BookingIcon },
];

const operatorLinks = [
  { to: '/operator/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/operator/bookings', label: 'Bookings', icon: BookingIcon },
  { to: '/operator/nodes', label: 'Microgrid Nodes', icon: NodeIcon },
];

function Sidebar({ open, onClose }) {
  const { user, logout, isBackoffice } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const links = isBackoffice ? backofficeLinks : operatorLinks;

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const roleLabel = user?.role === 'GridOperator' ? 'Grid Operator' : user?.role || 'User';

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'linear-gradient(180deg, #073F32 0%, #0A3728 50%, #062D23 100%)' }}
        aria-label="Main navigation"
      >
        {/* ── Logo / Brand ─────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 pt-6 pb-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-3">
            {/* Solar icon circle */}
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
              style={{ background: 'linear-gradient(135deg, #FFC400 0%, #FFD84D 100%)', boxShadow: '0 0 16px rgba(255,196,0,0.35)' }}
            >
              <SunIcon className="w-5 h-5" style={{ color: '#073F32' }} />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight text-white" style={{ fontFamily: 'var(--font-space)' }}>
                Smart Solar
              </p>
              <p className="text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Microgrid Trading
              </p>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden p-1.5 rounded-lg transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
            onClick={onClose}
            aria-label="Close menu"
          >
            <CloseIcon className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* ── Section label ───────────────────────────────── */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Navigation
          </p>
        </div>

        {/* ── Navigation links ────────────────────────────── */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto" aria-label="Sidebar navigation">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-white'
                    : 'text-white/65 hover:text-white hover:bg-white/8'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: 'linear-gradient(135deg, rgba(0,184,120,0.25) 0%, rgba(0,184,120,0.12) 100%)',
                      borderLeft: '3px solid #00B878',
                      boxShadow: 'inset 0 0 20px rgba(0,184,120,0.08)',
                    }
                  : { borderLeft: '3px solid transparent' }
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className="w-[18px] h-[18px] shrink-0 transition-colors duration-150"
                    style={{ color: isActive ? '#00B878' : 'inherit' }}
                  />
                  <span>{label}</span>
                  {isActive && (
                    <span
                      className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: '#00B878' }}
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── User profile + Logout ───────────────────────── */}
        <div
          className="px-4 pb-5 pt-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* User info */}
          <div className="flex items-center gap-3 mb-3 px-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{
                background: 'linear-gradient(135deg, #00B878 0%, #009962 100%)',
                color: '#fff',
                fontFamily: 'var(--font-space)',
              }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">{user?.name}</p>
              <p className="text-[11px] truncate mt-0.5" style={{ color: '#00B878' }}>
                {roleLabel}
              </p>
            </div>
          </div>

          {/* Logout button */}
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="
              w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl
              text-sm font-medium transition-all duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf
            "
            style={{
              color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            }}
          >
            <LogoutIcon className="w-4 h-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
      />
    </>
  );
}

export default Sidebar;
