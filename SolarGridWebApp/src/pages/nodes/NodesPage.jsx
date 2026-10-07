import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import DataTable from '../../components/tables/DataTable';
import { PlusIcon, EditIcon } from '../../components/common/Icons';
import { getNodes, createNode, updateNode, setNodeStatus } from '../../services/dataService';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../utils/errorUtils';
import {
  required,
  isPositiveNumber,
  latitudeValid,
  longitudeValid,
} from '../../utils/validation';

const emptyForm = {
  name: '',
  location: '',
  latitude: '',
  longitude: '',
  capacity: '',
  batterySlots: '',
  schedule: '',
};

function NodesPage() {
  const toast = useToast();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

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

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return nodes.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        n.location.toLowerCase().includes(q) ||
        n.status.toLowerCase().includes(q)
    );
  }, [nodes, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(node) {
    setEditing(node);
    setForm({
      name: node.name,
      location: node.location,
      latitude: String(node.latitude),
      longitude: String(node.longitude),
      capacity: String(node.capacity),
      batterySlots: String(node.batterySlots),
      schedule: node.schedule || '',
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validateForm() {
    const next = {
      name: required(form.name, 'Node name'),
      location: required(form.location, 'Location'),
      latitude: required(form.latitude, 'Latitude') || latitudeValid(form.latitude),
      longitude: required(form.longitude, 'Longitude') || longitudeValid(form.longitude),
      capacity: required(form.capacity, 'Capacity') || isPositiveNumber(form.capacity, 'Capacity'),
      batterySlots:
        required(form.batterySlots, 'Battery slots') ||
        isPositiveNumber(form.batterySlots, 'Battery slots'),
      schedule: required(form.schedule, 'Operational schedule'),
    };
    setFormErrors(next);
    return Object.values(next).every((v) => !v);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        location: form.location.trim(),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        capacity: Number(form.capacity),
        batterySlots: Number(form.batterySlots),
        schedule: form.schedule.trim(),
      };
      if (editing) {
        await updateNode(editing.id, payload);
        toast.success('Node updated successfully', 'The node has been updated.');
      } else {
        await createNode(payload);
        toast.success('Node created successfully', 'The new node has been added.');
      }
      setModalOpen(false);
      await loadNodes();
    } catch (err) {
      toast.error(editing ? 'Failed to update node' : 'Failed to create node', extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!confirm) return;
    setSaving(true);
    try {
      await setNodeStatus(confirm.id, 'Inactive');
      toast.success('Node deactivated', `Node "${confirm.name}" has been deactivated.`);
      setConfirm(null);
      await loadNodes();
    } catch (err) {
      toast.error('Failed to deactivate node', extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'name', label: 'Node Name' },
    { key: 'location', label: 'Location' },
    { key: 'latitude', label: 'Latitude' },
    { key: 'longitude', label: 'Longitude' },
    { key: 'capacity', label: 'Capacity', render: (n) => `${n.capacity} kW` },
    { key: 'batterySlots', label: 'Battery Slots' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'status', label: 'Status', render: (n) => <StatusBadge status={n.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (n) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(n)}>
            <EditIcon /> Edit
          </Button>
          {n.status === 'Active' && (
            <Button variant="ghost" size="sm" onClick={() => setConfirm(n)}>
              Deactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading nodes..." />;

  return (
    <div className="space-y-4">
      <ErrorMessage message={error} onRetry={loadNodes} />

      <Card
        title="Microgrid Nodes"
        actions={
          <Button onClick={openCreate} size="sm">
            <PlusIcon className="w-4 h-4" /> Create Node
          </Button>
        }
      >
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, location..." />
        </div>
        <DataTable columns={columns} data={filtered} emptyTitle="No nodes found" />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Node' : 'Create Node'}
        size="lg"
      >
        <form onSubmit={handleSave} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <FormInput label="Node Name" name="name" value={form.name} onChange={handleChange} error={formErrors.name} required />
            <FormInput label="Location" name="location" value={form.location} onChange={handleChange} error={formErrors.location} required />
            <FormInput label="Latitude" name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} error={formErrors.latitude} required />
            <FormInput label="Longitude" name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} error={formErrors.longitude} required />
            <FormInput label="Capacity (kW)" name="capacity" type="number" value={form.capacity} onChange={handleChange} error={formErrors.capacity} required />
            <FormInput label="Battery Storage Slots" name="batterySlots" type="number" value={form.batterySlots} onChange={handleChange} error={formErrors.batterySlots} required />
          </div>
          <FormInput
            label="Operational Schedule"
            name="schedule"
            value={form.schedule}
            onChange={handleChange}
            error={formErrors.schedule}
            required
            placeholder="e.g. 06:00 - 22:00"
          />
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Node"
        message={`Deactivate "${confirm?.name}"? Business rules for deactivation will be enforced by the API.`}
        confirmLabel="Deactivate"
        danger
        loading={saving}
      />
    </div>
  );
}

export default NodesPage;
