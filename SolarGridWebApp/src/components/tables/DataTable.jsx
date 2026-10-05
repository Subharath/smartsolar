import EmptyState from '../common/EmptyState';

/**
 * DataTable – redesigned responsive data table.
 * On small screens horizontal scroll is used.
 */
function DataTable({
  columns = [],
  data = [],
  emptyTitle = 'No records found',
  emptyDescription = '',
}) {
  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto" style={{ margin: '0 -1px' }}>
      <table className="min-w-full text-sm">
        <thead>
          <tr style={{ background: '#F4F6F2', borderBottom: '2px solid #E2E8E4' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left whitespace-nowrap ${col.className || ''}`}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#66756F',
                  fontFamily: 'var(--font-space)',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              className="transition-colors duration-150 group"
              style={{ borderBottom: '1px solid #F0F4F2' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F7FAF8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3.5 ${col.className || ''}`}
                  style={{ color: '#17352D' }}
                >
                  {col.render ? col.render(row) : (
                    <span style={{ color: col.key === 'id' ? '#66756F' : '#17352D', fontWeight: col.key === 'id' ? 500 : 400 }}>
                      {row[col.key]}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
