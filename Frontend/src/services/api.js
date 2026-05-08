export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
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
