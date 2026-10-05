/**
 * StatCard – premium KPI card for dashboard metrics.
 * accent: 'solar' | 'green' | 'leafLight' | 'energy' | 'dark'
 */

const accentMap = {
  solar: {
    bg:      '#FFFBEB',
    border:  '#FDE68A',
    iconBg:  'linear-gradient(135deg, #FFC400 0%, #FFD84D 100%)',
    iconColor: '#073F32',
    numColor: '#0B5D43',
    dot:     '#FFC400',
  },
  green: {
    bg:      '#F0FAF5',
    border:  '#A7E9CE',
    iconBg:  'linear-gradient(135deg, #0B5D43 0%, #073F32 100%)',
    iconColor: '#fff',
    numColor: '#0B5D43',
    dot:     '#00B878',
  },
  energy: {
    bg:      '#EDFBF4',
    border:  '#6EDCAD',
    iconBg:  'linear-gradient(135deg, #00B878 0%, #009962 100%)',
    iconColor: '#fff',
    numColor: '#007A4D',
    dot:     '#00B878',
  },
  leafLight: {
    bg:      '#F2FAF6',
    border:  '#B6E8D3',
    iconBg:  'linear-gradient(135deg, #34C785 0%, #00B878 100%)',
    iconColor: '#fff',
    numColor: '#0B5D43',
    dot:     '#34C785',
  },
  dark: {
    bg:      '#EEF5F2',
    border:  '#C3D9D0',
    iconBg:  'linear-gradient(135deg, #073F32 0%, #0A3728 100%)',
    iconColor: '#FFC400',
    numColor: '#073F32',
    dot:     '#073F32',
  },
};

function StatCard({ title, value, icon, accent = 'green', subtitle }) {
  const a = accentMap[accent] || accentMap.green;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-200 group"
      style={{
        background: a.bg,
        border: `1px solid ${a.border}`,
        boxShadow: '0 1px 4px rgba(11,93,67,0.06), 0 4px 12px rgba(11,93,67,0.04)',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          '0 4px 16px rgba(11,93,67,0.12), 0 8px 24px rgba(11,93,67,0.06)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          '0 1px 4px rgba(11,93,67,0.06), 0 4px 12px rgba(11,93,67,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Subtle decorative corner circle */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: `${a.border}60` }}
        aria-hidden="true"
      />

      {/* Icon + dot */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
          style={{ background: a.iconBg, color: a.iconColor, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        >
          {icon}
        </div>
        <span
          className="w-2 h-2 rounded-full mt-1 status-pulse"
          style={{ background: a.dot }}
          aria-hidden="true"
        />
      </div>

      {/* Value */}
      <p
        className="font-bold leading-none"
        style={{ fontSize: '2rem', color: a.numColor, fontFamily: 'var(--font-space)' }}
      >
        {value}
      </p>

      {/* Title */}
      <p
        className="text-sm font-medium mt-1.5"
        style={{ color: '#66756F' }}
      >
        {title}
      </p>

      {/* Optional subtitle */}
      {subtitle && (
        <p className="text-[11px] mt-1" style={{ color: '#8FA09A' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default StatCard;
