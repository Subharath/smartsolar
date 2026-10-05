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
import { getUsers, createUser, updateUser, setUserStatus } from '../../services/dataService';
import { required, emailFormat } from '../../utils/validation';

const emptyForm = { name: '', email: '', role: '', password: '' };

function UsersPage() {
  const [users, setUsers] = useState([]);
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
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      setUsers(await getUsers());
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(user) {
    setEditing(user);
    setForm({ name: user.name, email: user.email, role: user.role, password: '' });
    setFormErrors({});
    setModalOpen(true);
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validateForm() {
    const next = {
      name: required(form.name, 'Name'),
      email: required(form.email, 'Email') || emailFormat(form.email),
      role: required(form.role, 'Role'),
    };
    if (!editing) {
      next.password = required(form.password, 'Password');
    }
    setFormErrors(next);
    return Object.values(next).every((v) => !v);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), email: form.email.trim(), role: form.role };
      if (editing) {
        await updateUser(editing.id, payload);
      } else {
        await createUser({ ...payload, password: form.password });
      }
      setModalOpen(false);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to save user.');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusConfirm() {
    if (!confirm) return;
    setSaving(true);
    try {
      await setUserStatus(confirm.user.id, confirm.nextStatus);
      setConfirm(null);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (u) => (u.role === 'GridOperator' ? 'Grid Operator' : u.role),
    },
    { key: 'status', label: 'Status', render: (u) => <StatusBadge status={u.status} /> },
    { key: 'createdAt', label: 'Created' },
    {
      key: 'actions',
      label: 'Actions',
      render: (u) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(u)}>
            <EditIcon /> Edit
          </Button>
          {u.status === 'Active' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirm({ user: u, nextStatus: 'Inactive', label: 'Deactivate' })}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirm({ user: u, nextStatus: 'Active', label: 'Reactivate' })}
            >
              Reactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading users..." />;

  return (
    <div className="space-y-4">
      <ErrorMessage message={error} onRetry={loadUsers} />

      <Card
        title="Users"
        actions={
          <Button onClick={openCreate} size="sm">
            <PlusIcon className="w-4 h-4" /> Create User
          </Button>
        }
      >
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, role..." />
        </div>
        <DataTable columns={columns} data={filtered} emptyTitle="No users found" />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit User' : 'Create User'}
      >
        <form onSubmit={handleSave} noValidate>
          <FormInput label="Name" name="name" value={form.name} onChange={handleChange} error={formErrors.name} required />
          <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={formErrors.email} required />
          <SelectInput
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            error={formErrors.role}
            required
            options={[
              { value: 'Backoffice', label: 'Backoffice' },
              { value: 'GridOperator', label: 'Grid Operator' },
            ]}
          />
          {!editing && (
            <FormInput
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={formErrors.password}
              required
            />
          )}
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
        title={`${confirm?.label || ''} User`}
        message={`Are you sure you want to ${confirm?.label?.toLowerCase()} ${confirm?.user?.name}?`}
        confirmLabel={confirm?.label || 'Confirm'}
        danger={confirm?.nextStatus === 'Inactive'}
        loading={saving}
      />
    </div>
  );
}

export default UsersPage;
