const statusConfig = {
  Active: {
    bg: '#EDFBF4',
    border: '#6EDCAD',
    text: '#007A4D',
    dot: '#00B878',
  },
  Inactive: {
    bg: '#F3F4F6',
    border: '#D1D5DB',
    text: '#6B7280',
    dot: '#9CA3AF',
  },
  Pending: {
    bg: '#FFFBEB',
    border: '#FDE68A',
    text: '#92400E',
    dot: '#FFC400',
  },
  Approved: {
    bg: '#EDFBF4',
    border: '#6EDCAD',
    text: '#065F46',
    dot: '#00B878',
  },
  Current: {
    bg: '#EEF9F5',
    border: '#34C785',
    text: '#0B5D43',
    dot: '#0B5D43',
  },
  Completed: {
    bg: '#F0FAF5',
    border: '#A7E9CE',
    text: '#0B5D43',
    dot: '#34C785',
  },
  Cancelled: {
    bg: '#FEF2F2',
    border: '#FECACA',
    text: '#B91C1C',
    dot: '#EF4444',
  },
  Error: {
    bg: '#FEF2F2',
    border: '#FECACA',
    text: '#B91C1C',
    dot: '#EF4444',
  },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || {
    bg: '#F3F4F6',
    border: '#D1D5DB',
    text: '#6B7280',
    dot: '#9CA3AF',
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.text,
        fontFamily: 'var(--font-space)',
        letterSpacing: '0.01em',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: cfg.dot }}
        aria-hidden="true"
      />
      {status}
    </span>
  );
}

export default StatusBadge;
