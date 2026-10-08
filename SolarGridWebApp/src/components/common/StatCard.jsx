const accentMap = {
  solar: {
    bg:        '#FFFBEB',
    border:    '#FDE68A',
    iconBg:    'linear-gradient(135deg, #FFC400 0%, #FFD84D 100%)',
    iconColor: '#073F32',
    numColor:  '#0B5D43',
    dot:       '#FFC400',
  },
  green: {
    bg:        '#F0FAF5',
    border:    '#A7E9CE',
    iconBg:    'linear-gradient(135deg, #0B5D43 0%, #073F32 100%)',
    iconColor: '#fff',
    numColor:  '#0B5D43',
    dot:       '#00B878',
  },
  energy: {
    bg:        '#EDFBF4',
    border:    '#6EDCAD',
    iconBg:    'linear-gradient(135deg, #00B878 0%, #009962 100%)',
    iconColor: '#fff',
    numColor:  '#007A4D',
    dot:       '#00B878',
  },
  leafLight: {
    bg:        '#F2FAF6',
    border:    '#B6E8D3',
    iconBg:    'linear-gradient(135deg, #34C785 0%, #00B878 100%)',
    iconColor: '#fff',
    numColor:  '#0B5D43',
    dot:       '#34C785',
  },
  dark: {
    bg:        '#EEF5F2',
    border:    '#C3D9D0',
    iconBg:    'linear-gradient(135deg, #073F32 0%, #0A3728 100%)',
    iconColor: '#FFC400',
    numColor:  '#073F32',
    dot:       '#073F32',
  },
  // backoffice extras
  deepGreen: {
    bg:        '#E6F5EE',
    border:    '#8DD5B3',
    iconBg:    'linear-gradient(135deg, #005C3A 0%, #003D28 100%)',
    iconColor: '#fff',
    numColor:  '#003D28',
    dot:       '#005C3A',
  },
  leaf: {
    bg:        '#EDFBF4',
    border:    '#6EDCAD',
    iconBg:    'linear-gradient(135deg, #34C785 0%, #00B878 100%)',
    iconColor: '#fff',
    numColor:  '#007A4D',
    dot:       '#34C785',
  },
};

/* ── Photo-mode card ────────────────────────────────────── */
function PhotoStatCard({
  title,
  value,
  icon,
  subtitle,
  backgroundImage,
  overlay = 'linear-gradient(160deg, rgba(3,42,30,0.92) 0%, rgba(5,68,48,0.72) 50%, rgba(0,20,14,0.55) 100%)',
  iconAccentColor = '#ffffff',
  numAccentColor  = '#ffffff',
  bgPosition      = 'center',
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl hover:-translate-y-1 hover:shadow-xl transition-all duration-300 h-full w-full flex flex-col justify-end"
      style={{
        minHeight:           '155px',
        backgroundImage:     `${overlay}, url("${backgroundImage}")`,
        backgroundSize:      'cover',
        backgroundPosition:  bgPosition,
        backgroundRepeat:    'no-repeat',
      }}
    >
      {/* ── Small glass icon – top-left ─────────────────── */}
      {icon && (
        <div
          className="absolute top-4 left-4 flex items-center justify-center rounded-xl w-9 h-9 bg-black/25 backdrop-blur-md border border-white/20"
          style={{ color: iconAccentColor }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      {/* ── KPI text – bottom-left ───────────────────────── */}
      <div className="relative px-5 pb-5 pt-10 mt-auto">
        {/* Big number */}
        <p
          className="font-bold leading-none text-white"
          style={{
            fontSize:    '2.25rem',
            color:       numAccentColor,
            fontFamily:  'var(--font-space)',
            textShadow:  '0 1px 6px rgba(0,0,0,0.40)',
          }}
        >
          {value}
        </p>

        {/* Card title */}
        <p
          className="font-semibold mt-1 text-white"
          style={{
            fontSize:   '0.9375rem',
            textShadow: '0 1px 4px rgba(0,0,0,0.35)',
          }}
        >
          {title}
        </p>

        {/* Subtitle */}
        {subtitle && (
          <p
            className="mt-0.5 text-white/80"
            style={{
              fontSize:   '0.75rem',
              textShadow: '0 1px 3px rgba(0,0,0,0.30)',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Flat-mode card (used when no backgroundImage) ──────── */
function FlatStatCard({ title, value, icon, accent = 'green', subtitle }) {
  const a = accentMap[accent] || accentMap.green;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-200 group"
      style={{
        background:  a.bg,
        border:      `1px solid ${a.border}`,
        boxShadow:   '0 1px 4px rgba(11,93,67,0.06), 0 4px 12px rgba(11,93,67,0.04)',
        cursor:      'default',
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
      {/* Icon row */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
          style={{
            background: a.iconBg,
            color:      a.iconColor,
            boxShadow:  '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <p
        className="font-bold leading-none"
        style={{ fontSize: '2rem', color: a.numColor, fontFamily: 'var(--font-space)' }}
      >
        {value}
      </p>

      {/* Title */}
      <p className="text-sm font-medium mt-1.5" style={{ color: '#66756F' }}>
        {title}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-[11px] mt-1" style={{ color: '#8FA09A' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ── Public export ──────────────────────────────────────── */
function StatCard(props) {
  if (props.backgroundImage) {
    return <PhotoStatCard {...props} />;
  }
  return <FlatStatCard {...props} />;
}

export default StatCard;
