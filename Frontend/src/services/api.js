export const API_BASE_URL = "http://localhost:8000";
export const API_URL = `${API_BASE_URL}/api`;

const CSRF_HEADERS = {
  "Content-Type": "application/json",
  "X-Requested-With": "XMLHttpRequest",
};

export async function fetchJson(path) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  return response.json();
}

export async function postJson(path, body) {
  return fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: CSRF_HEADERS,
    body: JSON.stringify(body),
  });
}

export async function patchJson(path, body) {
  return fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: CSRF_HEADERS,
    body: JSON.stringify(body),
  });
}

export async function deleteReq(path) {
  return fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
}

export async function postForm(path, formData) {
  return fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "X-Requested-With": "XMLHttpRequest" },
    body: formData,
  });
}

// ── Tickets ───────────────────────────────────────────────────────────────────
export const getTickets = async () => {
  const response = await fetch(`${API_URL}/tickets`, {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  return response.json();
};

export const getTicket = async (id) => {
  const response = await fetch(`${API_URL}/tickets/${id}`, {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  return response.json();
};

export const createTicket = async (ticketData) => {
  const response = await fetch(`${API_URL}/tickets`, {
    method: "POST",
    headers: CSRF_HEADERS,
    body: JSON.stringify(ticketData),
  });
  return response.json();
};

export const updateTicket = async (id, updates) => {
  const response = await fetch(`${API_URL}/tickets/${id}`, {
    method: "PATCH",
    headers: CSRF_HEADERS,
    body: JSON.stringify(updates),
  });
  return response.json();
};

export const deleteTicket = async (id) => {
  const response = await fetch(`${API_URL}/tickets/${id}`, {
    method: "DELETE",
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  return response.json();
};

// ── Room DND Statuses ─────────────────────────────────────────────────────────
export const getRoomStatuses = async () => {
  const response = await fetch(`${API_URL}/room-statuses`, {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  return response.json();
};

export const updateRoomStatus = async (room, statusData) => {
  const response = await fetch(`${API_URL}/rooms/${room}/dnd`, {
    method: "PATCH",
    headers: CSRF_HEADERS,
    body: JSON.stringify(statusData),
  });
  return response.json();
};

// ── Dashboard Stats ───────────────────────────────────────────────────────────
export const getDashboardStats = async () => {
  const response = await fetch(`${API_URL}/dashboard/stats`, {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  return response.json();
};