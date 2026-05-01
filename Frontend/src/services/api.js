export const API_BASE_URL = "http://localhost:8000";
export const API_URL = `${API_BASE_URL}/api`;

export async function fetchJson(path) {
  const response = await fetch(`${API_URL}${path}`);
  return response.json();
}
