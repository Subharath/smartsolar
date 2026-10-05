/**
 * Card – general-purpose surface container.
 * Consistent with the Solar Grid design system.
 */
function Card({ children, className = '', title, actions, noPadding = false }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8E4',
        boxShadow: '0 1px 4px rgba(11,93,67,0.06), 0 4px 12px rgba(11,93,67,0.04)',
      }}
    >
      {(title || actions) && (
        <div
          className="flex items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid #E2E8E4' }}
        >
          {title && (
            <h3
              className="font-semibold text-base"
              style={{ color: '#0B5D43', fontFamily: 'var(--font-space)' }}
            >
              {title}
            </h3>
          )}
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
}

export default Card;
