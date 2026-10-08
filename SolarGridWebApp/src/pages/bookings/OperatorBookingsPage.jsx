import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import DataTable from '../../components/tables/DataTable';
import { EyeIcon } from '../../components/common/Icons';
import { getReservations, getNodes } from '../../services/dataService';

function OperatorBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [nodeFilter, setNodeFilter] = useState('');
  const [tab, setTab] = useState('current');
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [r, n] = await Promise.all([getReservations(), getNodes()]);
      setBookings(r);
      setNodes(n);
    } catch (err) {
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }

  const tabFiltered = useMemo(() => {
    if (tab === 'pending') return bookings.filter((b) => b.status === 'Pending');
    if (tab === 'current') return bookings.filter((b) => b.status === 'Current' || b.status === 'Approved');
    if (tab === 'history') return bookings.filter((b) => b.status === 'Completed' || b.status === 'Cancelled');
    return bookings;
  }, [bookings, tab]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tabFiltered.filter((b) => {
      const matchesSearch =
        b.id.toLowerCase().includes(q) ||
        b.prosumerName.toLowerCase().includes(q) ||
        b.nic.toLowerCase().includes(q) ||
        b.nodeName.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || b.status === statusFilter;
      const matchesDate = !dateFilter || b.date === dateFilter;
      const matchesNode = !nodeFilter || b.nodeId === nodeFilter;
      return matchesSearch && matchesStatus && matchesDate && matchesNode;
    });
  }, [tabFiltered, search, statusFilter, dateFilter, nodeFilter]);

  const tabs = [
    { id: 'pending', label: 'Pending' },
    { id: 'current', label: 'Current / Approved' },
    { id: 'history', label: 'History' },
  ];

  const columns = [
    { key: 'id', label: 'Booking ID' },
    { key: 'prosumerName', label: 'Prosumer' },
    {
      key: 'nic',
      label: 'NIC',
      render: (b) => <span className="font-mono text-xs font-semibold">{b.nic}</span>,
    },
    { key: 'nodeName', label: 'Node' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'status', label: 'Status', render: (b) => <StatusBadge status={b.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (b) => (
        <Button variant="outline" size="sm" onClick={() => setDetail(b)}>
          <EyeIcon /> View
        </Button>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading bookings..." />;

  return (
    <div className="space-y-4">
      <ErrorMessage message={error} onRetry={loadData} />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t.id ? 'bg-deepGreen text-white' : 'bg-white text-deepGreen border border-offWhite hover:bg-offWhite'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card title="Bookings">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search bookings..." />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-leaf/40"
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Current">Current</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leaf/40 focus:border-leaf"
          />
          <select
            value={nodeFilter}
            onChange={(e) => setNodeFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-leaf/40"
          >
            <option value="">All nodes</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
        </div>
        <DataTable columns={columns} data={filtered} emptyTitle="No bookings found" />
      </Card>

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Booking Details">
        {detail && (
          <div className="space-y-3 text-sm">
            <DetailRow label="Booking ID" value={detail.id} />
            <DetailRow label="Prosumer" value={detail.prosumerName} />
            <DetailRow label="NIC" value={<span className="font-mono font-semibold">{detail.nic}</span>} />
            <DetailRow label="Microgrid Node" value={detail.nodeName} />
            <DetailRow label="Date" value={detail.date} />
            <DetailRow label="Time" value={detail.time} />
            <DetailRow label="Slots" value={detail.slots} />
            <DetailRow label="Status" value={<StatusBadge status={detail.status} />} />
            <div className="pt-3 flex justify-end">
              <Button variant="outline" onClick={() => setDetail(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-offWhite pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="text-deepGreen font-medium text-right">{value}</span>
    </div>
  );
}

export default OperatorBookingsPage;
