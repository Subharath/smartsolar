/**
 * Domain service wrappers connecting SolarGrid Web App to ASP.NET Core Web API.
 * All functions communicate with the backend on /api endpoints.
 */

import { USE_MOCK_DATA, api } from './api';
import * as mock from './mockData';

/* ============================================================================
   Users (Backoffice User Management)
   ============================================================================ */

export async function getUsers() {
  if (USE_MOCK_DATA) return mock.mockGetUsers();
  try {
    const users = await api.get('/Auth/users');
    return users.map((u) => ({
      id: u.nic,
      nic: u.nic,
      name: u.fullName,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: '2026-09-01',
    }));
  } catch (err) {
    console.error('Failed to fetch users from API:', err);
    return [];
  }
}

export async function createUser(data) {
  if (USE_MOCK_DATA) return mock.mockCreateUser(data);
  const nic = data.nic || `NIC${Math.floor(10000000 + Math.random() * 90000000)}V`;
  return api.post('/Auth/register', {
    nic: nic.trim(),
    fullName: data.name,
    email: data.email,
    password: data.password || 'password123',
    role: data.role || 'Backoffice',
  });
}

export async function updateUser(id, data) {
  if (USE_MOCK_DATA) return mock.mockUpdateUser(id, data);
  const query = data.role ? `?role=${encodeURIComponent(data.role)}` : '';
  return api.put(`/Auth/users/${encodeURIComponent(id)}${query}`, {
    fullName: data.name,
    email: data.email,
  });
}

export async function setUserStatus(id, status) {
  if (USE_MOCK_DATA) return mock.mockSetUserStatus(id, status);
  if (status === 'Active') {
    return api.post(`/Auth/reactivate/${encodeURIComponent(id)}`);
  }
  return api.put(`/Auth/users/${encodeURIComponent(id)}?status=${encodeURIComponent(status)}`, {
    fullName: '',
    email: '',
  });
}

/* ============================================================================
   Prosumers
   ============================================================================ */

export async function getProsumers() {
  if (USE_MOCK_DATA) return mock.mockGetProsumers();
  try {
    const users = await api.get('/Auth/users?role=Prosumer');
    return users.map((p) => ({
      id: p.nic,
      nic: p.nic,
      name: p.fullName,
      email: p.email,
      phone: '+94 77 123 4567',
      address: 'Sri Lanka Microgrid Zone',
      status: p.status,
    }));
  } catch (err) {
    console.error('Failed to fetch prosumers from API:', err);
    return [];
  }
}

export async function createProsumer(data) {
  if (USE_MOCK_DATA) return mock.mockCreateProsumer(data);
  return api.post('/Auth/register', {
    nic: data.nic.trim(),
    fullName: data.name,
    email: data.email,
    password: 'password123',
    role: 'Prosumer',
  });
}

export async function updateProsumer(id, data) {
  if (USE_MOCK_DATA) return mock.mockUpdateProsumer(id, data);
  return api.put(`/Auth/users/${encodeURIComponent(id)}`, {
    fullName: data.name,
    email: data.email,
  });
}

export async function setProsumerStatus(id, status) {
  if (USE_MOCK_DATA) return mock.mockSetProsumerStatus(id, status);
  if (status === 'Active') {
    return api.post(`/Auth/reactivate/${encodeURIComponent(id)}`);
  }
  return api.put(`/Auth/users/${encodeURIComponent(id)}?status=${encodeURIComponent(status)}`, {
    fullName: '',
    email: '',
  });
}

/* ============================================================================
   Microgrid Nodes
   ============================================================================ */

export async function getNodes() {
  if (USE_MOCK_DATA) return mock.mockGetNodes();
  try {
    const nodes = await api.get('/MicrogridNodes?includeInactive=true');
    return nodes.map((n) => ({
      id: n.id,
      stationCode: n.stationCode,
      name: n.hubName,
      location: `${n.hubName} (${n.stationCode})`,
      latitude: n.latitude,
      longitude: n.longitude,
      capacity: n.capacityKwH,
      batterySlots: n.totalBatterySlots,
      availableSlots: n.availableBatterySlots,
      schedule: n.operationalSchedule,
      status: n.isActive ? 'Active' : 'Inactive',
    }));
  } catch (err) {
    console.error('Failed to fetch nodes from API:', err);
    return [];
  }
}

export async function createNode(data) {
  if (USE_MOCK_DATA) return mock.mockCreateNode(data);
  const codePrefix = data.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'HUB';
  const stationCode = `${codePrefix}-${Math.floor(10 + Math.random() * 90)}`;
  return api.post('/MicrogridNodes', {
    stationCode,
    hubName: data.name,
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    capacityKwH: Number(data.capacity),
    totalBatterySlots: Number(data.batterySlots),
    operationalSchedule: data.schedule || '08:00-18:00',
  });
}

export async function updateNode(id, data) {
  if (USE_MOCK_DATA) return mock.mockUpdateNode(id, data);
  return api.put(`/MicrogridNodes/${encodeURIComponent(id)}`, {
    hubName: data.name,
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    capacityKwH: Number(data.capacity),
    availableBatterySlots: Number(data.batterySlots),
    operationalSchedule: data.schedule || '08:00-18:00',
  });
}

export async function setNodeStatus(id, status) {
  if (USE_MOCK_DATA) return mock.mockSetNodeStatus(id, status);
  if (status === 'Inactive') {
    return api.delete(`/MicrogridNodes/${encodeURIComponent(id)}`);
  }
  return true;
}

