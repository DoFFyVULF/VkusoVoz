type ApiSuccess<T> = { success: true; data: T };
type ApiError = { success: false; error: { code: string; message: string; details?: unknown } };
type ApiResponse<T> = ApiSuccess<T> | ApiError;

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;
  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "include",
  });
  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!json) throw new ApiClientError(res.statusText || "Ошибка сети", "INTERNAL_ERROR", res.status);
  if (!json.success) throw new ApiClientError(json.error.message, json.error.code, res.status, json.error.details);
  return json.data;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  auth: {
    register: (data: { name: string; email: string; phone: string; password: string }) => request<{ id: string; email: string; name: string; role: string }>("/api/v1/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) => request<{ id: string; email: string; name: string; role: string }>("/api/v1/auth/login", { method: "POST", body: JSON.stringify(data) }),
    logout: () => request<{ ok: boolean }>("/api/v1/auth/logout", { method: "POST" }),
    me: () => request<{ id: string; email: string; name: string; role: string }>("/api/v1/auth/me", { method: "GET" }),
  },
  restaurants: {
    list: (q?: Record<string, string>) => request<{ items: unknown[]; total: number; page: number; pages: number }>(`/api/v1/restaurants${q ? `?${new URLSearchParams(q)}` : ""}`),
    get: (id: string) => request<unknown>(`/api/v1/restaurants/${id}`),
    menu: (id: string) => request<{ categories: unknown[] }>(`/api/v1/restaurants/${id}/menu`),
  },
  cart: {
    get: () => request<unknown>("/api/v1/cart"),
    add: (data: { dishId: string; quantity: number; options?: { optionItemId: string; quantity?: number }[]; comment?: string }) => request<unknown>("/api/v1/cart/items", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: { quantity: number; comment?: string }) => request<unknown>(`/api/v1/cart/items/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: string) => request<unknown>(`/api/v1/cart/items/${id}`, { method: "DELETE" }),
    clear: () => request<unknown>("/api/v1/cart/clear", { method: "POST" }),
  },
  orders: {
    estimate: (data: unknown) => request<{ subtotal: number; deliveryFee: number; discountAmount: number; total: number }>("/api/v1/checkout/estimate", { method: "POST", body: JSON.stringify(data) }),
    create: (data: unknown) => request<{ id: string }>("/api/v1/orders", { method: "POST", body: JSON.stringify(data) }),
    list: () => request<{ items: unknown[] }>("/api/v1/orders"),
    get: (id: string) => request<unknown>(`/api/v1/orders/${id}`),
    cancel: (id: string) => request<unknown>(`/api/v1/orders/${id}/cancel`, { method: "POST" }),
  },
  admin: {
    logs: {
      list: (q?: Record<string, string | number | undefined>) => {
        const params = new URLSearchParams()
        if (q) {
          for (const [k, v] of Object.entries(q)) {
            if (v !== undefined && v !== "") params.set(k, String(v))
          }
        }
        const qs = params.toString()
        return request<{ items: unknown[]; total: number; page: number; pages: number }>(
          `/api/v1/admin/logs${qs ? `?${qs}` : ""}`
        )
      },
    },
    settings: {
      get: () => request<unknown>("/api/v1/admin/settings"),
      update: (data: unknown) => request<unknown>("/api/v1/admin/settings", { method: "PATCH", body: JSON.stringify(data) }),
    },
  },
};

export function isApiError(e: unknown): e is ApiClientError {
  return e instanceof ApiClientError;
}
