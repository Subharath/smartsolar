/**
 * MOCK DATA – for frontend development only.
 * Remove or replace these once the C# ASP.NET Core API is ready.
 * Do NOT treat this as real business logic or a database.
 */

let users = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'backoffice@test.com',
    role: 'Backoffice',
    status: 'Active',
    createdAt: '2026-01-10',
  },
  {
    id: 'u2',
    name: 'Grid Operator One',
    email: 'operator@test.com',
    role: 'GridOperator',
    status: 'Active',
    createdAt: '2026-01-12',
  },
  {
    id: 'u3',
    name: 'Sara Perera',
    email: 'sara.perera@example.com',
    role: 'Backoffice',
    status: 'Active',
    createdAt: '2026-02-01',
  },
  {
    id: 'u4',
    name: 'Nimal Fernando',
    email: 'nimal.fernando@example.com',
    role: 'GridOperator',
    status: 'Inactive',
    createdAt: '2026-02-15',
  },
];

let prosumers = [
  {
    id: 'p1',
    name: 'Kamal Silva',
    nic: '199012345678',
    email: 'kamal.silva@example.com',
    phone: '0771234567',
    address: '12 Galle Road, Colombo',
    status: 'Active',
  },
  {
    id: 'p2',
    name: 'Anusha Jayasuriya',
    nic: '198567890123',
    email: 'anusha.j@example.com',
    phone: '0719876543',
    address: '45 Kandy Road, Kandy',
    status: 'Active',
  },
  {
    id: 'p3',
    name: 'Ruwan Bandara',
    nic: '199234567890',
    email: 'ruwan.b@example.com',
    phone: '0765554433',
    address: '8 Lake View, Negombo',
    status: 'Inactive',
  },
];

let nodes = [
  {
    id: 'n1',
    name: 'Colombo Central Node',
    location: 'Colombo 07',
    latitude: 6.9271,
    longitude: 79.8612,
    capacity: 50,
    batterySlots: 8,
    availableSlots: 3,
    schedule: '06:00 - 22:00',
    status: 'Active',
  },
  {
    id: 'n2',
    name: 'Kandy Hill Node',
    location: 'Kandy',
    latitude: 7.2906,
    longitude: 80.6337,
    capacity: 35,
    batterySlots: 6,
    availableSlots: 2,
    schedule: '07:00 - 20:00',
    status: 'Active',
  },
  {
    id: 'n3',
    name: 'Galle Coastal Node',
    location: 'Galle',
    latitude: 6.0535,
    longitude: 80.2210,
    capacity: 40,
    batterySlots: 5,
    availableSlots: 0,
    schedule: '06:00 - 21:00',
    status: 'Inactive',
  },
];

let reservations = [
  {
    id: 'r1',
    prosumerId: 'p1',
    prosumerName: 'Kamal Silva',
    nic: '199012345678',
    nodeId: 'n1',
    nodeName: 'Colombo Central Node',
    date: '2026-09-24',
    time: '09:00',
    status: 'Pending',
    slots: 1,
  },
  {
    id: 'r2',
    prosumerId: 'p2',
    prosumerName: 'Anusha Jayasuriya',
    nic: '198567890123',
    nodeId: 'n1',
    nodeName: 'Colombo Central Node',
    date: '2026-09-23',
    time: '14:00',
    status: 'Approved',
    slots: 2,
  },
  {
    id: 'r3',
    prosumerId: 'p1',
    prosumerName: 'Kamal Silva',
    nic: '199012345678',
    nodeId: 'n2',
    nodeName: 'Kandy Hill Node',
    date: '2026-09-22',
    time: '10:30',
    status: 'Current',
    slots: 1,
  },
  {
    id: 'r4',
    prosumerId: 'p2',
    prosumerName: 'Anusha Jayasuriya',
    nic: '198567890123',
    nodeId: 'n2',
    nodeName: 'Kandy Hill Node',
    date: '2026-09-18',
    time: '11:00',
    status: 'Completed',
    slots: 1,
  },
  {
    id: 'r5',
    prosumerId: 'p3',
    prosumerName: 'Ruwan Bandara',
    nic: '199234567890',
    nodeId: 'n1',
    nodeName: 'Colombo Central Node',
    date: '2026-09-20',
    time: '16:00',
    status: 'Cancelled',
    slots: 1,
  },
];

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