/* ============================================================================
   Reservations / Bookings
   ============================================================================ */

export async function getReservations() {
  if (USE_MOCK_DATA) return mock.mockGetReservations();
  try {
    const [reservations, nodes] = await Promise.all([
      api.get('/Reservations'),
      api.get('/MicrogridNodes?includeInactive=true').catch(() => []),
    ]);

    const nodeMap = new Map();
    nodes.forEach((n) => {
      nodeMap.set(n.id, n.hubName);
      nodeMap.set(n.stationCode, n.hubName);
    });

    return reservations.map((r) => {
      const scheduledDate = r.scheduledDateTime ? new Date(r.scheduledDateTime) : new Date();
      const nodeDisplayName = nodeMap.get(r.stationId) || r.stationId;

      return {
        id: r.id,
        prosumerId: r.prosumerNic,
        prosumerName: `Prosumer (${r.prosumerNic})`,
        nic: r.prosumerNic,
        nodeId: r.stationId,
        nodeName: nodeDisplayName,
        date: scheduledDate.toISOString().split('T')[0],
        time: scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        slots: 1,
        energyAmountKwH: r.energyAmountKwH,
        status: r.status,
        qrPayloadToken: r.qrPayloadToken,
      };
    });
  } catch (err) {
    console.error('Failed to fetch reservations from API:', err);
    return [];
  }
}

export async function createReservation(data) {
  if (USE_MOCK_DATA) return mock.mockCreateReservation(data);
  const timePart = data.time || '10:00';
  const scheduledIso = new Date(`${data.date}T${timePart}:00Z`).toISOString();

  return api.post('/Reservations', {
    stationId: data.nodeId,
    slotId: '',
    scheduledDateTime: scheduledIso,
    energyAmountKwH: (Number(data.slots) || 1) * 25.0,
  });
}

export async function updateReservation(id, data) {
  if (USE_MOCK_DATA) return mock.mockUpdateReservation(id, data);
  const timePart = data.time || '10:00';
  const scheduledIso = new Date(`${data.date}T${timePart}:00Z`).toISOString();

  return api.put(`/Reservations/${encodeURIComponent(id)}`, {
    newScheduledDateTime: scheduledIso,
    newEnergyAmountKwH: (Number(data.slots) || 1) * 25.0,
  });
}

export async function cancelReservation(id) {
  if (USE_MOCK_DATA) return mock.mockCancelReservation(id);
  return api.delete(`/Reservations/${encodeURIComponent(id)}`);
}

/* ============================================================================
   Operational Dashboard
   ============================================================================ */

export async function getBackofficeStats() {
  if (USE_MOCK_DATA) return mock.mockGetBackofficeStats();
  try {
    const [metrics, users, nodes] = await Promise.all([
      api.get('/Reservations/dashboard').catch(() => ({ pendingReservations: 0, approvedFutureReservations: 0, totalActiveNodes: 0 })),
      api.get('/Auth/users').catch(() => []),
      api.get('/MicrogridNodes?includeInactive=true').catch(() => []),
    ]);

    const prosumers = users.filter((u) => u.role?.toLowerCase() === 'prosumer');

    return {
      totalUsers: users.length,
      totalProsumers: prosumers.length,
      totalNodes: nodes.length,
      pendingReservations: metrics.pendingReservations || 0,
      approvedFutureReservations: metrics.approvedFutureReservations || 0,
    };
  } catch (err) {
    console.error('Failed to calculate backoffice stats:', err);
    return {
      totalUsers: 0,
      totalProsumers: 0,
      totalNodes: 0,
      pendingReservations: 0,
      approvedFutureReservations: 0,
    };
  }
}

export async function getOperatorStats() {
  if (USE_MOCK_DATA) return mock.mockGetOperatorStats();
  try {
    const [metrics, nodes, reservations] = await Promise.all([
      api.get('/Reservations/dashboard').catch(() => ({ pendingReservations: 0, approvedFutureReservations: 0, totalActiveNodes: 0 })),
      api.get('/MicrogridNodes?includeInactive=true').catch(() => []),
      api.get('/Reservations').catch(() => []),
    ]);

    const totalBatterySlots = nodes.reduce((sum, n) => sum + (n.batterySlots || 0), 0);
    const availableSlots = nodes.reduce((sum, n) => sum + (n.availableSlots || 0), 0);
    const occupiedSlots = Math.max(0, totalBatterySlots - availableSlots);

    const pendingCount = reservations.filter((r) => r.status === 'Pending').length || metrics.pendingReservations || 0;
    const currentCount = reservations.filter((r) => r.status === 'Approved' || r.status === 'Current').length || metrics.approvedFutureReservations || 0;
    const completedCount = reservations.filter((r) => r.status === 'Completed').length;

    return {
      totalNodes: nodes.length,
      pendingReservations: pendingCount,
      pendingBookings: pendingCount,
      currentBookings: currentCount,
      approvedReservations: currentCount,
      approvedFuture: currentCount,
      availableSlots,
      occupiedSlots,
      totalSlots: totalBatterySlots,
      completedToday: completedCount,
    };
  } catch (err) {
    console.error('Failed to calculate operator stats:', err);
    return {
      totalNodes: 0,
      pendingReservations: 0,
      pendingBookings: 0,
      currentBookings: 0,
      approvedReservations: 0,
      approvedFuture: 0,
      availableSlots: 0,
      occupiedSlots: 0,
      totalSlots: 0,
      completedToday: 0,
    };
  }
}
