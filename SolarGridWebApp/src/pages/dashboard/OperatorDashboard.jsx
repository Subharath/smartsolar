import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import DataTable from '../../components/tables/DataTable';
import {
  BookingIcon,
  NodeIcon,
  SunIcon,
  DashboardIcon,
} from '../../components/common/Icons';
import { getOperatorStats, getReservations, getNodes } from '../../services/dataService';

/* ── Compact icon wrappers ───────────────────────────────── */
function IconSm({ children }) {
  return <span className="w-5 h-5 flex items-center justify-center">{children}</span>;
}

/* ── Solar chevron-right icon ────────────────────────────── */
function ChevronRightIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

/* ── Slot Utilization bar component ─────────────────────── */
function UtilizationBar({ occupied, total }) {
  const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
  const barColor =
    pct >= 90 ? '#EF4444' : pct >= 70 ? '#FFC400' : '#00B878';

  return (
    <div>
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="font-bold" style={{ fontSize: '2rem', color: '#0B5D43', fontFamily: 'var(--font-space)', lineHeight: 1 }}>
            {pct}%
          </p>
          <p className="text-sm mt-1" style={{ color: '#66756F' }}>
            {occupied} / {total} slots occupied
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: barColor }} />
            <span className="text-xs font-medium" style={{ color: '#0B5D43' }}>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#E2E8E4' }} />
            <span className="text-xs font-medium" style={{ color: '#66756F' }}>Available</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: '10px', background: '#E2E8E4' }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct}% slots occupied`}
      >
        <div
          className="h-full rounded-full progress-bar-fill"
          style={{
            width: `${pct}%`,
            '--progress-width': `${pct}%`,
            background: `linear-gradient(90deg, ${barColor}CC 0%, ${barColor} 100%)`,
            transition: 'width 1s ease-out',
          }}
        />
      </div>

      {/* Slot breakdown pills */}
      <div className="flex gap-3 mt-4">
        <div
          className="flex-1 rounded-xl p-3 text-center"
          style={{ background: '#EDFBF4', border: '1px solid #6EDCAD' }}
        >
          <p className="font-bold text-lg" style={{ color: '#007A4D', fontFamily: 'var(--font-space)' }}>
            {total - occupied}
          </p>
          <p className="text-xs" style={{ color: '#66756F' }}>Available</p>
        </div>
        <div
          className="flex-1 rounded-xl p-3 text-center"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
        >
          <p className="font-bold text-lg" style={{ color: '#92400E', fontFamily: 'var(--font-space)' }}>
            {occupied}
          </p>
          <p className="text-xs" style={{ color: '#66756F' }}>Occupied</p>
        </div>
        <div
          className="flex-1 rounded-xl p-3 text-center"
          style={{ background: '#EEF5F2', border: '1px solid #C3D9D0' }}
        >
          <p className="font-bold text-lg" style={{ color: '#0B5D43', fontFamily: 'var(--font-space)' }}>
            {total}
          </p>
          <p className="text-xs" style={{ color: '#66756F' }}>Total</p>
        </div>
      </div>
    </div>
  );
}

/* ── Microgrid Node status card ──────────────────────────── */
function NodeStatusPanel({ nodes }) {
  if (!nodes || nodes.length === 0) {
    return (
      <p className="text-sm py-4 text-center" style={{ color: '#66756F' }}>
        No node data available
      </p>
    );
  }

  const total = nodes.length;
  const online = nodes.filter((n) => n.status === 'Active').length;
  const offline = total - online;

  return (
    <div>
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: '#EEF5F2', border: '1px solid #C3D9D0' }}
        >
          <p className="font-bold text-xl" style={{ color: '#0B5D43', fontFamily: 'var(--font-space)' }}>
            {total}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: '#66756F' }}>Total Nodes</p>
        </div>
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: '#EDFBF4', border: '1px solid #6EDCAD' }}
        >
          <p className="font-bold text-xl" style={{ color: '#007A4D', fontFamily: 'var(--font-space)' }}>
            {online}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: '#66756F' }}>Online</p>
        </div>
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
        >
          <p className="font-bold text-xl" style={{ color: '#B91C1C', fontFamily: 'var(--font-space)' }}>
            {offline}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: '#66756F' }}>Offline</p>
        </div>
      </div>

      {/* Node list */}
      <div className="space-y-2">
        {nodes.map((node) => {
          const isOnline = node.status === 'Active';
          const nodeTotal = node.batterySlots || 0;
          const nodeAvail = node.availableSlots || 0;
          const nodeOccupied = nodeTotal - nodeAvail;
          const nodePct = nodeTotal > 0 ? Math.round((nodeOccupied / nodeTotal) * 100) : 0;

          return (
            <div
              key={node.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ background: '#F4F6F2', border: '1px solid #E2E8E4' }}
            >
              {/* Status dot */}
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: isOnline ? '#00B878' : '#EF4444' }}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#17352D' }}>
                  {node.name}
                </p>
                <p className="text-[11px]" style={{ color: '#66756F' }}>
                  {node.location} · {nodeOccupied}/{nodeTotal} slots
                </p>
              </div>
              {/* Mini bar */}
              <div
                className="w-16 rounded-full overflow-hidden shrink-0"
                style={{ height: '5px', background: '#E2E8E4' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${nodePct}%`,
                    background: isOnline ? '#00B878' : '#EF4444',
                  }}
                />
              </div>
              <span
                className="text-[11px] font-semibold shrink-0"
                style={{ color: isOnline ? '#007A4D' : '#B91C1C', fontFamily: 'var(--font-space)', width: '30px', textAlign: 'right' }}
              >
                {nodePct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Dashboard Component ────────────────────────────── */
function OperatorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [s, reservations, nodeData] = await Promise.all([
        getOperatorStats(),
        getReservations(),
        getNodes(),
      ]);
      setStats(s);
      setNodes(nodeData);
      const active = reservations.filter((r) =>
        ['Pending', 'Approved', 'Current'].includes(r.status)
      );
      setRecent(active.slice(0, 5));
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const totalSlots = (stats?.availableSlots ?? 0) + (stats?.occupiedSlots ?? 0);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'prosumerName', label: 'Prosumer' },
    { key: 'nodeName', label: 'Node' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  const firstName = user?.name || 'Operator';

  return (
    <div className="space-y-6 max-w-[1400px]">
      <ErrorMessage message={error} onRetry={loadData} />

      {/* ── 1. Welcome hero banner ───────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-5 sm:px-8 sm:py-6"
        style={{
          background: 'linear-gradient(135deg, #073F32 0%, #0B5D43 50%, #0D6B4E 100%)',
          boxShadow: '0 4px 20px rgba(7,63,50,0.25)',
        }}
      >
        {/* Background decorative elements */}
        <div
          className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top right, rgba(255,196,0,0.12) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'rgba(0,184,120,0.08)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: 'rgba(255,196,0,0.15)', color: '#FFC400', border: '1px solid rgba(255,196,0,0.25)' }}
              >
                <SunIcon className="w-3 h-3" />
                Live Operations
              </span>
            </div>
            <h2
              className="font-bold text-white"
              style={{ fontFamily: 'var(--font-space)', fontSize: '1.5rem', lineHeight: 1.2 }}
            >
              Welcome back, {firstName} 👋
            </h2>
            <p className="mt-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.70)' }}>
              Monitor reservations, node availability and energy operations from one place.
            </p>
          </div>

          {/* Quick stat pills */}
          <div className="flex gap-3 flex-wrap">
            <div
              className="px-4 py-2.5 rounded-xl text-center min-w-[80px]"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <p className="font-bold text-lg text-white" style={{ fontFamily: 'var(--font-space)' }}>
                {stats?.pendingBookings ?? 0}
              </p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Pending</p>
            </div>
            <div
              className="px-4 py-2.5 rounded-xl text-center min-w-[80px]"
              style={{ background: 'rgba(0,184,120,0.15)', border: '1px solid rgba(0,184,120,0.25)' }}
            >
              <p className="font-bold text-lg" style={{ color: '#00B878', fontFamily: 'var(--font-space)' }}>
                {stats?.currentBookings ?? 0}
              </p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Current</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. KPI Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Pending Bookings"
          value={stats?.pendingBookings ?? 0}
          icon={<IconSm><BookingIcon className="w-5 h-5" /></IconSm>}
          accent="solar"
          subtitle="Awaiting review"
        />
        <StatCard
          title="Current Bookings"
          value={stats?.currentBookings ?? 0}
          icon={<IconSm><BookingIcon className="w-5 h-5" /></IconSm>}
          accent="green"
          subtitle="Active right now"
        />
        <StatCard
          title="Approved Future"
          value={stats?.approvedFuture ?? 0}
          icon={<IconSm><BookingIcon className="w-5 h-5" /></IconSm>}
          accent="leafLight"
          subtitle="Scheduled ahead"
        />
        <StatCard
          title="Available Slots"
          value={stats?.availableSlots ?? 0}
          icon={<IconSm><NodeIcon className="w-5 h-5" /></IconSm>}
          accent="energy"
          subtitle="Ready to book"
        />
        <StatCard
          title="Occupied Slots"
          value={stats?.occupiedSlots ?? 0}
          icon={<IconSm><NodeIcon className="w-5 h-5" /></IconSm>}
          accent="dark"
          subtitle="Currently in use"
        />
      </div>

      {/* ── 3. Slot Utilization + Node Status ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Slot Utilization */}
        <Card title="Slot Utilization">
          <UtilizationBar
            occupied={stats?.occupiedSlots ?? 0}
            total={totalSlots}
          />
        </Card>

        {/* Microgrid Node Status */}
        <Card title="Microgrid Node Status">
          <NodeStatusPanel nodes={nodes} />
        </Card>
      </div>

      {/* ── 4. Quick Actions ─────────────────────────────── */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl px-5 py-4"
        style={{ background: '#FFFFFF', border: '1px solid #E2E8E4', boxShadow: '0 1px 4px rgba(11,93,67,0.06)' }}
      >
        <div>
          <h3
            className="font-semibold text-base"
            style={{ color: '#0B5D43', fontFamily: 'var(--font-space)' }}
          >
            Quick Actions
          </h3>
          <p className="text-sm mt-0.5" style={{ color: '#66756F' }}>
            Jump to key sections of your dashboard
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/operator/bookings">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-leaf"
              style={{
                background: 'linear-gradient(135deg, #0B5D43 0%, #073F32 100%)',
                color: '#fff',
                border: '1px solid transparent',
                boxShadow: '0 2px 8px rgba(11,93,67,0.25)',
                fontFamily: 'var(--font-space)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(11,93,67,0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(11,93,67,0.25)';
              }}
            >
              <BookingIcon className="w-4 h-4" />
              View Bookings
            </button>
          </Link>
          <Link to="/operator/nodes">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-solar"
              style={{
                background: '#FFFBEB',
                color: '#073F32',
                border: '1px solid #FDE68A',
                boxShadow: '0 1px 4px rgba(255,196,0,0.15)',
                fontFamily: 'var(--font-space)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FFF4CC';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFBEB';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <NodeIcon className="w-4 h-4" style={{ color: '#FFC400' }} />
              View Nodes
            </button>
          </Link>
        </div>
      </div>

      {/* ── 5. Active Bookings Table ──────────────────────── */}
      <Card
        title="Active Bookings Overview"
        noPadding
        actions={
          <Link to="/operator/bookings">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-medium transition-colors duration-150"
              style={{ color: '#0B5D43', fontFamily: 'var(--font-space)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#00B878')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#0B5D43')}
            >
              View all
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </Link>
        }
      >
        <DataTable
          columns={columns}
          data={recent}
          emptyTitle="No active bookings"
          emptyDescription="All reservations are either completed or cancelled."
        />
      </Card>
    </div>
  );
}

export default OperatorDashboard;
