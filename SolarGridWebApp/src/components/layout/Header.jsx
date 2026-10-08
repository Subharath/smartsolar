import { useAuth } from '../../context/AuthContext';
import { MenuIcon, SunIcon } from '../common/Icons';

function Header({ onMenuClick, title }) {
  const { user } = useAuth();

  const roleLabel = user?.role === 'GridOperator' ? 'Grid Operator' : user?.role || '';

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  /* Subtitle per page title */
  const subtitles = {
    'Operator Dashboard': 'Monitor bookings, node availability and microgrid operations.',
    'Booking Management': 'Review, approve and manage energy slot reservations.',
    'Operational Node Information': 'View live status and capacity across all microgrid nodes.',
    'Backoffice Dashboard': 'System-wide analytics and platform management.',
    'User Management': 'Manage system users, roles and access.',
    'Prosumer Management': 'Manage registered prosumers and their accounts.',
    'Microgrid Node Management': 'Configure and control microgrid node infrastructure.',
    'Reservation Management': 'Oversee all reservations across the grid.',
  };

  const subtitle = subtitles[title];

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 sm:py-3.5"
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8E4',
        boxShadow: '0 1px 3px rgba(11,93,67,0.06)',
      }}
    >
      {/* ── Left: hamburger + title ─────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
          style={{ color: '#0B5D43' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#F4F6F2')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          aria-label="Open navigation menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1
            className="font-bold truncate leading-tight"
            style={{
              fontFamily: 'var(--font-space)',
              fontSize: '1.125rem',   /* 18px */
              color: '#0B5D43',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-xs truncate hidden sm:block mt-0.5"
              style={{ color: '#66756F' }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ── Right: user info ────────────────────────────── */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Solar accent icon */}
        <div
          className="hidden sm:flex items-center justify-center w-8 h-8 rounded-xl"
          style={{ background: '#FFF4CC', color: '#0B5D43' }}
          aria-hidden="true"
        >
          <SunIcon className="w-4 h-4" style={{ color: '#FFC400' }} />
        </div>

        {/* Name + role */}
        <div className="text-right hidden sm:block">
          <p
            className="text-sm font-semibold leading-tight"
            style={{ color: '#17352D', fontFamily: 'var(--font-space)' }}
          >
            {user?.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#66756F' }}>
            {roleLabel}
          </p>
        </div>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 select-none"
          style={{
            background: 'linear-gradient(135deg, #0B5D43 0%, #073F32 100%)',
            color: '#fff',
            fontFamily: 'var(--font-space)',
          }}
          aria-label={`User: ${user?.name}`}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}

export default Header;
