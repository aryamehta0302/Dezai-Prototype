import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

/**
 * Auth Provider Registry
 *
 * Abstracts OAuth providers behind a single registry function.
 * To add a new provider (Microsoft, University SSO, etc.):
 *   1. Install the provider package if needed
 *   2. Add it to the `providers` array below
 *   3. Add env variables to `.env.example`
 *
 * Business logic never references provider-specific APIs.
 */

/**
 * Returns all configured auth providers.
 * Providers without credentials are skipped silently.
 */
export function getAuthProviders(): Provider[] {
  const providers: Provider[] = [];

  // ─── Google ───
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code",
          },
        },
      })
    );
  }

  // ─── Microsoft (Future) ───
  // if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET) {
  //   providers.push(
  //     MicrosoftEntraId({
  //       clientId: process.env.AZURE_AD_CLIENT_ID,
  //       clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
  //     })
  //   );
  // }

  // ─── University SSO (Future) ───
  // Custom SAML/OIDC providers can be added here

  // ─── Credentials ───
  providers.push(
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();
          if (data.success && data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
              onboarded: data.user.onboarded,
            };
          }
        } catch (error) {
          console.error("Credentials authorize error:", error);
        }

        return null;
      },
    })
  );

  return providers;
}

/**
 * Provider metadata for UI rendering.
 * Used by sign-in buttons to display provider name/icon.
 */
export interface ProviderMeta {
  id: string;
  name: string;
  icon: string;
}

export function getProvidersMeta(): ProviderMeta[] {
  const meta: ProviderMeta[] = [];

  if (process.env.GOOGLE_CLIENT_ID) {
    meta.push({ id: "google", name: "Google", icon: "google" });
  }

  // Add future providers here

  return meta;
}
