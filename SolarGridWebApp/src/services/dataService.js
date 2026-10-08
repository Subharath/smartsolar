/**
 * Domain service wrappers.
 * Switch USE_MOCK_DATA to false in api.js when the C# API is ready,
 * then implement the real api.get/post/put/delete calls in each function.
 */

import { USE_MOCK_DATA, api } from './api';
import * as mock from './mockData';

/* Users */
export async function getUsers() {
  if (USE_MOCK_DATA) return mock.mockGetUsers();
  return api.get('/users');
}

export async function createUser(data) {
  if (USE_MOCK_DATA) return mock.mockCreateUser(data);
  return api.post('/users', data);
}

export async function updateUser(id, data) {
  if (USE_MOCK_DATA) return mock.mockUpdateUser(id, data);
  return api.put(`/users/${id}`, data);
}

export async function setUserStatus(id, status) {
  if (USE_MOCK_DATA) return mock.mockSetUserStatus(id, status);
  return api.patch(`/users/${id}/status`, { status });
}

/* Prosumers */
export async function getProsumers() {
  if (USE_MOCK_DATA) return mock.mockGetProsumers();
  return api.get('/prosumers');
}

export async function createProsumer(data) {
  if (USE_MOCK_DATA) return mock.mockCreateProsumer(data);
  return api.post('/prosumers', data);
}

export async function updateProsumer(id, data) {
  if (USE_MOCK_DATA) return mock.mockUpdateProsumer(id, data);
  return api.put(`/prosumers/${id}`, data);
}

export async function setProsumerStatus(id, status) {
  if (USE_MOCK_DATA) return mock.mockSetProsumerStatus(id, status);
  return api.patch(`/prosumers/${id}/status`, { status });
}

/* Nodes */
export async function getNodes() {
  if (USE_MOCK_DATA) return mock.mockGetNodes();
  return api.get('/nodes');
}

export async function createNode(data) {
  if (USE_MOCK_DATA) return mock.mockCreateNode(data);
  return api.post('/nodes', data);
}

export async function updateNode(id, data) {
  if (USE_MOCK_DATA) return mock.mockUpdateNode(id, data);
  return api.put(`/nodes/${id}`, data);
}

export async function setNodeStatus(id, status) {
  if (USE_MOCK_DATA) return mock.mockSetNodeStatus(id, status);
  return api.patch(`/nodes/${id}/status`, { status });
}

/* Reservations / Bookings */
export async function getReservations() {
  if (USE_MOCK_DATA) return mock.mockGetReservations();
  return api.get('/reservations');
}

export async function createReservation(data) {
  if (USE_MOCK_DATA) return mock.mockCreateReservation(data);
  return api.post('/reservations', data);
}

export async function updateReservation(id, data) {
  if (USE_MOCK_DATA) return mock.mockUpdateReservation(id, data);
  return api.put(`/reservations/${id}`, data);
}

export async function cancelReservation(id) {
  if (USE_MOCK_DATA) return mock.mockCancelReservation(id);
  return api.patch(`/reservations/${id}/cancel`);
}

/* Dashboard */
export async function getBackofficeStats() {
  if (USE_MOCK_DATA) return mock.mockGetBackofficeStats();
  return api.get('/dashboard/backoffice');
}

export async function getOperatorStats() {
  if (USE_MOCK_DATA) return mock.mockGetOperatorStats();
  return api.get('/dashboard/operator');
}
