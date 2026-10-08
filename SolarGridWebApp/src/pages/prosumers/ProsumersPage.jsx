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
import {
  getProsumers,
  createProsumer,
  updateProsumer,
  setProsumerStatus,
} from '../../services/dataService';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../utils/errorUtils';
import { required, emailFormat } from '../../utils/validation';

const emptyForm = { name: '', nic: '', email: '', phone: '', address: '' };

function ProsumersPage() {
  const toast = useToast();
  const [prosumers, setProsumers] = useState([]);
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
    loadProsumers();
  }, []);

  async function loadProsumers() {
    setLoading(true);
    setError('');
    try {
      setProsumers(await getProsumers());
    } catch (err) {
      setError(err.message || 'Failed to load prosumers.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return prosumers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nic.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }, [prosumers, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(prosumer) {
    setEditing(prosumer);
    setForm({
      name: prosumer.name,
      nic: prosumer.nic,
      email: prosumer.email,
      phone: prosumer.phone || '',
      address: prosumer.address || '',
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validateForm() {
    const next = {
      name: required(form.name, 'Name'),
      nic: required(form.nic, 'NIC'),
      email: required(form.email, 'Email') || emailFormat(form.email),
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
        nic: form.nic.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };
      if (editing) {
        await updateProsumer(editing.id, payload);
        toast.success('Prosumer updated successfully', 'The prosumer has been updated.');
      } else {
        await createProsumer(payload);
        toast.success('Prosumer created successfully', 'The new prosumer has been added.');
      }
      setModalOpen(false);
      await loadProsumers();
    } catch (err) {
      toast.error(editing ? 'Failed to update prosumer' : 'Failed to create prosumer', extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusConfirm() {
    if (!confirm) return;
    setSaving(true);
    try {
      await setProsumerStatus(confirm.item.id, confirm.nextStatus);
      toast.success('Status updated', `Prosumer status changed to ${confirm.nextStatus}.`);
      setConfirm(null);
      await loadProsumers();
    } catch (err) {
      toast.error('Failed to update status', extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    {
      key: 'nic',
      label: 'NIC',
      render: (p) => (
        <span className="font-mono text-sm font-semibold text-deepGreen bg-offWhite px-2 py-1 rounded">
          {p.nic}
        </span>
      ),
    },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (p) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
            <EditIcon /> Edit
          </Button>
          {p.status === 'Active' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirm({ item: p, nextStatus: 'Inactive', label: 'Deactivate' })}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirm({ item: p, nextStatus: 'Active', label: 'Reactivate' })}
            >
              Reactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading prosumers..." />;

  return (
    <div className="space-y-4">
      <ErrorMessage message={error} onRetry={loadProsumers} />

      <Card
        title="Prosumers"
        actions={
          <Button onClick={openCreate} size="sm">
            <PlusIcon className="w-4 h-4" /> Create Prosumer
          </Button>
        }
      >
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by NIC, name, email..." />
        </div>
        <DataTable columns={columns} data={filtered} emptyTitle="No prosumers found" />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Prosumer' : 'Create Prosumer'}
      >
        <form onSubmit={handleSave} noValidate>
          <FormInput label="NIC" name="nic" value={form.nic} onChange={handleChange} error={formErrors.nic} required placeholder="National Identity Card number" />
          <FormInput label="Name" name="name" value={form.name} onChange={handleChange} error={formErrors.name} required />
          <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={formErrors.email} required />
          <FormInput label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <FormInput label="Address" name="address" value={form.address} onChange={handleChange} />
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleStatusConfirm}
        title={`${confirm?.label || ''} Prosumer`}
        message={`Are you sure you want to ${confirm?.label?.toLowerCase()} ${confirm?.item?.name} (NIC: ${confirm?.item?.nic})?`}
        confirmLabel={confirm?.label || 'Confirm'}
        danger={confirm?.nextStatus === 'Inactive'}
        loading={saving}
      />
    </div>
  );
}

export default ProsumersPage;
