import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import DataTable from '../../components/tables/DataTable';
import { UsersIcon, ProsumerIcon, NodeIcon, BookingIcon, PlusIcon } from '../../components/common/Icons';
import { getBackofficeStats, getReservations } from '../../services/dataService';

function BackofficeDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [s, reservations] = await Promise.all([getBackofficeStats(), getReservations()]);
      setStats(s);
      setRecent(reservations.slice(0, 5));
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'prosumerName', label: 'Prosumer' },
    { key: 'nic', label: 'NIC', render: (r) => <span className="font-mono text-xs">{r.nic}</span> },
    { key: 'nodeName', label: 'Node' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <ErrorMessage message={error} onRetry={loadData} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon={<UsersIcon />} accent="deepGreen" />
        <StatCard title="Total Prosumers" value={stats?.totalProsumers ?? 0} icon={<ProsumerIcon />} accent="leaf" />
        <StatCard title="Microgrid Nodes" value={stats?.totalNodes ?? 0} icon={<NodeIcon />} accent="solar" />
        <StatCard title="Pending Reservations" value={stats?.pendingReservations ?? 0} icon={<BookingIcon />} accent="solar" />
      </div>

      <Card
        title="Recent Reservations"
        actions={
          <Link to="/backoffice/reservations">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        }
      >
        <DataTable columns={columns} data={recent} emptyTitle="No reservations yet" />
      </Card>
    </div>
  );
}

export default BackofficeDashboard;