function nextId(prefix, list) {
  return `${prefix}${list.length + 1}_${Date.now().toString().slice(-4)}`;
}

/* ---- Users ---- */
export async function mockGetUsers() {
  await delay();
  return [...users];
}

export async function mockCreateUser(data) {
  await delay();
  const user = { id: nextId('u', users), status: 'Active', createdAt: new Date().toISOString().slice(0, 10), ...data };
  users = [...users, user];
  return user;
}

export async function mockUpdateUser(id, data) {
  await delay();
  users = users.map((u) => (u.id === id ? { ...u, ...data } : u));
  return users.find((u) => u.id === id);
}

export async function mockSetUserStatus(id, status) {
  await delay();
  users = users.map((u) => (u.id === id ? { ...u, status } : u));
  return users.find((u) => u.id === id);
}

/* ---- Prosumers ---- */
export async function mockGetProsumers() {
  await delay();
  return [...prosumers];
}

export async function mockCreateProsumer(data) {
  await delay();
  const prosumer = { id: nextId('p', prosumers), status: 'Active', ...data };
  prosumers = [...prosumers, prosumer];
  return prosumer;
}

export async function mockUpdateProsumer(id, data) {
  await delay();
  prosumers = prosumers.map((p) => (p.id === id ? { ...p, ...data } : p));
  return prosumers.find((p) => p.id === id);
}

export async function mockSetProsumerStatus(id, status) {
  await delay();
  prosumers = prosumers.map((p) => (p.id === id ? { ...p, status } : p));
  return prosumers.find((p) => p.id === id);
}

/* ---- Nodes ---- */
export async function mockGetNodes() {
  await delay();
  return [...nodes];
}

export async function mockCreateNode(data) {
  await delay();
  const node = {
    id: nextId('n', nodes),
    status: 'Active',
    availableSlots: data.batterySlots ?? 0,
    ...data,
  };
  nodes = [...nodes, node];
  return node;
}

export async function mockUpdateNode(id, data) {
  await delay();
  nodes = nodes.map((n) => (n.id === id ? { ...n, ...data } : n));
  return nodes.find((n) => n.id === id);
}

export async function mockSetNodeStatus(id, status) {
  await delay();
  nodes = nodes.map((n) => (n.id === id ? { ...n, status } : n));
  return nodes.find((n) => n.id === id);
}

/* ---- Reservations / Bookings ---- */
export async function mockGetReservations() {
  await delay();
  return [...reservations];
}

export async function mockCreateReservation(data) {
  await delay();
  const reservation = { id: nextId('r', reservations), status: 'Pending', ...data };
  reservations = [...reservations, reservation];
  return reservation;
}

export async function mockUpdateReservation(id, data) {
  await delay();
  reservations = reservations.map((r) => (r.id === id ? { ...r, ...data } : r));
  return reservations.find((r) => r.id === id);
}

export async function mockCancelReservation(id) {
  await delay();
  reservations = reservations.map((r) => (r.id === id ? { ...r, status: 'Cancelled' } : r));
  return reservations.find((r) => r.id === id);
}

/* ---- Dashboard summaries ---- */
export async function mockGetBackofficeStats() {
  await delay();
  return {
    totalUsers: users.length,
    totalProsumers: prosumers.filter((p) => p.status === 'Active').length,
    totalNodes: nodes.length,
    pendingReservations: reservations.filter((r) => r.status === 'Pending').length,
  };
}

export async function mockGetOperatorStats() {
  await delay();
  const activeNodes = nodes.filter((n) => n.status === 'Active');
  return {
    pendingBookings: reservations.filter((r) => r.status === 'Pending').length,
    currentBookings: reservations.filter((r) => r.status === 'Current').length,
    approvedFuture: reservations.filter((r) => r.status === 'Approved').length,
    availableSlots: activeNodes.reduce((sum, n) => sum + (n.availableSlots || 0), 0),
    occupiedSlots: activeNodes.reduce((sum, n) => sum + ((n.batterySlots || 0) - (n.availableSlots || 0)), 0),
  };
}
