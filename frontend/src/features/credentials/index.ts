/**
 * @module features/credentials
 * Credential infrastructure, issuance & verification feature.
 */

// Types
export type { Credential, PublicCredential, CredentialTier, VerifyStatus, TierDisplayInfo } from './types/credential.types';
export { CREDENTIAL_TIER_CONFIG } from './types/credential.types';

// Service
export { credentialService } from './services/credential.service';

// Hooks
export { useCredentials } from './hooks/useCredentials';
export { useCredentialVerify } from './hooks/useCredentialVerify';

// Components
export { CredentialCard } from './components/CredentialCard';
export { CredentialStatusBadge } from './components/CredentialStatusBadge';

// Pages
export { CredentialVerifyPage } from './pages/CredentialVerifyPage';
export { CredentialLookupPage } from './pages/CredentialLookupPage';
