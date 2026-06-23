import { auth } from "@/core/auth";
import { getSession } from "next-auth/react";

let cachedToken: string | null = null;
let cachedTokenExpiry = 0;
const TOKEN_TTL = 5 * 60 * 1000;

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api";

type ApiRequestOptions = RequestInit & {
    params?: Record<string, string | number>;
};

/**
 * Core API client for Dezai backend.
 * Automatically handles authentication tokens and JSON parsing.
 * 
 * Usage:
 * const data = await apiClient.get('/users/me');
 */
export function clearTokenCache() {
    cachedToken = null;
    cachedTokenExpiry = 0;
}

class ApiClient {
    private async getAuthToken(): Promise<string | null> {
        if (typeof window === "undefined") {
            const session = await auth();
            return session?.accessToken || null;
        }
        if (cachedToken && Date.now() < cachedTokenExpiry) {
            return cachedToken;
        }
        const session = await getSession();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const token = (session as any)?.accessToken || null;
        cachedToken = token;
        cachedTokenExpiry = Date.now() + TOKEN_TTL;
        return token;
    }

    private async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
        const token = await this.getAuthToken();
        const headers = new Headers(options.headers);

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
            headers.set("Content-Type", "application/json");
        }

        const url = new URL(`${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`);

        if (options.params) {
            Object.entries(options.params).forEach(([key, value]) => {
                url.searchParams.append(key, String(value));
            });
        }

        const response = await fetch(url.toString(), {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }

        // Handlers for empty responses
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    public get<T>(endpoint: string, options?: ApiRequestOptions) {
        return this.request<T>(endpoint, { ...options, method: "GET" });
    }

    public post<T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) {
        return this.request<T>(endpoint, {
            ...options,
            method: "POST",
            body: body instanceof FormData ? body : JSON.stringify(body)
        });
    }

    public put<T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) {
        return this.request<T>(endpoint, {
            ...options,
            method: "PUT",
            body: body instanceof FormData ? body : JSON.stringify(body)
        });
    }

    public patch<T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) {
        return this.request<T>(endpoint, {
            ...options,
            method: "PATCH",
            body: body instanceof FormData ? body : JSON.stringify(body)
        });
    }

    public delete<T>(endpoint: string, options?: ApiRequestOptions) {
        return this.request<T>(endpoint, { ...options, method: "DELETE" });
    }
}

export const apiClient = new ApiClient();
