import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import SelectInput from '../../components/common/SelectInput';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import DataTable from '../../components/tables/DataTable';
import { PlusIcon, EditIcon } from '../../components/common/Icons';
import {
  getReservations,
  createReservation,
  updateReservation,
  cancelReservation,
  getProsumers,
  getNodes,
} from '../../services/dataService';
import {
  required,
  reservationWithin7Days,
  atLeast12HoursNotice,
} from '../../utils/validation';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../utils/errorUtils';

const emptyForm = {
  prosumerId: '',
  nodeId: '',
  date: '',
  time: '',
  slots: '1',
};

function ReservationsPage() {
  const toast = useToast();
  const [reservations, setReservations] = useState([]);
  const [prosumers, setProsumers] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [ruleMessage, setRuleMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const [r, p, n] = await Promise.all([getReservations(), getProsumers(), getNodes()]);
      setReservations(r);
      setProsumers(p.filter((x) => x.status === 'Active'));
      setNodes(n.filter((x) => x.status === 'Active'));
    } catch (err) {
      setError(err.message || 'Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return reservations.filter((r) => {
      const matchesSearch =
        r.id.toLowerCase().includes(q) ||
        r.prosumerName.toLowerCase().includes(q) ||
        r.nic.toLowerCase().includes(q) ||
        r.nodeName.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reservations, search, statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setRuleMessage('');
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      prosumerId: item.prosumerId,
      nodeId: item.nodeId,
      date: item.date,
      time: item.time,
      slots: String(item.slots || 1),
    });
    setFormErrors({});
    setRuleMessage('');
    setModalOpen(true);
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validateForm() {
    const next = {
      prosumerId: required(form.prosumerId, 'Prosumer'),
      nodeId: required(form.nodeId, 'Microgrid node'),
      date: required(form.date, 'Date') || reservationWithin7Days(form.date),
      time: required(form.time, 'Time'),
      slots: required(form.slots, 'Slots'),
    };

    // UX message for 12-hour rule on edits
    let notice = '';
    if (editing) {
      notice = atLeast12HoursNotice(form.date, form.time);
    }

    setFormErrors(next);
    setRuleMessage(notice || (next.date.includes('7 days') ? next.date : ''));
    return Object.values(next).every((v) => !v) && !notice;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const prosumer = prosumers.find((p) => p.id === form.prosumerId);
    const node = nodes.find((n) => n.id === form.nodeId);

    setSaving(true);
    try {
      const payload = {
        prosumerId: form.prosumerId,
        prosumerName: prosumer?.name || '',
        nic: prosumer?.nic || '',
        nodeId: form.nodeId,
        nodeName: node?.name || '',
        date: form.date,
        time: form.time,
        slots: Number(form.slots),
      };

      if (editing) {
        await updateReservation(editing.id, payload);
        toast.success('Reservation updated successfully', 'The reservation changes have been saved.');
      } else {
        await createReservation(payload);
        toast.success('Reservation created successfully', 'The new reservation has been saved.');
      }
      setModalOpen(false);
      await loadAll();
    } catch (err) {
      toast.error(editing ? 'Failed to update reservation' : 'Failed to create reservation', extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function requestCancel(item) {
    const notice = atLeast12HoursNotice(item.date, item.time);
    setCancelTarget({ item, notice });
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    if (cancelTarget.notice) {
      toast.error('Cannot cancel reservation', cancelTarget.notice);
      setCancelTarget(null);
      return;
    }
    setSaving(true);
    try {
      await cancelReservation(cancelTarget.item.id);
      toast.success('Reservation cancelled', 'The reservation has been cancelled successfully.');
      setCancelTarget(null);
      await loadAll();
    } catch (err) {
      toast.error('Failed to cancel reservation', extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'id', label: 'Reservation ID' },
    { key: 'prosumerName', label: 'Prosumer' },
    {
      key: 'nic',
      label: 'NIC',
      render: (r) => <span className="font-mono text-xs font-semibold">{r.nic}</span>,
    },
    { key: 'nodeName', label: 'Microgrid Node' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          {r.status !== 'Cancelled' && r.status !== 'Completed' && (
            <>
              <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                <EditIcon /> Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => requestCancel(r)}>
                Cancel
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading reservations..." />;

  return (
    <div className="space-y-4">
      <ErrorMessage message={error} onRetry={loadAll} />

      <div className="rounded-lg border border-solar/40 bg-solar/10 px-4 py-3 text-sm text-deepGreen">
        <p className="font-medium">Reservation rules (enforced by the API)</p>
        <ul className="list-disc ml-5 mt-1 space-y-0.5 text-gray-700">
          <li>Reservation must be within 7 days</li>
          <li>Updates / cancellations require at least 12 hours notice</li>
        </ul>
      </div>

      <Card
        title="Reservations"
        actions={
          <Button onClick={openCreate} size="sm">
            <PlusIcon className="w-4 h-4" /> Create Reservation
          </Button>
        }
      >
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search ID, prosumer, NIC, node..." />
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
        </div>
        <DataTable columns={columns} data={filtered} emptyTitle="No reservations found" />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Reservation' : 'Create Reservation'}
      >
        {ruleMessage && (
          <div className="mb-4 rounded-lg bg-solar/20 border border-solar/50 px-3 py-2 text-sm text-deepGreen">
            {ruleMessage}
          </div>
        )}
        <form onSubmit={handleSave} noValidate>
          <SelectInput
            label="Prosumer"
            name="prosumerId"
            value={form.prosumerId}
            onChange={handleChange}
            error={formErrors.prosumerId}
            required
            options={prosumers.map((p) => ({
              value: p.id,
              label: `${p.name} (NIC: ${p.nic})`,
            }))}
          />
          <SelectInput
            label="Microgrid Node"
            name="nodeId"
            value={form.nodeId}
            onChange={handleChange}
            error={formErrors.nodeId}
            required
            options={nodes.map((n) => ({ value: n.id, label: n.name }))}
          />
          <FormInput label="Date" name="date" type="date" value={form.date} onChange={handleChange} error={formErrors.date} required />
          <FormInput label="Time" name="time" type="time" value={form.time} onChange={handleChange} error={formErrors.time} required />
          <FormInput label="Slots" name="slots" type="number" min="1" value={form.slots} onChange={handleChange} error={formErrors.slots} required />
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel Reservation"
        message={
          cancelTarget?.notice
            ? cancelTarget.notice
            : `Cancel reservation ${cancelTarget?.item?.id}? This requires at least 12 hours notice.`
        }
        confirmLabel={cancelTarget?.notice ? 'Understood' : 'Cancel Reservation'}
        danger={!cancelTarget?.notice}
        loading={saving}
      />
    </div>
  );
}

export default ReservationsPage;
