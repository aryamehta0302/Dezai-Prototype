import { auth } from "@/core/auth";
import { getSession } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api";

type ApiRequestOptions = RequestInit & {
    params?: Record<string, string | number>;
    public?: boolean;
};

/**
 * Core API client for Dezai backend.
 * Automatically handles authentication tokens and JSON parsing.
 * 
 * Usage:
 * const data = await apiClient.get('/users/me');
 */
class ApiClient {
    private async getAuthToken(): Promise<string | null> {
        // Check if we are on server or client
        if (typeof window === "undefined") {
            try {
                const session = await auth();
                return session?.accessToken || null;
            } catch {
                return null;
            }
        } else {
            try {
                const session = await getSession();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (session as any)?.accessToken || null;
            } catch {
                return null;
            }
        }
    }

    private async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
        const token = options.public ? null : await this.getAuthToken();
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
