const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

export class HttpClient {
  constructor(tokenStorage) {
    this.tokenStorage = tokenStorage;
  }

  async request(path, options = {}) {
    const token = this.tokenStorage.getToken();
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message ?? data?.error ?? "No se pudo completar la solicitud");
    }

    return data;
  }
}
