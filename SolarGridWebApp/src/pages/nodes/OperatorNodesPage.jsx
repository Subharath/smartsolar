import { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import DataTable from '../../components/tables/DataTable';
import { getNodes } from '../../services/dataService';

function OperatorNodesPage() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadNodes();
  }, []);

  async function loadNodes() {
    setLoading(true);
    setError('');
    try {
      setNodes(await getNodes());
    } catch (err) {
      setError(err.message || 'Failed to load nodes.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = nodes.filter((n) => {
    const q = search.toLowerCase();
    return (
      n.name.toLowerCase().includes(q) ||
      n.location.toLowerCase().includes(q) ||
      n.status.toLowerCase().includes(q)
    );
  });

  const columns = [
    { key: 'name', label: 'Node Name' },
    { key: 'location', label: 'Location' },
    {
      key: 'slots',
      label: 'Battery Slots',
      render: (n) => (
        <span>
          <span className="text-leaf font-semibold">{n.availableSlots ?? 0}</span>
          <span className="text-gray-400"> / {n.batterySlots} available</span>
        </span>
      ),
    },
    { key: 'schedule', label: 'Schedule' },
    { key: 'capacity', label: 'Capacity', render: (n) => `${n.capacity} kW` },
    { key: 'status', label: 'Status', render: (n) => <StatusBadge status={n.status} /> },
  ];

  if (loading) return <LoadingSpinner message="Loading nodes..." />;

  return (
    <div className="space-y-4">
      <ErrorMessage message={error} onRetry={loadNodes} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {nodes
          .filter((n) => n.status === 'Active')
          .map((n) => (
            <Card key={n.id}>
              <p className="text-sm text-gray-500">Node</p>
              <h3 className="font-semibold text-deepGreen mt-1">{n.name}</h3>
              <p className="text-sm text-gray-600 mt-2">{n.location}</p>
              <p className="text-sm mt-3">
                Slots:{' '}
                <span className="font-semibold text-leaf">{n.availableSlots ?? 0}</span>
                {' / '}
                {n.batterySlots}
              </p>
              <p className="text-sm text-gray-600 mt-1">Schedule: {n.schedule}</p>
              <div className="mt-3">
                <StatusBadge status={n.status} />
              </div>
            </Card>
          ))}
      </div>

      <Card title="All Microgrid Nodes">
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search nodes..." />
        </div>
        <DataTable columns={columns} data={filtered} emptyTitle="No nodes available" />
      </Card>
    </div>
  );
}

export default OperatorNodesPage;
