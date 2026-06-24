/**
 * @module features/auth
 *
 * Authentication & authorization feature.
 *
 * Owns: login, signup, password reset, session management,
 *       RBAC middleware, role guards, auth providers.
 */

// Components
export { AuthGuard } from "./components/auth-guard";

// Hooks
export { useAuth } from "./hooks/useAuth";


// Types
export type { AuthUser, LoginCredentials, SignupData, AuthSession } from "./types/auth.types";

// Pages
export { LoginPage } from "./pages/LoginPage";
export { SignupPage } from "./pages/SignupPage";
export { OnboardingPage } from "./pages/OnboardingPage";
